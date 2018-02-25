const path       = require('path')
const fs         = require('fs')
const _          = require('lodash')
const execSync   = require('child_process').execSync
const prompt     = require('prompt-sync')()
const csvParse   = require('csv-parse/lib/sync')
const yaml       = require('js-yaml')

const colors = require('./colors')

//
// Functions
//
const getMaxLength = (types, headName) => {
  return _(types).map(headName).map((n) => { return n.length }).max()
}

const createChoices = (types) => {
  const maxLengths = {}
  _(types[0]).keys().forEach((key) => {
    maxLengths[key] = getMaxLength(types, key)
  })

  return _.map(types, (type) => {
    return _.map(type, (value, key) => {
      return _.padEnd(type[key], maxLengths[key])
    }).join(" ")
  }).join("\n")
}

const selectTypes = (types) => {
  const header = "choice types by <TAB>"
  const choices = createChoices(types)
  const command = `echo "${choices.replace(/"/g, '\\"')}" | fzf -m --reverse --header="${header}"`
  const selectedValues = execSync(command, { stdio: ['inherit', 'pipe', 'inherit'], shell: true }).toString().trim().split("\n")

  const selectedNames = selectedValues.map((v) => { return _.words(v)[0] })

  return _.filter(types, (type) => {
    return selectedNames.includes(type.name)
  })
}

const promptBool = (text, defaultValue = true) => {
  const defaultStr = defaultValue ? '(Y/n)' : '(y/N)'
  const input = prompt(`${text} ${defaultStr}: `)

  if (defaultValue) {
    if ((/^n(o)?/i).test(input)) {
      return false
    } else {
      return true
    }
  } else {
    if ((/^y(es)?/i).test(input)) {
      return true
    } else {
      return false
    }
  }
}

const generateTemplateFile = (templateFileName, templateDefines, dryRun = false) => {
  let typeName = ''
  if(templateDefines.type) {
    if(templateDefines.type.useEmoji) {
      typeName = '<emoji> '
    } else {
      typeName = '<type>: '
    }
  }

  const file = `${typeName}<subject>

<body>`

  writeFile(path.join('.', templateFileName), file, dryRun)
}

const generateDefinitionsFile = (definitionsFileName, templateDefines, dryRun = false) => {
  const content = {}

  if(templateDefines.type) {
    const name = templateDefines.type.useEmoji ? 'emoji' : 'type'

    let values = []
    if(templateDefines.type.useEmoji) {
      values = _.map(templateDefines.type.types, (type) => {
        return {
          name: type.emojiSign,
          description: `${type.meaning}: ${type.description}`,
        }
      })
    } else {
      values = _.map(templateDefines.type.types, (type) => {
        return {
          name: type.name,
          description: `${type.meaning}: ${type.description}`,
        }
      })
    }

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
      firstLatter: templateDefines.subject.lowerCaseStart ? 'lower' : 'upper',
      dotAtEnd:    templateDefines.subject.dotAtEnd,
      ascii:       false,
    }
  }

  content.body = {
    type: 'text',
    default: '',
    required: false,
    description: 'The body contains details of the change',
    rules: {
      firstLatter: 'upper',
      dotAtEnd:    true,
      ascii:       false,
    }
  }

  writeFile(path.join('.', definitionsFileName), yaml.safeDump(content), dryRun)
}

const writeFile = (path, text, dryRun = false) => {
  if (fs.existsSync(path)) {
    if(promptBool(`${colors.warning}'${path}' is already exists. over write it?${colors.reset}`, false)) {
      if (dryRun) {
        console.log("-------------------------")
        console.log(text)
        console.log("-------------------------")
      } else {
        fs.writeFileSync(path, text)
      }
    } else {
      console.log(`Canceled generate '${path}'.`)
    }
  } else {
    if (dryRun) {
      console.log("-------------------------")
      console.log(text)
      console.log("-------------------------")
    } else {
      fs.writeFileSync(path, text)
    }
  }
}

//
// Main
//
module.exports = (program, templateFileName, definitionsFileName, dryRun = false) => {
  const templateDefines = {}

  if(promptBool(`${colors.message}Use Type?${colors.reset}`, true)) {
    const typesCsv = fs.readFileSync(path.join('lib', 'types.csv'))
    const types = csvParse(typesCsv, {columns: true})

    templateDefines.type = {
      types: selectTypes(types),
      useEmoji: promptBool(`${colors.message}Use Emoji?${colors.reset}`, false),
    }
  }

  templateDefines.subject = {
    lowerCaseStart: promptBool(`${colors.message}Does the subject start with lower case?${colors.reset}`, true),
    dotAtEnd: promptBool(`${colors.message}Does the subject put dot (.) at end?${colors.reset}`, false),
  }

  generateTemplateFile(templateFileName, templateDefines, program.dryRun)
  generateDefinitionsFile(definitionsFileName, templateDefines, program.dryRun)

  console.log(`Generated '${templateFileName}' and '${definitionsFileName}'.`)
  console.log(`You can edit them freely.`)
  console.log(`Enjoy!`)
}
