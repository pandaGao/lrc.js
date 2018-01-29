# Lrc.js

[![npm version](https://badge.fury.io/js/lrc.js.svg)](https://badge.fury.io/js/lrc.js)
[![Build Status](https://travis-ci.org/pandaGao/lrc.js.svg?branch=master)](https://travis-ci.org/pandaGao/lrc.js)
[![Coverage Status](https://coveralls.io/repos/github/pandaGao/lrc.js/badge.svg?branch=master)](https://coveralls.io/github/pandaGao/lrc.js?branch=master)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

A lightly module for LRC format string parsing and serialization

# Install
## From npm
```bash
npm i lrc.js --save
```
## In browser
```html
<script src="https://unpkg.com/lrc.js/dist/lrc.js"></script>

<script src="https://unpkg.com/lrc.js/dist/lrc.min.js"></script>
```

# Usage

## LRC.Parse(lrc = '')

```javascript
const LRC = require('lrc.js')
// ...
let lyrics = LRC.parse(LRCString)
// or let lyrics = new LRC(LRCString)

```

## lyrics.clone(obj)

deep clone a lyrics object or plain object
```javascript
let lyrics = LRC.parse(LRCString)
let lyrics2 = new LRC().clone(lyrics)
```

## lyrics.toJSON()

```javascript

let lyrics = LRC.parse(LRCString)
lyrics.toJSON()

// Sample output
{
  al: '',
  ar: '',
  au: '',
  ti: '',
  by: '',
  offset: 0,
  length: '',
  re: '',
  ve: '',
  lines: [
    {
      time: 0,
      text: 'xxx'
    }
  ]
}
```

## lyrics.stringify(timeFixed = 2)

```javascript
let lyrics = LRC.parse(`[00:00:01]Test Line`)
lyrics.stringify()
// Output
"[00:00:01]Test Line"
lyrics.stringify(3)
// Output
"[00:00:010]Test Line"

```

## lyrics.findIndex(currentTime)

```javascript
let lrc =`
[00:01.00] Line 1
[00:03.00] Line 3
[00:05.70] Line 5
[00:02.00][00:04.00] Line 2 & Line 4
`
let lyrics = LRC.parse(lrc)
lyrics.findIndex(0) // -1
lyrics.findIndex(1.5) // 0
lyrics.findIndex(5) // 3
lyrics.findIndex(6) // 4
```

## lyrics.previousLine(currentTime)

```javascript
// ...
lyrics.previousLine(0) // null
lyrics.previousLine(1.5) // null
lyrics.previousLine(2.5)
// Output
{
  idx: 0,
  time: 1,
  text: 'Line 1'
}
```

## lyrics.currentLine(currentTime)

```javascript
// ...
lyrics.currentLine(0) // null
lyrics.currentLine(1.5) 
// Output
{
  idx: 0,
  time: 1,
  text: 'Line 1'
}

lyrics.currentLine(10)
// Output
{
  idx: 4,
  time: 5.7,
  text: 'Line 5'
}
```

## lyrics.nextLine(currentTime)

```javascript
// ...
lyrics.nextLine(0)
// Output
{
  idx: 0,
  time: 1,
  text: 'Line 1'
}

lyrics.nextLine(1.5)
// Output
{
  idx: 1,
  time: 2,
  text: 'Line 2 & Line 4'
}

lyrics.nextLine(6) // null
```

