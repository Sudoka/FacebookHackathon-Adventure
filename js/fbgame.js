function login(force) {
	$.ajax({
		type: "POST",
		url: "php/query.php",
		data:{"query":"login"},
		success:function(data){
			var result = $.parseJSON(data);
			if (result.result=="success") {
				$("#loading").text("LOADING");
				$(".username").html("Logged In as: " + result.name);
				//$(".fblogout").html("<a href='"+result.logouturl + "'> (logout)</a>");
				$("#loading").text("LOADING...");
				if(result.isNewUser){
					$("#top").hide();
					$("#profilecreate").show("drop",1000);
				} else {
					$("#play").show("drop",1000);
					init();
				}
			} else {
				if(force){
					window.location.href = result.loginurl;
				}
			}
		}
	})
}
function resizecanvas() {
	maxwidth = $(window).width()-236;
	maxheight = $(window).height();
	if(maxwidth*0.672>maxheight) maxwidth = maxheight/0.672;
	else maxheight = maxwidth*0.672;
	$("#testCanvas").css("width",maxwidth);
	$("#testCanvas").css("height",maxheight);
	$("#combatCanvas").css("width",maxwidth);
	$("#combatCanvas").css("height",maxheight);
}
$(window).resize(function(){
	resizecanvas();
});
$(document).ready(function(){
	login(false);
	resizecanvas();
	$(".fblogin").on("click",function() {
		login(true);
	});
	$("#character_select").change(function (){
		if($(this).val()=="Web Developer") {
			$("#character_preview").html( 
					'<div style="text-align:left;width:40%;display:inline-block;">'+
						'<div>Agility: <span id="agivalue">99</span></div>'+
						'<div>Strength: <span id="strvalue">25</span></div>' +
						'<div>Intelligence:<span id="intvalue">50</span></div>'+
					'</div>'+
					'<div style="width:50%;display:inline-block;"><img width="40%" src="/images/site/nerd1.png"></div>'

			)
			$("#special_preview").text("Special Ability: X-Site Script Attack");
		} else if($(this).val()=="Database Admin") {
			$("#character_preview").html( 
					'<div style="text-align:left;width:40%;display:inline-block;">'+
						'<div>Agility: <span id="agivalue">25</span></div>'+
						'<div>Strength: <span id="strvalue">50</span></div>' +
						'<div>Intelligence:<span id="intvalue">99</span></div>'+
					'</div>'+
					'<div style="width:50%;display:inline-block;"><img width="40%" src="/images/site/nerd2.png"></div>'

			)
			$("#special_preview").text("Special Ability: MySQL Injection Attack");
		} else if($(this).val()=="Project Manager") {
			$("#character_preview").html( 
					'<div style="text-align:left;width:40%;display:inline-block;">'+
						'<div>Agility: <span id="agivalue">50</span></div>'+
						'<div>Strength: <span id="strvalue">99</span></div>' +
						'<div>Intelligence:<span id="intvalue">25</span></div>'+
					'</div>'+
					'<div style="width:50%;display:inline-block;"><img width="40%" src="/images/site/nerd3.png"></div>'

			)
			$("#special_preview").text("Special Ability: Request More 'Pop' ");
		}
	});
	$("#create_profile").on("click",function(){
		$.ajax({
		type: "POST",
		url: "php/query.php",
		data:{"query":"profileupdate","agi":$("#agivalue").text(),"str":$("#strvalue").text(),"intel":$("#intvalue").text(),"character":$("#character_select").val()},
		success:function(data){
				$("#profilecreate").hide();
				$("#play").show("drop",1000);
				init();
		},
		async:false
		})
	});
});