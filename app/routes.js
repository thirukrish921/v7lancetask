
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user.js');
var Student = require('../models/student.js');
var Stream = require('../models/stream.js');
var Comment = require('../models/comments.js');
var Detail = require('../models/vid_details.js');
const cookieSession = require('cookie-session');
var express = require('express');
var router = express.Router();
var multer  = require('multer');
var fs  = require('fs');
const { isNull, isUndefined } = require('util');




module.exports = function(app,passport,streams) {

    
    app.get('/',isLoggedIn,function(req,res){
        console.log(req.session.username);
        User.findOne({_id : req.session.userid},function(err,rows){
            
        if(rows){
           // console.log(rows);
        }
        else{
            console.log(err);

        }
        
        res.render('index.ejs', {rows :  rows});
        });    
        
    });




    app.get('/login', function(req, res) {

        res.render('login.ejs',{ message: req.flash('loginMessage') });

    });

    app.get('/signup', function(req, res){
        res.render('signup.ejs',{message: req.flash('message')});
      });

    app.get('/upload',function(req,res){
        if(req.session.userid){
        res.render('upload.ejs'),{message:req.flash('messsage')}}
        else{
            res.redirect('/');
        }
    });
   
   


    app.get('/loaded',function(req,res){
       if(req.session.userid){
        Detail.find({ upload_by : req.session.userid},function (err, row) {
            if (err) {
                console.log(err);
            }
                console.log(row);
                res.render('loaded.ejs',{rows : row});
        });
    }
    else{
        res.redirect('/');
    }
    });
   

    app.post('/delete',function(req,res){
        Detail.deleteOne({_id : req.body.del_id}, function (err, result) {
            if (err) throw err;
          //  console.log("Number of records deleted: " + result.affectedRows);
          });
        res.redirect('/loaded');
        console.log(req.body.del_id,req.body.del_name);
        let fn='./public/videos/'+req.body.del_name;
        console.log(fn);
        fs.unlink(fn,function(err,res){
            if(err){
                console.log(err);
            }
            else{
                console.log('removed');
            }
        });
    });

    app.post('/comments',function(req,res){
        if(req.session.userid){
        var row = [];
       console.log("here"+req.body.vid_id);
       Comment.find({video_id : req.body.vid_id}, function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (rows.length) {
                    for (var i = 0, len = rows.length; i < len; i++) {  
                        row[i] = rows[i];
                        
                    }  
                }
                
                console.log(row);
                
            }
            
            res.render('comments.ejs', {rows : row});  
        });
    }
    else{
        res.redirect('/');
    }

    });

    app.post('/edit',function(req,res){
    if(req.session.userid){
        var row=[];
        row.vid=req.body.vid_id;
        //console.log(row);
        res.render('editdescrip.ejs',{rows:row});}
        else{
            res.redirect('/');
        }
    });

    
    app.post('/editdes',function(req,res){
        if(req.session.userid){
        console.log(req.descrip,req.vid_id);
            Detail.updateOne({$set:{ description : req.body.descrip,_id:req.body.vid_id}},function(err,result){
                if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
  });
  res.redirect('/loaded');}
  else{
      res.redirect('/');
  }
            });
 

    app.post('/signup', passport.authenticate('local-signup', {
            successRedirect: '/login',
            failureRedirect: '/signup',
            failureFlash : true 
    }));

    app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/', 
            failureRedirect : '/login',
            failureFlash : true 
        }),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });
    app.get('/logout', function(req, res) {
    
        req.session.destroy((err)=>{

        })
        res.redirect('/');
    });
    app.get('/stulogout', function(req, res) {
        
        req.session.destroy((err)=>{
                console.log(err);
        })
        res.redirect('/studentlogin');
    });
    app.get('/studentlogin',function(req,res){
        if(req.session.stuid){res.redirect('/student');}
        
        else{
            res.render('stu_login.ejs',{ message: req.flash('loginMessage') });    
        }
    });
    app.post('/studentlogin', function(req, res) {
        console.log(req.body.username);
        Student.findOne({username : req.body.username}, function(err, rows){
            if (err)
                return done(err);
                //console.log(rows);
           // console.log(rows);
            if (!rows) {
                res.render('stu_login.ejs',{message:'User Doesnt Exist!'});
        }

       //console.log(req.body.password,rows);
      
            if (req.body.password!= rows.password ){
               
                res.render('stu_login.ejs',{message:'Invalid Password!'});
                }
                else{
                req.session.stuid=rows.id;
                req.session.stuclass=rows.class;
                req.session.stuname=rows.name;
                console.log(req.session.stuclass);
                if (req.body.username) {
                    req.session.cookie.maxAge = 1000 * 60 * 3;
                  } else {
                    req.session.cookie.expires = false;
                  }
                  
              
                  res.redirect('/student');
                }
            });
           
    });
app.get('/studentsignup', function(req, res){
         res.render('stu_signup.ejs',{message: req.flash('message')});
  });
 app.post('/studentsignup',function(req,res){
        console.log(req.body.username,req.body.clas,req.body.password);
        let pass=bcrypt.hashSync(req.body.password,null,null);
        console.log(pass);
        var Stud = new Student({
            username : req.body.username,
            class :  req.body.clas,
            password : req.body.password

        });

        Stud.save(function(err,rows){
            if(!err){
                    res.redirect('/studentlogin');
            }
            console.log(rows);
        });

 });


app.get('/student',function(req,res){
console.log(req.session.stuid);
    if(req.session.stuid){
    var row = [];
       
    Student.find({_id : req.session.stuid}, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            if (rows.length) {
                for (var i = 0, len = rows.length; i < len; i++) {  
                    row[i] = rows[i];
                    
                }  
            }
           
            
            
        }
        
        res.render('stu_index.ejs', {rows : row}); 
    });}
    else{
        res.redirect('/studentlogin');
    }
   
});


app.get('/viewvideo',function(req,res){

    if(req.session.stuid){
        console.log(req.session.stuclass);
        var row = [];
           Detail.find({can_view_by : req.session.stuclass}, function (err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    if (rows.length) {
                        for (var i = 0, len = rows.length; i < len; i++) {  
                            row[i] = rows[i];
                            
                        }  
                    }
                    
                    console.log(row);
                    
                }
                
                res.render('view_video.ejs', {rows : row});  
            });
    
    }
        else{
            res.redirect('/studentlogin');
        }

});

app.post('/addcomm',function(req,res){
//console.log('here',req.body.id,req.body.comment);
var com= new Comment({
    video_id : req.body.id ,
    comment :  req.body.comment ,
    student_id :  req.session.stuid  ,
    student_name :   req.session.stuname

});
com.save(function(err,rows){
    if(err){
        console.log(err);
    }
    

})
});

app.get('/viewlive',function(req,res){
    if(req.session.stuid){
    //console.log(req.session.stuclass);
    var row = [];
        Stream.find({class : req.session.stuclass}, function (err, rows) {
           // console.log(rows);
            if (err) {
                console.log(err);
            } else {
                if (rows.length) {
                    for (var i = 0, len = rows.length; i < len; i++) {  
                        row[i] = rows[i];
                        
                    }  
                }
                
             //   console.log(row);
                
            }
            
            res.render('view_live.ejs', {rows : row});  
        });

}
    else{
        res.redirect('/studentlogin');
    }
});


  // GET streams as JSON
  var displayStreams = function(req, res) {
      
    var streamList = streams.getStreams();
    // JSON exploit to clone streamList.public
    var data = (JSON.parse(JSON.stringify(streamList))); 
  
    res.status(200).json(data);
  };

  app.get('/streams.json', displayStreams);
  app.get('/live', function(req, res) {
    res.render('local-cam.ejs', { 
                          title: 'Stream', 
                          header: 'live streaming',
                          
                          share: 'Share this link',
                          id: req.params.id
                        });
  }
);
  app.get('/:id', function(req, res) {
    res.render('remote-streams.ejs', { 
                          title: 'Project RTC', 
                          header: ' live streaming',
                        
                         
                          id: req.params.id
                        });
  }
);
app.post('/sendlivelink',function(req,res){
    if(req.session.userid){
    var name="";
console.log(req.body.class,req.body.link,req.session.userid);
User.find({_id :req.session.userid },function(err,rows){
        name=rows;
        console.log(name);

});

var url="https://"+req.body.link;
var strea= new Stream ({
    trainee_id :   req.session.userid ,
    trainee_name:  name,  
    stream_url :  url ,
    class:     req.body.class 

});
strea.save(function(err,rows){

if(err){
    console.log(err.message);
    res.redirect('/');
}
else{
    console.log('inserted');
}
});
    }
    else{
res.redirect('/studentlogin');

    }

});

app.post('/clearstreams',function(req,res){
//console.log(req.session.userid);
    if(req.session.userid){
   Stream.remove({trainee_id  : req.session.userid},function(err,result){
      
if(err){
    console.log(err.message);
    res.redirect('/');
}
else{
    console.log('stream cleared');
}
    } );
res.redirect('/');}
else{
    res.redirect('/studentlogin');
}
});
}





function isLoggedIn(req,res,next){
	if(req.session.userid)
        return next();
    console.log("auth",req.session.userid);
	res.redirect('/login');
}

