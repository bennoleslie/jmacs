
function Buffer(canvas, leading, fontHeight, lineHeight, font) {
    this.canvas = canvas
    this.cursorX = 0
    this.cursorY = 0
    this.lines = [""]
    this.topLine = 0
    this.width = 0
    this.height = 0
    this.leading = leading
    this.fontHeight = fontHeight
    this.lineHeight = lineHeight
    this.font = font
    this.cursorColour = "grey"
    this.cursorAlpha = 0.7
    this.left = 0
    this.top = 0
    this.keyMode = 0
    this.lastKeyCode = -1
    this.visible = true
}

Buffer.prototype.saveFile = function saveFile() {
    var client = new XMLHttpRequest()

    client.open("PUT", this.fileName)
    client.setRequestHeader("Content-Type", "text/plain")
    client.send(this.lines.join("\n"))
}

Buffer.prototype.loadFile = function loadFile(fileName) {
    var client = new XMLHttpRequest()
    var buffer = this

    this.name = fileName
    this.fileName = fileName

    function handler() {
        if (this.readyState == this.DONE) {
            if (this.status == 200 && this.responseText != null) {
                // success!
                buffer.lines = this.responseText.split("\n")
		buffer.redisplay()
                return
            }
            console.log("error")
            // something went wrong
        }
    }

    client.onreadystatechange = handler
    client.open("GET", fileName)
    client.setRequestHeader("Content-Type", "text/plain")
    client.send()
}

Buffer.prototype.getMaxLines = function getMaxLines() {
    /* Return the maximum number of lines that can be shown 
       in the buffer.
       
       One line is reserved for the status line.
    */
    return Math.floor(this.height / this.lineHeight) - 1
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

Buffer.prototype.getStatusLine = function getStatusLine() {
    return " --:-- " + this.name + '   (' + (this.getCurLineIdx() + 1) + ", " + this.cursorX + ')'
}


Buffer.prototype.erase = function erase() {
    if (this.lines[this.getCurLineIdx()].length > 0 && this.cursorX > 0) {
        this.lines[this.getCurLineIdx()] = this.lines[this.getCurLineIdx()].substr(0, this.cursorX - 1) + this.lines[this.getCurLineIdx()].substr(this.cursorX, this.lines[this.getCurLineIdx()].length)
        this.cursorX -= 1
    } else if (this.cursorX == 0 && this.cursorY > 0) {
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

Buffer.prototype.moveToLine = function moveToLine(line) {
    /* 
       We update two things here -- the cursorY and the topLine.
     */
    /* 1. Lets try and just move the cursor */
    if (line >= this.topLine && line <= this.topLine + this.getMaxLines()) {
	this.cursorY = line - this.topLine
    } else {
	/* For now we do this stupidly */
	this.topLine = line
	this.cursorY = 0
    }

    if (this.cursorX > this.lines[this.getCurLineIdx()].length) {
        this.cursorX = this.lines[this.getCurLineIdx()].length
    }

}

Buffer.prototype.moveStartOfBuffer = function moveStartOfBuffer() {
    this.moveToLine(0)
}

Buffer.prototype.moveEndOfBuffer = function moveEndOfBuffer() {
    this.moveToLine(this.lines.length - 1)
}

Buffer.prototype.moveStartOfLine = function moveStartOfLine() {
    this.cursorX = 0
}

Buffer.prototype.moveEndOfLine = function moveEndOfLine() {
    this.cursorX = this.lines[this.getCurLineIdx()].length
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
        return
    }

    if (this.cursorX > this.lines[this.getCurLineIdx()].length) {
        this.cursorX = this.lines[this.getCurLineIdx()].length
    }
}

Buffer.prototype.moveDownLine = function moveDownLine() {
    if (this.getCurLineIdx() < this.lines.length - 1) {
        if (this.cursorY < this.getMaxLines() - 1) {
            this.cursorY += 1
        } else {
            this.topLine += 1
        }


    } else {
        /* beep() */
        return
    }

    if (this.cursorX > this.lines[this.getCurLineIdx()].length) {
        this.cursorX = this.lines[this.getCurLineIdx()].length
    }

}

function drawText(buffer, ctx, str, x, y) {
    ctx.save()
    
    ctx.font = buffer.font
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'
    var metrics = ctx.measureText(str)
    
    ctx.fillText(str, x, y)
    ctx.beginPath()
    
    ctx.restore()
}

function drawCursor(buffer, ctx) {
    ctx.save()

    ctx.font = buffer.font
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'

    ctx.globalAlpha = buffer.cursorAlpha
    ctx.fillStyle = buffer.cursorColour
    var cx = ctx.measureText(buffer.getLine(buffer.cursorY).substr(0, buffer.cursorX)).width
    var t = buffer.getLine(buffer.cursorY).substr(buffer.cursorX, 1)
    if (t == "") {
        t = " "
    }
    var cw = ctx.measureText(t).width

    ctx.fillRect(10 + cx, buffer.lineHeight * buffer.cursorY, cw, buffer.lineHeight)
    ctx.restore()
}

Buffer.prototype.redisplay = function redisplay() {
    var canvas = this.canvas
    var ctx = canvas.getContext("2d")
    var i;

    if (!this.visible) {
	canvas.style.display = "none";
	return
    }

    canvas.style.display = "block";
    canvas.width = this.width
    canvas.height = this.height
    canvas.style.left = this.left
    canvas.style.top = this.top
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()

    for (i = 0; i < this.getNumLines(); i++) {
        drawText(this, ctx, this.getLine(i), 10, (i + 1) * this.lineHeight)
    }

    /* Draw borders */
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, 8, canvas.height)
    ctx.fillRect(canvas.width - 8, 0, 8, canvas.height)

    /*
      Draw the status line
     */
    i = this.getMaxLines()
    ctx.fillStyle = '#cccccc'
    ctx.fillRect(0, canvas.height - this.lineHeight, canvas.width, this.lineHeight)
    ctx.fillStyle = '#c8c8c8'
    ctx.fillRect(0, canvas.height - this.lineHeight, canvas.width, 1)
    ctx.fillStyle = '#aaaaaa'
    ctx.fillRect(0, canvas.height - 1, canvas.width, 1)

    ctx.fillStyle = 'black'
    tmp = this.font
    drawText(this, ctx, this.getStatusLine(), 10, canvas.height)
    this.font = tmp

    drawCursor(this, ctx)
}

Buffer.prototype.handleKeyMode1 = function handleKeyMode1(e, codes) {
    if (codes[1] == "Shift") {
	/* Bail early, shift doesn't cause end of key sequence */
	return
    } else if (e.shiftKey && codes[2] == '<') {
	this.moveStartOfBuffer()
    } else if (e.shiftKey && codes[2] == '>') {
	this.moveEndOfBuffer()
    } else {
	/* Everything else we break out of Meta mode */
    }
    this.keyMode = 0
}

Buffer.prototype.handleKey = function handleKey(e, codes) {
    if (this.keyMode == 1) {
	this.handleKeyMode1(e, codes)
	this.redisplay()
	e.preventDefault()
	return false
    }
    if (!e.ctrlKey && !e.altKey && !e.metaKey && codes[0] === true) {
        /* Should be a literal */
        var ch
        if (e.shiftKey) {
            ch = codes[2]
        } else {
            ch = codes[1]
        }
        this.insertLiteral(ch)
    } else if (e.metaKey && codes[1] == 'g') {

/*
	var ci = document.getElementById("canvasInput")
	if (!gotoUp){
	    ci.style.setProperty("display", "block")
	} else {
	    ci.style.setProperty("display", "none")
	}
	gotoUp = !gotoUp
	*/
    } else if (e.shiftKey  && e.metaKey && codes[2] == '<') {
	this.moveStartOfBuffer()
    } else if (e.shiftKey  && e.metaKey && codes[2] == '>') {
	this.moveEndOfBuffer()
    } else if (codes[1] == "Home") {
	this.moveStartOfBuffer()
    } else if (codes[1] == "End") {
	this.moveEndOfBuffer()
    } else if (codes[1] == "Backspace") {
        this.erase()
    } else if (codes[1] == "Enter") {
        this.insertNewLine()
    } else if (codes[1] == "Space") {
        this.insertLiteral(' ')
    } else if (codes[1] == "Tab") {
        this.insertLiteral(' ')
        this.insertLiteral(' ')
        this.insertLiteral(' ')
        this.insertLiteral(' ')
    } else if (e.ctrlKey && codes[1] == 's') {
        this.saveFile()
    } else if (e.ctrlKey && codes[1] == 'a') {
        this.moveStartOfLine()
    } else if (e.ctrlKey && codes[1] == 'e') {
        this.moveEndOfLine()
    } else if (codes[1] == "Esc") {
	this.keyMode = 1
    } else if (codes[1] == "Left") {
        this.moveBackChar()
    } else if (codes[1] == "Right") {
        this.moveForwardChar()
    } else if (codes[1] == "Up") {
        this.moveUpLine()
    } else if (codes[1] == "Down") {
        this.moveDownLine()
    } else {
        return true
    }

    this.redisplay()
    e.preventDefault()
    return false
}