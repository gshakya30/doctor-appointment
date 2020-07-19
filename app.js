var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var bodyParser = require('body-parser');
var mongodb = require('./db/mongodb');
require('dotenv').config();
var app = express();


app.set('view engine', 'jade');
app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var server = app.listen(8888)
var io = require('socket.io').listen(server);


io.on('connection', (socket) => {
  console.log('Socket connection established');
  socket.on('disconnect', () => {
    console.log('Disconnected')
  });
}); 

app.use(function(req, res, next) {
  res.io = io; 
  next();
});

app.use('/api/user', usersRouter);



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};  
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




module.exports = app;
