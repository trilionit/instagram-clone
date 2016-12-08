$(document).ready(function(){
	$( "#upload" ).on( "click", function( event ) {
		$("#show-photos").toggle("slow");
		$("#form-contain").toggle("slow");
	});

	$("#likes").on("click", function(event){
		$(".likes").toggle("slow");
		$(".liked").toggle();

	});
});