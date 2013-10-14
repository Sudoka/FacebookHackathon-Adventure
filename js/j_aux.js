
//Happens on player death. post score or something
function onPlayerDeath() {
	alert("You died, Better luck next time!");
	$.ajax({
		type: "POST",
		url: "../php/query.php",
		data:{"query":"deleteprofile"},
		success: function() {
			location.reload();	
		}
	})
	
}


function lvlFromXp(xp) {
	return Math.floor(Math.log(10+xp));
}
