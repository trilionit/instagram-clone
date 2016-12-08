var express =require("express");
var app = express();
var port = 3000;
var bodyParser = require('body-parser');
var fs = require('fs');
var multer  = require('multer');
var upload = multer({ dest: 'img/' });

app.use(express.static('public'));
app.set("view engine", "ejs");

var startTime;

app.get('/', function (req, res){
  startTime=new Date();
  console.log("index page started @" + startTime);
  res.send('index');
});

app.get('/pages/photos', function (req, res){
  startTime=new Date();
  console.log("photos page started @" + startTime);
  res.send('photos');
});

app.get('/pages/view', function (req, res){
  startTime=new Date();
  console.log("view main photo page started @" + startTime);
  res.send('view');
});

app.post('/uploads', upload.single('img'), function (req, res) {
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

app.listen(port, function(){
console.log('server started on port '+ port);
});