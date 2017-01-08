$("form#register").submit(function(e) {
	e.preventDefault();
	var	textBox= $(this).find("[type=text]");
	var firstName= $(this).find("[name=firstName]");
	var lastName= $(this).find("[name=lastName]");
	var	email= $(this).find("[type=email]");
	var password= $(this).find("[type=password]");
	var confirmPassword=$(this).find("[name=confirmPassword]");
	var errorMessage ="Important";
	var emailAddress = email.val();

//validate email
// http://stackoverflow.com/questions/2507030/email-validation-using-jquery

function validateEmail($email) {
 var emailRegExp = /^([\w-\.]+@([\w-]+\.)+[\w-]{2, 6})?$/;
  return emailRegExp.test( $email );
}

	//check required fields not empty
	if (textBox.val()==""){
		textBox.addClass("input-error");
		$(".form-element span").html(errorMessage);
	}

	if (email.val()==""){
		email.addClass("input-error");
		$(".full-element span").html(errorMessage);
	}
	//validate email
	
	else if(!validateEmail(emailAddress)){
		email.addClass("input-error");
		errorMessage="Enter a valid Email Address";
		$(".full-element span#email").html(errorMessage);
	}

	if (password.val()==""){
		password.addClass("input-error");
		$(".full-element span").html(errorMessage);
	}
	//validate input characters
	if (firstName.val().length < 2){
		firstName.addClass("input-error");
		errorMessage="Enter A valid First Name";
		$(".form-element span#fname").html(errorMessage);

	}else if(lastName.val().length < 2){
		lastName.addClass("input-error");
		errorMessage="Enter A valid Last Name";
		$(".form-element span#lname").html(errorMessage);
	}
	else if(password.val().length < 6 || confirmPassword.val().length < 6){
		password.addClass("input-error");
		errorMessage="Password Strength: needs more than 6 characters";
		$(".form-element span#password").html(errorMessage);
	}
	else if(password.val() != confirmPassword.val()){
		password.addClass("input-error");
		errorMessage="Passwords did not match";
		$(".form-element span#password").html(errorMessage);
	}
	
	else{
		data={
		firstName:firstName.val(),
		lastName:lastName.val(),
		email:emailAddress,
		password:password.val(),
		confirmPassword:confirmPassword.val()
		}

		$.ajax({
		  type: "POST",
		  url: "/first-time",
		  data: data
		});

	}

});
