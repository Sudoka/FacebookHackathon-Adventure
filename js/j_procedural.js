//procedural generation

function getRandomInt(min, max) {//returns random int between min and max
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

var itemType = ["coffee", "alcohol", "firewall", "script", "pizza"];

//generic objects. floor will be the null object
var wall = {
	type : 0,
	openable : false
}
var tree = {
	type : 1,
	openable : false
}
var entity = {//friend, enemy, creature, etc
	type : 2,
	openable : false,
	hostility : true
}
var item = {
	type : 3,
	openable : true
}
var door = {
	type : 4,
	openable : true
}

//Generates a procedural level
function proceduralGen(width) {
	var worldcellEmpty = new Array();
	for (var i = 0; i < width; i++) {
		worldcellEmpty[i] = new Array()
		for (var x = 0; x < width; x++) {
			worldcellEmpty[i][x] = null;
		}
	}
	return worldcellEmpty;
}

//makes a world, fills it with objects
function createWorld(width) { //important: draw range is from 0 to width-2
	//not sure why width-2 instead of -1, but fuck it
	var worldcell = proceduralGen(width);
	//create floor
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < width; y++) {
			worldcell[x][y] = null;
		}
	}
	
	for (var i = 0; i < width; i++) {
		for(var a = 0; a < width - 1; a += 9)
				for(var b = 0; b < width - 1; b += 9)
					worldcell[a][b] = wall;
	}

	//place treasures! (aka items!) how it works:
	//for loop randomly finds cells. if empty, place item. if not empty, contine thru for loop
	// var itemType = ["coffee", "alcohol", "firewall", "script", "pizza"];
	var howManyTreasures = getRandomInt(50, 200);
	for (var i = 0; i <= howManyTreasures; i++) {
		var treasureCell = new Object();
		var treasureX = getRandomInt(1, width - 2);
		var treasureY = getRandomInt(1, width - 2);
		treasureCell = worldcell[treasureX][treasureY];
		if (treasureCell == null) {
			treasureCell = {
				type : 3,
				openable : true,
				itemType : 0
			};
			whatsit = Math.random()
				if(whatsit < 0.20){							//20% chance
					treasureCell.itemType = 1;				//1 = coffee
				}
				else if(whatsit > 0.20 && whatsit < 0.40){ 	//20% chance
					treasureCell.itemType = 2; 				//2 = alcohol (increases health permanently)
				}
				else if(whatsit > 0.40 && whatsit < 0.60){ 	//20% chance
					treasureCell.itemType = 3; 				//3 = firewall
				}
				else if(whatsit > 0.60 && whatsit < 0.80){	//20% chance
					treasureCell.itemType = 4; 				//4 = script
				}
				else{ 										//20% chance
					treasureCell.itemType = 0; 				//0 = pizza
				}
			worldcell[treasureX][treasureY] = treasureCell;
		}
	}
	
	//delete this next bit after debugging
	/*for(int i = 0; i < width-2; i++)
		for(int j = 0; j < width-2 j++)
			if(worldcell[i][j].itemType == 0)
				console.log("found! location " + i + ", " + j); 
	*/
	
	for (var i = 0; i < width; i++) {//create border wall
		worldcell[i][0] = wall;
		worldcell[i][width - 2] = wall;
		worldcell[0][i] = wall;
		worldcell[width - 2][i] = wall;
	}
	
	//enemy creation
	enemyCount = 100;
	//placement
	for (var i = 0; i < enemyCount; i++) {
		var enemyCell = new Object();
		while (true) {
			var enemyX = getRandomInt(1, width - 2);
			var enemyY = getRandomInt(1, width - 2);
			if (worldcell[enemyX][enemyY] == null) {
			//	console.log("enemy exists at " + enemyX + ", " + enemyY);
				enemyCell = new Object();
				worldcell[enemyX][enemyY] = enemyCell;
				enemyCell.type = 2;
				enemyCell.enemyId = (i % 9);
				break;
			}
		}
	}

	//"tree" creation
	var howManyTrees = getRandomInt(150, 300);
	for (var i = 0; i <= howManyTrees; i++) {
		var treeCell = new Object();
		var treeX = getRandomInt(1, width - 2);
		var treeY = getRandomInt(1, width - 2);
		treeCell = worldcell[treeX][treeY];
		if (treeCell == null) {
			treeCell = {
				type : 1
			};
			worldcell[treeX][treeY] = treeCell;
		}
	}

//DOORS, NIGGA!
	var doorInWall = false;
	for (var a = 0; a < width; a += 9) {
		for (sometimes = 0; sometimes < width; sometimes += 9) {
			doorInWall = false;
			if (Math.random() < 0.75)		//coef of wall appearance
				for (b = sometimes; b < sometimes + 9; b++) {
					if (!doorInWall && (Math.random() < 0.10)) {	//coef of door appearance
						worldcell[a][b] = null;
						doorInWall = true;
					} else
						worldcell[a][b] = wall;
				}
		}
	}	
	doorInWall = false;
	for (var b = 0; b < width; b += 9) {
		for (sometimes = 0; sometimes < width - 9; sometimes += 9) {
			doorInWall = false;
			if (Math.random() < 0.75)		//coef of wall appearance
				for (a = sometimes + 1; a < sometimes + 8; a++) {
					if (!doorInWall && (Math.random() < 0.05)) {	//coef of door appearance
						worldcell[a][b] = null;
						doorInWall = true;
					} else
						worldcell[a][b] = wall;
				}
		}
	}
//place border squares again, because the doors went and broke them partially
	for (var i = 0; i < width; i++) {
		worldcell[i][0] = wall;
		worldcell[i][width - 2] = wall;
		worldcell[0][i] = wall;
		worldcell[width - 2][i] = wall;
	}
//..and corners, too
		for(var a = 0; a < width - 1; a += 9)
				for(var b = 0; b < width - 1; b += 9)
					worldcell[a][b] = wall;

	return worldcell;
}

