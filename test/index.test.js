const test = require('ava')
const execSync = require('child_process').execSync
const path = require('path')

const version = '0.9.8'

test('--version', (t) => {
  const output = execSync(`${path.join(__dirname, '../lib/index.js')} --version`)
    .toString()
    .trim()

  t.is(output, version)
})
