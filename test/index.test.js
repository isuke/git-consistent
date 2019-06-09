const test = require('ava')
const execSync = require('child_process').execSync
const path = require('path')

test('--version', (t) => {
  const output = execSync(`${path.join(__dirname, '../lib/index.js')} --version`)
    .toString()
    .trim()

  t.is(output, '0.9.9')
})
