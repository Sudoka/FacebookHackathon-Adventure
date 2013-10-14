
	var pos = {x:50, y:50}

	var stage, w, h, loader;
	var sky, grant, ground, hill, hill2;


function proceduralGenX(width) {
	var worldcell = new Array();
	for (var i = 0; i < width; i++) {
		worldcell[i] = new Array()
		for (var x = 0; x < width; x++) {
			worldcell[i][x] = null;
			if (Math.random() <= .05)
				worldcell[i][x] = {type:1}
			else if (Math.random() <= .05)
				worldcell[i][x] = {type:2}
			else if (Math.random() <= .05)
				worldcell[i][x] = {type:3}
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

	

	function handleMove(e) {
		//console.log(e.which + " " + e.keyCode);
		
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
		
		pos.x = Math.max(Math.min(pos.x,worldWidth),0);
		pos.y = Math.max(Math.min(pos.y,worldWidth),0);
		
		if ((world[pos.x][pos.y] != null) && world[pos.x][pos.y].type != 3) {
			//No moving on top of shit
			pos.x = oldPosX;
			pos.y = oldPosY;
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
	function selectItem(i) {
		if (items.length <= i) {
			items[i] = new createjs.Shape();
			items[i].graphics.beginStroke("#000").beginFill("#FFFF00")
				.drawRect(0, 0, cellWidth, cellWidth);
		}
		return items[i];
	}
	
	function selectTree(i) {
		if (trees.length <= i) {
			trees[i] = new createjs.Shape();
			trees[i].graphics.beginStroke("#000").beginFill("#00FF00")
				.drawRect(0, 0, cellWidth, cellWidth);
		}
		return trees[i];
	}
	
	function selectEnemy(i) {
		if (enemies.length <= i) {
			enemies[i] = new createjs.Shape();
			enemies[i].graphics.beginStroke("#000").beginFill("#FF0000")
				.drawRect(0, 0, cellWidth, cellWidth);
		}
		return enemies[i];
	}
	
	function selectWall(i) {
		if (walls.length <= i) {
			walls[i] = new createjs.Shape();
			walls[i].graphics.beginStroke("#000").beginFill("#000000")
				.drawRect(0, 0, cellWidth, cellWidth);
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
						shape = selectEnemy(localEnemiesUsed++);
						break;
					case 3: //Item
						shape = selectItem(localItemsUsed++);
						break;
				}
				
				//Set shape position
				shape.x = (x-sx)*cellWidth;
				shape.y = (y-sy)*cellWidth;
			}
		}
		
		//Add all the current shapes to the stage
		enableShapes(items,itemsUsed,localItemsUsed);
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
		
		stage.update(event);
	}
	
	function doneLoading() {
		//document.getElementById("loader").className = "";
	
		//Setup the universal shapes
		backgroundShape = new createjs.Shape();
		backgroundShape.graphics.beginStroke("#000").beginFill("#000088")
			.drawRect(0, 0, w, h);
		
		userShape = new createjs.Shape();
		userShape.graphics.beginStroke("#000").beginFill("#FFFFFF")
			.drawRect(0, 0, cellWidth, cellWidth);
		
		stage.addChild(backgroundShape);
		stage.addChild(userShape);
		

		
		//Generate the world
		world = createWorld(worldWidth);
		//Clear the position of the player
		//later we'll find a good place to put them instead of this
		world[pos.x][pos.y] = null;
		
		//sky = new createjs.Shape();
		//sky.graphics.beginBitmapFill(loader.getResult("sky")).drawRect(0,0,w,h);
		/*
		var groundImg = loader.getResult("ground");
		ground = new createjs.Shape();
		ground.graphics.beginBitmapFill(groundImg).drawRect(0, 0, w+groundImg.width, groundImg.height);
		ground.tileW = groundImg.width;
		ground.y = h-groundImg.height;
		
		hill = new createjs.Bitmap(loader.getResult("hill"));
		hill.setTransform(Math.random() * w, h-hill.image.height*3-groundImg.height, 3, 3);
		     
		hill2 = new createjs.Bitmap(loader.getResult("hill2"));
		hill2.setTransform(Math.random() * w, h-hill2.image.height*3-groundImg.height, 3, 3);
	
		var data = new createjs.SpriteSheet({
			"images": [loader.getResult("grant")],
			"frames": {"regX": 0, "height": 292, "count": 64, "regY": 0, "width": 165},
			// define two animations, run (loops, 1.5x speed) and jump (returns to run):
			"animations": {"run": [0, 25, "run", 1.5], "jump": [26, 63, "run"]}
		});
		grant = new createjs.Sprite(data, "run");
		grant.setTransform(-200, 90, 0.8, 0.8);
		grant.framerate = 30;

		stage.addChild(sky, hill, hill2, ground, grant);
		*/
		//stage.addEventListener("stagemousedown", handleMouse);
		//createjs.Ticker.timingMode = createjs.Ticker.RAF;
		
		createjs.Ticker.addEventListener("tick", tick);
		createjs.Ticker.setFPS(50);
	}


	function init() {
		stage = new createjs.Stage("testCanvas");
		
		// grab canvas width and height for later calculations:
		w = stage.canvas.width;
		h = stage.canvas.height;

		manifest = [
			{src:"images/person-placeholder.png", id:"user"}
		//We'll generate stuff eventually here
			/*{src:"assets/runningGrant.png", id:"grant"},
			{src:"assets/sky.png", id:"sky"},
			{src:"assets/ground.png", id:"ground"},
			{src:"assets/parallaxHill1.png", id:"hill"},
			{src:"assets/parallaxHill2.png", id:"hill2"}*/
		];

		loader = new createjs.LoadQueue(false);
		loader.addEventListener("complete", doneLoading);
		loader.loadManifest(manifest);
		
		//It's a pain
		//doneLoading();
	}