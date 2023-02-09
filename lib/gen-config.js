import path from 'path'
import fs from 'fs'
import _ from 'lodash'
import promptSync from 'prompt-sync'
import inquirer from 'inquirer'
import yaml from 'js-yaml'
import url from 'url'
import { parse as csvParse } from 'csv-parse/sync'

import colors from './colors.js'

const prompt = promptSync()

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const getMaxLength = (types, headName) => {
  return _(types)
    .map(headName)
    .map((n) => {
      return n.length
    })
    .max()
}

const createTypeListNames = (types) => {
  const maxLengths = {}
  _(types[0])
    .keys()
    .forEach((key) => {
      maxLengths[key] = getMaxLength(types, key)
    })

  const result = {}
  _.forEach(types, (type) => {
    result[type.name] = _.map(type, (value, key) => {
      return _.padEnd(type[key], maxLengths[key])
    }).join(' ')
  })
  return result
}

const typeListChoices = (useEmoji) => {
  const typesCsv = fs.readFileSync(path.join(__dirname, 'types.csv'))
  const types = csvParse(typesCsv, { columns: true })
  const names = createTypeListNames(types, useEmoji)

  return _.map(types, (type) => {
    const value = useEmoji ? type.emojiSign : type.name
    return { name: names[type.name], value: [value, type.description], short: type.name }
  })
}

const createQuestions = () => {
  return [
    {
      type: 'confirm',
      name: 'type',
      message: 'Use Type?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'emoji',
      message: 'Use Emoji?',
      default: false,
      when: (answers) => {
        return answers.type
      },
    },
    {
      type: 'checkbox',
      name: 'typeList',
      message: 'choice types',
      choices: (answers) => {
        return typeListChoices(answers.emoji)
      },
      when: (answers) => {
        return answers.type
      },
    },
    {
      type: 'list',
      name: 'subjectFirstLetter',
      message: 'Does the subject start with?',
      choices: [
        { name: 'lower case', value: 'lower' },
        { name: 'upper case', value: 'upper' },
      ],
    },
    {
      type: 'confirm',
      name: 'subjectDotAtEnd',
      message: 'Does the subject put dot (.) at end?',
      default: false,
    },
  ]
}

const generateTemplateFile = (templateFileName, answers, dryRun = false) => {
  let typeName = ''
  if (answers.type) {
    if (answers.emoji) {
      typeName = '<emoji> '
    } else {
      typeName = '<type>: '
    }
  }

  const file = `${typeName}<subject>

<body>`

  writeFile(path.join('.', templateFileName), file, dryRun)
}

const generateDefinitionsFile = (definitionsFileName, answers, dryRun = false) => {
  const content = {}

  if (answers.type) {
    const name = answers.emoji ? 'emoji' : 'type'

    let values = _.map(answers.typeList, (type) => {
      return { name: type[0], description: type[1] }
    })

    content[name] = {
      type: 'enum',
      required: true,
      description: 'commit type',
      values: values,
    }
  }

  content.subject = {
    type: 'string',
    required: true,
    description: 'The subject contains succinct description of the change',
    rules: {
      firstLetter: answers.subjectFirstLetter,
      dotAtEnd: answers.subjectDotAtEnd,
      nonAscii: false,
    },
  }

  content.body = {
    type: 'text',
    default: '',
    required: false,
    description: 'The body contains details of the change',
    rules: {
      firstLetter: 'upper',
      dotAtEnd: true,
      nonAscii: false,
    },
  }

  writeFile(path.join('.', definitionsFileName), yaml.dump(content), dryRun)
}

const promptBool = (text, defaultValue = true) => {
  const defaultStr = defaultValue ? '(Y/n)' : '(y/N)'
  const input = prompt(`${text} ${defaultStr}: `)

  if (defaultValue) {
    if (/^n(o)?/i.test(input)) {
      return false
    } else {
      return true
    }
  } else {
    if (/^y(es)?/i.test(input)) {
      return true
    } else {
      return false
    }
  }
}

const writeFile = (path, text, dryRun = false) => {
  if (fs.existsSync(path)) {
    if (promptBool(`${colors.warning}'${path}' is already exists. over write it?${colors.reset}`, false)) {
      if (dryRun) {
        console.log('-------------------------')
        console.log(text)
        console.log('-------------------------')
      } else {
        fs.writeFileSync(path, text)
      }
    } else {
      console.log(`Canceled generate '${path}'.`)
    }
  } else {
    if (dryRun) {
      console.log('-------------------------')
      console.log(text)
      console.log('-------------------------')
    } else {
      fs.writeFileSync(path, text)
    }
  }
}

//
// Main
//
export default async (program, templateFileName, definitionsFileName) => {
  const options = program.opts()

  await inquirer.prompt(createQuestions()).then((answers) => {
    generateTemplateFile(templateFileName, answers, options.dryRun)
    generateDefinitionsFile(definitionsFileName, answers, options.dryRun)

    console.log()
    console.log(`${colors.success}Generated '${templateFileName}' and '${definitionsFileName}'.${colors.reset}`)
    console.log(`${colors.success}You can edit them freely.${colors.reset}`)
    console.log(`${colors.success}Enjoy!${colors.reset}`)
  })
}
