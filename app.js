require('dotenv').config()
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

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')


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
  'password':String,
  'googleId':String,
  'secret':String
});

// userSchema.plugin(encrypt, { secret: process.env.SECRET,encryptedFields: ['password']  });

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User=new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    //console.log(profile.emails[0].value);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.route('/')
  .get(function(req, res){
    res.render('home');
});//END OF ROUTE

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

  app.get('/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

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


  app.route('/submit')
  .get(function(req, res){
    User.findOne({"secret":{$ne:null}}).lean().exec(function (err, foundUsers) {
  // User.find({"secret":{$ne:null}},function(err,foundUsers){

    if(err){
      console.log(err);
    }else{
      if(foundUsers){
       //foundUsers;
       //foundUsers.toObject({ getters: true })

        res.render('secrets');
        //res.render('list', {listTitle: "Today",itemList: foundItems});

      }
    }
  });
})

  //   if(req.isAuthenticated()){
  //     console.log('true');
  //     res.render('submit');
  //   }else{
  //     res.redirect('/login');
  //   }


    .post(function(req, res){
      let userSecret=req.body.secret;

      console.log(req.user.id);

      User.findById(req.user.id,function(err,foundUser){
        if(!err){
          if(foundUser){
            foundUser.secret=userSecret;
            foundUser.save(function(){
              res.redirect('/secrets');
            });
          }
        }else{
          console.log(err);
        }

      });

  });//END OF ROUTE


  app.route('/logout')
    .get(function(req, res){
      req.logout();
      res.redirect('/');
  });//END OF ROUTE



app.listen(port,function(){
  console.log(`App listening at http://localhost:${port}`)
});
