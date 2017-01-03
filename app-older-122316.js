var express =require("express");
var app = express();
var port = 3000;
var jsonfile = require('jsonfile');
var file = './photos.json'
var bodyParser = require('body-parser');
var fs = require('fs');
var multer  = require('multer');
var upload = multer({ dest: './public/img' });

var Sequelize = require('sequelize');
// var dbUrl='postgres://instagram.db:';
// var sequelize = new Sequelize(dbUrl);

var sequelize = new Sequelize('instagram', 'postgres', '123456', {
  host: 'localhost',
  port:'5432',
  dialect:'postgres'
});
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(
  bodyParser.urlencoded({extended:true })
);
var startTime;

//create database tables
var Users = sequelize.define('users', {
	firstName:Sequelize.STRING,
	lastName:Sequelize.STRING,
	email:Sequelize.STRING,
	password:Sequelize.STRING,
	address:Sequelize.STRING,
	city:Sequelize.STRING,
	state:Sequelize.STRING,
	zipCode:Sequelize.STRING,
	phone:Sequelize.STRING,
	status:Sequelize.INTEGER

});

var Photos = sequelize.define('photos', {
	filename:Sequelize.STRING,
	caption:Sequelize.TEXT
});

var Comments = sequelize.define('comments', {
	comment:Sequelize.TEXT,
	status:Sequelize.INTEGER
});

var Tags = sequelize.define('tags', {
	tagName:Sequelize.STRING
});

var Likes = sequelize.define('likes', {
	liked:Sequelize.INTEGER
});

//dummy user
// Users.create({
// 	firstName: 'Prince',
// 	lastName: 'Osei',
// 	email: 'prince@trilionit.com',
// 	password: '123456',
// 	address: '126 Port Ave',
// 	city: 'Elizabeth',
// 	zipcode: '07206',
// 	phone: '908-344-2963',	
// 	status: 1
//     });

//dummy Likes
// Likes.create({
// 	userId: 'Prince',
// 	photoId: 'Osei',
// 	liked: 'prince@trilionit.com',
//     });

Photos.belongsTo(Users);
Comments.belongsTo(Users);
Comments.belongsTo(Photos);
Tags.belongsTo(Photos);
Likes.belongsTo(Photos);
Likes.belongsTo(Users);
sequelize.sync();

//userid alt:sessionid with userid inclusive
Users.findAll().then(function(rowUser) {

			var userId= rowUser[0].id;
			console.log("user ID "+ userId + " logged in");


app.get('/', function (req, res){
	startTime=new Date();
	console.log("index page started @" + startTime);
	Photos.findAll().then(function(query) {
	// console.log("ID | CAPTION | FILENAME ");
	// console.log(query[0].id + " | " + query[0].caption + " | " + query[0].filename);

	res.render('index', {upl:query});
		});
});
//POST ROUTES
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
	fs.rename(__dirname +'/public/img/' + imgName, __dirname +'/public/img/'+ newFileName , (err) => {
	if (err) throw err;
	console.log('rename completed as ' + newFileName);
	});

	
	//insert into db
	//	sequelize.sync().then(function(){
Photos.create({
filename: newFileName,
userId:userId,
caption: req.body.caption
	}).then(function(){
	Photos.findAll().then(function(query){
		return photoId= query[0].id;
	}).then(function(){
		if(!req.body.tag){
 			tagName="photo";
 		}
 		else{
 			tagName= req.body.tag;
 		}
		Tags.create({
		    tagName: tagName,
		    photoId:photoId
	});

 	
	res.redirect('/pages/uploaded/'+photoId); 
			});
	});
});


app.post('/add', function (req, res){
	var newTag= req.body.tag;
	var pId=req.body.photoid;
	console.log(pId + " " + newTag);
 	Tags.create({
	tagName: newTag,
	photoId: pId
    });
	res.redirect('/pages/uploaded/'+ pId);
});

app.post('/add/comment', function (req, res){
	var newComment= req.body.comment;
	var pId=req.body.photoid;
	var userId=req.body.userid;
	var st=1;
	console.log(pId + " " + newComment);
 	Comments.create({
	comment: newComment,
	photoId: pId,
	userId: userId,
	status: st
    });
    console.log(pId);
	res.redirect('/pages/photos/' + pId);
	});
});

// GET ROUTERS
app.get('/pages/uploaded/:id', function (req, res){
	var photoId = req.params.id;
	console.log(photoId);
	var hub={}
	Photos.findAll({where:{id:photoId}}).then(function(photoQuery){
	console.log(photoQuery[0].filename);
		hub.photoValues =[]
				var vals ={
				id:photoQuery[0].id,
				filename:photoQuery[0].filename,
				caption:photoQuery[0].caption
			}
		hub.photoValues.push(vals);
		console.log(hub);	
	Tags.findAll({where:{photoId:photoQuery[0].id}}).then(function(tagQuery){
		//console.log(tagQuery);
		hub.tagValues = []
		var vals={}
		for (var i =0; i < tagQuery.length; i++) {
			vals = {
			id:tagQuery[i].id,
			tagName:tagQuery[i].tagName
		}
		hub.tagValues.push(vals);
		}
		

		console.log(hub);
		res.render('hub', {upl:hub});
		});
	});	
});


app.get('/pages/photos', function (req, res){
	startTime=new Date();
	console.log("1. photos page started @" + startTime);
	Photos.findAll().then(function(photoQuery) {
	console.log("2. " + photoQuery);
	res.render('photos', {upl:photoQuery});
	});
});

app.get('/pages/photos/:id', function (req, res){
	//show photos with comments
	//1. photo with id :id
	// 2. all comments associated with id :id
	//likes associated with photo
	var photoId=req.params.id;
	var photoData = []
	Photos.findOne({
		where:{id: photoId}, 
		attributes: ['userId','filename', 'caption', 'createdAt']
	}).then(function (rowPhoto){
	photoData.photoValues = []
		// var vals = {
		// photoId:photoId,
		// userId:rowPhoto.userId,
	 //    photoName: rowPhoto.filename,
	 //    caption:rowPhoto.caption,
	 //    createdAt:rowPhoto.createdAt
  // 	}
   	photoData.photoValues.push(rowPhoto);
	console.log("#1 "+ rowPhoto.caption);
	
}).then(function(){
	Comments.findAll(
		{where:
			{photoId:photoId}
		}).then(function(rowComments){
	photoData.photoComments = []
	for (i=0; i < rowComments.length ; i++){
	   // 	vals = {
	   //  id: rowComments[i].id,
	   //  userId: rowComments[i].userId,
	   //  text:rowComments[i].comment,
	   //  createdAt:rowComments[i].createdAt
	  	// }
	photoData.photoComments.push(rowComments[i]);

  }
  console.log("#2 "+ rowComments.length);
		});
}).then(function(){
		Likes.findAll(
		{where:
			{photoId: photoId}
		}).then(function(rowLikes) {
			// if (!rowLikes){
			// 	vals = {
			//     id: 0,
			//     liked: 0,
			//     userId:userId,
			//     photoId:photoId
			//   	}

			// }
			// else{
			// 	vals = {
			//     id: rowLikes.id,
			//     liked: rowLikes.liked,
			//     userId:rowLikes.userId,
			//     photoId:rowLikes.photoId
			//   	}
	  // }
	photoData.photoLikes.push(rowLikes);
	console.log("#3 "+ rowLikes.length);
	console.log(photoData);
		});
});

//res.render('views', {views:photoData});
});


app.listen(port, function(){
console.log('server started on port '+ port);
});