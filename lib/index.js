#!/usr/bin/env node

const program = require('commander')
const path = require('path')
const fs = require('fs')
const _ = require('lodash')
const execSync = require('child_process').execSync
const yaml = require('js-yaml')

const colors = require('./colors')
const main = require('./main')
const genConfig = require('./gen-config')

const templateFileName = '.gitcommit_template'
const definitionsFileName = '.git_consistent'

const version = '0.9.5'

//
// Functions
//
const getProjectRoot = () => {
  try {
    return execSync('git rev-parse --show-toplevel 2> /dev/null')
      .toString()
      .trim()
  } catch (_e) {
    throw new Error('Not a git repository')
  }
}

const getFilePath = (rootPath, fileName) => {
  let result

  result = path.join(rootPath, fileName)
  if (fs.existsSync(result)) return result

  result = path.join(process.env.HOME, fileName)
  if (fs.existsSync(result)) return result

  throw new Error(`Not found '${fileName}'.`)
}

const loadDefinitions = (path) => {
  return yaml.safeLoad(fs.readFileSync(path, 'utf8'))
}

const setOptions = (program, definitions, terms) => {
  if (_.isEmpty(terms)) {
    return program
  } else {
    const term = terms[0]
    const definition = definitions[term]
    const type = definition.type
    const optionName = term == 'subject' ? `-m, --${term}` : `--${term}`
    const valueStr = definition.required ? `<${term}>` : `[${term}]`
    const defaultValue = definition.default
    if (!['variable', 'branch'].includes(type)) program.option(`${optionName} ${valueStr}`, definition.description, defaultValue)
    return setOptions(program, definitions, _.tail(terms))
  }
}

const customHelp = (program, templateFilePath, definitionsFilePath) => {
  program.on('--help', () => {
    console.log('')
    console.log('File Paths:')
    console.log(`  ${templateFileName}:\t ${templateFilePath}`)
    console.log(`  ${definitionsFileName}:    \t ${definitionsFilePath}`)
  })
}

//
// Main
//
program
  .option('-d, --duet', 'run git-duet mode')
  .option('-D, --dry-run', 'run dry-run mode')
  .option('-i, --interactive', 'run interactive mode')
  .option('-S, --silent', "don't show commit command")
  .option('-t, --typo-check', '[Already deleted this function] check spell')
  .version(version)

program
  .command('init')
  .description('generate config files')
  .option('-D, --dry-run', 'run dry-run mode')
  .action(() => {
    /* no-op */
  })

if (process.argv[2] === 'init') {
  program.parse(process.argv)

  genConfig(program, templateFileName, definitionsFileName).catch((e) => {
    console.error(`${colors.error}${e.message}${colors.reset}`)
    e.status ? process.exit(e.status) : process.exit(1)
  })
} else {
  const projectRoot = getProjectRoot()
  const rootPath = projectRoot === '' ? process.env.HOME : projectRoot

  const templateFilePath = getFilePath(rootPath, templateFileName)
  const definitionsFilePath = getFilePath(rootPath, definitionsFileName)

  const template = fs.readFileSync(templateFilePath, 'utf8')
  const definitions = loadDefinitions(definitionsFilePath)
  const terms = _.keys(definitions)

  customHelp(program, templateFilePath, definitionsFilePath)

  setOptions(program, definitions, terms).parse(process.argv)

  main(program, template, definitions, terms).catch((e) => {
    console.error(`${colors.error}${e.message}${colors.reset}`)
    e.status ? process.exit(e.status) : process.exit(1)
  })
}
