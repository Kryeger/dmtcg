var app = require('express')();
var express = require('express');
app.use(express.static('public'));
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');
var path = require('path');
var winston = require('winston');
var _ = require('underscore');
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

logger.log('error', 'test error message %s', 'my string');

var con = mysql.createConnection({
  host: "mysql1.gear.host",
  user: "dmtcg",
  password: "browntacocat123!",
  database : 'dmtcg'
});

var db, users;

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
  con.query("SELECT * FROM users", function(err, result){
    if(err) throw err;
    console.log("Retrieved users.");
    users = result;
    _.forEach(users, function(el, index, list){
      console.log(el);
    });
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

console.log(User.prototype);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(80, function(){
  console.log('listening on *:80');
});

io.on('connection', function(socket){
  console.log('a user connected');
  io.emit('send db', db);
  io.emit('send dirname', __dirname);
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(user){
    io.emit('chat message', user);
  });
  socket.on('sel-card', function([id, color]){
    io.emit('selected-card', [id, color]);
  })
  socket.on("login", function(obj){
    con.query("SELECT `password` FROM users WHERE `username` = '" + obj.user + "'", function(err, result){
      if (err) throw err;
    });
});
});