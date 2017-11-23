var socket;

$(function () {
  socket = io({transports: ['websocket']});
  var user = "Kryeger";
  var pass = "pass";
  
  var db;

  //check if logged in
  $(document).ready(function(){
    if(typeof $.cookie('userid') === 'undefined' || typeof $.cookie('userkey') === 'undefined'){
    $("body").prepend(`
    <div class="guestWrap">
      <div class="guestButt" do="login">Login</div>
      <div class="guestButt" do="register">Register</div>
    </div>
    `);
  } else {
    var acc = {};
    acc.userid = $.cookie('userid');
    acc.userkey = $.cookie('userkey');
    socket.emit("check account exists", acc);
    socket.on("check account exists response", function(r){
      if(r){ // user is logged
        
        socket.emit("collection req", acc.userid);
        
        $("body").prepend(`<div do="logout">Logout</div>`);
      }else{
        $.removeCookie('userid', {path : '/'} );
        $.removeCookie('userkey', {path : '/'} );
        location.reload();
      }
    });
  }
    
    $(document).on("click", "[do=login]", function(){
      $('.guestWrap').remove();
      $("body").prepend('<div class="loginWrap"></div>');
      $(".loginWrap").load('/html/login.html');
    });
    
    $(document).on("click", "[do=register]", function(){
      $('.guestWrap').remove();
      $("body").prepend('<div class="registerWrap"></div>');
      $(".registerWrap").load('/html/register.html');
    });
    
    $(document).on("click", "[do=logout]", function(){
      $.removeCookie('userid', {path : '/'} );
      $.removeCookie('userkey', {path : '/'} );
      location.reload();
    });
  });
  
  socket.on("collection response", function(collection){
    _.forEach(collection, function(el, index, list){
      console.log("TEST");
      $(".player").append("<img class='card' src='/img/" + el + ".jpg'>");
    });
  });
  
  
  //user.name = prompt("enter name", "example");

});