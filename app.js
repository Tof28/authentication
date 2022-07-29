const jwt = require('jsonwebtoken');
require('dotenv').config();

const port = 3000;
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

const user = {
    id : 69,
    name : "Calogrenan",
    email : "calogrenan@gw.com",
    password : "pouet",
    admin : true
};
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1800s'});
} 
function generateRefreshToken(user) {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn : '24h' });
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
    console.log('access token is', accessToken);
    res.send({
        accessToken
    });
    
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ') [1];

    if(token == null) 
    return res.sendStatus(401)

    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) {
            return res.sendStatus(401);
        }
        req.user = user;
        next();
    });
}
app.post('/api/refreshToken', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ') [1];
    if(token == null) 
    return res.sendStatus(401)

    jwt.verify(token,process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) {
            return res.sendStatus(401);
        }
        delete user.iat;
        delete user.exp;
        const refreshedToken = generateAccessToken(user);
        res.send({
            accessToken: refreshedToken,
        });
    });
});
app.get('/api/me', authenticateToken, (req, res) => {
    res.send(req.user);
});
/*
function newUser(id, name, email, password)  {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password= password;
}*/

app.listen(port, () =>(console.log("Server running on port", port)));
