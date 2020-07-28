var LocalStrategy   = require('passport-local').Strategy;


var bcrypt = require('bcrypt-nodejs');

var User = require('../models/user.js');
var express = require('express');
var router = express.Router();



module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });


    passport.deserializeUser(function(id, done) {
       User.findOne({_id:id},function(err,data){
           done(err,data);
       })
    });


    passport.use(
        'local-signup',
        new LocalStrategy({

            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true 
        },
        function(req, username, password, done) {

            User.findOne({username:username}, function(err, rows) {
                if (err)
                    return done(err);
                console.log(rows);
                if (rows) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {

                    var newUser = new User({
                        username: username,
                  
                        password: bcrypt.hashSync(password, null, null)
                    });
                    newUser.save(function(err,data){
                            if(err){
                                console.log(err);
                            }
                            else{
                                console.log(data);
                                done(null,data);
                            }
                    });
            
                }
            });
        })
    );

    passport.use(
        'local-login',
        new LocalStrategy({
            
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true 
        },
        function(req, username, password, done) {
            //console.log(username);
           User.findOne({username:username}, function(err, rows){
              //console.log(rows);
                if (err)
                    return done(err);
                if (!rows) {
                    return done(null, false, req.flash('loginMessage', 'User does not exist.')); 
                }

           
                if (!bcrypt.compareSync(password, rows.password))
                    return done(null, false, req.flash('loginMessage', 'Invalid Password.'));

                req.session.userid=rows._id;
                req.session.username=rows.username;
                console.log("p",req.session.userid);
                console.log(rows);
                return done(null, rows);
            });
        })
    );
    
   
};