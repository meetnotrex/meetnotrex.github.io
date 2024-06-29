let screenHandler = null;

function unpublishMyCameraForScreenShare() {
    // Unpublish our stream
    let unpublish = { request: "unpublish" };
    screenHandler.send({ message: unpublish });
}
function startScreenShare() {
    unpublishOwnFeed();
    setTimeout(function(){
        publishOwnFeed(false, true);  // publish my screen whihout audio
    }, 800);

    janus.attach({
        plugin: "janus.plugin.videoroom",
        opaqueId: opaqueId,
        success: function(pluginHandle) {
            screenHandler = pluginHandle;
            Janus.log(":: Screen handler attached! (" + screenHandler.getPlugin() + ", id=" + screenHandler.getId() + ")");

            let register = {
                request: "join",
                room: parseInt(roomId),
                ptype: "publisher",
                display: currentUserName
            };
            screenHandler.send({ message: register });

            // janus.destroy();
        },
        error: function(error) {
            Janus.error("  -- Error attaching plugin...", error);
        },
        consentDialog: function(on) {
            // Janus.debug("Consent dialog should be " + (on ? "on" : "off") + " now");
            if (on) {
                // open screen
            } else {
                // close screen
            }
        },
        iceState: function(state) {
            Janus.log("ICE state changed to " + state);
        },
        mediaState: function(medium, on) {
            Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
        },
        webrtcState: function(on) {
            // bağlantı durumu
            Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
            if (!on)
                return;
        },
        onmessage: function(msg, jsep) {
            Janus.debug(" ::: Screen handler got a message (publisher) :::", msg);
            console.log(msg);

            let event = msg["videoroom"];
            Janus.debug("Event: " + event);
            if (! event) {
                return;
            }
            if (event === "joined") {
                // Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
                Janus.log("Successfully joined room " + msg["room"] + " with ID " + msg["id"]);
                
                // video conference
                publishMyCameraForScreenShare();

            } else if (event === "destroyed") {
                // // The room has been destroyed
                Janus.warn("The room has been destroyed!");
            }
        },
        onlocalstream: function(stream) {
            Janus.debug(" ::: ScreenHandler got a local stream :::", stream);
        },
        onremotestream: function(stream) {
            // The publisher stream is sendonly, we don't expect anything here
        },
        oncleanup: function() {
            Janus.log(" ::: Screen handler got a cleanup notification: we are unpublished now :::");
        }
    });
}
function stopScreenShare() {
    unpublishOwnFeed();
    unpublishMyCameraForScreenShare();
    setTimeout(function(){
        publishOwnFeed(true, false);
    }, 800);
}