const mysql = require('mysql2');
const config = require('./config')

const mycon = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0
});

// Explicitly connect to the database
mycon.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to database as id ' + connection.threadId);
  connection.release(); // Release the connection after obtaining it
});

module.exports = mycon.promise();
