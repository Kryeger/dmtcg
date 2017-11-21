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

var logger = new winston.Logger({
  level: 'error',
  transports: [
    new (winston.transports.File)({ filename: 'error.log' })
  ]
});



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
  socket.on('chat message', function(user){
    io.emit('chat message', user);
  });
  socket.on('sel-card', function([id, color]){
    io.emit('selected-card', [id, color]);
  });
  socket.on("login", function(obj){
    con.query("SELECT `password` FROM users WHERE `username` = '" + obj.user + "'", function(err, result){
      if (err) throw err;
      if(encrypt(obj.pass) == result[0].password){
          con.query("SELECT * FROM users WHERE `username` = '" + obj.user + "'", function(err, result){
            if (err) throw err;
            io.emit('logged in', result[0]);
          });
        console.log(obj.user + " logged in.");
      }
      else console.log("Login for user " + obj.user + " failed.");
    });
  });
  socket.on("get card", function(cardArray){
    console.log(cardArray);
    str = "(" + cardArray.join() + ")";
    console.log(str);
    con.query("SELECT * FROM cards WHERE `id` in " + str + "", function(err, result){
      //if (err) throw err;
      console.log(result);
      io.emit('card info', result);
    });
  });
});