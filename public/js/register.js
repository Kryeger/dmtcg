$(function () {
  $(document).on('click', 'form[name = registerForm] button', function(e){
    e.preventDefault();
    var user = {
      name: $('input[name = username]').val(),
      pass: $('input[name = password]').val(),
      repass: $('input[name = repassword]').val(),
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
        if(this.pass.length && this.repass != this.pass){
          canDo = 0;
          console.log("Passwords don't match.");
          //TODO: warning
        }
        return canDo;
        //return (this.pass === this.repass) && (this.name);
      }
    }
    if(user.valid()){
      socket.emit('register req', user);
    }
  });
  socket.on("register response", function(arr){
    if(arr[0]){
      console.log("Registered!");
      $.cookie('userid', arr[1], { expires: 7, path: '/' });
      $.cookie('userkey', arr[2], { expires: 7, path: '/' });
      location.reload();
    } else {alert("Username Taken");}
  });
});