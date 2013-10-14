
var allButtons = new Array();

function checkButtons(x,y) {
	for (var i = 0; i < allButtons.length; i++) {
		if ((allButtons[i].x <= x) && (allButtons[i].x+allButtons[i].width >= x)) {
			if ((allButtons[i].y <= y) && (allButtons[i].y+allButtons[i].height >= y)) {
				if (allButtons[i].isvisible)
					allButtons[i].onclick();
			}
		}
	}
}

function glowButtons(x,y) {
	for (var i = 0; i < allButtons.length; i++) {
		if ((allButtons[i].x >= x) && (allButtons[i].x+allButtons[i].width <= x)) {
			if ((allButtons[i].y >= y) && (allButtons[i].y+allButtons[i].height <= y)) {
				//Should make the buttons glow when you're hovering
				//allButtons[i]
			}
			else {
				//Make button not glow
			}
		}
	}
}

function drawButtons() {
	for (var i = 0; i < allButtons.length; i++) {
		var obj = allButtons[i];
		obj.spriteBackground.x = obj.x;
		obj.spriteBackground.y = obj.y;
		obj.spriteText.text = obj.text
		obj.spriteText.x = obj.x+obj.width/2 - obj.spriteText.getMeasuredWidth()/2;
		obj.spriteText.y = obj.y+3;
		
		
		var size = obj.spriteBackground.getBounds();
		//console.log("BUtton: " + obj.x + " " + obj.y);
		obj.spriteBackground.setTransform(obj.x,obj.y,obj.width/size.width,obj.height/size.height);
	}
}

function makebutton(text,enableBackground,onclick) {
	//Create an easy button
	var obj = new Object();
	obj.x = obj.y = 0;
	obj.enableBackground = enableBackground;
	obj.text = text;
	obj.spriteBackground = new createjs.Bitmap(loader.getResult("button"));
	
	var sizes = obj.spriteBackground.getBounds();
	obj.spriteText = new createjs.Text(obj.text, "20px Arial", "#FFFFFF");
	obj.width = 100;
	obj.height = 30;
	obj.onclick = onclick;
	obj.isvisible = true;
	
	obj.Visible = function(vis) {
		obj.isvisible = vis;
		if (!vis) {
			if (enableBackground)
				cstage.removeChild(obj.spriteBackground);
			
			cstage.removeChild(obj.spriteText);
		}
		else {
			if (enableBackground)
				cstage.addChild(obj.spriteBackground);
			
			cstage.addChild(obj.spriteText);			
		}
	}
	
	//Super jenky way of disabling button background
	if (enableBackground)
		cstage.addChild(obj.spriteBackground);
	
	cstage.addChild(obj.spriteText);

	
	allButtons[allButtons.length] = obj;
	
	return obj;
}

function bhandleMouseDown(event) {
	checkButtons(event.stageX,event.stageY);
}

function initButtons() {

}

function bhandleMouseMove(event) {
	glowButtons(event.stageX,event.stageY);
}

function registerWithStage(stage) {
	$(document).click(bhandleMouseDown);
	stage.addEventListener("stagemousemove", bhandleMouseMove);
}
