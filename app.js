"use strict"
const express =require("express");
const app = express();
const port = 3000;

const bodyParser = require('body-parser');
const fs = require('fs');



const Index = require('./routes/index');

app.use(express.static('public'));
app.set("view engine", "ejs");

let startTime;

// mount routers
app.use('/', Index);


app.listen(port, function(){
console.log('server started on port '+ port);
});