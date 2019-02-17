var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
/*
var options = {
  key: fs.readFileSync('certs/key.pem'),
  cert: fs.readFileSync('certs/certificate.pem')
};
*/
var http1 = require('http')//.Server(app)
var server = http1.createServer(app)
var io = require('socket.io')(server);
app.use(function(req, res, next){
  res.io = io;
  next();
});

app.use('/public',express.static(path.join(__dirname,'../docs')))
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = {app: app,server: server};
