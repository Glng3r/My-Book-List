  /*
  A few citations for the different things I used:
  API for searching for the books:ttps://openlibrary.org/dev/docs/api/search
  API for getting cover images:https://openlibrary.org/dev/docs/api/covers
  For authentication/authorization of routes I used passport. 
  I followed this tutorial to get it setup: https://www.passportjs.org/tutorials/password/signup/
  
  
  
  */
  var createError = require('http-errors');
  var express = require('express');
  var path = require('path');
  var cookieParser = require('cookie-parser');
  var logger = require('morgan');
  var passport = require('passport');
  var session = require('express-session');
  
  var SQLiteStore = require('connect-sqlite3')(session);
  
  var indexRouter = require('./routes/index');
  var authRouter = require('./routes/auth');
  var app = express();
  
  app.locals.pluralize = require('pluralize');
  
  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');
  
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: 'sessions.db', dir: './data' })
  }));
  app.use(passport.authenticate('session'));
  
  app.use('/', indexRouter);
  app.use('/', authRouter);
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
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, err => {
      if(err) console.log(err)
      else {
            console.log(`Server listening on port: ${PORT} CNTL:-C to stop`)
            console.log(`To Test:`)
            console.log('user: ldnel password: secret')
            console.log('http://localhost:3000')
        }
    })