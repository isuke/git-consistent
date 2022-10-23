import test from 'ava'
import sinon from './../node_modules/sinon/pkg/sinon-esm.js'
import outdent from 'outdent'

import main from './../lib/main.js'

test.beforeEach((t) => {
  t.context.consoleStub = sinon.stub(console, 'log')
})

test.afterEach((t) => {
  t.context.consoleStub.restore()
})

test('main : simple case', async (t) => {
  const type = 'feat'
  const subject = 'first commit'
  const body = `this is body`
  const program = {}
  program.opts = function () {
    return {
      type: type,
      subject: subject,
      body: body,
      dryRun: true,
      silent: true,
    }
  }
  const template = outdent`
    <type>: <subject>

    <body>
  `
  const definitions = {
    type: {
      type: 'enum',
      required: true,
      values: [{ name: 'feat' }, { name: 'doc' }],
    },
    subject: {
      type: 'string',
      required: true,
    },
    body: {
      type: 'text',
      required: false,
    },
  }

  const expectedCommitMessage = outdent`
    feat: first commit

    this is body
  `

  await main(program, template, definitions)
  t.true(t.context.consoleStub.calledWith(expectedCommitMessage))
})
