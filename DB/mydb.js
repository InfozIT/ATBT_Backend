const mysql = require('mysql2');

const mycon = mysql.createConnection({
  host: 'atbt-db.cwuyjszxxfxc.us-east-1.rds.amazonaws.com',
  user: 'rootadmin',
  password: 'rootadmin',
  database: 'RBAC'
});

// Connect to the database
mycon.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to database as id ' + mycon.threadId);
});

module.exports = mycon;
