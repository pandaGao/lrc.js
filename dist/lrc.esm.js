/*
* Lrc.js v1.0.0
* (c) 2018 Ryan Gao
* Released under the MIT License.
*/

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var metaTags = ['ti', 'al', 'ar', 'au', 'by', 'offset', 'length', 're', 've'];
var validLineReg = /^\[[^:]+:[^\]]*\]/;
var timeReg = /\[(\d+):(\d+)(?:.(\d+))?\]/;
var timeListReg = /\[(\d+):(\d+)(?:.(\d+))?\]/g;
var metaReg = /\[([a-z]+):([^\]]*)\]/;

var LRC = function () {
  function LRC() {
    var lyrics = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    _classCallCheck(this, LRC);

    if (typeof lyrics === 'string') {
      return LRC.parse(lyrics);
    }
    this.clone(lyrics);
  }

  _createClass(LRC, [{
    key: 'clone',
    value: function clone() {
      var _this = this;

      var lyrics = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      metaTags.forEach(function (t) {
        _this[t] = lyrics[t] || '';
      });
      this.offset = lyrics.offset || 0;
      this.lines = Array.isArray(lyrics.lines) ? lyrics.lines.map(function (l) {
        return {
          time: l.time,
          text: l.text
        };
      }) : [];
      return this;
    }
  }, {
    key: 'stringify',
    value: function stringify() {
      var _this2 = this;

      var timeFixed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;

      var lrc = metaTags.filter(function (k) {
        return !!_this2[k];
      }).map(function (key) {
        return key === 'offset' ? '[' + key + ':' + (_this2[key] > 0 ? '+' : '-') + Math.abs(_this2[key]) + ']' : '[' + key + ':' + _this2[key] + ']';
      }).join('\n');
      lrc += '\n';
      lrc += this.lines.map(function (line) {
        var m = Math.floor(line.time / 60);
        var s = Math.floor(line.time % 60);
        var ms = line.time - Math.floor(line.time);
        m = m < 10 ? '0' + m : '' + m;
        s = s < 10 ? '0' + s : '' + s;
        ms = Math.round(ms * Math.pow(10, timeFixed)) + '';
        while (ms.length < timeFixed) {
          ms = '0' + ms;
        }
        return '[' + m + ':' + s + '.' + ms + ']' + line.text;
      }).join('\n');
      return lrc.trim();
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var _this3 = this;

      var jsonObj = {};
      metaTags.forEach(function (t) {
        jsonObj[t] = _this3[t];
      });
      jsonObj.lines = this.lines.map(function (l) {
        return {
          time: l.time,
          text: l.text
        };
      });
      return jsonObj;
    }
  }, {
    key: 'findIndex',
    value: function findIndex(currentTime) {
      var idx = -1;

      for (var i = 0; i < this.lines.length; i++) {
        if (this.lines[i].time > currentTime) {
          idx = i;
          break;
        }
      }

      return idx < 0 ? this.lines.length - 1 : idx - 1;
    }
  }, {
    key: 'previousLine',
    value: function previousLine(currentTime) {
      var idx = this.findIndex(currentTime);
      return idx <= 0 ? null : {
        idx: idx - 1,
        time: this.lines[idx - 1].time,
        text: this.lines[idx - 1].text
      };
    }
  }, {
    key: 'currentLine',
    value: function currentLine(currentTime) {
      var idx = this.findIndex(currentTime);
      return idx < 0 ? null : {
        idx: idx,
        time: this.lines[idx].time,
        text: this.lines[idx].text
      };
    }
  }, {
    key: 'nextLine',
    value: function nextLine(currentTime) {
      var idx = this.findIndex(currentTime);
      return idx < this.lines.length - 1 ? {
        idx: idx + 1,
        time: this.lines[idx + 1].time,
        text: this.lines[idx + 1].text
      } : null;
    }
  }], [{
    key: 'parse',
    value: function parse() {
      var lrc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      var defaultLyrics = {
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
      };
      var parsedLyrics = lrc.trim().split(/\n/).map(function (l) {
        return l.trim();
      }).filter(function (l) {
        return validLineReg.test(l);
      }).reduce(function (lyrics, line) {
        if (timeListReg.test(line)) {
          var text = line.replace(timeListReg, '').trim();
          line.match(timeListReg).forEach(function (t) {
            var _t$match = t.match(timeReg),
                _t$match2 = _slicedToArray(_t$match, 4),
                m = _t$match2[1],
                s = _t$match2[2],
                ms = _t$match2[3];

            ms = ms ? ms.length > 2 ? ms * 1 : ms * 10 : 0;
            var time = m * 60 + s * 1 + ms / 1000;
            lyrics.lines.push({
              time: time,
              text: text
            });
          });
        } else if (metaReg.test(line)) {
          var _line$match = line.match(metaReg),
              _line$match2 = _slicedToArray(_line$match, 3),
              type = _line$match2[1],
              _text = _line$match2[2];

          type = type.trim();
          _text = _text.trim();
          if (metaTags.indexOf(type) > -1) {
            if (type !== 'offset') {
              lyrics[type] = _text || '';
            } else {
              var offset = _text * 1;
              lyrics[type] = isNaN(offset) ? 0 : offset;
            }
          }
        }
        return lyrics;
      }, defaultLyrics);
      parsedLyrics.lines.sort(function (a, b) {
        return a.time - b.time;
      });
      return new LRC(parsedLyrics);
    }
  }]);

  return LRC;
}();

export default LRC;
