const test = require('ava')
const sinon = require('sinon')
const outdent = require('outdent')

const main = require('../lib/main')

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

  const consoleSpy = sinon.spy(console, 'log')

  const expectedCommitMessage = outdent`
    feat: first commit

    this is body
  `

  await main(program, template, definitions, terms)
  t.true(consoleSpy.calledWith(expectedCommitMessage))

  t.pass()
})
