const test = require('ava')
const sinon = require('sinon')
const outdent = require('outdent')

const main = require('../lib/main')

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
  const program = {
    type: type,
    subject: subject,
    body: body,
    dryRun: true,
    silent: true,
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
  const terms = ['type', 'subject', `body`]

  const expectedCommitMessage = outdent`
    feat: first commit

    this is body
  `

  await main(program, template, definitions, terms)
  t.true(t.context.consoleStub.calledWith(expectedCommitMessage))
})
