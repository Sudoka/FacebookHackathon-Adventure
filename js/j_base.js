//pull vars
var username;
var userid;
var stats;
var profilepic;

var oldPos = {x:-1,y:-1};

$.ajax({
		type: "POST",
		url: "php/query.php",
		data:{"query":"pullStats"},
		success:function(data){
			var result = $.parseJSON(data);
			if (result.result=="success") {
				username = result.name;
				userid  = result.id;
				stats  = result.stats;
				items = result.items;
				profilepic = result.profilepic;
			} else {
				alert("oh fuck, what did you do anthony?");
			}
		},
		async:   false
})
	var pos = {x:50, y:50}

	var stage, w, h, loader;
	
function savegame() {
	$.ajax({
		type: "POST",
		url: "php/query.php",
		data:{"query":"savegame", "stats":user.stats, "items":userData.items, "xp":userData.xp, "score":userData.score},
		success:function(data) {
			var result = $.parseJSON(data);
			if(result.result == "success") {
			} else {
				alert("something fucked up while saving, sorry :(");
			}
		}
	});
}

function loadgame() {
	$.ajax({
		type: "POST",
		url: "php/query.php",
		data:{"query":"loadgame"},
		success:function(data) {
			var result = $.parseJSON(data);
			if(result.result == "success") {
				user.stats['agi'] = result.stats[1];
				user.stats['int'] = result.stats[2];
				user.stats['str'] = result.stats[0];
				userData.items = result.items;
				userData.xp = result.xp;
				userData.score = result.score;
				user.class = result.class;
			} else {
				alert("load screwed up, badaboom");
			}
		},
		async: false
	});
}
	
//combat stage
var cstage;

var incombat = false;

var enemyui = new Object();

var user = {
	name: username,
	stats: {
		agi: stats[0],
		str: stats[1],
		int: stats[2],
		def: stats[0]+10,
		atk: stats[1]*.25+stats[0]*.25+10,
		maxhp: stats[1]*30 //You a special case
	},
	//0 1 or 2 for the three different base characters
	playerTypeId  : 1
}

var userData = {
	items: [0,0,0,0,0],
	maxHealth: 100,
	health: 100,
	abilityId: 0,
	xp: 0,
	score: 0
};

var stats = [
	{name: "agi", show: "Agility"},
	{name: "str", show: "Strength"},
	{name: "int", show: "Intelligence"},
	{name: "def", show: "Defence"},
	{name: "atk", show: "Attack"}
];

var itemTypes = [
	{name: "Coffee", itm: "item_coffee"},
	{name: "Alcohol", itm: "item_alcohol"},
	{name: "Pizza", itm: "item_pizza"},
	{name: "Firewall", itm: "item_firewall"},
	{name: "Script", itm: "item_script"}
];

function proceduralGenX(width) {
	var pos = []
	var worldcell = new Array();
	for (var i = 0; i < width; i++) {
		worldcell[i] = new Array()
		for (var x = 0; x < width; x++) {
			worldcell[i][x] = null;
			if (Math.random() <= .05)
				worldcell[i][x] = {type:1}
			else if (Math.random() <= .05)
				worldcell[i][x] = {type:2,enemyId: Math.floor(Math.random(9))}
			else if (Math.random() <= .05)
				worldcell[i][x] = {type:3,itemType: Math.floor(Math.random()*5)}
			else if (Math.random() <= .05)
				worldcell[i][x] = {type:0}
		}
	}
	
	worldcell[52][52] = {type:1}
	
	return worldcell;
}

	//The global shapes
	var userShape;
	var backgroundShape;
	var uiShapes; //Object which contains lots of shapes
	
	function setCombatStatus(newStatus) {
		if (incombat == newStatus)
			return;
			
		//Change what's displayed
		if (newStatus)
			$("#combatCanvas").show();
		else
			$("#combatCanvas").hide();
			
		incombat = newStatus;
	}
	

	function handleMove(e) {
		//console.log(e.which + " " + e.keyCode);
		
		if (incombat) {
			if (!attackButton.isvisible)
				return;
							
			var v = e.which || e.keyCode;
			if (v == 32) {
				//Attack!
				//Disable your control
						showCombatUi(false);
						
						sendAttackFromPlayer("poke",user.stats.sp);
			}
		}
		else {
			
			
			var oldPosX = pos.x;
			var oldPosY = pos.y;
			
			switch (e.which || e.keyCode) {
				//up
				case 87:
				case 38:
					pos.y--;
					break;
				//left
				case 65:
				case 37:
					pos.x--;
					break;
				//right
				case 68:
				case 39:
					pos.x++;
					break;
				//down
				case 83:
				case 40:
					pos.y++;
					break;	
			}
			
			pos.x = Math.max(Math.min(pos.x,worldWidth-2),0);
			pos.y = Math.max(Math.min(pos.y,worldWidth-2),0);
			
			if ((world[pos.x][pos.y] != null) && world[pos.x][pos.y].type != 3) {
				if (world[pos.x][pos.y].type == 2) {
					//Enemy - START THE COMBAT
					setCombatStatus(true);
					startCombat(world[pos.x][pos.y].enemyId);
					//Destroy the enemy tile
					world[pos.x][pos.y] = null;
				}
				else {
					//No moving on top of shit
					pos.x = oldPosX;
					pos.y = oldPosY;				
				}
			}
			else if ((world[pos.x][pos.y] != null) && world[pos.x][pos.y].type == 3){
				//Pick up the item
				userData.items[world[pos.x][pos.y].itemType]++;
				world[pos.x][pos.y] = null;
				savegame();
			}
		}
		
	}

	/*function handleJumpStart() {
		grant.gotoAndPlay("jump");
	}*/

	//Register keydown using jquery
	$(window).keydown(handleMove);


	var walls = [];
	var trees = [];
	var items = [];
	var enemies = [];

	var wallsUsed = 0;
	var treesUsed = 0;
	var itemsUsed = 0;
	var enemiesUsed = 0;

	//Number of cells per view
	var screenX = 13;
	var screenY = 13;
	
	var worldWidth = 100;
	
	var cellWidth = 32;
	
	//The cell 2d array
	var world;
	
	//Generate everything
	function selectItem(i, x, y) {
		switch(world[x][y].itemType){
			case 0:
				items[i] = new createjs.Bitmap(loader.getResult("item_coffee"));
				break;
			case 1:
				items[i] = new createjs.Bitmap(loader.getResult("item_alcohol"));
				break;
			case 3:
				items[i] = new createjs.Bitmap(loader.getResult("item_firewall"));
				break;
			case 4:
				items[i] = new createjs.Bitmap(loader.getResult("item_script"));
				break;
			case 2:
				items[i] = new createjs.Bitmap(loader.getResult("item_pizza"));
				break;
		}
			var size = items[i].getBounds();
			items[i].setTransform(0,0,cellWidth/size.width,cellWidth/size.height);
			stage.addChild(items[i]);
		return items[i];
	}
	
	function selectTree(i) {
		/*if (trees.length <= i) {
			trees[i] = new createjs.Shape();
			trees[i].graphics.beginStroke("#000").beginFill("#00FF00")
				.drawRect(0, 0, cellWidth, cellWidth);
		}*/
		if (trees.length <= i) {
			trees[i] = new createjs.Bitmap(loader.getResult("obstacle"));
			var size = trees[i].getBounds();
			trees[i].setTransform(0,0,cellWidth/size.width,cellWidth/size.height);
		}
		return trees[i];
	}
	
	function selectEnemy(i,x,y) {
		enemies[i] = new createjs.Bitmap(loader.getResult("e"+world[x][y].enemyId));
			
		var size = enemies[i].getBounds();
		enemies[i].setTransform(0,0,cellWidth/size.width,cellWidth/size.height);
		stage.addChild(enemies[i]);

		return enemies[i];
	}
	
	function selectWall(i) {
		if (walls.length <= i) {
			walls[i] = new createjs.Bitmap(loader.getResult("wall"));
			var size = walls[i].getBounds();
			walls[i].setTransform(0,0,cellWidth/size.width,cellWidth/size.height);
		}
		return walls[i];
	}
	
	//Add shapes to the stage, or remove old shapes
	function enableShapes(shapeList,oldShapeCount,newShapeCount) {
		if (oldShapeCount > newShapeCount) {
			//remove unused shapes
			for (var x = newShapeCount; x < oldShapeCount; x++)
				stage.removeChild(shapeList[x]);
		}
		else if (oldShapeCount < newShapeCount) {
			//add newly used shapes
			for (var x = oldShapeCount; x < newShapeCount; x++)
				stage.addChild(shapeList[x]);
		}
	}


	function tick(event) {
		
		//Update pretty buttons
		drawButtons();
		
		if (incombat) {
			updateCombat();
		}
		else {
			if (oldPos.x == pos.x && oldPos.y == pos.y) {
				return;
			}
			oldPos.x = pos.x;
			oldPos.y = pos.y;
			
		
			for(var i = 0; i < items.length;i++)
				stage.removeChild(items[i]);
			for(var i = 0; i < enemies.length;i++)
				stage.removeChild(enemies[i]);
		
			//Determine the "screen" to render
			var sx = Math.min(Math.max(pos.x-Math.floor(screenX/2+1),0),worldWidth-screenX-1);
			var sy = Math.min(Math.max(pos.y-Math.floor(screenY/2+1),0),worldWidth-screenY-1);
			
			var localWallsUsed = 0;
			var localTreesUsed = 0;
			var localItemsUsed = 0;
			var localEnemiesUsed = 0;
			
			//Render the screen
			for (var x = sx; x < sx+screenX; x++) {
				for (var y = sy; y < sy+screenY; y++) {
					var cell = world[x][y];
					if (cell == null)
						continue;
	
					
					var shape;
					
					//find a shape to use
					switch (cell.type) {
						case 0: //wall
							shape = selectWall(localWallsUsed++);
							break;
						case 1: //tree
							shape = selectTree(localTreesUsed++);
							break;
						case 2: //enemy
							shape = selectEnemy(localEnemiesUsed++,x,y);
							break;
						case 3: //Item
							shape = selectItem(localItemsUsed++,x,y);
							break;
					}
					
					//Set shape position
					shape.x = (x-sx)*cellWidth;
					shape.y = (y-sy)*cellWidth; 
				}
			}
			//These update whether or not you're in combat
			
			//Add all the current shapes to the stage
			//enableShapes(items,itemsUsed,localItemsUsed);
			enableShapes(trees,treesUsed,localTreesUsed);
			enableShapes(enemies,enemiesUsed,localEnemiesUsed);
			enableShapes(walls,wallsUsed,localWallsUsed);
			itemsUsed = localItemsUsed;
			treesUsed = localTreesUsed;
			enemiesUsed = localEnemiesUsed;
			wallsUsed = localWallsUsed;
			
			
			//now move the player
			userShape.x = (pos.x-sx)*cellWidth;
			userShape.y = (pos.y-sy)*cellWidth;
		}
		
		
		//Now refresh all the ui stuff that can change frame to frame
		var drawn = false;
		//if(drawn)
		//	ui.healthbar.graphics.endFill();
		ui.healthbar.graphics.beginFill("#000000").drawRect(0,0,100,20);
		ui.healthbar.graphics.beginFill("#00FF00").drawRect(0,0,100*userData.health/user.stats.maxhp,20);
		drawn = true;
		ui.healthtext.text = "" + Math.floor(userData.health) + "/" + Math.floor(user.stats.maxhp);

		//Update the stats list
		for (var i = 0; i < stats.length; i++)
			ui.stats[i].text = stats[i].show + ": " + user.stats[stats[i].name];

		//Update the items count
		for (var i = 0; i < itemTypes.length; i++)
			ui.items[i].text = "x" + userData.items[i];
		
		//Finish updating the stage
		stage.update(event);
		if (incombat)
			cstage.update(event);
	}
	
	function doneLoading() {
		//document.getElementById("loader").className = "";
	
		loadgame();
		uiX = w-100;
	
		var trueBackground = new createjs.Bitmap(loader.getResult("uback"));
		stage.addChild(trueBackground);
	
		//Setup the universal shapes
		backgroundShape = new createjs.Shape();
		backgroundShape.graphics.beginStroke("#000").beginFill("#111111")
			.drawRect(0, 0, w, h);
		
		userShape = new createjs.Bitmap(loader.getResult("user"));
		var size = userShape.getBounds();
		userShape.setTransform(0,0,cellWidth/size.width,cellWidth/size.height);
		//userShape.graphics.beginStroke("#000").beginFill("#FF00FF")
		//	.drawRect(0, 0, cellWidth, cellWidth);
		
		//stage.addChild(backgroundShape);
		stage.addChild(userShape);
		
		//Build the ui
		ui = {
			x : w-200,
			y : 0,
			width : 200,
			height : h,
			background : new createjs.Shape(),
			username : new createjs.Text(user.name, "20px Arial", "#FFFFFF"),
			userpic : new createjs.Bitmap(loader.getResult("user")),
			userbackground : new createjs.Shape(),
			stattext : new createjs.Shape(),
			healthbar : new createjs.Shape(),
			healthbarbackground  : new createjs.Shape(),
			healthtext : new createjs.Text("Health 100/100", "12px Arial", "#FFFFFF"),
			stats : new Array(),
			items : new Array(),
		}
		ui.background.graphics.beginFill("#000").drawRect(ui.x,ui.y,ui.width,ui.height);
		stage.addChild(ui.background);
		
		ui.username.y = ui.y + ui.height/20;
		ui.username.x = ui.x + ui.width/2 - ui.username.getMeasuredWidth()/2;
		stage.addChild(ui.username);
		
		ui.userbackground.graphics.beginFill("#FFFFFF").drawRect(0,0,60,60);
		ui.userbackground.x = ui.x+ui.width/2-60/2;
		ui.userbackground.y = ui.y+ui.height/20*3-5
		stage.addChild(ui.userbackground);
		
		var size = ui.userpic.getBounds();
		ui.userpic.setTransform(ui.x+ui.width/2-50/2,ui.y+ui.height/20*3,50/size.width,50/size.height);
		stage.addChild(ui.userpic);
		
		ui.healthbarbackground.graphics.beginFill("#333333").drawRect(0,0,110,30);
		ui.healthbarbackground.x = ui.x+ui.width/2-100/2-5;
		ui.healthbarbackground.y = ui.y+ui.height/20*8-5
		stage.addChild(ui.healthbarbackground);
		
		//ui.healthbar.graphics.beginFill("#00FF00").drawRect(0,0,100,20);
		ui.healthbar.x = ui.x+ui.width/2-100/2;
		ui.healthbar.y = ui.y+ui.height/20*8
		stage.addChild(ui.healthbar);
		
		ui.healthtext.x = ui.x+ui.width/2-ui.healthtext.getMeasuredWidth()/2;
		ui.healthtext.y = ui.y+ui.height/20*7
		stage.addChild(ui.healthtext);		

		//Generate the stats list
		for (var i = 0; i < stats.length; i++) {
			var itm = new createjs.Text(stats[i].show + ": " + user.stats[stats[i].name], "12px Arial", "#FFFFFF");
			itm.x = ui.x+ui.width/2-100/2;
			itm.y = ui.y+ui.height/20*10+i*20;
			stage.addChild(itm);
			ui.stats[i] = itm;
		}

		//Generate the items list
		for (var i = 0; i < itemTypes.length; i++) {
			var extraHeight = (i >= 3) ? 50 : 0;
			var curW = 0;
			var curH = 0;
			if (i >= 3) {
				curH = ui.height/20*15 + 60;
				curW = ui.x+60+(i-3)*50;
			}
			else {
				curH = ui.height/20*15;
				curW = ui.x+40+i*50;
			}
			
			var itm = new createjs.Bitmap(loader.getResult(itemTypes[i].itm));
			var size = itm.getBounds();
			itm.setTransform(curW,curH,30/size.width,30/size.height);
			stage.addChild(itm);
			//now display item count background
			itm = new createjs.Shape();
			itm.graphics.beginFill("#CCCCCC").drawRect(0,0,20,20);
			itm.x = curW+20;
			itm.y = curH+20;
			stage.addChild(itm);
			//Now display the count
			
			var itm = new createjs.Text("x" + userData.items[i], "12px Arial", "#000000");
			itm.x = curW+21;
			itm.y = curH+23;
			stage.addChild(itm);
			ui.items[i] = itm;
		}

		
		//Setup the combat stuff
		enemyui = {
			x : 0,
			y : 0,
			width : 200,
			height : h,
			background : new createjs.Shape(),
			username : new createjs.Text(user.name, "20px Arial", "#FFFFFF"),
			userpic : new createjs.Bitmap(loader.getResult("user")),
			userbackground : new createjs.Shape(),
			healthbar : new createjs.Shape(),
			healthbarbackground  : new createjs.Shape(),
			healthtext : new createjs.Text("Health 100/100", "12px Arial", "#FFFFFF"),
			leveltext : new createjs.Text("Level 5", "20px Arial", "#FFFFFF"),
		}
		
		enemyui.background.graphics.beginFill("#000").drawRect(enemyui.x,enemyui.y,enemyui.width,enemyui.height);
		cstage.addChild(enemyui.background);
		
		enemyui.username.y = enemyui.y + enemyui.height/20;
		enemyui.username.x = enemyui.x + enemyui.width/2 - enemyui.username.getMeasuredWidth()/2;
		cstage.addChild(enemyui.username);
		
		enemyui.userbackground.graphics.beginFill("#FFFFFF").drawRect(0,0,60,60);
		enemyui.userbackground.x = enemyui.x+enemyui.width/2-60/2;
		enemyui.userbackground.y = enemyui.y+enemyui.height/20*3-5
		cstage.addChild(enemyui.userbackground);
		
		var size = enemyui.userpic.getBounds();
		enemyui.userpic.setTransform(enemyui.x+enemyui.width/2-50/2,enemyui.y+enemyui.height/20*3,50/size.width,50/size.height);
		cstage.addChild(enemyui.userpic);
		
		enemyui.healthbarbackground.graphics.beginFill("#333333").drawRect(0,0,110,30);
		enemyui.healthbarbackground.x = enemyui.x+enemyui.width/2-100/2-5;
		enemyui.healthbarbackground.y = enemyui.y+enemyui.height/20*8-5
		cstage.addChild(enemyui.healthbarbackground);
		
		enemyui.healthbar.graphics.beginFill("#00FF00").drawRect(0,0,100,20);
		enemyui.healthbar.x = enemyui.x+enemyui.width/2-100/2;
		enemyui.healthbar.y = enemyui.y+enemyui.height/20*8
		cstage.addChild(enemyui.healthbar);
		
		enemyui.healthtext.x = enemyui.x+enemyui.width/2-enemyui.healthtext.getMeasuredWidth()/2;
		enemyui.healthtext.y = enemyui.y+enemyui.height/20*7
		cstage.addChild(enemyui.healthtext);	
		
		enemyui.leveltext.x = enemyui.x+enemyui.width/2-enemyui.leveltext.getMeasuredWidth()/2;
		enemyui.leveltext.y = enemyui.y+enemyui.height/20*10
		cstage.addChild(enemyui.leveltext);	
		 
		var cbackground = new createjs.Shape();
		cbackground.graphics.beginFill("#222222").drawRect(200,0,w-400,h);
		cstage.addChild(cbackground);
		 
		//Generate the world
		world = createWorld(worldWidth);
		//Clear the position of the player
		//later we'll find a good place to put them instead of this
		world[pos.x][pos.y] = null;
		
		//Setup combat sprites
		initCombatSprites();
		
		//Update generated stats
		updateStats(user.stats,[user.stats.str,user.stats.agi,user.stats.int]);
		userData.health = user.stats.maxhp;
		
		
		registerWithStage(stage);
		registerWithStage(cstage);
		
		createjs.Ticker.addEventListener("tick", tick);
		createjs.Ticker.setFPS(50);
	}


	function init() {
		stage = new createjs.Stage("testCanvas");
		cstage = new createjs.Stage("combatCanvas");
		
		// grab canvas width and height for later calculations:
		w = stage.canvas.width;
		h = stage.canvas.height;
		
		var friends;
		$.ajax({
		type: "POST",
		url: "php/query.php",
		data:{"query":"pullFriends"},
		success:function(data){
			var result = $.parseJSON(data);
			if (result.result=="success") {
				friends = result.friend;
			} else {
			}
		},
		async:   false
		});
		console.log(allEnemies);
		allEnemies['friend'] = friends;
		console.log(allEnemies);
		var profpics = new Array(10);
		for(var blah = 0; blah < friends.length; blah++) {
			$.ajax({
			type: "POST",
			url: "php/query.php",
			data:{"query":"urlLookup","url":friends[blah]['profilepic']},
			success:function(data){
				var result = $.parseJSON(data);
				if (result.result=="success") {
					profpics[blah] = result.url;
				} else {
				}
			},
			async: false
			});
		}
		$("#top").hide();
		manifest = [
		//We'll generate stuff eventually here
			{src: profilepic, id:"user"},
			{src:"images/itemcoffee.png",id:"item_coffee"},
			{src:"images/itemalcohol.png",id:"item_alcohol"},
			{src:"images/itemfood.png",id:"item_pizza"},
			{src:"images/itemfirewall.png",id:"item_firewall"},
			{src:"images/itemscript.png",id:"item_script"},
			{src:"images/game/Main-Char.png",id:"p0"},
			{src:"images/character_placeholder.png",id:"p1"},
			{src:"images/character_placeholder.png",id:"p2"},
			{src:profpics[0],id:"e0"},
			{src:profpics[1],id:"e1"},
			{src:profpics[2],id:"e2"},
			{src:profpics[3],id:"e3"},
			{src:profpics[4],id:"e4"},
			{src:profpics[5],id:"e5"},
			{src:profpics[6],id:"e6"},
			{src:profpics[7],id:"e7"},
			{src:profpics[8],id:"e8"},
			{src:profpics[9],id:"e9"},
			{src:"images/button.png",id:"button"},
			{src:"images/poke.png",id:"poke"},
			{src:"images/pokeright.png",id:"pokeright"},
			{src:"images/worldwall2.png",id:"wall"},
			{src:"images/worldbg2.png",id:"uback"},
			{src:"images/worldobstacle.png",id:"obstacle"},
			{src:"images/game/boom3_0.png",id:"boom"},	
			{src:"images/zeroone.png",id:"zeroone"},
			{src:"images/syringe.png",id:"syringe"}
			//{src:"images/zero.png",id:"01"}
			/*{src:"assets/runningGrant.png", id:"grant"},
			{src:"assets/sky.png", id:"sky"},
			{src:"assets/ground.png", id:"ground"},
			{src:"assets/parallaxHill1.png", id:"hill"},
			{src:"assets/parallaxHill2.png", id:"hill2"}*/
		];
		
	   $('#combatCanvas').bind('click', function (ev) {
	        var $img = $(ev.target);
	
	        var offset = $img.offset();
	        var x = ev.clientX - offset.left;
	        var y = ev.clientY - offset.top;
	
			x *= 616/$('#combatCanvas').width();
			y *= 416/$('#combatCanvas').height();
			
	
	
	        checkButtons(x,y);
    	});
		loader = new createjs.LoadQueue(false);
		loader.addEventListener("complete", doneLoading);
		loader.loadManifest(manifest);
		
		/*while($user.stats['atk']) {
			loadgame();
		}*/
		
		//It's a pain
		//doneLoading();
	}