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
    var recordRTC = null;
    navigator.getUserMedia(session, function(stream) {

        var context = new AudioContext();
        var audioInput = context.createMediaStreamSource(stream);
        var bufferSize = 4096;
        // create a javascript node
        var recorder = context.createScriptProcessor(bufferSize, 1, 1);
        // specify the processing function
        recorder.onaudioprocess = (function(e) {

            var buffer = e.inputBuffer;
            var floatChunk = buffer.getChannelData(0).buffer;

            socket.emit("upChunk", floatChunk);

        });
        // connect stream to our recorder
        audioInput.connect(recorder);
        // connect our recorder to the previous destination
        recorder.connect(context.destination);

        //ss(socket).emit('upStream', upStream);
    }, function(e) {});
}

(function(window) {

    window.readContext = new AudioContext();
    window.socket = io();

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    socket.on("ready", function() {
        initMic();
    });

    socket.on("downChunk", function(rawBuffer) {
        play(new Float32Array(rawBuffer));
    });

})(window);