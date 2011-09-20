var JsonpData;

function Messaging() {
    this.authKey = '';
    this.apiLocation = 'http://intweet.dev/';
    
    return this;
};

/**
 * Application bootstrapper
 * - Checks if the browser meets the application requirements
 * - Checks if the user has landed on a page which could be seen
 */
Messaging.prototype.bootstrap = function() {
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
        //window.location.href = 'login.html';
    }
    
    if (!this.hasKey()) {
        $('nav').hide();
    }
}

/**
 * Checks if a key has been set from the local storage
 */
Messaging.prototype.hasKey = function() {
    if (this.authKey != null) {
        return true;
    }
    return false;
}

/**
 * Checks if a user is allowed to view the current page
 */
Messaging.prototype.isAllowedOnPage = function() {
    if (this.hasKey()) {
        return true;
    }
    
    if($('#login').length > 0 || $('#editprofile').length > 0) {
        return true;
    }
    
    return false;
}

/**
 * Submits changes to someone's profile
 */
Messaging.prototype.submitProfile = function (event, formObj) {
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
            console.log(data);
        }
    );
}

Messaging.prototype.dataSaved = function() {
    alert('Your data has been saved');
}

/**
 * Submit a new message from your own profile
 */
Messaging.prototype.submitMessage = function() {
    
}

/**
 * Submit a login form
 */
Messaging.prototype.submitLogin = function() {
    $.getJSON("http://intweet.dev/auth.json?&callback=myData",
      {
         username: $('#frmUsername').val(),
         password: $('#frmPassword').val()
      },
      function(userProfile) {
          console.log(userProfile);
          if (userProfile.meta.success !== 1) {
              alert('Wrong username or password');
              return false;
          }
          return true;
          //window.location.href='index.html';
      }
    );
}

/**
 * Load messages
 */
Messaging.prototype.loadMessages = function() {
    $.ajax({
        url: "http://intweet.dev/message.json?callback=myData",
        success: function(data) {
            var cloned;
            $.each(data.data, function(key, messageData) {
                console.log(messageData);
                cloned = $('#messageTpl').clone().removeAttr('id');
                cloned.find('a.fullnamelink').html(messageData.firstname + ' ' + messageData.lastname);    
                cloned.find('.usermessage').html(messageData.message);
                cloned.find('time').html(messageData.placed);
                cloned.find('.usernamelink').html(messageData.username);
                cloned.find('.maillink').html(messageData.email);
                cloned.appendTo('#messages');
                
            });
        },
        dataType: 'jsonp'
    });
};

$(document).ready(function(){

    var messApplication = new Messaging();
    messApplication.bootstrap();
    
    // show messages
    if ($('#messageTpl').length > 0) {
        messApplication.loadMessages();
    }
    
    // create profile
    // edit profile
    $('#editprofile form').submit(function(event){
        messApplication.submitProfile(event, $(this));
    });

    // add message    
    $('#sendmessage').submit(function(){
        console.log('sending out a message');
    });
   
    // login
    $('#login form').submit(function(e){
        e.preventDefault();
        messApplication.submitLogin();
    });
   
});