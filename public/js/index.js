(function ($) {

    // initiliazes variables
    const $btnSignup = $('#frm-signup button')
    const $btnLogin = $('#frm-login button')

    const $imgProfileAvatar = $('#frame #sidepanel #profile-img')
    const $pProfileFullname = $('#frame #sidepanel #profile .wrap #full-name')
    const $contacts = $('#contacts ul')

    /************************************************************************/

    // trigger a click to open login modal
    $('#click-trigger').trigger('click');

    // initialize modals
    $('.modal').modal();

    // initialize dropdown
    $('.dropdown-trigger').dropdown();

    $('#feedback-message').text("Your account has been successfully activated. Please log in!");

    /************************************************************************/

    // show and hide pages
    (function showPages() {

        let $aBtnShowPages = $(".btnShowPage");
        // this is an array
        for (let i = 0; i < $aBtnShowPages.length; i++) {

            $aBtnShowPages.eq(i).click(function () {

                // Hide the pages
                let $aPages = $('.page');
                for (let j = 0; j < $aPages.length; j++) {
                    $aPages.eq(j).css("display", "none");;
                }

                let $sDataAttribute = $(this).attr("data-showThisPage");
                //console.log($sDataAttribute);
                $($sDataAttribute).css("display", "block");
                if ($sDataAttribute === '#login') {
                    $('.modal-footer span').text("Don't have a LimeLINE account yet?");
                    $('.modal-footer a').text('Sign Up').attr("data-showThisPage", "#signup-general");
                } else {
                    $('.modal-footer span').text("Already have a LimeLINE account?");
                    $('.modal-footer a').text('Log In').attr("data-showThisPage", "#login");
                }
            });

        }

    })();

    /*************************************************************************************************/

    // Signup user POST 
    $('#frm-signup').submit(function (e) {
        event.preventDefault()
        $btnSignup.text('Please wait ...').prop('disabled')
        $.ajax({
            url: "/signup-user",
            type: "POST",
            data: new FormData(this),
            processData: false,
            contentType: false,
            dataType: "json",
        }).always(function (response) {
            $btnSignup.text('Sending email and SMS').prop('disabled')
            if (response.status == 'error') {
                $btnSignup.removeClass('lime').addClass('red').text('Registration failed. Try again.');
                return
            }
            $btnSignup.text('Email and SMS sent');
        })

    })
    /**************************************************************************/

    // Login with FACEBOOK - POST

    $('#btn-facebook-login').click(function (e) {
        event.preventDefault()
        $('#btn-facebook-login').text('Please wait ...').prop('disabled')
        FB.login(function (response) {
            console.log(response.authResponse)
            if (response.authResponse) {
                //sessionStorage.setItem('token', response.authResponse.accessToken)
                let xhr = $.ajax({
                    url: "/login-user/facebook",
                    type: "POST",
                    data: {
                        access_token: response.authResponse.accessToken
                    },
                }).always(function (response) {
                    $('#btn-facebook-login').text('Logging in').prop('disabled')
                    if (response.status == 'error') {
                        $('#btn-facebook-login').text('Log in failed. Try again.').color('red');
                        return
                    }
                    console.log(response)
                    let token = xhr.getResponseHeader('token');
                    sessionStorage.setItem('token', token)
                    if (token) {
                        let $jUser = response
                        if ($jUser) {
                            let $sjUser = JSON.stringify($jUser)
                            sessionStorage.setItem('$sjUser', $sjUser)
                            getUsers($jUser)
                        }
                    }
                })
            }
        });
    })

    /**************************************************************************/

    // Login POST

    $('#frm-login').submit(function (e) {
        event.preventDefault()
        $btnLogin.text('Please wait ...').prop('disabled')
        $.ajax({
            url: "/login-user",
            type: "POST",
            data: $('#frm-login').serialize(),
            dataType: "json"
        }).always(function (response) {
            $btnLogin.text('Logging in').prop('disabled')
            console.log("Login", response)
            if (response.status == "error") {
                $btnLogin.removeClass('lime').addClass('red').text('Log in failed. Try again.');
                return
            }
            sessionStorage.setItem('token', response.token)
            if (sessionStorage.token) {
                verifyUser(sessionStorage.token)
            }
        })
    })

    /**************************************************************************/

    // Verify GET 

    function verifyUser(token) {
        $.ajax({
            type: "GET",
            url: "/verify-user",
            headers: {
                'Authorization': 'Bearer ' + token
            },
            dataType: "json"
        }).always(function (response) {
            console.log("Auth", response)
            if (response.status == "error") {
                $btnLogin.removeClass('lime').addClass('red').text('Log in failed. Try again.');
                return

            }
            let $jUser = response.authData.user
            let $sjUser = JSON.stringify($jUser)
            sessionStorage.setItem('$sjUser', $sjUser)
            getUsers($jUser)
        })
    }

    /**************************************************************************/

    // UPDATE page

    function updatePage(user) {
        $('#index-page').css('display', 'none')
        $('#main-page').css('display', 'block')
        $(document).prop('title', 'LimeLINE: Welcome');
        $.getScript('/js/socket.js', function () {
            console.log('script loaded');
        });
        $imgProfileAvatar.attr('src', user.avatar)
        $pProfileFullname.text(user.first_name + ' ' + user.last_name)
    }

    $sjUser = sessionStorage.getItem("$sjUser");

    if ($sjUser) {
        let $jUser = JSON.parse(sessionStorage.$sjUser);
        let $ajUsers = JSON.parse(sessionStorage.$sajUsers);
        updatePage($jUser)
        showUsers($ajUsers)
    }

    // GET users

    /************************************************************************/

    function getUsers(user) {
        $.ajax({
            type: "GET",
            url: "/get-users/" + user.id,
            dataType: "json"
        }).always(function (response) {
            console.log("Users", response)
            if (response.status == "error") {
                //  
                $('#index-page').css('display', 'none')
                $('#main-page').css('display', 'none')
                $('#error-page').css('display', 'block')
                return
            }
            let $ajUsers = response
            let $sajUsers = JSON.stringify($ajUsers)
            sessionStorage.setItem('$sajUsers', $sajUsers)
            updatePage(user)
            showUsers($ajUsers)
        })

    }

    // DISPLAY users

    function showUsers(users) {
        for (var i = 0; i < users.length; i++) {
            let $contactDiv = $('<li class="contact"><div class="wrap">' +
                '<span class="contact-status online">' + '</span><img src="' +
                users[i].avatar + '" alt="" /><div class = "meta"><p class="name">' +
                users[i].first_name + ' ' + users[i].last_name + '</p>' +
                '<p class="preview">You just got LITT up, Dragon.</p> </div></div></li>')
            $contacts.append($contactDiv)

        }
    }
    // chat-room JS

    /************************************************************************/

    $(".messages").animate({
        scrollTop: $(document).height()
    }, "fast");

    $("#profile-img").click(function () {
        $("#status-options").toggleClass("active");
    });

    $(".expand-button").click(function () {
        $("#profile").toggleClass("expanded");
        $("#contacts").toggleClass("expanded");
    });

    $("#status-options ul li").click(function () {
        $("#profile-img").removeClass();
        $("#status-online").removeClass("active");
        $("#status-away").removeClass("active");
        $("#status-busy").removeClass("active");
        $("#status-offline").removeClass("active");
        $(this).addClass("active");

        if ($("#status-online").hasClass("active")) {
            $("#profile-img").addClass("online");
        } else if ($("#status-away").hasClass("active")) {
            $("#profile-img").addClass("away");
        } else if ($("#status-busy").hasClass("active")) {
            $("#profile-img").addClass("busy");
        } else if ($("#status-offline").hasClass("active")) {
            $("#profile-img").addClass("offline");
        } else {
            $("#profile-img").removeClass();
        }

        $("#status-options").removeClass("active");
    });

    /************************************************************************/

    // Logout GET
    $('#btn-logout').click(function (e) {
        $('#btn-logout').text('Please wait ...').prop('disabled')
        sessionStorage.clear();
        location.reload();
        $('#index-page').css('display', 'block')
        $('#main-page').css('display', 'none')
        $(document).prop('title', 'LimeLINE: Get Started');
    })

})(jQuery);