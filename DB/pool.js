
const mysql = require('mysql2');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'atbt.cdwoi4ikm5i7.ap-south-1.rds.amazonaws.com',
  user: 'admin',
  password: 'rootadmin',
  database: 'JoinDb'
});

module.exports = pool;
