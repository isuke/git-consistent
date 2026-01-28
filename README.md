# git-consistent

[![Test and Lint](https://github.com/isuke/git-consistent/actions/workflows/main.yml/badge.svg)](https://github.com/isuke/git-consistent/actions/workflows/main.yml)
[![npm version](https://img.shields.io/npm/v/git-consistent.svg)](https://www.npmjs.com/package/git-consistent)
[![License: MIT](https://img.shields.io/github/license/mashape/apistatus.svg)](https://raw.githubusercontent.com/isuke/advanced-poe-filter/main/LICENSE)
[![git-consistent friendly](https://img.shields.io/badge/git--consistent-friendly-brightgreen.svg)](https://github.com/isuke/git-consistent)

<p align="center">
  <img src="https://raw.githubusercontent.com/isuke/git-consistent/images/git-consistent01.gif" alt="git-consistent demo">
</p>

**Give consistency to your project's git logs.**

`git-consistent` helps you and your team maintain a consistent and readable git commit history by enforcing a configurable commit message format.

Supported Node.js versions:
[!["node v16"](https://img.shields.io/badge/node-v16-026e00.svg)](https://nodejs.org/en/download/releases)
[!["node v18"](https://img.shields.io/badge/node-v18-026e00.svg)](https://nodejs.org/en/download/releases)
[!["node v20"](https://img.shields.io/badge/node-v20-026e00.svg)](https://nodejs.org/en/download/releases)
[!["node v22"](https://img.shields.io/badge/node-v22-026e00.svg)](https://nodejs.org/en/download/releases)
[!["node v24"](https://img.shields.io/badge/node-v24-026e00.svg)](https://nodejs.org/en/download/releases)

## Features

- **Interactive & Inline Modes**: Create commits interactively or directly from the command line.
- **Customizable Commit Format**: Define your own commit message structure with a simple YAML configuration file (`.git_consistent.yaml`).
- **Validation Rules**: Enforce standards like case rules for the subject, character limits, and more.
- **Dynamic Variables**: Automatically insert values like issue numbers into your commit messages.
- **Branch Name Parsing**: Extract information (e.g., issue IDs) directly from your git branch name.
- **Emoji Support**: Easily include emojis in your commit types.
- **git-duet Integration**: Works with `git-duet` for pair programming commits.

## Installation

```sh
npm install -g git-consistent
```

### Optional: Set up a Git Alias

For easier access, you can create a git alias.

```sh
git config --global alias.con "consistent -i"
```

This allows you to run `git con` instead of `git consistent -i`.

### Optional: Configure Your Editor

For multiline commit bodies, `git-consistent` uses the editor defined in your environment variables.

```sh
# For Visual Studio Code
export EDITOR='code -w'

# For Cursor
export EDITOR='cursor -w'
```

## Getting Started

### 1. Initialize Configuration

Run the init command in your project repository.

```sh
git consistent --init
```

This will ask you a few questions and generate two files:
- `.git_consistent.yaml`: Your configuration file.
- `.gitcommit_template`: The template for your commit messages.

Feel free to edit these files to match your project's conventions.

### 2. Create a Commit

You can create commits in several ways.

#### Interactive Mode

Run `git consistent` in interactive mode to be prompted for each part of the commit message.

```sh
$ git consistent -i
? Select type: feat
? Enter subject: implement new feature
? Enter body multiline:
This is an amazing new feature.
```

You can also combine interactive mode with command-line arguments. The tool will only prompt for the missing parts.

```sh
$ git consistent -i --subject="implement new feature"
? Select type: feat
? Enter body multiline:
This is an amazing new feature.
```

#### Inline Mode

Provide all the information using command-line flags.

```sh
git consistent --type="feat" --subject="implement new feature" --body="This is an amazing feature."
```

## Configuration (`.git_consistent.yaml`)

The `.git_consistent.yaml` file allows you to define and customize the structure of your commit messages. It uses a simple YAML-like format.

Here is the basic structure:

```yml
<term>:
  <option key>: <option value>
  <option key>: <option value>
<term>:
  <option key>: <option value>
```

Each `<term>` corresponds to a variable in your `.gitcommit_template` file.

### Configuration Options

| Key | Description | Possible Values |
| :--- | :--- | :--- |
| `type` | The input type for the term. | `enum`, `string`, `text`, `variable`, `branch` |
| `required` | Whether the term is mandatory. | `true`, `false` |
| `description` | A description shown in interactive mode. | string |
| `values` | A list of options for `enum` type. | Array of `{ name, description }` objects |
| `prefix` | A string to add before the input value. | string |
| `suffix` | A string to add after the input value. | string |
| `default` | A default value for the term. | string |
| `origin` | (`type: variable` only) The source term for the variable's value. | string (name of another term) |
| `regExp` | (`type: branch` only) A regex to extract a value from the branch name. | string |
| `regExpMatchNum` | (`type: branch` only) The match group index from `regExp`. | integer |
| `regExpFlag` | (`type: branch` only) A flag for the regex (e.g., `i` for case-insensitive). | string |
| `rules` | A set of validation rules for the input. | Object |

### Validation Rules (`rules`)

| Rule | Description | Possible Values |
| :--- | :--- | :--- |
| `firstLetter` | Enforces the case of the first letter. | `upper`, `lower` |
| `dotAtEnd` | Requires or disallows a dot at the end. | `true`, `false` |
| `nonAscii` | Allows or disallows non-ASCII characters. | `true`, `false` |
| `numberOnly` | Restricts the input to numbers only. | `true`, `false` |
| `maxLength` | The maximum allowed length of the string. | integer |
| `minLength` | The minimum allowed length of the string. | integer |

### Examples

#### Decorators

Add a prefix and suffix to a `scope` field.

```yml
scope:
  type: text
  required: false
  description: 'The scope could be specifying place of the commit change.'
  prefix: '('
  suffix: ')'
```

#### Validation

Enforce that a `subject` starts with a lowercase letter and has no dot at the end.

```yml
subject:
  type: string
  required: true
  description: 'The subject contains succinct description of the change'
  rules:
    firstLetter: lower
    dotAtEnd: false
```

#### Variables

Create a `githubIssueUrl` variable based on a `githubIssueNum` input.

**`.gitcommit_template`:**
```
<githubIssueNum> <subject>

<githubIssueUrl>
<body>
```

**`.git_consistent.yaml`:**
```yml
githubIssueNum:
  type: string
  required: false
  description: 'GitHub issue number'
  prefix: 'fix #'
subject:
  type: string
  required: true
  description: 'The subject contains succinct description of the change'
githubIssueUrl:
  type: variable
  origin: githubIssueNum
  description: 'GitHub issue URL'
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

#### Extracting from Branch Name

Automatically generate an issue link from a branch name like `issue/123-feature-name`.

**`.gitcommit_template`:**
```
<subject>

<issueLink>
<body>
```

**`.git_consistent.yaml`:**
```yml
issueLink:
  type: branch
  required: false
  description: 'GitHub issue link'
  regExp: 'issue/([0-9]+)'
  regExpMatchNum: 1
  prefix: 'https://github.com/you/repository/issues/'
  suffix: "\n"
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

#### Emoji Support

Use an `enum` to provide a list of emojis for the commit type.

```yml
emoji:
  type: enum
  required: true
  description: 'Commit type'
  values:
    - name: ':heavy_plus_sign:'
      description: 'When implementing a new feature'
    - name: ':sunny:'
      description: 'When fixing a bug'
    - name: ':art:'
      description: 'When refactoring code'
```

This will display a selectable list in interactive mode:

<p align="center">
  <img src="https://raw.githubusercontent.com/isuke/git-consistent/images/git-consistent02_emoji.png" alt="Emoji support">
</p>

## Integrations

### git-duet

Use the `-d` or `--duet` flag to commit with `git-duet` authors.

```sh
git consistent -d --type="feat" --subject="duet test"
```

This will add a `Signed-off-by:` trailer to the commit message.

## Command Reference

| Option | Alias | Description |
| :--- | :--- | :--- |
| `--duet` | `-d` | Run in `git-duet` mode. |
| `--dry-run` | `-D` | Run in dry-run mode (don't commit). |
| `--interactive` | `-i` | Run in interactive mode. |
| `--silent` | `-S` | Don't show the final `git commit` command. |
| `--init` | `-I` | Generate configuration files. |
| `--version` | `-V` | Output the version number. |
| `--help` | `-h` | Output usage information. |
| `--type <type>` | | Set the commit type. |
| `--subject <subject>` | `-m` | Set the commit subject. |
| `--body [body]` | | Set the commit body. |

## Samples

See more examples and advanced use cases:
- [Commitizen Sample](https://gist.github.com/isuke/183057f709b14b997772ffee0a226e66)
- [Issue Link Sample](https://gist.github.com/isuke/1cc2931e30b4d59b2b623741ebff242b)
- [Issue Link from Branch Name Sample](https://gist.github.com/isuke/03d83037f13a671d0f0a0af5d76496f8)
- [Emoji Sample](https://gist.github.com/isuke/fade15cf04b9e172ee76c2784119b44e)
- [Sample Type List](https://github.com/isuke/git-consistent/blob/master/sample_type_list.md)

## Badge for Your Project

Show that your project uses `git-consistent` by adding this badge to your `README.md`.

![git-consistent friendly](https://img.shields.io/badge/git--consistent-friendly-brightgreen.svg)

**Markdown**
```markdown
[![git-consistent friendly](https://img.shields.io/badge/git--consistent-friendly-brightgreen.svg)](https://github.com/isuke/git-consistent)
```

**reStructuredText**
```rst
.. image:: https://img.shields.io/badge/git--consistent-friendly-brightgreen.svg
   :alt: git-consistent friendly
   :target: https://github.com/isuke/git-consistent
```

**AsciiDoc**
```adoc
image:https://img.shields.io/badge/git--consistent-friendly-brightgreen.svg["git-consistent friendly",link="https://github.com/isuke/git-consistent"]
```
