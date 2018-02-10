# git consistent

![anigif01](https://raw.githubusercontent.com/isuke/git-consistent/images/git-consistent01.gif)

## Install

You need install [fzf](https://github.com/junegunn/fzf) if you use interactive mode.

```
$ npm install -g git-consistent
# or
$ yarn global add git-consistent

# options
$ git config --global alias.con "consistent -i"
```

## Usage

Please put follow two files to your project root dir.

`.gitcommit_template`
```text
<type>: <subject>

<body>
```

`.git_consistent`
```yml
type:
  type: enum
  required: true
  description: 'commit type'
  values:
    -
      name: feat
      description: 'when implementing function'
    -
      name: fix
      description: 'when fixing a bug'
    -
      name: refactor
      description: 'when refactoring'
    -
      name: docs
      description: 'when writing docs'
subject:
  type: string
  required: true
  description: 'The subject contains succinct description of the change'
body:
  type: text
  default: ''
  required: false
  description: 'The body contains details of the change'
```

### inline mode

```sh
$ git consistent --type="feat" --subject="implement new feature" --body="This is amazing feature."
```

### interactive mode

```sh
$ git consistent -i
Select type: feat
Enter subject: implement new feature
Enter body multiline:
This is amazing feature.
```

## `.git_consistent` format

**TODO**

## options

| Option | Default | Description |
| ------ | ------- | ----------- |
| `-d, --duet` | false | run git-duet mode |
| `-D, --dry-run` | false | run dry-run mode |
| `-i, --interactive` | false | run interactive mode |
| `-s, --skip-options` | false | skip not required term input (interactive mode only) |
| `-V, --version` | | output the version number |

## Output usage information

```sh
$ git-consistent --help
```

## Samples

- [sample01](https://gist.github.com/isuke/183057f709b14b997772ffee0a226e66)

## Advance
### Decorate

```yml
scope:
  type: text
  required: false
  description: 'The scope could be specifying place of the commit change.'
  prefix: '('
  suffix: ')'
```

### format check

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

$ git consistent -i
Enter subject:
subject is required.
Enter subject: Write documents.
subject must be first latter is lowercase.
subject should put dot (.) at the end.
Enter subject: write document
```

### variables

`.gitcommit_template`
```text
<githubIssueNum> <subject>

<githubIssueUrl>
<body>
```

`.git_consistent`
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

### git-duet

Run [git-duet](https://github.com/git-duet/git-duet) mode when with `-d` option.

```sh
$ git consistent -d --type"feat" --subject="duet test" --body=""
```

```
Author: isuke <isuke770@gmail.com>
Date:   Sat Feb 10 15:13:40 2018 +0900

    feat: duet test

    Signed-off-by: foo <foo@example.con>
```

---

# TODO
## feature
### support emoji

## Develop
### test

```sh
$ yarn run test
```
