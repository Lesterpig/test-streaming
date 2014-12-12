var app  = require("sockpress").init({ secret: "a", disableSession: true });
var fs   = require("fs");
var join = require("path").join;

app.use(app.express.static(join(__dirname, "static"), {etag: false, lastModified: false}));

app.io.on("connection", function(socket) {

	socket.emit("ready");

	socket.on("upChunk", function(upChunk) {
		socket.broadcast.emit('downChunk', upChunk);
	});

});

app.listen(3000, "0.0.0.0", function() {
	console.log("Ready to relay.");
});