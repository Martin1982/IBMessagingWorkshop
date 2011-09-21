var JsonpData;

function Messaging() {
    this.authKey = '';
    this.apiLocation = 'http://intweet.dev/';
    this.methods = {
        /**
         * Application bootstrapper
         * - Checks if the browser meets the application requirements
         * - Checks if the user has landed on a page which could be seen
         */
        bootstrap : function() {
            var message = '';
            var validBoot = true;

            if (typeof localStorage == 'undefined') {
                message+= 'Your browser does not support local storage!\n';
                validBoot = false;
            } else {
                this.authKey = localStorage.getItem('authKey');
            }

            if (typeof Worker == 'undefined') {
                message+= 'Your browser does not support web workers!\n';
                validBoot = false;
            }
            if (typeof window.applicationCache == 'undefined') {
                message+= 'Your browser does not support application caching!\n';
                validBoot = false;
            }

            if (!validBoot) {
                alert(message);
                return;
            }

            if (!this.isAllowedOnPage()) {
                window.location.href = 'login.html';
            }

            if (!this.hasKey()) {
                $('nav').hide();
            }
        },
        /**
         * Checks if a key has been set from the local storage
         */
        hasKey : function() {
            this.authKey = localStorage.getItem('authKey');
            if (this.authKey != null) {
                return true;
            }
            return false;
        },
        /**
         * Checks if a user is allowed to view the current page
         */
        isAllowedOnPage : function() {
            if (this.hasKey()) {
                return true;
            }

            if($('#login').length > 0 || $('#editprofile').length > 0) {
                return true;
            }

            return false;
        },
        /**
         * Submits changes to someone's profile
         */
        submitProfile : function (event, formObj) {
            event.preventDefault();
            var formData = {
                username: formObj.find('input[name=username]').val(),
                firstname: formObj.find('input[name=firstname]').val(),
                lastname: formObj.find('input[name=lastname]').val(),
                email: formObj.find('input[name=email]').val(),
                password: formObj.find('input[name=password]').val()
            }
            $.post(
                "http://intweet.dev/user.json?callback=userdata", 
                formData,
                function (data) {
                    window.location.href = "index.html";
                }
            );
        },
        /**
         * Submit a new message from your own profile
         */
        submitMessage : function(event, formObj) {
            event.preventDefault();
            var formData = {
                message: formObj.find('textarea').val(),
                authKey: localStorage.getItem('authKey')
            }
            $.ajax({
                type: "POST",
                url: "http://intweet.dev/message.json", 
                data: formData,
                success: function (data) {
                    console.log(data);
                    if(data.meta.success !== 1) {
                        alert('Your message has not been posted');
                    }
                },
                dataType: 'json'
            });

        },
        /**
         * Submit a login form
         */
        submitLogin : function() {
            $.ajax({
                url: "http://intweet.dev/auth.json?&callback=myData",
                data: {
                    username: $('#frmUsername').val(),
                    password: $('#frmPassword').val()
                },
                success: function(userProfile) {
                    if (userProfile.meta.success !== 1) {
                        alert('Wrong username or password');
                        return false;
                    }
                    
                    localStorage.setItem('authKey', userProfile.data.authKey);
                    window.location.href='index.html';
                },
                dataType: 'jsonp'
            });
        },
        /**
         * Load messages
         */
        loadMessages : function() {
            $.ajax({
                url: "http://intweet.dev/message.json?callback=myData",
                success: function(data) {
                    var cloned;
                    $.each(data.data, function(key, messageData) {
                        cloned = $('#messageTpl').clone().removeAttr('id');
                        cloned.find('a.fullnamelink').attr('href', 'viewprofile.html?username=' + messageData.username).html(messageData.firstname + ' ' + messageData.lastname);    
                        cloned.find('.usermessage').html(messageData.message);
                        cloned.find('time').attr('datetime', messageData.placed).html(messageData.placed);
                        cloned.find('.usernamelink').attr('href', 'viewprofile.html?username=' + messageData.username).html(messageData.username);
                        cloned.find('.maillink').attr('href', 'mailto:' + messageData.email).html(messageData.email);
                        cloned.appendTo('#messages');

                    });
                },
                dataType: 'jsonp'
            });
        },
        /**
         * Load user profile
         */
        loadProfile : function(username) {
            $.ajax({
                url: "http://intweet.dev/user.json?username=" + username + "&callback=myData",
                success: function(user) {
                    $('#profileUsername').html(user.data.username);
                    $('#profileFirstname').html(user.data.firstname);
                    $('#profileLastname').html(user.data.lastname);
                    $('#profileEmail').html(user.data.email);
                },
                dataType: 'jsonp'
            });
        },
        /**
         * Load a user's own profile
         */
        loadMyProfile : function(authKey) {
            $.ajax({
                url: "http://intweet.dev/user.json?authKey=" + authKey + "&callback=myData",
                success: function(user) {
                    $('#username').attr('value', user.data.username);
                    $('#firstname').attr('value', user.data.firstname);
                    $('#lastname').attr('value', user.data.lastname);
                    $('#email').attr('value', user.data.email);
                },
                dataType: 'jsonp'
            });
        }
    }
    
    return this.methods;
};



$(document).ready(function(){

    var messApplication = new Messaging();
    messApplication.bootstrap();
    
    if ($('#login').length > 0) {
        localStorage.removeItem('authKey');
    }
    
    // show messages
    if ($('#messageTpl').length > 0) {
        messApplication.loadMessages();
    }
    
    if ($('#viewprofile').length > 0) {
        var getVars = {};

        document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
            function decode(s) {
                return decodeURIComponent(s.split("+").join(" "));
            }

            getVars[decode(arguments[1])] = decode(arguments[2]);
        });

        messApplication.loadProfile(getVars['username']);
    }
    
    if ($('#editprofile').length > 0) {
        messApplication.loadMyProfile(localStorage.authKey);
    }
    
    // create profile
    // edit profile
    $('#editprofile form').submit(function(event){
        messApplication.submitProfile(event, $(this));
    });

    // add message    
    $('#sendmessage').submit(function(e){
        messApplication.submitMessage(e, $(this));
    });
   
    // login
    $('#login form').submit(function(e){
        e.preventDefault();
        messApplication.submitLogin();
    });
    
    $('.backBtn').click(function(){
        document.location.href = 'index.html';
    });
   
});