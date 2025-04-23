
const secret_key = process.env.SECRET_KEY
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.json({ message: "Token missing" });

    jwt.verify(token, secret_key, (err, user) => {
        if (err) return res.json({ message: "Token invalid" });

        req.user = user; 
        next();
    });
}

module.exports = authenticateToken;
