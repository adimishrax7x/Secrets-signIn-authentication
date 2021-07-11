require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
// var encrypt = require('mongoose-encryption');
var md5 = require('md5');


port=3000 || process.env.PORT ;
const app = express();

app.use(express.static("public"));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema= new mongoose.Schema({
  'email':String,
  'password':String
});

// userSchema.plugin(encrypt, { secret: process.env.SECRET,encryptedFields: ['password']  });

const User=new mongoose.model("User",userSchema);

app.route('/')
  .get(function(req, res){
    res.render('home');
});//END OF ROUTE


app.route('/login')
  .get(function(req, res){
    res.render('login');
})
  .post(function(req, res){
    let loginEmail= req.body.username;
    let loginPassword= md5(req.body.password);

    User.findOne({email:loginEmail},function(err,foundItem){
      if(!err){
        if(foundItem.password===loginPassword){
        res.render('secrets');
      }
      }else{
        console.log(err);
      }

    });

  });//END OF ROUTE



app.route('/register')
  .get(function(req, res){
    res.render('register');
})
  .post(function(req, res){
    const newUser=new User({
      email: req.body.username,
      password: md5(req.body.password)
    });
    newUser.save(function(err){
      if(err){
        console.log(err);
      }else{
        res.render('secrets');
      }
    });
  });//END OF ROUTE


  app.route('/logout')
    .get(function(req, res){
      res.render('home');
  });


app.listen(port,function(){
  console.log(`App listening at http://localhost:${port}`)
});
