# git consistent

![anigif01](https://raw.githubusercontent.com/isuke/git-consistent/images/git-consistent01.gif)

## Install

You need install [fzf](https://github.com/junegunn/fzf) if you use interactive mode.

```
$ npm install -g git-consistent
# or
$ yarn global add git-consistent

# options
$ git config --global alias.con consistent
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

## help

```sh
$ git-consistent --help
```

## inline mode

```sh
$ git consistent --type="feat" --subject="implement new feature" --body="This is amazing feature."
```

## interactive mode

```sh
$ git consistent -i
Select type: feat
Enter subject: implement new feature
Enter body multiline:
This is amazing feature.
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

### decorate

## develop
### test

```sh
$ yarn run test
```
