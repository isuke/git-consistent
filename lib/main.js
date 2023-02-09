import _ from 'lodash'
import inquirer from 'inquirer'
import emoji from 'node-emoji'
import { execSync } from 'child_process'

import colors from './colors.js'

//
// Functions
//
const getCurrentBranchName = () => {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD 2> /dev/null').toString().trim()
  } catch (e) {
    // it is First Commit
    if (e.status === 128) {
      return ''
    } else {
      throw e
    }
  }
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
  const maxLength = _(values)
    .map('name')
    .map((n) => {
      return n.length
    })
    .max()

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
      const enumNamesStr = _.map(enumNames, (enumName) => {
        return `'${enumName}'`
      }).join(', ')
      errorMessages.push(`${term}'s value '${value}' is undefined. defined values ${enumNamesStr}.`)
    }
  }

  _.forEach(rules, (ruleSetting, ruleName) => {
    switch (ruleName) {
      case 'firstLatter':
      case 'firstLetter':
        if (ruleName === 'firstLatter') {
          console.log(`${colors.warning}oh, 'firstLatter' is misspell. 'firstLetter' is right!${colors.reset}`)
        }
        if (['small', 'lower', 'lowercase'].includes(ruleSetting) && /^[^a-z].*/.test(value)) {
          errorMessages.push(`${term} must be first letter is lowercase.`)
        } else if (['big', 'upper', 'uppercase'].includes(ruleSetting) && /^[^A-Z].*/.test(value)) {
          errorMessages.push(`${term} must be first letter is uppercase.`)
        }
        break
      case 'dotAtEnd':
        if (ruleSetting) {
          if (/[^.]$/.test(value)) errorMessages.push(`${term} should put dot (.) at the end.`)
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
        if (ruleName === 'ascii') {
          console.log(`${colors.warning}[Deprecated Warning] 'ascii' rule renamed 'nonAscii' (the meaning does not change).${colors.reset}`)
        }
        if (!ruleSetting && /[^\x00-\x7F]/.test(value)) {
          errorMessages.push(`${term} should only ascii symbols.`)
        }
        break
      case 'maxLength':
        if (ruleSetting < value.length) {
          errorMessages.push(`${term} length is '${value.length}' but max length is '${ruleSetting}'.`)
        }
        break
      case 'minLength':
        if (ruleSetting > value.length) {
          errorMessages.push(`${term} length is '${value.length}' but min length is '${ruleSetting}'.`)
        }
        break
      default:
        throw new Error(`${ruleName} is not defined.`)
    }
  })

  return errorMessages.join('\n')
}

const createQuestion = (definition, term) => {
  let result = {}
  switch (definition.type) {
    case 'enum':
      result = {
        type: 'list',
        name: term,
        message: `Select ${term}:`,
        choices: createChoices(definition),
      }
      if (definition.default) result.default = definition.default
      return result
    case 'string':
      result = {
        type: 'input',
        name: term,
        message: `Write ${term}:`,
      }
      if (definition.default) result.default = definition.default
      return result
    case 'text':
      result = {
        type: 'editor',
        name: term,
        message: `Write ${term}:`,
      }
      if (definition.default) result.default = definition.default
      return result
    case 'variable':
    case 'branch':
      return
    default:
      throw new Error(`${definition.type} is not defined.`)
  }
}

const createQuestions = (options, definitions) => {
  return _(definitions)
    .map((definition, term) => {
      if (!_.isUndefined(options[term]) || !_.isUndefined(definition.default)) return
      return createQuestion(definitions[term], term)
    })
    .compact()
    .value()
}

const getValue = (options, definition, answer, term) => {
  const val = branchText(definition)

  switch (definition.type) {
    case 'enum':
    case 'string':
    case 'text':
      if (!_.isUndefined(options[term])) return options[term]
      if (!_.isUndefined(answer)) return answer
      if (!_.isUndefined(definition.default)) return definition.default
      return ''
    case 'variable':
      if (!_.isUndefined(options[definition.origin])) return options[definition.origin]
      return ''
    case 'branch':
      if (!_.isUndefined(val)) return val
      return ''
    default:
      throw new Error(`${definition.type} is not defined.`)
  }
}

const replaceTerms = async (options, template, definitions, callback) => {
  await inquirer
    .prompt(createQuestions(options, definitions))
    .then((answers) => {
      let result = template
      _.forEach(definitions, (definition, term) => {
        const answer = answers[term]
        const value = getValue(options, definition, answer, term).trim()

        options[term] = value
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
    })
    .catch((e) => {
      console.error(`${colors.error}${e.message}${colors.reset}`)
      e.status ? process.exit(e.status) : process.exit(1)
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
    console.log('-------------------------')
    console.log(escapedCommitMessage)
    console.log('-------------------------')
  } else {
    execSync(command)
  }
}

//
// Main
//
export default async (program, template, definitions) => {
  const options = program.opts()

  if (!options.dryRun) checkAddedFile()

  await replaceTerms(options, template, definitions, (commitMessage) => {
    gitCommit(commitMessage.trim(), options.duet, options.silent, options.dryRun)
  })
}
