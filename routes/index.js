var express = require('express');
var db = require('../db');
const { search } = require('.');
var router = express.Router();
const https = require('https')

/* GET home page. */
router.get('/', function (req, res, next) {
  if (!req.user) { return res.render('login'); }
  next();
}, function (req, res, next) {
  res.locals.filter = null;
  db.all("SELECT * from ratings JOIN books ON ratings.isbn = books.isbn WHERE username = ?", [req.user.username], function (err, row) {
    console.log("getting rating data in index")
    console.log(row)
    res.render('index', { user: req.user, books: row });
  });
});
router.get('/search', function (req, res, next) {
  if (!req.user) { return res.render('login'); }
  next();
}, function (req, res, next) {
  res.render('search', { user: req.user });
});
router.post('/search/term', function (req, res, next) {
  if (!req.user) { return res.redirect('/'); }
  next();
}, async function (req, res, next) {
  console.log(req.body)
  let searchT = req.body.search.replace(/ /g, "+")
  let recievedBooks = []
  let info = undefined

  try {
    let response = await fetch(`https://openlibrary.org/search.json?title=${searchT}&language=eng&fields=editions,title,author_name,isbn&editions.sort`);
    info = await response.json();
    //console.log(info);
  } catch (error) {
    console.error(error);
    next(error);
  }
  for (let i = 0; i < info.docs.length; i++) {
    if (info.docs[i].title && info.docs[i].author_name && info.docs[i].isbn) {
      recievedBooks.push({ title: info.docs[i].title, author: info.docs[i].author_name[0], isbn: info.docs[i].isbn[0] })
      db.run('INSERT OR REPLACE INTO books(isbn, author_name, book_title) VALUES (?,?,?)',
        [info.docs[i].isbn[0], info.docs[i].author_name[0], info.docs[i].title], function (err) {
          if (err) { return next(err); }
        });
    }
    if (i == 5) break;
    //console.log(info.docs[i].isbn)
  }
  console.log("docs length:")
  //console.log(info.docs.length)
  console.log(recievedBooks)
  res.render('output', { user: req.user, recievedBooks });
});
router.get('/output', function (req, res, next) {
  if (!req.user) { return res.render('login'); }
  next();
}, function (req, res, next) {
  res.render('output', { user: req.user, recievedBooks: undefined });
});
router.post('/book/:isbn', function (req, res, next) {
  if (!req.user) { return res.render('login'); }
  next();
}, function (req, res, next) {
  console.log("isbn" + req.params.isbn)
  //console.log("query")
  let book = undefined
  db.all("SELECT * FROM books WHERE isbn = ?", [req.params.isbn], function (err, row) {
    if (row[0] == undefined) {
      console.log("COULD NOT FIND BOOK :(")
      return next("Could not find book");
    }
    console.log(row[0])
    res.render('rate', { book: row[0], user: req.user });
  });
  //console.log(req.query)
});
router.post('/rate/:isbn', function (req, res, next) {
  if (!req.user) { return res.render('login'); }
  next();
}, function (req, res, next) {
  console.log("isbn" + req.params.isbn)
  console.log("body")
  console.log(req.body)
  if (req.body.finished == undefined) {
    req.body.finished = "N/A"
  }
  db.run('INSERT OR REPLACE INTO ratings(username,isbn,rating,completed) VALUES (?,?,?,?)',
    [req.user.username, req.params.isbn, req.body.rating, req.body.finished], function (err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
});
router.get('/admin', function (req, res, next) {
  if (!req.user) { return res.render('login'); }
  next();
}, function (req, res, next) {
  db.all("SELECT * from users WHERE username = ?", [req.user.username], function (err, row) {
    if (row[0].userType != "A") return res.redirect('/');
    next();
  });
}, function (req, res, next) {
  db.all("SELECT * from users WHERE userType != 'A'", function (err, row) {
    res.render('admin', { user: req.user, users: row });
  });
});
router.post('/admin/:username', function (req, res, next) {
  db.run('DELETE FROM users WHERE username = ?', [req.params.username], function (err) {
    if (err) { return next(err); }
    res.redirect('/admin');
  });
});
router.get('/searchuser', function (req, res, next) {
  if (!req.user) { return res.render('login'); }
  next();
}, function (req, res, next) {
  res.render('searchUser', { user: req.user });
});
router.post('/search/user/', function (req, res, next) {
  if (!req.user) { return res.render('login'); }
  next();
}, function (req, res, next) {
  console.log(req.body)
  db.all("SELECT * from users WHERE username = ?", [req.body.searchU], function (err, row) { 
    if(row[0] == undefined) return res.redirect('/');
    db.all("SELECT * from ratings JOIN books ON ratings.isbn = books.isbn WHERE username = ?", [req.body.searchU], function (err, row) {
      console.log("getting rating data in index")
      console.log(row)
      res.render('viewUser', { username: req.body.searchU, books: row });
    });
  });
});
module.exports = router;