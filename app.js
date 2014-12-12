var app  = require("sockpress").init({ secret: "a" });
var fs   = require("fs");
var join = require("path").join;

app.use(app.express.static(join(__dirname, "static"), {etag: false, lastModified: false}));

app.io.on("connection", function(socket) {

	socket.emit("ready");

	socket.on("upChunk", function(upChunk) {
		socket.broadcast.volatile.emit('downChunk', upChunk);
	});

});

app.listen(3030, function() {
	console.log("Ready to relay.");
});