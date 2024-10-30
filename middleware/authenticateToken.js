const jwt = require('jsonwebtoken');

const JWT_SECRET = 'YzICerzt2Y16pb8c';

let tokenBlacklist=[];

const authenticateToken = (req,res,next)=>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    if(tokenBlacklist.includes(token)){
        return res.status(403).json({error: "Token is no longer valid"});
    }

    jwt.verify(token, JWT_SECRET, (err,user)=>{

        if (err) return res.status(403).json({ error: 'Forbidden' });

        req.user=user;
        next();
    });
};

module.exports = {authenticateToken,tokenBlacklist};
