$(function () {
  $(document).on('click', 'form[name = loginForm] button', function(e){
    e.preventDefault();
    var user = {
      name: $('input[name = username]').val(),
      pass: $('input[name = password]').val(),
      valid: function (){
        var canDo = 1;
        if(!this.name.length || this.name.length > 20){
          canDo = 0;
          console.log("Invalid Username.");
          //TODO: warning
        }
        if(!this.pass.length || this.pass.length > 32){
          canDo = 0;
          console.log("Invalid Password.");
          //TODO: warning
        }
        return canDo;
        //return (this.pass === this.repass) && (this.name);
      }
    }
    if(user.valid()){
      socket.emit('login req', user);
    }
  });
  socket.on("login response", function(arr){
    if(arr[0]){
      console.log("Logged in!");
      $.cookie('userid', arr[1], { expires: 30, path: '/' });
      $.cookie('userkey', arr[2], { expires: 30, path: '/' });
      location.reload();
    } else {console.log("Wrong credentials.");}
  });
});