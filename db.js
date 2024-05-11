var sqlite3 = require('sqlite3').verbose();
var mkdirp = require('mkdirp');

mkdirp.sync('data');
var db = new sqlite3.Database('data/MyBooksList.db');
db.serialize(function(){

  db.run("PRAGMA foreign_keys = ON;")
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT NOT NULL, password TEXT,userType TEXT NOT NULL,UNIQUE(username));"); //A for admin, U for user
  db.run("CREATE TABLE IF NOT EXISTS books(isbn TEXT PRIMARY KEY NOT NULL, author_name TEXT, book_title TEXT NOT NULL);");
  db.run("CREATE TABLE IF NOT EXISTS ratings (username TEXT NOT NULL, isbn TEXT NOT NULL, rating TEXT NOT NULL, completed TEXT, FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE, FOREIGN KEY (isbn) REFERENCES books(isbn) ON DELETE CASCADE,PRIMARY KEY(username,isbn));");
  db.run("INSERT OR REPLACE INTO users VALUES (1,'frank', 'secret2','A');");
  db.run("INSERT OR REPLACE INTO users VALUES (2,'g', 'g','U')")
});
module.exports = db;