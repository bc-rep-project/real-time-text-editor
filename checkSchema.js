
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./web-app/database.sqlite');

db.serialize(() => {
  db.all("PRAGMA table_info(chat_messages);", (err, rows) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log(rows);
  });
});

db.close();
