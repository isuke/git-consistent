# git consistent

![anigif01](https://raw.githubusercontent.com/isuke/git-consistent/images/git-consistent01.gif)

## Install

You need install [fzf](https://github.com/junegunn/fzf).

```
$ cd /path/to/bin
$ curl -O https://raw.githubusercontent.com/isuke/git-consistent/master/git-consistent
$ chmod u+x git-consistent

$ git config --global alias.con consistent # option
```

## Usage

Please put follow two files to your project root dir.

`.gitcommit_template`
```text:
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

Exec command.

```
$ git consistent
```
