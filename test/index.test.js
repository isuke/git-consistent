import test from 'ava'
import path from 'path'
import url from 'url'
import { execSync } from 'child_process'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

test('--version', (t) => {
  const output = execSync(`${path.join(__dirname, '../lib/index.js')} --version`)
    .toString()
    .trim()

  t.is(output, '1.2.0')
})
