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
        window.location.href = 'login.html';
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
Messaging.prototype.submitProfile = function () {
    
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
    
}

$(document).ready(function(){

    var messApplication = new Messaging();
    messApplication.bootstrap();
    
    // show messages
    
    // create profile
    // edit profile
    $('#editprofile form').submit(function(){
        Messaging.submitProfile();
    });

    // add message    
    $('#sendmessage').submit(function(){
        console.log('sending out a message');
    });
   
    // login
    $('#login form').submit(function(){
        console.log('do a login') 
    });
   
});