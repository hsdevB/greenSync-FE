mergeInto(LibraryManager.library, {
    SendMessageToReact : function (msg){
        window.dispatchReactUnityEvent(
            "OnMessageReceived",
            UTF8ToString(msg)
        )
    },
})