var express =require("express");
var app = express();
var port = 3000;

var bodyParser = require('body-parser');
var fs = require('fs');
var multer  = require('multer');
var upload = multer({ dest: './img' });

var Sequelize = require('sequelize');
// var dbUrl='postgres://instagram.db:';
// var sequelize = new Sequelize(dbUrl);

var sequelize = new Sequelize('instagram', 'postgres', '123456', {
  host: 'localhost',
  port:'5432',
  dialect:'postgres'
});

app.use(express.static('public'));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({extended:true })
);
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
sequelize.sync();

var userId=1;

app.get('/', function (req, res){
	startTime=new Date();
	console.log("index page started @" + startTime);
	res.send('index');
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
    	var tagName="photos";
    	tags.create({
    	tagName: tagName
    	})

	});
	//console.log(fileName);
	res.redirect('/pages/uploaded'); 
	
});

app.get('/pages/uploaded', function (req, res){
	startTime=new Date();

	photos.findAll().then(function(query) {
	
	// tags.findAll().then(function(tagged) {
	// var hub=[upl, tagged];
	// });

	console.log("Uploaded page started @" + startTime);
	console.log("ID | CAPTION | FILENAME");
	console.log(query[0].id + " | "+ query[0].caption + " | " + query[0].filename);
	res.render('hub', {upl:query});
	});
});

app.post('/add', function (req, res){
	var newTag= req.body.tag;
	var photoId=req.body.photoid;
	tags.sync().then(function(){
    return tags.create({
	    tagName: newTag,
	    photoId: photoId
		});
    });
	res.redirect('/pages/uploaded');
	});



app.listen(port, function(){
console.log('server started on port '+ port);
});