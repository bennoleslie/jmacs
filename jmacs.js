/* Jmacs object */
function Jmacs() {
    this.workspaces = new Array(0);
}

Jmacs.prototype.createWorkspace = function createWorkspace() {
    var ws = new Workspace()
    this.workspaces.push(ws)
    return ws
}

Jmacs.prototype.getActiveWorkspace = function getActiveWorkspace() {
    return this.workspaces[0]
}

Jmacs.prototype.handleKey = function handleKey(e, codes) {
    console.log("jmacs handling", e, codes)
    return this.getActiveWorkspace().handleKey(e, codes)
}

Jmacs.prototype.resize = function resize(width, height) {
    return this.getActiveWorkspace().resize(width, height);
}

Jmacs.prototype.redisplay = function redisplay() {
    return this.getActiveWorkspace().redisplay()
}

/* Workspace object */
function Workspace() {
    this.buffers = new Array(0);
    this.layout = 2

    this.leading = 3
    this.fontHeight = 12
    this.lineHeight = this.fontHeight + this.leading
    this.font = '' + this.fontHeight +  'px Monaco'
}

Workspace.prototype.createBuffer = function createBuffer(fileName) {
    var canvas = document.createElement("canvas")
    canvas.style.position = "absolute"
    document.body.appendChild(canvas)

    var buffer = new Buffer(canvas, this.leading, this.fontHeight, this.lineHeight, this.font)
    buffer.loadFile(fileName)
    this.buffers.push(buffer)
    return buffer
}

Workspace.prototype.handleKey = function handleKey(e, codes) {
    /* Get current buffer */
    console.log("workspace handling key", e, codes)

    if (codes[1] == "F1") {
	this.layout = 1
    } else if (codes[1] == "F2") {
	this.layout = 2
    } else if (codes[1] == "F3") {
	this.layout = 3
    } else {
	var buf = this.buffers[0]
	return buf.handleKey(e, codes)
    }
    this.resize(window.innerWidth, window.innerHeight)
    this.redisplay()
    return true
}

Workspace.prototype.resize = function resize(width, height) {
    if (this.layout == 1) {
	this.buffers[0].top = 0
	this.buffers[0].left = 0
	this.buffers[0].resize(width, height - this.lineHeight)

	this.buffers[1].visible = false

    } else if (this.layout == 2) {
	this.buffers[0].top = 0
	this.buffers[0].left = 0
	this.buffers[0].resize(width / 2, height - this.lineHeight)
	this.buffers[0].visible = true

	this.buffers[1].top = 0
	this.buffers[1].left = width / 2
	this.buffers[1].resize(width / 2, height - this.lineHeight)
	this.buffers[1].visible = true

    } else if (this.layout == 3) {

	this.buffers[0].top = 0
	this.buffers[0].left = 0
	this.buffers[0].resize(width, (height - this.lineHeight) / 2)
	this.buffers[0].visible = true
	
	this.buffers[1].top = (height - this.lineHeight) / 2
	this.buffers[1].left = 0
	this.buffers[1].resize(width, (height - this.lineHeight) / 2)
	this.buffers[1].visible = true
    }
}

Workspace.prototype.redisplay = function redisplay() {
    for (i = 0; i < this.buffers.length; i++) {
	this.buffers[i].redisplay()
    }
}


function keydown(e) {
    /* Cursor movement */
    lastKeyCode = e.keyCode
    var codes = keyMap[e.keyCode]
    if (codes === undefined) {
        /* If we couldn't work out what the keycode was, we are shit out of luck! */
        console.log("Undefined keycode:" + e.keyCode)
        return true
    }
    
    return jmacs.handleKey(e, codes)
}

function keypress(e) {
    /* This is here mostly for a workaround on Firefox Mac where certain specific characters
       come through as keycode zero for the keydown event */
    if (lastKeyCode == 0) {
        if (keyMap === macGeckoKeyMap) {
            if (e.charCode == 60 && e.shiftKey) {
                return handleKey(e, [true, undefined, '<'])
            } else if (e.charCode == 62 && e.shiftKey) {
                return handleKey(e, [true, undefined, '>'])
            } else if (e.charCode == 63 && e.shiftKey) {
                return handleKey(e, [true, undefined, '?'])
            } else if (e.charCode == 124 && e.shiftKey) {
                return handleKey(e, [true, undefined, '|'])
            } else if (e.charCode == 126 && e.shiftKey) {
                return handleKey(e, [true, undefined, '`'])
            } else if (e.charCode == 95 && e.shiftKey) {
                return handleKey(e, [true, undefined, '_'])
            } else if (e.charCode == 58 && e.shiftKey) {
                return handleKey(e, [true, undefined, ':'])
            } else {
                console.log("Don't know how to fixup [macGeckoKeyMap]", e)
            }
        } else {
            console.log("Don't know how to fixup", e)
        }
    }
    lastKeyCode = -1
    return true
}


/* 
   Need some more testing to see if we really care about debouncing the resize event -- we seem
   to keep up pretty well without the debounce.

   Debounce the resize event 

   props to: http://stackoverflow.com/questions/667426/javascript-resize-event-firing-multiple-times-while-dragging-the-resize-handle
*/
function doResize() {
    jmacs.resize(window.innerWidth, window.innerHeight)
    jmacs.redisplay()
}

var resizeTimeout = false
function resize(e) {
    doResize()
/*
    if (resizeTimeout !== false) {
	clearTimeout(resizeTimeout)
    }
    resizeTimeout = setTimeout(doResize, 100)
*/
}

function start() {
    var ws = jmacs.createWorkspace()
    ws.createBuffer("/README")
    var jsbuf = ws.createBuffer("/jmacs.js")
    jsbuf.left = 500
    window.addEventListener("keydown", keydown, true)
    window.addEventListener("keypress", keypress, true)
    window.addEventListener("resize", resize, true)

    document.body.style.overflow = "hidden"

    resize()
}

var jmacs = new Jmacs()
start()

/*
    buffer.canvas.left = 50
    buffer.canvas.top = 50

    var ci = document.getElementById("canvasInput")
    var ctx = ci.getContext("2d")

    ci.width = 500
    ci.height = 30
    ci.position = 'absolute'

    ctx.save()
    ctx.fillStyle = "red"
    ctx.fillRect(0, 0, ci.width, ci.height)

    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(20, 30)
    ctx.lineTo(310, 30)
    ctx.lineTo(330, 0)
    ctx.closePath()
    ctx.fillStyle = "blue"
    ctx.fill()

    ctx.restore()

    ci.style.setProperty("display", "none")

    var ifr = document.getElementById("foo")
    ifr.width = 400
    ifr.height = window.innerHeight - 10
    */
