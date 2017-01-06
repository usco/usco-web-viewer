# usco-web-viewer

[![GitHub version](https://badge.fury.io/gh/usco%2Fusco-web-viewer.svg)](https://badge.fury.io/gh/usco%2Fusco-web-viewer)
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)
[![Build Status](https://travis-ci.org/usco/usco-web-viewer.svg)](https://travis-ci.org/usco/usco-web-viewer)
[![Dependency Status](https://david-dm.org/usco/usco-web-viewer.svg)](https://david-dm.org/usco/usco-web-viewer)
[![devDependency Status](https://david-dm.org/usco/usco-web-viewer/dev-status.svg)](https://david-dm.org/usco/usco-web-viewer#info=devDependencies)

<img src="https://raw.githubusercontent.com/usco/usco-web-viewer/master/screenshot.png" />


> Web based viewer of usco project

This is a small-ish (700 kb minified) web based 3d file viewer component : minimal renderer + loading (

- coded in es6
- uses streaming (node.js streams) to minimize memory consumption
- functional/ FRP oriented
- uses regl as functional WebGL framework

## Table of Contents

- [Background](#background)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Contribute](#contribute)
- [License](#license)

## Background

- uses the fantastic [regl](https://github.com/mikolalysenko/regl) (declarative stateless rendering)
- uses the also great [glsify](https://github.com/stackgl/glslify)
- and let us not forget [most](https://github.com/cujojs/most) for observables
- and many more

## Installation


```
npm install
```

### build distributable

```
npm run build
```

### launch dev server

```
npm run start-dev
```


## Usage

See index.html for an example of use : this is not meant to be used as a library !

Because of the dependency on fetch + readeable streams , if not running this in
a recent Chrome/Chromium you will need a few polyfills :
these are also provided in the dist folder
- https://github.com/inexorabletash/text-encoding
- https://github.com/creatorrr/web-streams-polyfill


### Branding:

branding/ logos displayed in the app are flat 3d geometry generated from svg Files
for increased quality & speed : to regenerate those files , please see the script in
src/branding/generateBrandingGeoFromSvg

and use the following command:

```
  node src/branding/launchGenBrandingGeoFromSvg.js
```


## Contribute

PRs accepted.

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.


## License

[The MIT License (MIT)](https://github.com/usco/usco-web-viewer/blob/master/LICENSE)
(unless specified otherwise)
