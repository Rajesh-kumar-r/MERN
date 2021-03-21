const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {

    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json([{ msg: 'token not found' }])
    }

    try {
        const decode = jwt.verify(token, config.get('jwtSecret'));
        req.user = decode.user;
        next()
    } catch (err) {
        return res.status(401).json([{ msg: 'token not valid' }])
    }

}