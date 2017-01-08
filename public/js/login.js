$("form#register").submit(function(e) {
	e.preventDefault();
	var	email= $(this).find("[type=email]");
	var password= $(this).find("[type=password]");
	var errorMessage ="Important";
	var emailAddress = email.val();

//validate email
// http://stackoverflow.com/questions/2507030/email-validation-using-jquery

function validateEmail($email) {
 var emailRegExp = /^([\w-\.]+@([\w-]+\.)+[\w-]{2, 6})?$/;
  return emailRegExp.test( $email );
}

	//check required fields not empty

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

	else if (password.val()==""){
		password.addClass("input-error");
		$(".full-element span").html(errorMessage);
	}
	
	else{
		data={
		email:emailAddress,
		password:password.val()
		}

		$.ajax({
		  type: "POST",
		  url: "/login",
		  data: data
		});

	}

});
