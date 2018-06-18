(function ($) {

    // Initialize variables
    const $window = $(window);
    const $frmChat = $('#frm-chat');
    const $messages = $('.messages ul')
    //const $sProfileAvatar = $('img#profile-img').attr('src'); // avatar of logged in user
    const $sProfileName = $('#full-name').text(); // full name of logged in user
    const $inputMessage = $('#input-message'); // input message input box
    const $liActiveContact = $(".contact.active .preview");
    const sToken = sessionStorage.token;

    // connect to the server
    const socket = io().connect()

    socket.on('connect', function () {
        socket
            .emit('authenticate', {
                token: sToken
            }) //send the jwt
            .on('authenticated', function () {
                // Tell the server the username
                (function setUsername() {
                    if ($sProfileName) {
                        socket.emit('add user', $sProfileName);
                    }
                })()
                //do other things
                // Save the message to the database
                $frmChat.submit(function (e) {
                    event.preventDefault()
                    sendMessage()
                    /*$.ajax({
                        url: "/send-message",
                        type: "POST",
                        data: new FormData(this),
                        processData: false,
                        contentType: false,
                        dataType: "json",
                    }).always(function (response) {
                        if (response.status == 'error') {
                            console.log("error")
                            // give some feedback 
                            // like open a modal with the error message
                        }
                        // give some feedback
                        console.log("success")
                    })*/
                })
                // Sends a chat message
                function sendMessage() {
                    // Prevent markup from being injected into the message
                    let message = $inputMessage.val()
                    // Prevent markup from being injected into the message
                    message = cleanInput(message);
                    // if there is a non-empty message and a socket connection
                    if (message) {
                        // Tell the server the message
                        socket.emit('chat message', message);
                        // Empty the input box
                        $inputMessage.val(null);
                    }
                }
                socket.on('chat message', function (data) {
                    addChatMessage(data)
                });

                function addChatMessage(data) {
                    let $messageDiv = $('<li class="message"><img src="' + data.avatar + '" alt="avatar" /><span class="lime-text">' + data.username + '</span><p>' +
                        data.message + '</p></li>').data('username', data.username)
                    $messages.append($messageDiv)
                    //var happyEmoji = $messages.html().replace(/(\:\))/g, '&#x1F600;');
                    //$messages.html(happyEmoji);
                    //var sadEmoji = $messages.html().replace(/(\:\()/g, '&#x1F614;');
                    //$messages.html(sadEmoji);
                    //$liActiveContact.html("<span>You: </span>" + data.message);
                    $(".messages").animate({
                        scrollTop: $(document).height()
                    }, "fast");
                }

                // Prevents input from having injected markup
                function cleanInput(input) {
                    return $('<div/>').text(input).html();
                }

            })
            .on('unauthorized', function (msg) {
                console.log("unauthorized: " + JSON.stringify(msg.data));
                throw new Error(msg.data.type);
            })
    });

})(jQuery);