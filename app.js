var express =require("express");
var app = express();
var port = 3000;


var bodyParser = require('body-parser');
var fs = require('fs');
var multer  = require('multer');
var upload = multer({ dest: './public/img' });

var passwordHash = require('password-hash');
var session = require('express-session');


var Sequelize = require('sequelize');
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

app.use(session({
	secret: 'dfhsdfjshururwowo',
	resave: false,
	saveUninitialized: true,
}));

//create database tables -{work in progress put sequelize in models}
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


app.post('/first-time', function (req, res){
	startTime=new Date();
	console.log("first-time page started @" + startTime);

	var firstName=req.body.firstName;
	var lastName=req.body.lastName;
	var email=req.body.email;
	var password=req.body.password;
	var confirmPassword=req.body.confirmPassword;
	//console.log("firstName:"+ firstName + " lastName:" + lastName +" email:" + email + " password:" + password + " confirmPassword:" + confirmPassword)
	var hashedPassword = passwordHash.generate(password);
	var confirmHashedPassword = passwordHash.generate(confirmPassword);

	if(hashedPassword != confirmHashedPassword){

		res.redirect('sign-up')
	}else{

//check if not exist
	Users.findAll({where: {email:email}}).then(function (rowUser){
		if(rowUser.length ==0){

		//create if not exist

	Users.create({
		firstName: firstName,
		lastName: lastName,
		email: email,
		password: hashedPassword,
		status: 1
	});

	}else{
		var userId= rowUser[0].id;
		req.session.user= userId;
		res.redirect('/');
	}	
	});
		
}
});

app.get('/', function (req, res){
if(!req.session.user){
	res.redirect('/login')
}else{
	console.log("session: "+ req.session.user);
	Photos.findAll().then(function(query) {		
		res.render('index', {upl:query});
	});

}

	
});

app.post('/login', function (req, res){
	//userid alt:sessionid with userid inclusive

var email=req.body.email;
var password=req.body.password;
console.log("Login requested for " + email + " and password" + password)

Users.findAll({where:{email:email}}).then(function(rowUser) {
	console.log(rowUser[0].password)
	var passwordVerify = passwordHash.verify(password, rowUser[0].password)
		if(!passwordVerify){
			console.log(passwordVerify);
			res.redirect('/')	
		}
		else{
			var userId= rowUser[0].id;
			req.session.user= userId;
			console.log("session: "+ req.session.user);
			console.log("user ID "+ userId + " logged in");
			res.redirect('/')
		}
	
});

});


app.get('/login', function (req, res){
	if(req.session.user){
		res.redirect('/')

	}else{
		res.render('login');
	}
});

app.get('/logout', function (req, res){
	console.log("session: "+ req.session.id);
	req.session.destroy(function(err) {
  // cannot access session here
})

	
	res.redirect('/login')
 
})

app.get('/sign-up', function (req, res){
		res.render('sign-up');
});



app.listen(port, function(){
console.log('server started on port '+ port);
});