var PeerConnection = (window.PeerConnection ||
    window.webkitPeerConnection ||
    window.webkitRTCPeerConnection ||
    window.mozRTCPeerConnection);
var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
var localVideo = null, remoteVideo = null, localVideoStream = null,
    videoCallButton = null, endCallButton = null,
    pc = null, socket = null;
var RTCSDP = window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;
var ice = {
    "iceServer": [
        { "url": "stun:stun.l.google.com:19302" },
        { 'url': 'stun:stun.services.mozilla.com' }
    ]
};
socket = new WebSocket("wss:" + window.location.href.substring(window.location.protocol.length).split('#')[0]);
function pageReady() {
    if (getUserMedia) {
        videoCallButton = document.getElementById("videoCallButton");
        endCallButton = document.getElementById('endCallButton');
        localVideo = document.getElementById('localVideo');
        remoteVideo = document.getElementById('remoteVideo');
        videoCallButton.removeAttribute('disabled');
        videoCallButton.addEventListener('click', initiateCall);
        endCallButton.addEventListener('click', function (evt) {
            endCall();
            socket.send(JSON.stringify({ "closeConnection": true }));
        });
    } else {
        alert("Sorry, your brower does not support Webrtc");
    }
}

function initiateCall() {
    prepareCall();
    getUserMedia.call(navigator, { 'audio': true, 'video': true }, function (stream) {
        localVideoStream = stream;
        localVideo.src = URL.createObjectURL(localVideoStream);
        pc.addStream(localVideoStream);
        createAndSendOffer();
    }, function (error) {
        console.log('getUserMedia err :' + err)
    })
};

socket.onmessage = function (evt) {
    var signal = null;
    
    if (!pc) {console.log("i need "+pc); answerCall();}

    signal = JSON.parse(evt.data);
    if (signal.sdp) {
        console.log("Received SDP from remote peer.");
        pc.setRemoteDescription(new RTCSDP(signal.sdp));
    } else if (signal.candidate) {
        console.log("Received ICECandidate from remote peer.");
        pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
    } else if (signal.closeConnection) {
        console.log("Received 'close call' signal from remote peer.");
        endCall();
    }
};

function prepareCall() {
    console.log(pc)
    pc = new PeerConnection(ice);
    pc.onicecandidate = onIceCandidateHandler;

    pc.onaddstream = onAddStreamHandler;
    console.log("sss")
}

function endCall() {
    function obj(){}
    pc.close();
    localVideoStream.getTracks().forEach(function (track) {
        track.stop();
    })
    localVideo.src = '';
    remoteVideo.src = '';
    videoCallButton.removeAttribute('disabled');
    endCallButton.setAttribute('disabled', true);
    pc = null;
}

function onIceCandidateHandler(evt) {
    if (!evt || !evt.candidate) return;
    socket.send(JSON.stringify({ "candidate": evt.candidate }));
};

function onAddStreamHandler(evt) {
    videoCallButton.setAttribute('disabled', true);
    endCallButton.removeAttribute('disabled');
    remoteVideo.src = URL.createObjectURL(evt.stream);
}

function answerCall() {
    prepareCall();

    getUserMedia.call(navigator, { "audio": true, 'video': true }, function (stream) {
        localVideoStream = stream;
        localVideo.src = URL.createObjectURL(localVideoStream);
        pc.addStream(localVideoStream);
        createAndSendAnswer();
    }, function (error) {
        console.log("getUserMedia err :" + error);
    })
}

function createAndSendAnswer() {
    pc.createAnswer(
        function (answer) {
            var ans = new RTCSDP(answer);
            pc.setLocalDescription(ans, function () {
                socket.send(JSON.stringify({ 'sdp': ans }));
            },
                function (error) {
                    console.log("create answer error sdp:" + error);
                })
        }, function (error) {
            console.log("create answer err: " + error);
        }
    );
}

function createAndSendOffer() {
    pc.createOffer(
        function (offer) {
            var off = new RTCSDP(offer);
            pc.setLocalDescription(new RTCSDP(off),
                function () {
                    socket.send(JSON.stringify({ "sdp": off }));
                },
                function (error) {
                    console.log("create sdp err :" + error);
                });
        }, function (error) {
            console.log("create offer err: " + error);
        }
    );
};