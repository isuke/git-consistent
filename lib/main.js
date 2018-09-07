const path       = require('path')
const fs         = require('fs')
const _          = require('lodash')
const execSync   = require('child_process').execSync
const inquirer   = require('inquirer');
const emoji      = require('node-emoji')

const colors = require('./colors')

//
// Functions
//
const getCurrentBranchName = () => {
  return execSync("git rev-parse --abbrev-ref HEAD").toString().trim()
}

const branchText = (definition) => {
  const currentBranchName = getCurrentBranchName()
  const regExp = new RegExp(definition.regExp, definition.regExpFlag)
  const matchNum = definition.regExpMatchNum || 1
  const match = currentBranchName.match(regExp)
  const value = match ? match[matchNum] : ''
  return value
}

const checkAddedFile = () => {
  const addedFiles = execSync(`git diff --name-only --cached 2> /dev/null`).toString().trim()
  if (_.isEmpty(addedFiles)) throw new Error(`no changes added to commit.`)
}

const createChoicesNames = (values) => {
  const maxLength = _(values).map('name').map((n) => { return n.length }).max()

  const result = {}
  _.forEach(values, (value) => {
    const temp = []
    temp.push(_.padEnd(value.name, maxLength))
    if (/^:.+:$/.test(value.name) && emoji.hasEmoji(value.name)) temp.push(emoji.get(value.name) + ' ')
    temp.push(value.description)

    result[value.name] = temp.join(' ')
  })
  return result
}

const createChoices = (definition) => {
  const names = createChoicesNames(definition.values)

  const choices = _.map(definition.values, (value) => {
    return {
      name: names[value.name],
      value: value.name,
      short: value.name,
    }
  })
  if (!definition.required) choices.unshift({ name: 'none', value: '', short: 'none' })

  return choices
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
          if (/[^\.]$/.test(value)) errorMessages.push(`${term} should put dot (.) at the end.`)
        } else {
          if (/\.$/.test(value)) errorMessages.push(`${term} should not put dot (.) at the end.`)
        }
        break
      case 'numberOnly':
        if (ruleSetting && /^[^0-9].*/.test(value)) {
          errorMessages.push(`${term} must be number only.`)
        }
        break
      case 'nonAscii':
      case 'notAscii':
      case 'ascii':
        if(ruleName === 'ascii') {
          console.log(`${colors.warning}[Deprecated Warning] 'ascii' rule renamed 'nonAscii' (the meaning does not change).${colors.reset}`)
        }
        if (!ruleSetting && /[^\x00-\x7F]/.test(value)) {
          errorMessages.push(`${term} should only ascii symbols.`)
        }
        break
      default:
        throw new Error(`${ruleName} is not defined.`)
    }
  })

  return errorMessages.join("\n")
}

const createQuestion = (definition, term) => {
  let result = {}
  switch (definition.type) {
    case 'enum':
      result = {
        type: 'list',
        name: term,
        message: `Select ${term}:`,
        choices: createChoices(definition)
      }
      if(definition.default) result.default = definition.default
      return result
    case 'string':
      result = {
        type: 'input',
        name: term,
        message: `Write ${term}:`,
      }
      if(definition.default) result.default = definition.default
      return result
    case 'text':
      result = {
        type: 'editor',
        name: term,
        message: `Write ${term}:`,
      }
      if(definition.default) result.default = definition.default
      return result
    case 'variable':
    case 'branch':
      return
    default:
      throw new Error(`${ruleName} is not defined.`)
  }
}

const createQuestions = (program, definitions, terms) => {
  return _(terms).map((term) => {
    const definition = definitions[term]
    if(!_.isUndefined(program[term]) || ! _.isUndefined(definition.default)) return
    return createQuestion(definitions[term], term)
  }).compact().value()
}

const getValue = (program, definition, answer, term) => {
  switch (definition.type) {
    case 'enum':
    case 'string':
    case 'text':
      if(! _.isUndefined(program[term]))      return program[term]
      if(! _.isUndefined(answer))             return answer
      if(! _.isUndefined(definition.default)) return definition.default
      return ''
    case 'variable':
      if(! _.isUndefined(program[definition.origin])) return program[definition.origin]
      return ''
    case 'branch':
      const val = branchText(definition)
      if(! _.isUndefined(val)) return val
      return ''
    default:
      throw new Error(`${definition.type} is not defined.`)
  }
}

const replaceTerms = (program, template, definitions, terms, callback) => {
  inquirer.prompt(createQuestions(program, definitions, terms)).then((answers) => {
    let result = template
    _.forEach(terms, (term) => {
      const definition = definitions[term]
      const answer = answers[term]
      const value = getValue(program, definition, answer, term).trim()

      program[term] = value

      const errorMessages = checkValue(term, value, definition)
      if (!_.isEmpty(errorMessages)) throw new Error(errorMessages)

      let decoratedValue = value
      if (!_.isEmpty(value)) {
        if (definition.prefix) decoratedValue = definition.prefix + decoratedValue
        if (definition.suffix) decoratedValue = decoratedValue + definition.suffix
      }
      result = _.replace(result, `<${term}>`, decoratedValue)
    })
    callback(result)
  }).catch((e) => {
    console.error(`${colors.error}${e.message}${colors.reset}`)
  })
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

  replaceTerms(program, template, definitions, terms, (commitMessage) => {
    if (program.typoCheck) console.log(`${colors.warning}[Already Deleted Warning] '--typo-check' option is already deleted. sorry.${colors.reset}`)

    gitCommit(commitMessage.trim(), program.duet, program.silent, program.dryRun)
  })
}
