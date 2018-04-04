# hubot-bad-git-help

[![Build Status](https://travis-ci.org/hocup/hubot-bad-git-help.svg?branch=master)](https://travis-ci.org/hocup/hubot-bad-git-help)

A hubot script that pretends to know a lot about git.
Whenever a user asks about a git command, the script will provide documentation for the git command (rarely) or make something up.

Uses [Lokaltog's](https://github.com/Lokaltog) awesome [git man page generator](https://github.com/Lokaltog/baba-grammar-git-man-page-generator) to generate the made up git help. 

In the rare cases when the user actually asks about something that is already a git command, the script will pull in help from the [git reference pages](https://git-scm.com/docs) (and provide a link to more info).


## Installation

In hubot project repo, run:

`npm install hubot-bad-git-help --save`

Then add **hubot-bad-git-help** to your `external-scripts.json`:

```json
[
  "hubot-bad-git-help"
]
```

## Sample Interactions

```
user1>> How can I alter reality in git?
hubot>> @user1:

git-alter-reality - Alter non-specified upstream realities for all committed failed packs

*SYNOPSIS*:

_git-alter-reality_ [ --gain-change | --narrow-divert-base ]
_git-alter-reality_ [ --whack-tree | --shove-taste-path | --foster-exhibit-head ] [ --chart-file | --greet-promote-submodule ] [ --score-prompt-base ]

*DESCRIPTION*: 
git-alter-reality alters checked upstream realities for the
initialized initialized downstream histories. Provided that
`git-blow-commit` rebases a head, a relinked failure will prevent
temporary performing of all format-patched checked areas, and
`git-alter-reality` `--trap-foster-commit` can execute an
automatic `git-receive-tree` before doing anything else. Pre-remoted
specified paths are packed to `<old-tree>` by
`git-clarify-file`.
```

## NPM Module

https://www.npmjs.com/package/hubot-bad-git-help
