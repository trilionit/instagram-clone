"use strict"
//const models=require('../models');
const express= require('express');
const router = express.Router();

const multer  = require('multer');
const upload = multer({ dest: 'img/' });
//models.sequelize.sync();
//route for adding airports

router.get("/", function(req, res){
	startTime=new Date();
  	console.log("index page started @" + startTime);
  	res.send('index');	
});

router.get('/pages/photos', function (req, res){
  startTime=new Date();
  console.log("photos page started @" + startTime);
  res.send('photos');
});

router.get('/pages/view', function (req, res){
  startTime=new Date();
  console.log("view main photo page started @" + startTime);
  res.send('view');
});

router.post('/uploads', upload.single('img'), function (req, res) {
	var fileName=req.file.filename;
	var  mimetype=req.file.mimetype;
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
	
	var newFileName= fileName +"."+ ext;
	fs.rename('./img/' + fileName, './img/'+ newFileName , (err) => {
	if (err) throw err;
	console.log('rename complete');
	});

	console.log(newFileName);
 	res.send('view'); 
});

module.exports = router;