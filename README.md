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
:type:
  :type: :enum
  :required: true
  :description: 'commit type'
  :values:
    -
      :name: feat
      :description: 'when implementing function'
    -
      :name: fix
      :description: 'when fixing a bug'
    -
      :name: refactor
      :description: 'when refactoring'
    -
      :name: docs
      :description: 'when writing docs'
:subject:
  :type: :string
  :required: true
  :description: 'The subject contains succinct description of the change'
:body:
  :type: :text
  :required: false
  :description: 'Body'
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
### format check

```sh
$ git consistent --type="feat" --subject="Implement new feature"
The subject must begin with lowercase letters.

$ git consistent --type="foo" --subject="implement new feature"
'foo' is not defined.
You should select follow values.
'feat', 'fix', 'docs' and 'refactor'.
```

## develop
### test

```sh
$ yarn run test
```
