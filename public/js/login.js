$(function(){
	var getStatus = function(status) {
	var statusClasses ={
		"NOT_FOUND_EMAIL": "wrong",
		"INCORRECT_PASSWORD": "wrong",
		"ERROR": "error"
	}
	return statusClasses[status];
	}

	

	$("#login").submit(function(event){

		event.preventDefault();

		console.log("submitted");

		var form = event.target;
		var dataUrl = form.action;
		var email = $(form).find("input[name=email]");
		var pass = $(form).find("input[name=password]")
		var emailAddress = email.val();
		var password = pass.val();
		
		var sendData={
			email:emailAddress,
			password: password
		}

		$.post(dataUrl, sendData, function(data, status){
			console.log(status + "-> retrievedData: "+ data.message);
			var cssClass = getStatus(data.status);

			if(data.status =="SUCCESS"){
				window.location.href = '/'
			}
			else if(data.status =="NOT_FOUND"){
				//user not found. Add message to try again or go to register page
				$("#message").text(data.message)
				$(pass).removeClass("success").removeClass("wrong").removeClass("error")
				.addClass(cssClass);

				//display register link
				$("#register").show();

			}
			else{

			console.log(cssClass);
			$("#message").text(data.message)
			$(pass).removeClass("success").removeClass("wrong").removeClass("error")
			.addClass(cssClass);
		}
		})
		

		
		

		
		

	})
})