const { JWT_SECRET } = require('../utils/utils')
const jwt = require("jsonwebtoken")

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        throw new Error(`Invalid token ${error}`);
    }
}

function extractUserIDFromToken(decodedToken) {
    if (decodedToken && decodedToken.userId && decodedToken.roleId) {
        return {
            userId: decodedToken.userId,
            roleId: decodedToken.roleId
        };
    } else {
        throw new Error("Invalid or missing user ID in token");
    }
}

function authVerify(req, res, next) {
    const token = req.headers.authorization;
    try {
        const decoded = verifyToken(token);
        const { userId, roleId } = extractUserIDFromToken(decoded);
        req.user = { userId, roleId };
        return next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorised access, please add the token" })
    }
}

module.exports = authVerify;