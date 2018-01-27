const assert = require('assert')
const LRC = require('../src/index.js')

const defaultLyrics = {
  al: '',
  ar: '',
  au: '',
  ti: '',
  by: '',
  offset: 0,
  length: '',
  re: '',
  ve: '',
  lines: []
}

describe('Test empty input', () => {
  it('toJSON() return default lyrics object', () => {
    assert.deepEqual(LRC.parse().toJSON(), defaultLyrics)
  })
  it('toJSON() return default lyrics object (use constructor)', () => {
    assert.deepEqual(new LRC().toJSON(), defaultLyrics)
  })
  it('clone() return default lyrics object', () => {
    assert.deepEqual(new LRC().clone().toJSON(), defaultLyrics)
  })
  it('stringify() return empty string', () => {
    assert.equal(LRC.parse('').stringify(), '')
  })
  it('findIndex() return -1', () => {
    assert.equal(LRC.parse('').findIndex(1), -1)
  })
  it('previousLine() return null', () => {
    assert.equal(LRC.parse('').previousLine(1), null)
  })
  it('currentLine() return null', () => {
    assert.equal(LRC.parse('').currentLine(1), null)
  })
  it('nextLine() return null', () => {
    assert.equal(LRC.parse('').nextLine(1), null)
  })
})

describe('Test specified tag', () => {
  const BaseTag = `
  [ti: Test Title]
  [ar: Test Artist]
  [au: Test Author]
  [al: Test Album]
  [by: Test Creator]
  [length: 2:33]
  [re: Test Editor]
  [ve: Test Version]
  `

  it('Test base tags', () => {
    assert.deepEqual(LRC.parse(BaseTag).toJSON(), Object.assign({}, defaultLyrics, {
      ti: 'Test Title',
      ar: 'Test Artist',
      au: 'Test Author',
      al: 'Test Album',
      by: 'Test Creator',
      length: '2:33',
      re: 'Test Editor',
      ve: 'Test Version'
    }))
    assert.equal(LRC.parse('[al:]').stringify(), '')
    assert.equal(LRC.parse('[al: 1]').stringify(), '[al:1]')
  })

  it('Test offset tag', () => {
    assert.equal(LRC.parse('[offset: 500]').offset, 500)
    assert.equal(LRC.parse('[offset: 500]').stringify(), '[offset:+500]')
    assert.equal(LRC.parse('[offset: +500]').offset, 500)
    assert.equal(LRC.parse('[offset: +500]').stringify(), '[offset:+500]')
    assert.equal(LRC.parse('[offset: -500]').offset, -500)
    assert.equal(LRC.parse('[offset: -500]').stringify(), '[offset:-500]')
    assert.equal(LRC.parse('[offset: 11.23]').offset, 11.23)
    assert.equal(LRC.parse('[offset: 11.23]').stringify(), '[offset:+11.23]')
    assert.equal(LRC.parse('[offset: -11.23]').offset, -11.23)
    assert.equal(LRC.parse('[offset: -11.23]').stringify(), '[offset:-11.23]')
    assert.equal(LRC.parse('[offset: bad]').offset, 0)
    assert.equal(LRC.parse('[offset: bad]').stringify(), '')
    assert.equal(LRC.parse('[offset:]').offset, 0)
    assert.equal(LRC.parse('[offset:]').stringify(), '')
  })

  it('Test not support tag', () => {
    assert.equal(LRC.parse('[11a]').stringify(), '')
    assert.equal(LRC.parse('[xxx]').stringify(), '')
    assert.equal(LRC.parse('[xxx: 111]').stringify(), '')
    assert.equal(LRC.parse('[offse:]').stringify(), '')
    assert.equal(LRC.parse('[@:1]').stringify(), '')
  })

  it('Test time', () => {
    assert.deepEqual(LRC.parse('[00:00.00] Test Line ').lines, [
      {
        time: 0,
        text: 'Test Line'
      }
    ])
    assert.deepEqual(LRC.parse('[00:00.01] Test Line ').lines, [
      {
        time: 0.01,
        text: 'Test Line'
      }
    ])
    assert.deepEqual(LRC.parse('[00:00.10] Test Line ').lines, [
      {
        time: 0.1,
        text: 'Test Line'
      }
    ])
    assert.deepEqual(LRC.parse('[00:01.23] Test Line ').lines, [
      {
        time: 1.23,
        text: 'Test Line'
      }
    ])
    assert.equal(LRC.parse('[00:01.23] Test Line ').stringify(3), '[00:01.230]Test Line')
    assert.equal(LRC.parse('[00:01.03] Test Line ').stringify(3), '[00:01.030]Test Line')
    assert.deepEqual(LRC.parse('[09:11.233] Test Line ').lines, [
      {
        time: 551.233,
        text: 'Test Line'
      }
    ])
    assert.equal(LRC.parse('[09:11.233] Test Line ').stringify(2), '[09:11.23]Test Line')
    assert.equal(LRC.parse('[109:11.036] Test Line ').stringify(2), '[109:11.04]Test Line')
    assert.deepEqual(LRC.parse('[10:11.233] Test Line ').lines, [
      {
        time: 611.233,
        text: 'Test Line'
      }
    ])
    assert.deepEqual(LRC.parse('[01:11] Test Line ').lines, [
      {
        time: 71,
        text: 'Test Line'
      }
    ])
    assert.deepEqual(LRC.parse('[01] Not Valid ').lines, [])
    assert.deepEqual(LRC.parse('[10:11.233][00:01.23] Test Line ').lines, [
      {
        time: 1.23,
        text: 'Test Line'
      },
      {
        time: 611.233,
        text: 'Test Line'
      }
    ])
  })
})

describe('Test find functions', () => {
  const TestFindCase =
  `
  [00:01.00] Line 1
  [00:03.00] Line 3
  [00:05.70] Line 5
  [00:02.00][00:04.00] Line 2 & Line 4
  `
  it('sort lines', () => {
    assert.deepEqual(LRC.parse(TestFindCase).toJSON(), Object.assign({}, defaultLyrics, {
      lines: [
        {
          time: 1,
          text: 'Line 1'
        },
        {
          time: 2,
          text: 'Line 2 & Line 4'
        },
        {
          time: 3,
          text: 'Line 3'
        },
        {
          time: 4,
          text: 'Line 2 & Line 4'
        },
        {
          time: 5.7,
          text: 'Line 5'
        }
      ]
    }))
    assert.deepEqual(LRC.parse(TestFindCase).lines, [
      {
        time: 1,
        text: 'Line 1'
      },
      {
        time: 2,
        text: 'Line 2 & Line 4'
      },
      {
        time: 3,
        text: 'Line 3'
      },
      {
        time: 4,
        text: 'Line 2 & Line 4'
      },
      {
        time: 5.7,
        text: 'Line 5'
      }
    ])
  })
  it('findIndex', () => {
    assert.equal(LRC.parse(TestFindCase).findIndex(-1), -1)
    assert.equal(LRC.parse(TestFindCase).findIndex(0.5), -1)
    assert.equal(LRC.parse(TestFindCase).findIndex(1), 0)
    assert.equal(LRC.parse(TestFindCase).findIndex(1.5), 0)
    assert.equal(LRC.parse(TestFindCase).findIndex(2.5), 1)
    assert.equal(LRC.parse(TestFindCase).findIndex(5.7), 4)
    assert.equal(LRC.parse(TestFindCase).findIndex(10), 4)
  })
  it('currentLine', () => {
    assert.equal(LRC.parse(TestFindCase).currentLine(-1), null)
    assert.deepEqual(LRC.parse(TestFindCase).currentLine(1), {
      idx: 0,
      time: 1,
      text: 'Line 1'
    })
    assert.deepEqual(LRC.parse(TestFindCase).currentLine(2.5), {
      idx: 1,
      time: 2,
      text: 'Line 2 & Line 4'
    })
    assert.deepEqual(LRC.parse(TestFindCase).currentLine(5.7), {
      idx: 4,
      time: 5.7,
      text: 'Line 5'
    })
  })
  it('previousLine', () => {
    assert.equal(LRC.parse(TestFindCase).previousLine(-1), null)
    assert.equal(LRC.parse(TestFindCase).previousLine(1), null)
    assert.deepEqual(LRC.parse(TestFindCase).previousLine(2.5), {
      idx: 0,
      time: 1,
      text: 'Line 1'
    })
    assert.deepEqual(LRC.parse(TestFindCase).previousLine(5.7), {
      idx: 3,
      time: 4,
      text: 'Line 2 & Line 4'
    })
  })
  it('nextLine', () => {
    assert.deepEqual(LRC.parse(TestFindCase).nextLine(-1), {
      idx: 0,
      time: 1,
      text: 'Line 1'
    })
    assert.deepEqual(LRC.parse(TestFindCase).nextLine(1), {
      idx: 1,
      time: 2,
      text: 'Line 2 & Line 4'
    })
    assert.deepEqual(LRC.parse(TestFindCase).nextLine(2.5), {
      idx: 2,
      time: 3,
      text: 'Line 3'
    })
    assert.equal(LRC.parse(TestFindCase).nextLine(5.7), null)
    assert.equal(LRC.parse(TestFindCase).nextLine(10), null)
  })
})
