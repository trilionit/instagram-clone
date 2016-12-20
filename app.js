var express =require("express");
var app = express();
var port = 3000;
var jsonfile = require('jsonfile');
var file = './photos.json'
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
//	sequelize.sync().then(function(){
    return photos.create({
	    filename: newFileName,
	    userId:userId,
	    caption: req.body.caption
		});
    	var tagName="photos";
    	tags.create({
    	tagName: tagName
    	})

	//});
	//console.log(fileName);
	res.redirect('/pages/uploaded'); 
	
});

app.get('/pages/uploaded', function (req, res){
	startTime=new Date();

	photos.findAll().then(function(query) {
	
		tags.findAll({
			where:{
				photoId:query[0].id
			}
		}).then(function(tagged) {
		var hub=[query, tagged];
	
	console.log("Uploaded page started @" + startTime);
	console.log("ID | CAPTION | FILENAME ");
	console.log(query[0].id + " | " + query[0].caption + " | " + query[0].filename);
	console.log("| PHOTO ID | TAGNAME |");
	console.log(tagged[0].photoId + " " + tagged[0].tagName);
	res.render('hub', {upl:hub});
		});
	});
});

app.post('/add', function (req, res){
	var newTag= req.body.tag;
	var pId=req.body.photoid;
	console.log(pId + " " + newTag);
	//tags.sync().then(function(){
 	return tags.create({
	tagName: newTag,
	photoId: pId
		});
    //});
	res.redirect('/pages/uploaded');
	});

app.get('/photos', function (req, res){
	startTime=new Date();
	console.log("1. photos page started @" + startTime);
	photos.findAll().then(function(photoQuery) {

	var photoData = {}
	photoData.photoTable = []
	for (i=0; i <photoQuery.length ; i++){
   	var vals = {
       id: photoQuery[0].id,
       photoName: photoQuery[0].filename,
       caption:photoQuery[0].caption,
       createdAt:photoQuery[0].createdAt
  	}
   	photoData.photoTable.push(vals)
		}
	fs.writeFile (file, JSON.stringify(photoData), function(err) {
    if (err) throw err;
    console.log('2. complete');
    	}
	);

// jsonfile.writeFile(file, JSON.stringify(photoQuery[0]), function (err) {
//   console.error(err);
// })
	
	console.log("3. " + photoQuery);
	res.render('photos', {upl:photoQuery});
	});
});



app.listen(port, function(){
console.log('server started on port '+ port);
});