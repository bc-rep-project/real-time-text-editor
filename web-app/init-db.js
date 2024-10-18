
const db = require('./database');

db.serialize(() => {
  console.log('Database initialized and tables created.');
  db.close();
});
