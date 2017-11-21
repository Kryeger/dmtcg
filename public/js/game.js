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
  
  socket.on("selected-card", function([id, color]){
    $("#" + id).css("background-color", color);
  });

  socket.on('send db', function(_db){
    db = _db;
    _.forEach(db, function(el, index, list){
      $("#card" + index + " .card-name").text(el.name);
      $("#card" + index + " .card-power").text(el.power);
    })
  });
});