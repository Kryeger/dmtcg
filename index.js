var app = require('express')();
var express = require('express');
app.use(express.static('public'));
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');
var path = require('path');
var winston = require('winston');
var _ = require('underscore');
var async = require('async');
var Chance = require('chance');
chance = new Chance();
var crypto = require('crypto'), algorithm = 'aes-256-ctr', password = 'Qqo*o[{MYFx<fwrq[4/\$7^J[PBR<==DnN?JO*tW{C*"WY1R}jCK]%7%WOy}i%r';

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
} 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

var s = chance.string();

//const errorLog = require('/utils/logger').errorlog;
//const successlog = require('/utils/logger').successlog;
var con = mysql.createConnection({
  host: "mysql1.gear.host",
  user: "dmtcg",
  password: "browntacocat123!",
  database : 'dmtcg'
});

var db;

con.connect(function(err){
  if (err) {
    throw err;
    console.log("ERROR!"); 
  }
  console.log("Connected!");
  con.query("SELECT * FROM cards", function(err, result){
    if (err) throw err;
    console.log("Retrieved cards.")
    db = result;
  });
});



function User(id, username, collection, stats, playState){
  this.id = id;
  this.username = username;
  this.collection = collection;
  this.stats = stats;
  this.playState = playState;
  }
  
User.prototype = {
  constructor: User
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(80, function(){
  console.log('listening on *:80');
});

io.on('connection', function(socket){
  io.emit('send dirname', __dirname);
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on("get card", function(cardArray){
    str = "(" + cardArray.join() + ")";
    con.query("SELECT * FROM cards WHERE `id` in " + str + "", function(err, result){
      if (err) throw err;
      io.emit('card info', result);
    });
  });
  socket.on("register req", function(user){
    var success = 0;
    con.query("SELECT `id` FROM users WHERE `username` = '" + user.name + "' LIMIT 1", function(err, result){
      if (err) throw err;
      if (result.length){
        console.log("Username taken.");
        io.emit('register response', [success]);
      }
      else {
        success = 1;
        var cm = "','";
        user.collection = user.decks = "[]";
        user.hash = chance.string({length: 64 - user.pass.length});
        user.pass = encrypt(user.pass + user.hash);
        user.key = chance.string({length: 64});
        con.query("INSERT INTO users (`username`, `password`, `hash`, `userkey`, `collection`, `decks`) VALUES('" + user.name + cm + user.pass + cm + user.hash + cm + user.key + cm + user.collection + cm + user.decks + "')", function(err, result){
          if (err) throw err;
        });
        con.query("SELECT `id` FROM users WHERE `username` = '" + user.name + "'", function(err, result){
          if (err) throw err;
          user.id = result[0].id;
        });
        io.emit('register response', [success, user.id, user.key]);
      }
    });
  });
  socket.on("login req", function(user){
    var success = 0;
    con.query("SELECT `password`, `hash`, `userkey`, `id`, `collection` FROM users WHERE `username` = '" + user.name + "'", function(err, result){
      if (err) throw err;
      if (!result.length){
        io.emit('login response', [0]);
        return;
      }
      if (encrypt(user.pass + result[0].hash) == result[0].password){
        io.emit('login response', [1, result[0].id, result[0].userkey]);
      } else {
        io.emit('login response', [0]);
      }
    });
  });
  socket.on("check account exists", function(acc){
    con.query("SELECT `id` FROM users WHERE `id` = '"+ acc.userid +"' AND `userkey` = '"+ acc.userkey +"'", function(err, result){
      if(err) throw err;
      if(!result.length) io.emit("check account exists response", 0);
      else io.emit("check account exists response", 1);
    });
  });
  socket.on("collection req", function(userid){
    con.query("SELECT `collection` FROM users WHERE `id` = '" + userid+ "'", function(err, result){
      if (err) throw err;
      if(result.length) io.emit("collection response", JSON.parse(result[0].collection));
    });
  });
});