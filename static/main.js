function play(chunk) {

    // Decode
    var buffer = readContext.createBuffer(1, chunk.length, 44100);

    channel = buffer.getChannelData(0);

    for (var i = 0; i < chunk.length; i++) {
        channel[i] = chunk[i];
    }

    // Play
    var source = readContext.createBufferSource();
    source.connect(readContext.destination);
    source.buffer = buffer;
    source.start(0);
}

function initMic() {
    var session = {
        audio: true,
        video: false
    };

    navigator.getUserMedia(session, function(stream) {

        var audioInput = micContext.createMediaStreamSource(stream);
        var bufferSize = 4096;
        var recorder = micContext.createScriptProcessor(bufferSize, 1, 1);
        recorder.onaudioprocess = (function(e) {

            var buffer = e.inputBuffer;
            var floatChunk = buffer.getChannelData(0).buffer;
            bytesUp += floatChunk.byteLength;

            socket.emit("upChunk", floatChunk);

        });

        audioInput.connect(recorder);

        recorder.connect(micContext.destination);

    }, function(e) { console.error(e); });
}

(function(window) {


    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    window.micContext = new AudioContext();
    window.readContext = new AudioContext();
    window.socket = io();

    window.bytesUp = 0;
    window.bytesDown = 0;

    socket.on("ready", function() {
        initMic();
    });

    socket.on("downChunk", function(rawBuffer) {
    	bytesDown += rawBuffer.byteLength;
        play(new Float32Array(rawBuffer));
    });

    // Network Trafic Tests


    setInterval(function() {

    	var deltaUp   = Math.ceil((bytesUp) / 3000);
    	var deltaDown = Math.ceil((bytesDown) / 3000);

    	console.log("UP : "+ deltaUp + " ko/s - " +
    	            "DOWN : "+ deltaDown + " ko/s");

    	bytesUp = 0;
    	bytesDown = 0;
    },3000);

})(window);