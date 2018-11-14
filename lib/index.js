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

const version = '0.9.6'

//
// Functions
//
const getGitProjectRootPath = () => {
  try {
    return execSync('git rev-parse --show-toplevel 2> /dev/null')
      .toString()
      .trim()
  } catch (_e) {
    return undefined
  }
}

const getFilePath = (filePaths, fileName) => {
  const filePath = filePaths.find((filePath) => fs.existsSync(path.join(filePath, fileName)))

  return filePath ? path.join(filePath, fileName) : undefined
}

const loadYaml = (path) => {
  return yaml.safeLoad(fs.readFileSync(path, 'utf8'))
}

const setCustomOptions = (program, definitions) => {
  program.option('', '---- custom options ----')
  _.forEach(definitions, (definition, term) => {
    const optionName = term == 'subject' ? `-m, --${term}` : `--${term}`
    const valueStr = definition.required ? `<${term}>` : `[${term}]`
    const defaultValue = definition.default
    if (!['variable', 'branch'].includes(definition.type)) program.option(`${optionName} ${valueStr}`, definition.description, defaultValue)
  })
  program.option('', '---- custom options ----')
}

const showErrorMessageAndExit = (e) => {
  console.error(`${colors.error}${e.message}${colors.reset}`)
  e.status ? process.exit(e.status) : process.exit(1)
}

const runInit = (program) => {
  program.parse(process.argv)

  genConfig(program, templateFileName, definitionsFileName).catch((e) => showErrorMessageAndExit(e))
}

const runMain = (program, templateFilePath, definitionsFilePath) => {
  if (!templateFilePath) throw new Error(`Not found '${templateFileName}'.`)
  if (!definitionsFilePath) throw new Error(`Not found '${definitionsFileName}'.`)

  const template = fs.readFileSync(templateFilePath, 'utf8')
  const definitions = loadYaml(definitionsFilePath)

  setCustomOptions(program, definitions)

  program.parse(process.argv)

  main(program, template, definitions).catch((e) => showErrorMessageAndExit(e))
}

const runHelp = (program, definitionsFilePath) => {
  if (definitionsFilePath) setCustomOptions(program, loadYaml(definitionsFilePath))

  program.parse(process.argv)
}

//
// Main
//
const rootPath = getGitProjectRootPath() || '.'
const templateFilePath = getFilePath([rootPath, process.env.HOME], templateFileName)
const definitionsFilePath = getFilePath([rootPath, process.env.HOME], definitionsFileName)

program
  .option('-d, --duet', 'run git-duet mode')
  .option('-D, --dry-run', 'run dry-run mode')
  .option('-i, --interactive', 'run interactive mode')
  .option('-S, --silent', "don't show commit command")
  .option('-t, --typo-check', `${colors.error}[Already deleted this function]${colors.reset} check spell`)
  .on('--help', () => {
    console.log('')
    console.log('File Paths:')
    console.log(`  ${templateFileName}:\t ${templateFilePath}`)
    console.log(`  ${definitionsFileName}:    \t ${definitionsFilePath}`)
  })
  .version(version)

program
  .command('init')
  .description('generate config files')
  .option('-D, --dry-run', 'run dry-run mode')
  .action(() => {
    /* no-op */
  })

if (process.argv[2] === 'init') {
  runInit(program)
} else if (['-h', '--help'].includes(process.argv[2])) {
  runHelp(program, definitionsFilePath)
} else {
  runMain(program, templateFilePath, definitionsFilePath)
}
