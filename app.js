const express = require('express');
const path = require('path')
require('dotenv').config();

const session = require('express-session');

// CONTROLLERS IMPORTS
const Student = require('./controllers/student')

const bodyParser = require('body-parser');
const app = express();
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));


app.use(session({
    secret: process.env.SECRETKEY,
    resave: false,
    saveUninitialized:false
}))
// INITIALIZING THE CONTROLLERS
app.use('/student/', Student)


let PORT = process.env.PORT || 2000;

app.get('/', (req,res)=>{
    res.redirect('/student/login')
})

app.get('/student/', (req,res)=>{
    res.redirect('/student/login')
})

app.listen(PORT, console.log('server on 2000'))