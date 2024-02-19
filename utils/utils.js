const jwt = require('jsonwebtoken');
const JWT_SECRET = "IRFAN_NAWAZ_SHHH"

const generateToken = (userId, roleId) => {
    return jwt.sign({ userId, roleId }, JWT_SECRET, { expiresIn: '24h' })
}

module.exports = { generateToken, JWT_SECRET }