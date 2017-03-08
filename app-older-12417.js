"use strict"
var express =require("express");
var app = express();
var port = 3000;
var Sequelize = require('sequelize');
var bodyParser = require('body-parser');
var multer  = require('multer');
var upload = multer({ dest: './public/img' });
var session = require('express-session');
var passwordHash = require('password-hash');
var sequelize = new Sequelize('instagram', 'postgres', '123456', {
  host: 'localhost',
  port:'5432',
  dialect:'postgres'
});
//var belongsTo = require("./models/belongsTo");
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
	caption:Sequelize.TEXT,
	category:Sequelize.STRING,
	status:Sequelize.INTEGER
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

Photos.belongsTo(Users);
Comments.belongsTo(Users);
Comments.belongsTo(Photos);
Tags.belongsTo(Photos);
Likes.belongsTo(Photos);
Likes.belongsTo(Users);
sequelize.sync({force:true});


app.post('/first-time', function (req, res){
	var startTime= new Date();
	console.log("first-time page started @" + startTime);

	var firstName=req.body.firstName;
	var lastName=req.body.lastName;
	var email=req.body.email;
	var password=req.body.password;
	var confirmPassword=req.body.confirmPassword;
	var responseObject;
	//console.log("firstName:"+ firstName + " lastName:" + lastName +" email:" + email + " password:" + password + " confirmPassword:" + confirmPassword)
	var hashedPassword = passwordHash.generate(password);
	var confirmHashedPassword = passwordHash.generate(confirmPassword);

	if(hashedPassword != confirmHashedPassword){
		//password mis-match
		responseObject= {
			input:"PASSWORD",
			status:"MIS-MATCH",
			message:"Passwords did not match. Try again"
		}
		console.log("Incorrect P?W MSG: " + responseObject.message);
		res.json(responseObject);
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
	}).then(
	Users.findaAll({
		where:{email:email}
	}).then(function (rowUser){
		var userId= rowUser[0].id;
		req.session.user= userId;
		responseObject= {
				input:"NULL",
				status:"SUCCESS",
				message:"Successfully logged in"
			}
			res.json(responseObject);
	})
	)
	}else{
		var userId= rowUser[0].id;
		req.session.user= userId;
		responseObject= {
				input:"NULL",
				status:"SUCCESS",
				message:"Successfully logged in"
			}
			res.json(responseObject);
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

let email=req.body.email;
let password=req.body.password;

//console.log("Login requested for " + email)

Users.count({where:{email:email}}).then(function (count){
	let responseObject;
	if(count !=0){
		console.log("user exists");
		//continue checking and creating
		Users.findAll({where:{email:email}}).then(function (rowUser){
			let rowPassword= rowUser[0].password;
			console.log("RowPassword: " +rowPassword);
			let passwordVerify = passwordHash.verify(password, rowPassword);
			console.log("Password Verify: " +passwordVerify);
			if(!passwordVerify){
				 responseObject= {
					input:"PASSWORD",
					status:"INCORRECT_PASSWORD",
					message:"Password is incorrect"
					}
				console.log("Incorrect P?W MSG: " + responseObject.message);
				res.json(responseObject);


			}else{
				 responseObject= {
					input:"NULL",
					status:"SUCCESS",
					message:"Successfully logged in"
					}
				console.log(responseObject.message);
				var userId= rowUser[0].id;
				req.session.user= userId;
				res.json(responseObject);
			}

		});
	}
	else{

		//res.redirect('register');

		 responseObject= {
			input:"EMAIL",
			status:"NOT_FOUND",
			message:"No User Found. Please Try a different Username"
		}


		console.log("no user found")
		res.json(responseObject);

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

app.get('/register', function (req, res){

		res.render('sign-up');
});

app.get('/pages/view', function (req, res){
if(!req.session.user){
		res.redirect('/login')

	}else{
		res.render('uploaded');
	}
});


app.listen(port, function(){
console.log('server started on port '+ port);
});