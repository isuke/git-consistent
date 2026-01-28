#!/usr/bin/env node

import path from 'path'
import fs from 'fs'
import _ from 'lodash'
import yaml from 'js-yaml'
import url from 'url'
import { Command } from 'commander'
import { execSync } from 'child_process'

import colors from './colors.js'
import main from './main.js'
import genConfig from './gen-config.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const templateFileName = '.gitcommit_template'
const definitionsFileName = '.git_consistent.yaml'
const definitionsFileNameCandidates = [
  '.git_consistent.yaml',
  '.git_consistent.yml',
  '.git_consistent',
  'git_consistent.yaml',
  'git_consistent.yml',
  'git_consistent',
]

const program = new Command()

const pk = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json')))
const version = pk.version

//
// Functions
//
const getGitProjectRootPath = () => {
  try {
    return execSync('git rev-parse --show-toplevel 2> /dev/null').toString().trim()
  } catch (_e) {
    return undefined
  }
}

const getFilePath = (filePaths, fileNames) => {
  const candidates = Array.isArray(fileNames) ? fileNames : [fileNames]

  for (const basePath of filePaths) {
    if (!basePath) continue
    for (const name of candidates) {
      const fullPath = path.join(basePath, name)
      if (fs.existsSync(fullPath)) return fullPath
    }
  }

  return undefined
}

const loadYaml = (path) => {
  return yaml.load(fs.readFileSync(path, 'utf8'))
}

const setCustomOptions = (program, definitions) => {
  _.forEach(definitions, (definition, term) => {
    const optionName = term == 'subject' ? `-m, --${term}` : `--${term}`
    const valueStr = definition.required ? `<${term}>` : `[${term}]`
    const defaultValue = definition.default
    if (!['variable', 'branch'].includes(definition.type)) program.option(`${optionName} ${valueStr}`, definition.description, defaultValue)
  })
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
const definitionsFilePath = getFilePath([rootPath, process.env.HOME], definitionsFileNameCandidates)

program
  .option('-d, --duet', 'run git-duet mode')
  .option('-D, --dry-run', 'run dry-run mode')
  .option('-i, --interactive', 'run interactive mode')
  .option('-S, --silent', "don't show commit command")
  .option('-I, --init', 'generate config files')
  .on('--help', () => {
    console.log('')
    console.log('File Paths:')
    console.log(`  ${templateFileName}:\t ${templateFilePath}`)
    console.log(`  ${definitionsFileName}:    \t ${definitionsFilePath}`)
  })
  .version(version)

if (['-I', '--init'].includes(process.argv[2])) {
  runInit(program)
} else if (['-h', '--help'].includes(process.argv[2])) {
  runHelp(program, definitionsFilePath)
} else {
  runMain(program, templateFilePath, definitionsFilePath)
}
