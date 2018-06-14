var frame = {
  buff: document.getElementById('buff'),
  code: document.getElementById('code'),
  eval: document.getElementById('eval'),
  send: document.getElementById('send')
}

var ws = new WebSocket('ws://localhost:55443')

ws.onopen = function () {
  // send('(+ 1 2 3)')
  buff()
}

function default_cb (msg) {
  console.log(msg)
  frame.eval.innerHTML = msg.data
}

ws.onmessage = default_cb

function send (msg, cb = undefined) {
  if (cb !== undefined) {
    ws.onmessage = function (msg) {
      default_cb(msg)
      cb(msg)
    }
  }

  frame.send.innerHTML = msg
  ws.send(msg)
}

var concat = (a, b) => a + b

// switch buffer
var sb = (b) => {
  console.log(b)
  var cmd = `(progn (switch-to-buffer "${b}") (buffer-substring (point-min) (point-max)))`
  var cb = (msg) => {
    frame.code.innerHTML = msg.data
  }
  send(cmd, cb)
}

function buff () {
  var cmd = '(etw-bl)'
  var cb = (msg) => {
    var buffers = JSON.parse(msg.data)

    frame.buff.innerHTML = buffers
      .map(b => `<a href="#" onclick='sb("${b}")'>${b}</a>`)
      .reduce(concat)
  }

  send(cmd, cb)
}

// keypress
const kp = (e) => {
  var key = e.key

  switch (true) {
    case e.code === 'Space': key = 'SPC'; break
    case e.code === 'Enter': key = 'RET'; break
    case e.code === 'Backspace': key = 'DEL'; break
    case e.key === 'Escape': key = '<escape>'; break
  }

  // full buffer
  // var cmd = `(progn (etw-keypress "${key}") (buffer-substring (point-min) (point-max)))`
  var cmd = `
(progn
  (etw-keypress "${key}")
  (buffer-substring (max (point-min) (- (point) 100))
                    (min (point-max) (+ (point) 100))))`
  var cb = (msg) => {
    frame.code.innerHTML = msg.data
  }
  send(cmd, cb)
}

document.body.addEventListener('keydown', function (e) {
  console.log(e)
  kp(e)
})
