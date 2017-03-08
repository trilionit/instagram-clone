'use strict'
var passwordHash = require('password-hash');


module.exports = function (rowUser, password){
		if(rowUser){
		let rowPassword= rowUser[0].password;
		let passwordVerify = passwordHash.verify(password, rowPassword);

		if(!passwordVerify){
		return {
			input:"PASSWORD",
			status:"INCORRECT_PASSWORD",
			message:"Password is incorrect"
			}

		}
		
	else if(rowUser && passwordVerify){
		return {
			input:"NULL",
			status:"SUCCESS",
			message:"Successfully logged in"
			}

	
	

}
}
}
//check username == true
//check password == true
