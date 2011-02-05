function Buffer() {
    this.cursorX = 0
    this.cursorY = 0
    this.lines = ["test\""]
    this.topLine = 0
    this.width = 0
    this.height = 0
    this.leading = 3
    this.lineHeight = 20
    this.font = '' + (this.lineHeight - this.leading) +  'px Courier'
    console.log(this.font)
    this.cursorColour = "green"
    this.cursorAlpha = 0.7
}

Buffer.prototype.getMaxLines = function getMaxLines() {
    return Math.floor(this.height / this.lineHeight)
}

Buffer.prototype.resize = function resize(width, height) {
    this.width = width
    this.height = height
    this.showCursor()
}

Buffer.prototype.showCursor = function showCursor() {
    if (this.cursorY > this.getMaxLines() - 1) {
	/* Need to move the window to show the cursor */
	this.topLine += (this.cursorY - (this.getMaxLines() - 1))
	this.cursorY = this.getMaxLines() - 1
    }
}

Buffer.prototype.getNumLines = function getNumLines() {
    if (this.lines.length - this.topLine < this.getMaxLines()) {
	return this.lines.length - this.topLine
    } else {
	return this.getMaxLines()
    }
}

Buffer.prototype.getLine = function getLine(idx) {
    return this.lines[this.topLine + idx]
}

Buffer.prototype.getCurLineIdx = function getCurLineIdx() {
    return this.cursorY + this.topLine
}

Buffer.prototype.erase = function erase() {
    if (this.lines[this.getCurLineIdx()].length > 0 && this.cursorX > 0) {
	this.lines[this.getCurLineIdx()] = this.lines[this.getCurLineIdx()].substr(0, this.cursorX - 1) + this.lines[this.getCurLineIdx()].substr(this.cursorX, this.lines[this.getCurLineIdx()].length)
	this.cursorX -= 1
    }
    if (this.cursorX == 0 && this.cursorY > 0) {
	this.cursorX = this.lines[this.getCurLineIdx() - 1].length
	this.lines[this.getCurLineIdx() - 1] = this.lines[this.getCurLineIdx() - 1] + this.lines[this.getCurLineIdx()]
	this.lines = this.lines.slice(0, this.getCurLineIdx()).concat(this.lines.slice(this.getCurLineIdx() + 1, this.lines.length))
	this.cursorY -= 1 // FIXME: what is we are cursorY == 0
    }
}

Buffer.prototype.insertNewLine = function insertNewLine() {
    this.lines = this.lines.slice(0, this.getCurLineIdx()).concat([this.lines[this.getCurLineIdx()].substr(0, this.cursorX),
								   this.lines[this.getCurLineIdx()].substr(this.cursorX, this.lines[this.getCurLineIdx()].length)],
								  this.lines.slice(this.getCurLineIdx() + 1, this.lines.length))
    this.moveDownLine()
    this.moveStartOfLine()
}

Buffer.prototype.insertLiteral = function insertLiteral(ch) {
    this.lines[this.getCurLineIdx()] = this.lines[this.getCurLineIdx()].substr(0, this.cursorX) + ch + this.lines[this.getCurLineIdx()].substr(this.cursorX, this.lines[this.getCurLineIdx()].length)
    this.cursorX += 1
}

Buffer.prototype.moveStartOfLine = function moveStartOfLine() {
    this.cursorX = 0
}

Buffer.prototype.moveEndOfLine = function moveEndOfLine() {
    this.cursorX = this.lines[buffer.getCurLineIdx()].length
}

Buffer.prototype.moveForwardChar = function moveForwardChar() {
    if (this.cursorX < this.lines[this.getCurLineIdx()].length) {
	this.cursorX += 1
    }
}

Buffer.prototype.moveBackChar = function moveBackChar() {
    if (this.cursorX > 0) {
	this.cursorX -= 1
    }
}

Buffer.prototype.moveUpLine = function moveUpLine() {
    if (this.getCurLineIdx() > 0) {
	if (this.cursorY > 0) {
	    this.cursorY -= 1
	} else {
	    this.topLine -= 1
	}
    } else {
	/* beep() */
	console.log("at top!")
	return
    }

    if (this.cursorX > this.lines[this.getCurLineIdx()].length) {
	this.cursorX = this.lines[this.getCurLineIdx()].length
    }
}

Buffer.prototype.moveDownLine = function moveDownLine() {
    console.log("--> this.cursorY: " + this.cursorY + " this.topLine: " + this.topLine)
    if (this.getCurLineIdx() < this.lines.length - 1) {
	if (this.cursorY < this.getMaxLines() - 1) {
	    this.cursorY += 1
	} else {
	    this.topLine += 1
	}


    } else {
	/* beep() */
	console.log("at bottom!")
	return
    }
    console.log("<-- this.cursorY: " + this.cursorY + " this.topLine: " + this.topLine)

    if (this.cursorX > this.lines[this.getCurLineIdx()].length) {
	this.cursorX = this.lines[this.getCurLineIdx()].length
    }

}

var buffer = new Buffer()

/* Redisplay */
function drawText(ctx, str, x, y) {
    ctx.save()
    
    ctx.font = buffer.font
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    var metrics = ctx.measureText(str)
    
    ctx.fillText(str, x, y)
    ctx.beginPath()
    
    ctx.restore()
}

function drawCursor(ctx) {
    ctx.save()

    ctx.font = buffer.font
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    ctx.globalAlpha = buffer.cursorAlpha
    ctx.fillStyle = buffer.cursorColour
    var cx = ctx.measureText(buffer.getLine(buffer.cursorY).substr(0, buffer.cursorX)).width
    var t = buffer.getLine(buffer.cursorY).substr(buffer.cursorX, 1)
    if (t == "") {
	t = " "
    }
    var cw = ctx.measureText(t).width

    ctx.fillRect(cx, buffer.lineHeight * buffer.cursorY, cw, buffer.lineHeight)
    ctx.restore()
}

function redisplay() {
    var canvas = document.getElementById("canvas")
    var ctx = canvas.getContext("2d")

    canvas.width = buffer.width
    canvas.height = buffer.height
    ctx.save()
    ctx.clearRect(0, 0, 1000, 1000)
    ctx.restore()

    for (i = 0; i < buffer.getNumLines(); i ++) {
	drawText(ctx, buffer.getLine(i), 0, i * buffer.lineHeight)
    }

    drawCursor(ctx)
}

function handleKey(e, codes) {

    if (!e.ctrlKey && !e.altKey && !e.metaKey && codes[0] === true) {
	/* Should be a literal */
	var ch;
	if (e.shiftKey) {
	    ch = codes[2]
	} else {
	    ch = codes[1]
	}
	buffer.insertLiteral(ch)
    } else if (codes[1] == "Backspace") {
	buffer.erase()
    } else if (codes[1] == "Enter") {
	buffer.insertNewLine()
    } else if (codes[1] == "Space") {
	buffer.insertLiteral(' ')
    } else if (codes[1] == "Tab") {
	buffer.insertLiteral(' ')
	buffer.insertLiteral(' ')
	buffer.insertLiteral(' ')
	buffer.insertLiteral(' ')
    } else if (e.ctrlKey && codes[1] == 'a') {
	buffer.moveStartOfLine()
    } else if (e.ctrlKey && codes[1] == 'e') {
	buffer.moveEndOfLine()
    } else if (codes[1] == "Left") {
	buffer.moveBackChar()
    } else if (codes[1] == "Right") {
	buffer.moveForwardChar()
    } else if (codes[1] == "Up") {
	buffer.moveUpLine()
    } else if (codes[1] == "Down") {
	buffer.moveDownLine()
    } else {
	return true
    }

    redisplay()
    e.preventDefault()
    return false
}


var lastKeyCode = -1

function keydown(e) {
    /* Cursor movement */
    lastKeyCode = e.keyCode
    var codes = keyMap[e.keyCode]
    if (codes === undefined) {
	/* If we couldn't work out what the keycode was, we are shit out of luck! */
	console.log("Undefined keycode:" + e.keyCode)
	return true
    }
    
    return handleKey(e, codes)
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

function resize(e) {
    buffer.resize(window.innerWidth, window.innerHeight)
    redisplay()
}

function start() {
    window.addEventListener("keydown", keydown, false)
    window.addEventListener("keypress", keypress, false)
    window.addEventListener("resize", resize, false)
    resize()
}
