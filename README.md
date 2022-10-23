# git-consistent [!["Build Status"](https://travis-ci.org/isuke/git-consistent.svg?branch=master)](https://travis-ci.org/isuke/git-consistent) [!["npm"](https://img.shields.io/npm/v/git-consistent.svg)](https://www.npmjs.com/package/git-consistent) [!["git-consistent friendly"](https://img.shields.io/badge/git--consistent-friendly-brightgreen.svg)]("https://github.com/isuke/git-consistent")

![](https://raw.githubusercontent.com/isuke/git-consistent/images/git-consistent01.gif)

Give consistency to your project's git logs.

## Samples

- [commitizen sample](https://gist.github.com/isuke/183057f709b14b997772ffee0a226e66)
- [issue link sample](https://gist.github.com/isuke/1cc2931e30b4d59b2b623741ebff242b)
- [issue link by branch name sample](https://gist.github.com/isuke/03d83037f13a671d0f0a0af5d76496f8)
- [emoji sample](https://gist.github.com/isuke/fade15cf04b9e172ee76c2784119b44e)

## Install

```sh
$ npm install -g git-consistent
# or
$ yarn global add git-consistent
```

### Optional settings

```sh
# set alias
$ git config --global alias.con "consistent -i"

# setting editor (for text type input) if you use editor other than vim.
$ export EDITOR='code -w'
# or
$ export EDITOR='atom -w'
# or
$ export EDITOR='subl -w'
# or etc.
```

## Usage

### Init

```sh
$ git consistent init
Use Type? (Y/n): Y
Use Emoji? (y/N): N
Does the subject start with lower case? (Y/n): Y
Does the subject put dot (.) at end? (y/N): Y

Generated '.gitcommit_template' and '.git_consistent'.
You can edit them freely.
Enjoy!
```

### Output usage

```sh
$ git-consistent --help

  Usage: git-consistent [options]


  Options:

    --type <type>            commit type
    -m, --subject <subject>  The subject contains succinct description of the change
    --body [body]            The body contains details of the change (default: )
    ...
    -V, --version            output the version number
    -h, --help               output usage information
```

### Inline mode

```sh
$ git consistent --type="feat" --subject="implement new feature" --body="This is amazing feature."
```

### Interactive mode

```sh
$ git consistent -i
Select type: feat
Enter subject: implement new feature
Enter body multiline:
This is amazing feature.
```

You can use both mode interactive and inline at the same time.
In that case, you input value that are not given as option only.

```sh
$ git consistent -i --subject="implement new feature"
Select type: feat
Enter body multiline:
This is amazing feature.
```

`--subject` have alias of `-m`.
You can commit like you normally do!

```
$ git config --global alias.con "consistent -i"
$ git con -m "write README"
? Select type: docs
git commit -m "docs: write README"
```

### Advance
#### Decorate

```yml
scope:
  type: text
  required: false
  description: 'The scope could be specifying place of the commit change.'
  prefix: '('
  suffix: ')'
```

#### format check

```yml
subject:
  type: string
  required: true
  description: 'The subject contains succinct description of the change'
  rules:
    firstLatter: lower
    dotAtEnd: false
    ascii: false
```

```sh
$ git consistent --subject="Write documents."
subject must be first latter is lowercase.
subject should put dot (.) at the end.

$ git consistent --subject="ドキュメントを書いた"
subject must be first latter is lowercase.
subject should only alphabet.
```

#### variables

```
<githubIssueNum> <subject>

<githubIssueUrl>
<body>
```

```yml
githubIssueNum:
  type: string
  required: false
  description: 'github issue number'
  prefix: 'fix #'
subject:
  type: string
  required: true
  description: 'The subject contains succinct description of the change'
githubIssueUrl:
  type: variable
  origin: githubIssueNum
  description: 'github issue url'
  prefix: 'https://github.com/isuke/git-consistent/issues/'
body:
  type: text
  default: ''
  required: false
  description: 'The body contains details of the change'
```

```sh
$ git consistent -i --subject="test" --body="This is test."
Enter githubIssueNum: 12

$ git log -n 1
commit a9d6457f3674c8620fbe72c769cee09ba5459f02
Author: isuke <isuke770@gmail.com>
Date:   Sat Feb 10 17:40:33 2018 +0900

    fix #12 test

    https://github.com/isuke/git-consistent/issues/12
    This is test.
```

#### branch

```
<subject>

<issueLink><body>
```

```yml
...
issueLink:
  type: branch
  required: false
  description: 'Github issue link'
  regExp: 'issue([0-9]+)'
  prefix: 'https://github.com/you/repository/issues/'
  suffix: "\n"
...
```

```sh
$ git branch
* issue123_hoge
  master

$ git consistent -i --subject="test" --body="This is test."

$ git log -n 1
commit a9d6457f3674c8620fbe72c769cee09ba5459f02
Author: isuke <isuke770@gmail.com>
Date:   Sat Feb 10 17:40:33 2018 +0900

    test

    https://github.com/you/repository/issues/123
    This is test.
```

#### emoji

```yml
emoji:
  type: enum
  required: true
  description: 'commit type'
  values:
    -
      name: ':heavy_plus_sign:'
      description: 'when implementing function'
    -
      name: ':sunny:'
      description: 'when fixing a bug'
    -
      name: ':art:'
      description: 'when refactoring'
```

![](https://raw.githubusercontent.com/isuke/git-consistent/images/git-consistent02_emoji.png)

#### git-duet

Run [git-duet](https://github.com/git-duet/git-duet) mode when with `-d` option.

```sh
$ git consistent -d --type="feat" --subject="duet test" --body=""

$ git log -n 1
Author: isuke <isuke770@gmail.com>
Date:   Sat Feb 10 15:13:40 2018 +0900

    feat: duet test

    Signed-off-by: foo <foo@example.con>
```

## Type list sample

[sample type list](https://github.com/isuke/git-consistent/blob/master/sample_type_list.adoc)

## .git_consistent format

```
<term>:
  <option key>: <option value>
  <option key>: <option value>
  <option key>: <option value>
<term>:
  <option key>: <option value>
  <option key>: <option value>
  <option key>: <option value>
<term>:
  <option key>: <option value>
  <option key>: <option value>
  <option key>: <option value>
```

| key              | description                                        | value                                                                    |
| ---------------- | -------------------------------------------------- | ------------------------------------------------------------------------ |
| term             | .gitcommit_template's term                         | string                                                                   |
| option key       | term's options                                     | `type`, `required`, `description`, `values`, `prefix`, `suffix`, `rules` |
| `type`           | term's input type                                  | `enum`, `string`, `text`, `variable`, `branch`                           |
| `required`       | required?                                          | boolean                                                                  |
| `description`    | term's description                                 | string                                                                   |
| `values`         | enum's values                                      | Array                                                                    |
| `prefix`         | a decoration to be attached before the input value | string                                                                   |
| `suffix`         | a decoration to be attached after the input value  | string                                                                   |
| `regExp`         | (`type: branch` only) regular expression for extracting values from branch names        | string                              |
| `regExpMatchNum` | (`type: branch` only) number of values to retrieve from the match specified by `regExp` | string                              |
| `regExpFlag`     | (`type: branch` only) `regExp`'s falg              | `i`                                                                      |
| `rules`          | input value format rules                           | Object                                                                   |
| rule key         | rule's type                                        | `firstLatter`, `dotAtEnd`, `nonAscii`, `numberOnly`                      |
| `firstLatter`    | upper case or lower case about input value's first latter                               | `upper`, `lower`                    |
| `dotAtEnd`       | need dot (`.`) input value's last                  | boolean                                                                  |
| `nonAscii`       | Use not ascii symbols                              | boolean                                                                  |
| `numberOnly`     | number only?                                       | boolean                                                                  |
| `maxLength`      | max length of string                               | integer                                                                  |
| `minLength`      | min length of string                               | integer                                                                  |

## Command options

| Option              | Description               |
| ------------------- | ------------------------- |
| `-d, --duet`        | run git-duet mode         |
| `-D, --dry-run`     | run dry-run mode          |
| `-i, --interactive` | run interactive mode      |
| `-S, --silent`      | don't show commit command |
| `-V, --version`     | output the version number |

## Badges

![git-consistent friendly](https://img.shields.io/badge/git--consistent-friendly-brightgreen.svg)

* Markdown
```
[![git-consistent friendly](https://img.shields.io/badge/git--consistent-friendly-brightgreen.svg)](https://github.com/isuke/git-consistent)
```

* reStructuredText
```
.. image:: https://img.shields.io/badge/git--consistent-friendly-brightgreen.svg   :alt: git-consistent friendly   :target: https://github.com/isuke/git-consistent
```

* AsciiDoc
```
image:https://img.shields.io/badge/git--consistent-friendly-brightgreen.svg["git-consistent friendly",link="https://github.com/isuke/git-consistent"]
```
