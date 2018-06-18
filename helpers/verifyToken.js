module.exports = function verifyToken(req, res, next) {
    // Get auth header value
    try {
        const bearerHeader = req.headers['authorization'];
        //split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
    } catch (ex) {
        console.log(ex)
        return res.sendStatus(403);
    }
    next()
}