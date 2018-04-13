# @scrutiny/analysis
@TODO

## Backlog - Capability development

What are some things that package owners might care about in their dependencies?

  - What packages will run scripts when they are installed? [Scripts](#scripts)
    - What are the commands? [Scripts](#scripts)
  - What packages are really old, were released a long time ago? [Versions](#versions)
  - What packages are really outdated, have many newer versions? [Versions](#versions)
  - What packages have known vulnerabilities? [Security](#security)
  - What packages are known to be malicious? [Security](#security)
  - Who is responsible for X packages? [Authors](#authors)
  - What packages are still in Alpha? [Versions](#versions)
  - What packages are still in Beta? [Versions](#versions)
  - What packages have fewer than X releases? [Versions](#versions)
  - What packages have been released by X author? [Authors](#authors)
  - How many extra dependencies are installed by installing X into my project? [Meta](#meta)
  - How many total dependencies are needed by package X? [Meta](#meta)
  - What package is responsible for what dependencies, what proportion? [Meta](#meta)
  - What packages are installed in the top of their required semver range [Versions](#versions)
  - What packages are installed with whack semver ranges [Versions](#versions)
  - What packages have updated the most recently, in order of update? [Versions](#versions)


### Scripts
Information pertaining to npm scripts. What packages run scripts, what scripts are run on install, etc.

### Versions
Information about package versions. When they have been released, under what semver, what semver was requested, etc.

### Security
Information about the security of packages. Whether there are any known vulnerabilities, etc. Could in the future include all sorts of stuff like "have any reviews been performed on this version"

### Authors
Information about people and the packages they release. Who has released what dependencies, what % of dependencies, etc.

### Meta
Overview information about dependencies of a project. How many dependencies a package might have, what package is responsible for a dependency, etc. 

## Backlog for v0.3.0 "First release"

  - ~~Finish off this package (give it a name)~~
  - ~~Make CLI depend on it so that it's thin AF~~
  - Chuck all packages on GitHub
  - Add npm binary to CLI project
  - Write READMEs
  - Setup CI/CD for all projects
  - Setup npm release CD to release on GitHub
  - Review package.JSONs … e.g description, License, etc.
  - Review Logger levels across packages
  - Real quick take a gander across projects for TODOs
  - Review _base project for launch.json, package.json, etc.
  - Support all forms of input string e.g. file://../my-cool-project
  - Publish packages to NPM in the right order…
  - Merge deep-install-details PR!!!
  - Investigate multi-root workspace for Scrutiny