

var express  = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app      = express();
var express = require('express');
var multer  = require('multer');
var fs  = require('fs');
var port     = process.env.PORT || 3000;
var passport = require('passport');
var flash    = require('connect-flash');
var uuid = require('uuid');
const crypto = require("crypto");
var streams = require('./app/streams.js');
var Detail = require('./models/vid_details.js');
var mongoose = require('mongoose');
const { MongoClient } = require("mongodb");
var MongoStore = require('connect-mongo')(session);
var methodOverride = require('method-override');

mongoose.connect('mongodb://localhost/mydb',{useNewUrlParser: true,useUnifiedTopology :true});
require('./config/passport.js')(passport); 

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
});
app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: db
    })
  }));
app.use(morgan('dev')); 
app.use(cookieParser()); 
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs'); 



app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash()); 

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var dir = './public/videos';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        callback(null, dir);
    },
    filename: function (req, file, callback) {

        global.r = Math.random().toString(36)+".mp4";
        console.log("random", r);
        callback(null, r);
    }
});
app.use(function(req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  });
var upload = multer({storage: storage}).array('files', 12);
app.post('/upload', function (req, res, next) {
    upload(req, res, function (err) {
        if (err) {
            console.log(err);
            return res.end("Something went wrong:(");
        }
        let descr=req.body.descript;
        let audience=req.body.class;
     
        var  Details= new Detail({
            name: r,
            description: descr,
            upload_by: req.session.userid,
            can_view_by: audience
        });
        Details.save(function(err,data){
            if(err){
                console.log(err);
            }
            else{
                console.log(data);
                
            }
    });
        
        res.redirect('/');
    });
});


require('./app/routes.js')(app, passport,streams); 


var server = app.listen(port);
console.log('server is running  localhost: ' + port);

var io = require('socket.io').listen(server);

require('./app/socketHandler.js')(io, streams);
