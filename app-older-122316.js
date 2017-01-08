var express =require("express");
var app = express();
var port = 3000;


var bodyParser = require('body-parser');
var fs = require('fs');
var multer  = require('multer');
var upload = multer({ dest: './public/img' });

var passwordHash = require('password-hash');
var session = require('express-session');


// var jsonfile = require('jsonfile');
// var file = './photos.json'
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

// Photos.addIndex('');
// Comments.addIndex();
// Tags.addIndex();
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

app.use(session({
	secret: 'dfhsdfjshururwowo',
	resave: false,
	saveUninitialized: true,
}))

app.post('/login', function (req, res){
	//userid alt:sessionid with userid inclusive

	var email=req.email;
	var pw=req.pw;

	var hpw = passwordHash.generate(pw);

	Users.findAll({where:{email:email, password:hpw}}).then(function(rowUser) {

	var userId= rowUser[0].id;
	session.user= userId;
	console.log("user ID "+ userId + " logged in");

});

app.post('/first-time', function (req, res){
	startTime=new Date();
	console.log("sign-up page started @" + startTime);

	var fname=req.fname;
	var lname=req.lname;
	var email=req.email;
	var pw=req.pw;
	var cpw=req.cpw;
	
	var hpw = passwordHash.generate(pw);
	var chpw = passwordHash.generate(cpw);

	if(hpw != chpw){
		res.redirect('sign-up')
	}

	//check if not exist
	Users.findAll({where: {email:email}}).then(function (rowUser){
		if(!rowUser){

		//create if not exist

			Users.create({
				firstName: fname,
				lastName: lname,
				email: email,
				password: hpw,
				status: 1
			});
		}
		return	res.redirect('sign-up')
	});
		
	Users.findAll({where: {email:email}}).then(function (rowUser){
		var userId= rowUser[0].id;
		session.user= userId;
		res.redirect('/');
		});	

});

app.get('/', function (req, res){
	if(!session.user){
		res.redirect('/login')
	}
	startTime=new Date();
	console.log("index page started @" + startTime);
	Photos.findAll().then(function(query) {
	// console.log("ID | CAPTION | FILENAME ");
	// console.log(query[0].id + " | " + query[0].caption + " | " + query[0].filename);

	res.render('index', {upl:query});
		});
});

app.get('/sign-up', function (req, res){
	startTime=new Date();
	console.log("sign-up page started @" + startTime);

	res.render('sign-up');
});

//POST ROUTES

//----------- Upload Photos ---------------------------------
app.post('/uploads', upload.single('img'), function (req, res) {
	if(!session.user){
		res.redirect('/login')
	}
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
	if(!session.user){
		res.redirect('/login')
	}
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
	if(!session.user){
		res.redirect('/login')
	}
	var newComment= req.body.comment;
	var pId=req.body.photoid;
	var userId=req.body.userid;
	var st=1;
	console.log(pId + " " + userId + " " + newComment);
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

app.get('/likes/userId/:id/photoId/:pId', function (req, res){
	if(!session.user){
		res.redirect('/login')
	}
	var uId=req.params.id;
	var pId = req.params.pId;
	var liked=1;
	 	Likes.create({
			liked: liked,
			photoId: pId,
			userId: uId
	    });
    console.log("done");
	res.redirect('/pages/photos/' + pId);
});

app.get('/pages/uploaded/:id', function (req, res){
	if(!session.user){
		res.redirect('/login')
	}
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
	if(!session.user){
		res.redirect('/login')
	}
	startTime=new Date();
	console.log("1. photos page started @" + startTime);
	Photos.findAll().then(function(photoQuery) {
	console.log("2. " + photoQuery);
	res.render('photos', {upl:photoQuery});
	});
});

app.get('/pages/photos/:id', function (req, res){
	if(!session.user){
		res.redirect('/login')
	}
	//show photos with comments
	//1. photo with id :id
	// 2. all comments associated with id :id
	//likes associated with photo
	var photoId=req.params.id;
	var photoData = []
	Photos.findOne({
		where:{id: photoId}, 
		attributes: ['id','userId','filename', 'caption', 'createdAt']
	}).then(function (rowPhotos){
			Comments.findAll({
				where: {photoId:photoId}
			}).then(function (rowComments){
					Likes.findAll({
						where:	{photoId: photoId}
					}).then(function (rowLikes){
						Users.findAll({
							where:	{id: rowPhotos.userId}
						}).then(function (userInfo){

			var data= {
				photoData: rowPhotos,
				commentData: rowComments,
				likesData: rowLikes,
				userInfo:userInfo
			}
			console.log("Likes " + data.likesData.length);
			
			res.render('views', {data:data})

						})

					})
			})	
	})

});


app.listen(port, function(){
console.log('server started on port '+ port);
});