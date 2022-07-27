const jwt = require('jsonwebtoken');
require('dotenv').config();

const express = require('express');
const app = express();
app.use(express.json);
app.use(express.urlencoded({ extended: true}));

const user = {
    id : 69,
    name : "Calogrenan",
    email : "Calogrenan@gw.com",
    password : "pouet",
    admin : true
};

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1800s'});
}

app.post('/api/login', (req, res) => {
    if (req.body.email !== user.email) {
        res.status(401).send('invalid email')
        return;
    }
    if (req.body.password !== user.password) {
        res.status(401).send('invalid password')
        return;
    }
    const accessToken = generateAccessToken(user);
    res.send({ 
        accessToken,
    });
   console.error();
});
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split('') [1];

    if(token) {
        return res.sendStatus(401);
    }
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) {
            return res.sendStatus(401);
        }
        req.user = user;
    next();
    });
}
app.get('/api/me', authenticateToken, (req, res) => {
    res.send(req.user)
});
app.listen(4000, () =>(console.log('Server running on port 4000')));