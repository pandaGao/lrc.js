const del = require('del')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const uglify = require('rollup-plugin-uglify')
const version = require('../package.json').version
const banner =
`/*
* Lrc.js v${version}
* (c) 2018 Ryan Gao
* Released under the MIT License.
*/
`

async function build () {
  await del(['dist/*'])
  const bundle = await rollup.rollup({
    input: 'src/index.js',
    plugins: [
      babel()
    ]
  })
  // CommonJS Package
  await bundle.write({
    file: 'dist/lrc.common.js',
    format: 'cjs',
    name: 'LRC',
    banner
  })
  // UMD Package
  await bundle.write({
    file: 'dist/lrc.js',
    format: 'umd',
    name: 'LRC',
    banner
  })

  // Minified UMD Package
  const minifyBundle = await rollup.rollup({
    input: 'src/index.js',
    plugins: [
      babel(),
      uglify({
        output: {
          comments: function (node, comment) {
            var text = comment.value
            var type = comment.type
            if (type === 'comment2') {
              return /license/i.test(text)
            }
          }
        }
      })
    ]
  })
  await minifyBundle.write({
    file: 'dist/lrc.min.js',
    format: 'umd',
    name: 'LRC',
    banner
  })
}

build()
