var express =require("express");
var app = express();
var port = 3000;

var bodyParser = require('body-parser');
var fs = require('fs');
var multer  = require('multer');
var upload = multer({ dest: './img' });
//db
var Sequelize = require('sequelize');
var databaseURL = 'sqlite://instagram.sqlite3';
var sequelize = new Sequelize(process.env.DATABASE_URL || databaseURL
// 	, {
// 	//omitNull: true
// }
);
// var Sequelize = require("sequelize");
// var sequelize = new Sequelize('instagram', 'root', null, {
// 	host: 'localhost',
// 	dialect: 'sqlite',
// 	storage: '../db/instagram.db'
// });
app.use(express.static('public'));
app.set("view engine", "ejs");

var startTime;

//create database tables
var users = sequelize.define('users', {
	firstName:Sequelize.STRING,
	lastName:Sequelize.STRING,
	email:Sequelize.STRING,
	password:Sequelize.STRING,
	address:Sequelize.STRING,
	city:Sequelize.STRING,
	zipCode:Sequelize.STRING,
	phone:Sequelize.STRING,
	status:Sequelize.INTEGER

});

var photos = sequelize.define('photos', {
	filename:Sequelize.STRING,
	caption:Sequelize.TEXT
});

var comments = sequelize.define('comments', {
	comment:Sequelize.TEXT,
	status:Sequelize.INTEGER
});

var tags = sequelize.define('tags', {
	tagName:Sequelize.STRING
});
//photos.belongsTo(users);
comments.belongsTo(users);
comments.belongsTo(photos);
tags.belongsTo(photos);
//sequelize.sync();

var userId=1;

app.get('/', function (req, res){
	startTime=new Date();
	console.log("index page started @" + startTime);
	res.send('index');
});

app.get('/pages/uploaded', function (req, res){
	startTime=new Date();

	photos.findAll().then(function(upl) {
	//var newObject=uploadObject.datavalues;
	console.log("Uploaded page started @" + startTime);
	res.render('uploaded', {uploaded:upl});
	});
	
});


app.post('/add', function (req, res){
	var newTag= req.body.tag;
	var photoId=req.body.photoid;
	sequelize.sync().then(function(){
    return tags.create({
	    tagName: newTag,
	    photoid: photoId
		});
    });
	tags.findAll().then(function(tagged) {
	res.render('uploaded', {tagged:tagged});
	});
});

//----------- Upload Photos ---------------------------------
app.post('/uploads', upload.single('img'), function (req, res) {
	var fileName=req.file;
	var imgName=fileName.filename;
	var  mimetype=fileName.mimetype;
	console.log(mimetype);
	var ext;
	if (mimetype== "image/jpeg" ||  mimetype== "image/jpg"){
		ext="jpg";
	}
	else if(mimetype== "image/png"){
		ext="png";
	}
	else if(mimetype== "image/gif"){
		ext="gif";
	} 

	var newFileName= imgName  +"."+ ext;
	fs.rename('./img/' + imgName, './img/'+ newFileName , (err) => {
	if (err) throw err;
	console.log('rename completed as ' + newFileName);
	});

	//insert into db
	sequelize.sync().then(function(){
    return photos.create({
	    filename: newFileName,
	    userId:userId,
	    caption: req.body.caption
		});

	});
	//console.log(fileName);
	res.redirect('/pages/uploaded'); 
	
});

app.listen(port, function(){
console.log('server started on port '+ port);
});