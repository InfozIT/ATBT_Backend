require('dotenv').config();

module.exports = {
    host: process.env.DB_HOST || host,
    user: process.env.DB_USER || user,
    password: process.env.DB_PASSWORD || password,
    database: process.env.DB_DATABASE || database,
    dialect : process.env.DB_DIALECT || 'mysql'
};