function Buffer() {
    this.cursorX = 0
    this.cursorY = 0
    this.lines = ["test"]
}

Buffer.prototype.getNumLines = function getNumLines() {
    return this.lines.length
}

Buffer.prototype.getLine = function getLine(idx) {
    return this.lines[idx]
}

var buffer = new Buffer()

/* Redisplay */
function drawText(ctx, str, x, y) {
    ctx.save();
    
    ctx.font = '16pt courier';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    var metrics = ctx.measureText(str)
    
    ctx.fillText(str, x, y)
    ctx.beginPath()
    
    ctx.restore()
}

function drawCursor(ctx) {
    ctx.save()
    ctx.fillStyle = "red"
    ctx.fillRect(13 * buffer.cursorX, 2 + 25 * buffer.cursorY, 13, 23)
    ctx.restore()
}

function redisplay() {
    var canvas = document.getElementById("canvas")
    var ctx = canvas.getContext("2d")

    ctx.save()
    ctx.clearRect(0, 0, 1000, 1000)
    ctx.restore()

    for (i = 0; i < buffer.getNumLines(); i ++) {
	drawText(ctx, buffer.getLine(i), 0, i * 25)
    }

    drawCursor(ctx)
}

function getKey() {
    if (event.keyCode == 8) { 
       if (buffer.lines[buffer.cursorY].length > 0 && buffer.cursorX > 0) {
	   buffer.lines[buffer.cursorY] = buffer.lines[buffer.cursorY].substr(0, buffer.cursorX - 1) + buffer.lines[buffer.cursorY].substr(buffer.cursorX, buffer.lines[buffer.cursorY].length)
	    buffer.cursorX -= 1
	}
	if (buffer.cursorX == 0 && buffer.cursorY > 0) {
	    buffer.cursorX = buffer.lines[buffer.cursorY - 1].length
	    buffer.lines[buffer.cursorY - 1] = buffer.lines[buffer.cursorY - 1] + buffer.lines[buffer.cursorY]
	    buffer.lines = buffer.lines.slice(0, buffer.cursorY).concat(buffer.lines.slice(buffer.cursorY + 1, buffer.lines.length))
	    buffer.cursorY -= 1
	}
    } else if (event.ctrlKey && event.keyCode == 65) {
	buffer.cursorX = 0
    } else if (event.ctrlKey && event.keyCode == 69) {
	buffer.cursorX = buffer.lines[buffer.cursorY].length
    } else if (event.keyCode == 13) {
	buffer.lines = buffer.lines.slice(0, buffer.cursorY).concat([buffer.lines[buffer.cursorY].substr(0, buffer.cursorX), buffer.lines[buffer.cursorY].substr(buffer.cursorX, buffer.lines[buffer.cursorY].length)], buffer.lines.slice(buffer.cursorY + 1, buffer.lines.length))
	buffer.cursorX = 0
	buffer.cursorY += 1
    } else if (event.keyCode == 37) {
	if (buffer.cursorX > 0) {
	    buffer.cursorX -= 1
	}
    } else if (event.keyCode == 39) {
	if (buffer.cursorX < buffer.lines[buffer.cursorY].length) {
	    buffer.cursorX += 1
	}
    } else if (event.keyCode == 38) {
	if (buffer.cursorY > 0) {
	    buffer.cursorY -= 1
	}
	if (buffer.cursorX > buffer.lines[buffer.cursorY].length) {
	    buffer.cursorX = buffer.lines[buffer.cursorY].length
	}
    } else if (event.keyCode == 40) {
	if (buffer.cursorY < buffer.lines.length - 1) {
	    buffer.cursorY += 1
	}
	if (buffer.cursorX > buffer.lines[buffer.cursorY].length) {
	    buffer.cursorX = buffer.lines[buffer.cursorY].length
	}
    } else if (event.keyCode >= 65 && event.keyCode <= 90 && ! event.altKey && ! event.ctrlKey && ! event.metaKey ) {
	if (event.shiftKey) {
	    ch = String.fromCharCode(event.keyCode)
	} else {
	    ch = String.fromCharCode(event.keyCode).toLowerCase()
	}
	buffer.lines[buffer.cursorY] = buffer.lines[buffer.cursorY].substr(0, buffer.cursorX) + ch + buffer.lines[buffer.cursorY].substr(buffer.cursorX, buffer.lines[buffer.cursorY].length)
	buffer.cursorX += 1
    } else {
	return true
    }
    redisplay()
    event.preventDefault()
    return false
}

function blah() {
    return false
}

document.onkeydown = getKey
document.onkeypress = blah
