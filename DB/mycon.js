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

// const mysql = require('mysql2');

// const mycon = mysql.createConnection({
//   host: 'atbt.cdwoi4ikm5i7.ap-south-1.rds.amazonaws.com',
//   user: 'admin',
//   password: 'rootadmin',
//   database: 'JoinDb'
// });

// // Connect to the database
// mycon.connect((err) => {
//   if (err) {
//     console.error('Error connecting to database: ' + err.stack);
//     return;
//   }
//   console.log('Connected to database as id ' + mycon.threadId);
// });

// module.exports = mycon;
