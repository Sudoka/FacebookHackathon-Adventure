

player0 = {
	framerate: 4, images: ["/images/game/11sprite.png"], id: "p0",
	frames: {width:32, height:48},
	 animations: {
	 	walkSouth: [0, 3],
	 	walkWest: [4, 7],
	 	walkEast: [8, 11],
	 	walkNorth: [12, 15],
		stand: 2,
		}
}

boom = {
	framerate: 64, images:["/images/game/boom3_0.png"], id: "boom",
	animations: {
		explode: [0, 63]
	}
}
