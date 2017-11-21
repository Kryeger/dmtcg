$(function () {
  var socket = io();
  var user = prompt("", "username");
  var pass = prompt("", "password");
  
  socket.emit("login", {user: user, pass: pass});
  
  var db;

  //user.name = prompt("enter name", "example");

  $('form').submit(function(){
    user.msg = $('#m').val();
    socket.emit('chat message', user);
    $('#m').val('');
    return false;
  });
  
  $(document).on("click", ".card", function(){
    socket.emit("sel-card", [this.id, user.color]);
  });
  
  socket.on("logged in", function(user){
    $("body").append(user.username);
      socket.emit('get card', JSON.parse(user.collection));
      socket.on("card info", function(cardArray){
        _.forEach(cardArray, function(el, index, list){
          $("body").append(el.name + " " + el.power);
        })
      });
  });
  
  socket.on("selected-card", function([id, color]){
    $("#" + id).css("background-color", color);
  });
});