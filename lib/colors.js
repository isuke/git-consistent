const black   = '\u001b[30m'
const red     = '\u001b[31m'
const green   = '\u001b[32m'
const yellow  = '\u001b[33m'
const blue    = '\u001b[34m'
const magenta = '\u001b[35m'
const cyan    = '\u001b[36m'
const white   = '\u001b[37m'
const reset   = '\u001b[0m'

module.exports = {
  message: cyan,
  warning: yellow,
  info:    magenta,
  error:   red,
  reset:   reset,
}
