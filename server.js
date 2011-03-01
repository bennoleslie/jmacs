/*
 jmacs server.
 */
var http = require('http');
var fs = require('fs');

var port = 9090
var host = "127.0.0.1"

var editFile = "README"

function do204(res) {
    res.writeHead(204)
    res.end()
}

function do301(res) {
    res.writeHead(301, {'Content-Type' : 'text/html'})
    res.end("<html><head><title>Foo</title></head><body>This is a 301</body></html>")
}


function do404(res) {
    res.writeHead(404, {'Content-Type' : 'text/html'})
    res.end("<html><head><title>Foo</title></head><body>This is a 404</body></html>")
}

function doGet(req, res) {
    if (req.url == "/") {
	fileName = "index.html"
	contentType = "text/html"
    } else if (req.url == "/reset-min.css") {
	fileName = "reset-min.css"
	contentType = "text/css"
    } else if (req.url == "/jmacs.js") {
	fileName = "jmacs.js"
	contentType = "text/javascript"
    } else if (req.url == "/buffer.js") {
	fileName = "buffer.js"
	contentType = "text/javascript"
    } else if (req.url == "/util.js") {
	fileName = "util.js"
	contentType = "text/javascript"
    } else if (req.url == "/keymap.js") {
	fileName = "keymap.js"
	contentType = "text/javascript"
    } else if (req.url == "/" + editFile) {
	fileName = editFile
	contentType = "text/plain"
    }

    if (fileName !== undefined) {
	res.writeHead(200, {'Content-Type' : contentType})
	fs.readFile(fileName, function (err, data) {
	    if (err) {
		throw err
	    }
	    res.end(data)
	})
    } else {
	do404(res)
    }
}

function doPut(req, res) {
    var data = ""
    if (req.url == "/" + editFile) {
	console.log("handling put of test file.")

	req.addListener("data", function(chunk) {
	    data += chunk
	})

	req.addListener("end", function() {
	    fs.writeFile(editFile, data)
	    do204(res)
	})
	
	do301(res)
    } else {
	do301(res)
    }
}

function handler(req, res) {
    var fileName
    var contentType

    console.log("Request: " + req.method + " " + req.url)

    if (req.method == "GET") {
	return doGet(req, res)
    } else if (req.method == "PUT") {
	return doPut(req, res)
    } else {
	return do404(res)
    }
}

var server = http.createServer(handler)

function onListen() {
    console.log('Server running at http://' + host + ':' + port + '/')
}

server.listen(port, host, onListen)
