const metaTags = ['ti', 'al', 'ar', 'au', 'by', 'offset', 'length', 're', 've']
const validLineReg = /^\[[^:]+:[^\]]*\]/
const timeReg = /\[(\d+):(\d+)(?:.(\d+))?\]/
const timeListReg = /\[(\d+):(\d+)(?:.(\d+))?\]/g
const metaReg = /\[([a-z]+):([^\]]*)\]/

class LRC {
  constructor (lyrics = '') {
    if (typeof lyrics === 'string') {
      return LRC.parse(lyrics)
    }
    this.clone(lyrics)
  }

  clone (lyrics = {}) {
    metaTags.forEach(t => {
      this[t] = lyrics[t] || ''
    })
    this.offset = lyrics.offset || 0
    this.lines = Array.isArray(lyrics.lines) ? lyrics.lines.map(l => ({
      time: l.time,
      text: l.text
    })) : []
    return this
  }

  static parse (lrc = '') {
    let defaultLyrics = {
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
    let parsedLyrics = lrc.trim()
      .split(/\n/)
      .map(l => l.trim())
      .filter(l => validLineReg.test(l))
      .reduce((lyrics, line) => {
        if (timeListReg.test(line)) {
          let text = line.replace(timeListReg, '').trim()
          line.match(timeListReg).forEach(t => {
            let [, m, s, ms] = t.match(timeReg)
            ms = ms
              ? ms.length > 2
                ? ms * 1
                : ms * 10
              : 0
            let time = m * 60 + s * 1 + ms / 1000
            lyrics.lines.push({
              time: time,
              text: text
            })
          })
        } else if (metaReg.test(line)) {
          let [, type, text] = line.match(metaReg)
          type = type.trim()
          text = text.trim()
          if (metaTags.indexOf(type) > -1) {
            if (type !== 'offset') {
              lyrics[type] = text || ''
            } else {
              let offset = text * 1
              lyrics[type] = isNaN(offset) ? 0 : offset
            }
          }
        }
        return lyrics
      }, defaultLyrics)
    parsedLyrics.lines.sort(function (a, b) {
      return a.time - b.time
    })
    return new LRC(parsedLyrics)
  }

  stringify (timeFixed = 2) {
    let lrc = metaTags
      .filter(k => !!this[k])
      .map(key => key === 'offset'
        ? `[${key}:${this[key] > 0 ? '+' : '-'}${Math.abs(this[key])}]`
        : `[${key}:${this[key]}]`).join('\n')
    lrc += '\n'
    lrc += this.lines.map((line) => {
      let m = Math.floor(line.time / 60)
      let s = Math.floor(line.time % 60)
      let ms = line.time - Math.floor(line.time)
      m = m < 10 ? '0' + m : '' + m
      s = s < 10 ? '0' + s : '' + s
      ms = Math.round(ms * Math.pow(10, timeFixed)) + ''
      while (ms.length < timeFixed) {
        ms = '0' + ms
      }
      return `[${m}:${s}.${ms}]${line.text}`
    }).join('\n')
    return lrc.trim()
  }

  toJSON () {
    let jsonObj = {}
    metaTags.forEach(t => {
      jsonObj[t] = this[t]
    })
    jsonObj.lines = this.lines.map(l => ({
      time: l.time,
      text: l.text
    }))
    return jsonObj
  }

  findIndex (currentTime) {
    let idx = -1

    for (let i = 0; i < this.lines.length; i++) {
      if (this.lines[i].time > currentTime) {
        idx = i
        break
      }
    }

    return idx < 0 ? this.lines.length - 1 : idx - 1
  }

  previousLine (currentTime) {
    let idx = this.findIndex(currentTime)
    return idx <= 0
      ? null
      : {
        idx: idx - 1,
        time: this.lines[idx - 1].time,
        text: this.lines[idx - 1].text
      }
  }

  currentLine (currentTime) {
    let idx = this.findIndex(currentTime)
    return idx < 0
      ? null
      : {
        idx: idx,
        time: this.lines[idx].time,
        text: this.lines[idx].text
      }
  }

  nextLine (currentTime) {
    let idx = this.findIndex(currentTime)
    return idx < this.lines.length - 1
      ? {
        idx: idx + 1,
        time: this.lines[idx + 1].time,
        text: this.lines[idx + 1].text
      }
      : null
  }
}

module.exports = LRC
