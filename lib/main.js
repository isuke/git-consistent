const path       = require('path')
const fs         = require('fs')
const _          = require('lodash')
const execSync   = require('child_process').execSync
const prompt     = require('prompt-sync')()
const spellcheck = require('nodehun-sentences')
const nodehun    = require('nodehun')
const emoji      = require('node-emoji')

const colors = require('./colors')

//
// Functions
//
const formatChoices = (choices) => {
  const nameMaxLength = _(choices).map('name').map((n) => { return n.length }).max()
  const emojiMaxLength = _(choices).map('emoji').map((n) => { return n.length }).max()

  return _.map(choices, (choice) => {
    const n = _.padEnd(choice.name, nameMaxLength)
    const e = emojiMaxLength === 0 ? '' : _.padEnd(choice.emoji, 3)
    return [n, e, choice.description].join(" ")
  }).join("\n")
}

const select = (term, definition) => {
  const none = "(none)"
  const header = `Select ${term}: `
  const choices = _.map(definition.values, function (value) {
    const name = value.name
    const description = value.description
    let emojiStr = ''

    if (/^:.+:$/.test(name) && emoji.hasEmoji(name)) emojiStr = emoji.get(name)
    return { name: name, emoji: emojiStr, description: description }
  })
  if (!definition.required) choices.unshift({ name: '', emoji: '', description: none })

  const command = `echo "${formatChoices(choices).replace(/"/g, '\\"')}" | fzf --reverse --cycle --header="${header}"`

  const selectedValue = execSync(command, { stdio: ['inherit', 'pipe', 'inherit'], shell: true }).toString().trim()
  const value = selectedValue.split(" ")[0]
  const v = value === none ? '' : value
  console.log(`${header}${value}`)
  return v
}

const inputString = (term, _definition) => {
  return prompt(`${colors.message}Enter ${term}: ${colors.reset}`)
}

const inputText = (term, _definition) => {
  console.log(`${colors.message}Enter ${term} multiline:${colors.reset}`)
  let values = []
  let value = ""

  do {
    value = prompt()
    values.push(value)
  } while (!_.isEmpty(value))

  return values.join("\n").trim()
}

const input = (term, definition) => {
  const type = definition.type
  let inputValue
  switch (type) {
    case 'enum':
      inputValue = select(term, definition)
      break
    case 'string':
      inputValue = inputString(term, definition)
      break
    case 'text':
      inputValue = inputText(term, definition)
      break
    case 'variable':
      break
    default:
      throw new Error(`${type} is not defined.`)
  }
  return inputValue
}

const checkValue = (term, value, definition) => {
  const rules = definition.rules
  const errorMessages = []

  if (definition.required && _.isEmpty(value)) errorMessages.push(`${term} is required.`)

  if (definition.type === 'enum') {
    const enumNames = _.map(definition.values, 'name')
    if (!enumNames.includes(value) && !_.isEmpty(value)) {
      const enumNamesStr = _.map(enumNames, (enumName) => { return `'${enumName}'` }).join(', ')
      errorMessages.push(`${term}'s value '${value}' is undefined. defined values ${enumNamesStr}.`)
    }
  }

  _.forEach(rules, (ruleSetting, ruleName) => {
    switch (ruleName) {
      case 'firstLatter':
        if (['small', 'lower', 'lowercase'].includes(ruleSetting) && /^[^a-z].*/.test(value)) {
          errorMessages.push(`${term} must be first latter is lowercase.`)
        } else if (['big', 'upper', 'uppercase'].includes(ruleSetting) && /^[^A-Z].*/.test(value)) {
          errorMessages.push(`${term} must be first latter is uppercase.`)
        }
        break
      case 'dotAtEnd':
        if (ruleSetting) {
          if (/[^\.]$/.test(value)) errorMessages.push(`${term} should not put dot (.) at the end.`)
        } else {
          if (/\.$/.test(value)) errorMessages.push(`${term} should put dot (.) at the end.`)
        }
        break
      case 'numberOnly':
        if (ruleSetting && /^[^0-9].*/.test(value)) {
          errorMessages.push(`${term} must be number only.`)
        }
        break
      case 'ascii':
        if (!ruleSetting && /[\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf]/.test(value)) {
          errorMessages.push(`${term} should only alphabet.`)
        }
        break
      default:
        throw new Error(`${ruleName} is not defined.`)
    }
  })

  return errorMessages.join("\n")
}

const replaceTerms = (program, template, definitions, terms) => {
  if (_.isEmpty(terms)) {
    return template
  } else {
    const term = terms[0]
    const definition = definitions[term]
    template = replaceTerm(program, template, definition, term)
    return replaceTerms(program, template, definitions, _.tail(terms))
  }
}

const replaceTerm = (program, template, definition, term) => {
  let value = definition.type === 'variable' ? program[definition.origin] : program[term]

  if (program.interactive) {
    if (_.isUndefined(value) || _.isNull(value)) {
      if (definition.required || !program.skipOptions) {
        value = input(term, definition)
      } else {
        value = ''
      }
      let errorMessages = checkValue(term, value, definition)
      while (!_.isEmpty(errorMessages)) {
        console.log(`${colors.warning}${errorMessages}${colors.reset}`)
        value = input(term, definition)
        errorMessages = checkValue(term, value, definition)
      }
    }
  } else {
    if (_.isEmpty(value) && definition.required) throw new Error(`${term} is required.`)
  }

  const errorMessages = checkValue(term, value, definition)
  if (!_.isEmpty(errorMessages)) throw new Error(errorMessages)

  program[term] = value

  let decoratedValue = value
  if (!_.isEmpty(value)) {
    if (definition.prefix) decoratedValue = definition.prefix + decoratedValue
    if (definition.suffix) decoratedValue = decoratedValue + definition.suffix
  }

  return _.replace(template, `<${term}>`, decoratedValue)
}

const checkSpell = (message) => {
  const dictionaryBase = path.dirname(require.resolve('dictionary-en-us'))
  const hunspell = new nodehun(
    fs.readFileSync(path.join(dictionaryBase, 'index.aff')),
    fs.readFileSync(path.join(dictionaryBase, 'index.dic'))
  )

  spellcheck(hunspell, message, (e, typos) => {
    if (e) throw e

    _.forEach(typos, (typo) => {
      process.stdout.write(`${colors.warning}Is '${typo.word}' misspelled? ${colors.reset}`)
      console.log(`${colors.warning}Did you mean that? ${typo.suggestions.map((s) => { return `'${s}'` }).join(', ')}${colors.reset}`)
    })
  })
}

const checkAddedFile = () => {
  const addedFiles = execSync(`git diff --name-only --cached 2> /dev/null`).toString().trim()
  if (_.isEmpty(addedFiles)) throw new Error(`no changes added to commit.`)
}

const gitCommit = (commitMessage, duet = false, silent = false, dryRun = false) => {
  const escapedCommitMessage = commitMessage.replace(/"/g, '\\"')

  let command
  if (duet) {
    command = `git duet-commit -m "${escapedCommitMessage}"`
  } else {
    command = `git commit -m "${escapedCommitMessage}"`
  }

  if (!silent) console.log(`${colors.info}${command}${colors.reset}`)

  if (dryRun) {
    console.log("-------------------------")
    console.log(escapedCommitMessage)
    console.log("-------------------------")
  } else {
    execSync(command)
  }
}

//
// Main
//
module.exports = (program, template, definitions, terms) => {
  if (!program.dryRun) checkAddedFile()

  const commitMessage = replaceTerms(program, template, definitions, terms)

  if (program.typoCheck) checkSpell(commitMessage)

  gitCommit(commitMessage.trim(), program.duet, program.silent, program.dryRun)
}
