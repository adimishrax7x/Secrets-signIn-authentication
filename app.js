//require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
// var encrypt = require('mongoose-encryption');
//var md5 = require('md5');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');



port=3000 || process.env.PORT ;
const app = express();

app.use(express.static("public"));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: 'BIG SECRET',
  resave: false,
  saveUninitialized: false,
  //cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);

const userSchema= new mongoose.Schema({
  'username':String,
  'password':String
});

// userSchema.plugin(encrypt, { secret: process.env.SECRET,encryptedFields: ['password']  });

userSchema.plugin(passportLocalMongoose);

const User=new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.route('/')
  .get(function(req, res){
    res.render('home');
});//END OF ROUTE


app.route('/login')
  .get(function(req, res){
    res.render('login');
})
  .post(function(req, res){
    const user=new User({
      username: req.body.username,
      password: req.body.password
    });

    req.login(user,function(err){
      if(err){
        console.log(err);
      }else{
        passport.authenticate("local")(req,res,function(){
          res.redirect('/secrets');
        });
      }
    });
  });//END OF ROUTE

  app.route('/secrets')
    .get(function(req, res){
      if(req.isAuthenticated()){
        console.log('true');
        res.render('secrets');
      }else{
        res.redirect('/login');
      }
  });//END OF ROUTE


app.route('/register')
  .get(function(req, res){
    res.render('register');
})
  .post(function(req, res){
    User.register({username: req.body.username},req.body.password,function(err,user){
      if(err){
        console.log(err);
        res.redirect('/register');
      }else{
        passport.authenticate("local")(req,res,function(){
          res.redirect('/secrets');
        });
      }

    });
  });//END OF ROUTE


  app.route('/logout')
    .get(function(req, res){
      req.logout();
      res.redirect('/');
  });



app.listen(port,function(){
  console.log(`App listening at http://localhost:${port}`)
});
