const mysql = require('mysql2');

const mycon = mysql.createConnection({
    host: 'atbt.cdwoi4ikm5i7.ap-south-1.rds.amazonaws.com',
    user: 'admin',
    password: 'rootadmin',
    database: 'ATBT'
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