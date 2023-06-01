var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var logger = require('morgan');
const mongoose = require("mongoose");
require('dotenv')?.config();
const cors = require("cors")
var chatgptRoute = require('./routes/chatgptApiRoutes.js');
var userRoute = require('./routes/userRoutes');

require('dotenv')?.config();
const { Configuration, OpenAIApi } = require("openai");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true, limit: "200mb" }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

console.log("Server in Running....")
// mongoose.connect(
//   `mongodb+srv://hussainraja:${process.env.AtlasPassword}@chatgptchathistory.sf7qk8p.mongodb.net/?retryWrites=true&w=majority`,{ useNewUrlParser: true })
//   .then(() => console.log("Connected to Mongo"))
//   .catch((error) => console.log("Mongodb Error " + error.message));
mongoose.connect(process.env.db_Connection, { useNewUrlParser: true })
.then(() => console.log("Connected to Mongo...."))
.catch((error) => console.log(error.message));
  
app.use('/brainStorm', chatgptRoute);
app.use('/brainStorm', userRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



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
