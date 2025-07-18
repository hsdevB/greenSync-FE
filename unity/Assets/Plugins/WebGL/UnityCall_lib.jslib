mergeInto(LibraryManager.library, {
    SendMessageToReact : function (msg){
        console.log("[JSlib] Called from Unity!");
        window.dispatchReactUnityEvent(
            "OnMessageReceived",
            UTF8ToString(msg)
        )
    },
})