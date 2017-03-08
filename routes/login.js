'use strict';
module.exports = function(sequelize, DataTypes) {
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

};