const { Sequelize } = require('sequelize');
const config = require('./config')


const sequelize = new Sequelize(config.database, config.user, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: false
});


// const sequelize = new Sequelize('ATBT', 'admin', 'rootadmin', {
//   host: 'atbt.cdwoi4ikm5i7.ap-south-1.rds.amazonaws.com',
//   dialect: 'mysql',
//   logging: false
// });

// for pg Admin
// const sequelize = new Sequelize('atbtclg', 'postgres', 'root', {
//   host: 'atbt-db.cwuyjszxxfxc.us-east-1.rds.amazonaws.com',
//   dialect: 'postgres',
//   logging: false
// });

try {
  sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

module.exports = sequelize;