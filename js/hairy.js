var Hairy = {
    username: null,
    authKey: null,

    init: function() {
        Hairy.checkLogin();
        Hairy.initLoginScreen();
        Hairy.initEditProfile();
        Hairy.initSendMessage();
        window.setInterval(Hairy.refreshMessages, 5000);
        Hairy.initShowProfile();
        Hairy.initWorker();
    },

    //______________________ CHECK LOGIN _____________________//
    checkLogin: function() {
        if (Hairy.needsLogin() && !Hairy.isLoggedIn()) {
            document.location = 'login.html';
        }
    },

    needsLogin: function() {
        var needsLogin = true;

        var pathName = window.location.pathname;
        var whitelist = $(['login.html', 'editprofile.html']);
        whitelist.each(function(index, item) {
            if (pathName.indexOf(item) > -1) {
                needsLogin = false;
            }
        });
        return needsLogin;
    },

    isLoggedIn: function() {
        Hairy.username = localStorage.getItem('username');
        Hairy.authKey = localStorage.getItem('authKey');
        return (Hairy.username != null && Hairy.authKey != null);
    },

    //________________________ LOGIN _______________________//
    initLoginScreen: function() {
        $('section#login form').submit(function(event) {
            event.preventDefault();
            Hairy.login($(this).find('input#username').val(), $(this).find('input#password').val());
        });
    },

    login: function(username, password) {
        var errorSpan = $('section#login form span.error');
        errorSpan.addClass('hidden');

        $.ajax({
            url: Hairy.getAuthUrl(),
            type: 'GET',
            data: {
                username: username,
                password: password
            },
            dataType: 'json',
            success: function(response) {
                var username = response.data.username;
                var authKey = response.data.authKey;

                localStorage.setItem('username', username);
                localStorage.setItem('authKey', authKey);

                document.location = 'index.html';
            },
            error: function(data) {
                errorSpan.removeClass('hidden');
            }
        });
    },

    //____________________ EDIT PROFILE ___________________//
    initEditProfile: function() {
        $('section#editprofile form').submit(function(event) {
            event.preventDefault();
            Hairy.sendEditProfile();
        });
    },

    sendEditProfile: function() {
        var data = $('section#editprofile form').serialize();
        $.ajax({
            url: Hairy.getUserUrl(),
            type: 'POST',
            data: data,
            success: function(data) {
                document.location = 'login.html';
            }
        });
    },

    //___________________ SENDING MESSAGES ________________//
    initSendMessage: function() {
        $('section#sendmessage input#submit').click(function(event) {
            event.preventDefault();

            var data = {
                authKey: Hairy.authKey,
                message: $('section#sendmessage textarea').val()
            };

            $.ajax({
                url: Hairy.getMessageUrl(),
                type: 'POST',
                data: data,
                success: function(data) {
                    $('section#sendmessage textarea').val('');
                }
            });
        });
    },

    //____________________ SHOW MESSAGES __________________//
    refreshMessages: function() {
        $('section#messages').each(function() {
            var messagesSection = $(this);

            $.ajax({
                url: Hairy.getMessageUrl(),
                type: 'GET',
                dataType: 'json',
                success: function(response) {
                    Hairy.showMessages(response.data, messagesSection);
                }
            });
        });
    },

    showMessages: function(messages, messagesSection) {
        messagesSection.html('');

        $(messages).each(function() {
            var message = this;

            var messageHtml = $('<article class="message"></article>');
            messageHtml.append($('<header></header>').append($('<h1></h1>').text(message.firstname + ' ' + message.lastname + ':')));
            messageHtml.append($('<p></p>').text(message.message));

            var footer = $('<footer></footer>');
            footer.append($('<span></span>').text(message.placed)).append(' | ');
            footer.append($('<span></span>').append($('<a></a>').attr('href', 'viewprofile.html?username=' + message.username).text(message.username))).append(' | ');
            footer.append($('<span></span>').text('E-mail: ' + message.email));

            messageHtml.append(footer);
            messagesSection.append(messageHtml);
        });
    },

    //____________________ VIEW PROFILE ___________________//
    initShowProfile: function() {
        $('section#viewprofile').each(function() {
            var viewprofileSection = $(this);
            viewprofileSection.find('input').click(function() {
                document.location = 'index.html';
            });

            var matches = window.location.search.match('username=([^&]+)');
            
            var username = Hairy.username;
            if (matches) {
                username = matches[1];
            }

            $.ajax({
                url: Hairy.getUserUrl(),
                type: 'GET',
                data: {
                    username: username
                },
                dataType: 'json',
                success: function(response) {
                    viewprofileSection.find('#profileUsername').text(response.data.username);
                    viewprofileSection.find('#profileFirstname').text(response.data.firstname);
                    viewprofileSection.find('#profileLastname').text(response.data.lastname);
                    viewprofileSection.find('#profileEmail').text(response.data.email);
                    viewprofileSection.find('#profilePassword').text(response.data.password);
                }
            });
        });
    },

    //_______________________ WORKER ______________________//
    initWorker: function() {
        var worker = new Worker('js/myworker.js');
        worker.onmessage = function(event) {
            console.log(event.data);
        };
    },

    //______________ PATHS TO THE WEBSERVICE ______________//
    getAuthUrl: function() {
        return Hairy.getBasePath() + 'auth.json';
    },

    getUserUrl: function() {
        return Hairy.getBasePath() + 'user.json';
    },

    getMessageUrl: function() {
        return Hairy.getBasePath() + 'message.json';
    },

    getBasePath: function() {
        return 'http://intweet.dev/';
    }
};

$(document).ready(function() {
    Hairy.init();
});