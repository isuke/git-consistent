# git consistent

![anigif01](https://raw.githubusercontent.com/isuke/git-consistent/images/git-consistent01.gif)

## Samples

- [commitizen sample](https://gist.github.com/isuke/183057f709b14b997772ffee0a226e66)
- [issue link sample](https://gist.github.com/isuke/1cc2931e30b4d59b2b623741ebff242b)
- [emoji sample](https://gist.github.com/isuke/fade15cf04b9e172ee76c2784119b44e)

## Install

**You need install [fzf](https://github.com/junegunn/fzf) if you use interactive mode.**

```
$ npm install -g git-consistent
# or
$ yarn global add git-consistent

$ git config --global alias.con "consistent -i -t" # recommended option
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

### output usage

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

You can use both mode interactive and inline at the same time.
In that case, you input value that are not given as option only.

```sh
$ git consistent -i --subject="implement new feature"
Select type: feat
Enter body multiline:
This is amazing feature.
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

$ git consistent -i
Enter subject:
subject is required.
Enter subject: Write documents.
subject must be first latter is lowercase.
subject should put dot (.) at the end.
Enter subject: write document
```

#### variables

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

#### spell check

With `-t` option.

```sh
$ git consistent -t --type="feat" --scope="" --subject="this is some text we want to ceck for typos"
git commit -m "feat: this is some text we want to ceck for typos"
Is 'ceck' misspelled? Did you mean that? 'check', 'ceca', 'neck', 'cock', 'deck', 'peck', 'heck', 'beck', 'Peck', 'Beck', 'Keck'
```

#### emoji

```
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

![emoji02](https://raw.githubusercontent.com/isuke/git-consistent/images/git-consistent02_emoji.png)

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

| key           | description                                               | value                                                                    |
|---------------|-----------------------------------------------------------|--------------------------------------------------------------------------|
| term          | `.gitcommit_template`'s term                              | string                                                                   |
| option key    | term's options                                            | `type`, `required`, `description`, `values`, `prefix`, `suffix`, `rules` |
| `type`        | term's input type                                         | `enum`, `string`, `text`, `variable`                                     |
| `required`    | required?                                                 | boolean                                                                  |
| `description` | term's description                                        | string                                                                   |
| `values`      | enum's values                                             | Array                                                                    |
| `prefix`      | a decoration to be attached before the input value        | string                                                                   |
| `suffix`      | a decoration to be attached after the input value         | string                                                                   |
| `rules`       | input value format rules                                  | Object                                                                   |
| rule key      | rule's type                                               | `firstLatter`, `dotAtEnd`, `ascii`, `numberOnly`                         |
| `firstLatter` | upper case or lower case about input value's first latter | `upper`, `lower`                                                         |
| `dotAtEnd`    | need dot (`.`) input value's last                         | boolean                                                                  |
| `ascii`       | allow ASCII?                                              | boolean                                                                  |
| `numberOnly`  | number only?                                              | boolean                                                                  |


## command options

| Option               | Description                                          |
|----------------------|------------------------------------------------------|
| `-d, --duet`         | run git-duet mode                                    |
| `-D, --dry-run`      | run dry-run mode                                     |
| `-i, --interactive`  | run interactive mode                                 |
| `-s, --skip-options` | skip not required term input (interactive mode only) |
| `-S, --silent`       | dont show commit command                             |
| `-t, --typo-check`,  | check spell                                          |
| `-V, --version`      | output the version number                            |

---

# TODO
## Develop
### test

```sh
$ yarn run test
```
