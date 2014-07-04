var vars = {
	//config
	spritesURL: "./sprites.png",
	blockWidth: 16,
	blockHeight: 19,
	selectionBorder: 4, //2px on each side
	spriteSheet: {
		width: 1940,
		height: 1953
	},
	blocksShown: {
		x: 31,
		y: 21
	},
	sprites: new Array(),
};
vars.ccm = {
	players: new Object(),
	addPlayer: function(userid, x, y) {
		if (!x || !y) {
			x = 0;
			y = 0;
		}
		if (this.players[userid]) alert('Already have player \'' + userid + '\' added. Resetting their variables... I guess.');
		var u = {
			x: x,
			y: y,
			coordinates: {
				x: x,
				y: y
			},
			direction: "",
			userid: userid,
			cycle: 0,
			cycleType: "walk"
		};
		this.players[userid] = u;
		$('#p' + userid).remove();
		var insides = '',
				left = u.x * vars.blockWidth,
				top = u.y * vars.blockHeight;
		if (toId(search.username) != userid) {
			insides += '<div id="p' + userid + '" class="player" style="';
			insides += 'left: ' + left + 'px;';
			insides += 'top: ' + top + 'px;';
			insides += 'background: url(' + vars.spritesURL + ') ' + (vars.character.x * -1) + 'px ' + (vars.character.y * -1) + 'px;';
			insides += 'width: ' + vars.blockWidth + 'px;';
			insides += 'height: ' + vars.blockHeight + 'px;';
			insides += '">';
			insides += '<span class="nametag">' + userid + '</span></div>';
			$('#layer1').append(insides);
		}
	},
	coordinatesToPixels: function(x, y) {
		if (typeof x == "object") {
			if (x.x) {
				var player = x;
				x = player.x;
				y = player.y;
			}
		}
		var left = x * vars.blockWidth,
				top = y * vars.blockHeight;
		return {
			x: left,
			y: top,
			left: left,
			top: top
		};
	},
	updateCoordinates: function(player, funk) {
		if (!funk) funk = "animate";
		var px = this.coordinatesToPixels(player);
		$('#p' + player.userid)[funk]({
			left: px.x + "px",
			top: px.y + "px"
		}, vars.fps / 1.5);
	},
	updatePlayer: function(who, direction, x, y) {
		if (who == toId(search.username)) return false; //don't add yourself
		if (!this.players[who]) this.addPlayer(who, x, y);
		var player = this.players[who];
		player.direction = direction;
		if (x && y) {
			player.x = x;
			player.y = y;
			player.coordinates = {
				x: x,
				y: y
			};
			this.updateCoordinates(player, "css");
		}
		if (player.direction) vars.animateMe[who] = true; else delete vars.animateMe[who];
		vars.initMovementLoop();
	}
};
vars.map = [[[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],[-1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,-1],[-1,1,1,-1,-1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,-1,-1,1,1,1,-1],[-1,1,1,-1,-1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,-1,-1,1,1,1,-1],[-1,1,1,1,1,1,1,1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,1,1,1,1,1,1,1,1,1,-1],[-1,1,1,1,1,1,1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,1,1,1,1,1,1,1,1,-1],[-1,1,1,1,1,1,1,-1,-1,-1,-1,1,1,1,1,1,1,1,1,1,-1,-1,-1,1,1,1,1,1,1,1,-1],[-1,1,1,1,1,1,1,-1,-1,-1,1,1,1,1,-1,-1,1,1,1,1,-1,-1,-1,1,1,1,1,1,1,1,-1],[-1,1,1,1,1,1,1,-1,-1,-1,1,1,1,1,-1,-1,1,1,1,1,-1,-1,-1,1,1,1,1,1,1,1,-1],[-1,-1,1,1,1,1,1,-1,-1,-1,1,1,1,1,1,1,1,1,1,1,-1,-1,-1,1,1,1,1,1,1,-1,-1],[-1,-1,1,1,1,1,1,-1,-1,-1,-1,1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,1,1,1,1,1,-1,-1],[-1,1,1,1,1,1,1,-1,-1,-1,-1,-1,1,1,1,1,1,1,-1,-1,-1,-1,-1,1,1,1,1,1,1,1,-1],[-1,1,1,1,1,1,1,-1,-1,-1,-1,-1,-1,1,1,1,1,-1,-1,-1,-1,-1,-1,1,-1,-1,-1,-1,-1,1,-1],[-1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,-1,1,1,1,-1,1,-1],[-1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,-1,1,1,1,-1,1,-1],[-1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,-1,-1,-1,-1,-1,1,-1],[-1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,-1],[-1,1,1,-1,-1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,-1,-1,1,1,1,1,1,-1],[-1,1,1,-1,-1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,-1,-1,1,1,1,1,1,-1],[-1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,-1],[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],[0,0,0,0,0,0,0,6,0,6,0,0,0,6,0,0,0,0,19,16,0,18,0,0,0,0,0,0,0,0,0],[0,0,0,19,0,0,0,17,0,0,0,0,19,16,19,0,19,0,0,0,0,6,18,0,0,0,0,19,0,0,0],[0,0,0,0,6,0,0,6,19,0,18,0,0,0,0,17,0,0,6,0,0,0,0,0,16,0,0,0,19,0,0],[0,0,6,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,6,0,0,0,6,0,0,0,0,0,6],[0,0,0,0,0,18,0,0,0,0,19,19,0,0,0,0,0,0,0,19,17,0,0,0,18,19,0,19,0,0,0],[0,0,6,0,0,0,6,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0],[0,17,6,0,0,16,19,0,6,0,6,19,0,0,19,0,0,0,0,0,0,0,0,0,17,0,19,0,0,0,0],[0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0],[0,0,0,0,19,0,0,0,19,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,6,0,6,0],[0,17,0,0,6,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,19,0,0,0,6,0],[6,0,6,0,0,16,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,19,0,0,6,0,0,0,0,0,6,0,0,0,0,0,0,0,6,0,0,0,6,0,0,19,18,0,0],[0,0,0,18,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,17,0,19,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,6,6,0,0],[0,0,0,0,6,0,0,19,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,19,0,6,0,6,0,0,19],[0,0,6,0,6,0,17,18,0,0,0,0,0,0,18,0,6,0,0,16,0,0,19,0,6,0,6,0,0,0,0],[0,0,0,6,18,18,19,0,6,0,0,0,16,0,0,0,0,0,0,18,0,0,6,6,6,17,17,0,0,0,0],[0,0,0,0,6,18,0,0,0,0,0,19,17,19,0,0,19,0,0,0,0,0,18,0,19,18,6,0,0,0,0],[0,0,0,0,0,16,0,16,0,18,19,0,0,0,6,0,6,0,6,0,0,0,6,19,0,0,0,19,0,0,0],[0,0,16,0,0,0,6,6,0,0,0,6,0,0,0,0,0,6,17,0,0,6,19,6,17,6,0,0,6,0,0],[6,6,0,16,0,0,0,0,6,0,6,0,0,0,0,0,6,6,0,0,0,0,0,0,0,0,0,6,0,0,0]],[{"sprite":8,"column":4,"row":7},{"sprite":5,"column":1,"row":3},{"sprite":5,"column":1,"row":25},{"sprite":5,"column":8,"row":29},{"sprite":5,"column":8,"row":0},{"sprite":5,"column":16,"row":3},{"sprite":5,"column":16,"row":23},{"sprite":6,"column":13,"row":9},{"sprite":6,"column":13,"row":17},{"sprite":6,"column":14,"row":13},{"sprite":6,"column":17,"row":0},{"sprite":6,"column":17,"row":5},{"sprite":6,"column":17,"row":20},{"sprite":6,"column":17,"row":25},{"sprite":6,"column":9,"row":26},{"sprite":6,"column":2,"row":22},{"sprite":6,"column":2,"row":27},{"sprite":6,"column":2,"row":0},{"sprite":6,"column":2,"row":5},{"sprite":6,"column":9,"row":2},{"sprite":24,"column":7,"row":13},{"sprite":23,"column":12,"row":24},{"sprite":14,"column":7,"row":14}]];
vars.walkVelocity = 1;
vars.runVelocity = 2;
vars.fps = 1000 / 10;
vars.character = {
	direction: false,
	coordinates: {
		x: Math.floor(vars.blocksShown.x / 2),
		y: Math.floor(vars.blocksShown.y / 2)
	},
	oldCoordinates: {
		x: 0,
		y: 0
	},
	cycle: 0,
	cycleType: "walk",
	x: 481,
	y: 387,
	directionsOrder: ["down", "left", "up", "right", /* walk */ "down", "left", "up", "right" /* run */],
	walk: new Object(),
	run: new Object(),
};
vars.directions = new Object();
vars.animateMe = new Object();
vars.initMovementLoop = function() {
	if (typeof pendingTimeout != "undefined") return false;
	vars.movementLoop();
};
vars.updateMap = function() {
	if ((vars.character.oldCoordinates.x == vars.character.coordinates.x) && (vars.character.oldCoordinates.y == vars.character.coordinates.y)) return false;
	var halfBlocks = {
		x: Math.floor(vars.blocksShown.x / 2),
		y: Math.floor(vars.blocksShown.y / 2)
	};
	var visible = {
		minX: vars.character.coordinates.x - halfBlocks.x,
		maxX: vars.character.coordinates.x + halfBlocks.x,
		minY: vars.character.coordinates.y - halfBlocks.y,
		maxY: vars.character.coordinates.y + halfBlocks.y
	};
	var backgroundLayer = 0;
	var layer = vars.map[backgroundLayer];
	var canvasX = 0,
			canvasY = 0;
	for (var y = visible.minY; y < visible.maxY + 1; y++) {
		for (var x = visible.minX; x < visible.maxX + 1; x++) {
			var sprite = layer[y],
					spriteClass = "";
			if (sprite) sprite = sprite[x];
			if (sprite !== undefined) if (sprite != 0) spriteClass = " sprite" + sprite;
			$("#b" + canvasX + "-" + canvasY).attr("class", "block" + spriteClass);
			canvasX++;
		}
		canvasY++;
		canvasX = 0;
	}
	
	
	var currentLayer = 1;
	var layer = vars.map[currentLayer];
	var currentKey = 0;
	//add missing layer elements
	if (!vars.layerElementsLoaded) {
		for (var spriteKey in layer) {
			var sprite = layer[spriteKey];
			var newrow = (sprite.row - visible.minX),
					newcolumn = (sprite.column - visible.minY);
			var el = $('#layer' + currentLayer + '-' + currentKey);
			if (!el.length) {
				var block = {
					left: newrow * vars.blockWidth,
					top: newcolumn * vars.blockHeight
				};
				$("#layer" + currentLayer).append('<div id="layer' + currentLayer + '-' + currentKey + '" class="sprite' + sprite.sprite + '" style="position: absolute;top: ' + block.top + 'px;left: ' + block.left + 'px;"></div>');
			}
			currentKey++;
		}
		vars.layerElementsLoaded = true;
	}
	//move layer
	$("#layer" + currentLayer).animate({
		left: (halfBlocks.x - vars.character.coordinates.x) * vars.blockWidth,
		top: (halfBlocks.y - vars.character.coordinates.y) * vars.blockHeight
	}, vars.fps / 1.5);
};
vars.movementLoop = function() {
	if (typeof pendingTimeout != "undefined") return false;
	var animate = false;
	if (Object.keys(vars.animateMe).length) animate = true;
	if (!animate) return false;
	
	function callLoop() {
		if (typeof pendingTimeout == "undefined") {
			pendingTimeout = setTimeout("clearTimeout(pendingTimeout);pendingTimeout = undefined;vars.movementLoop();", vars.fps);
		}
		return function() {};
	}
	var directionPlusOrMinus = {
		right: 1,
		left: -1,
		up: -1,
		down: 1
	};
	var playersmoving = false;
	for (var userid in vars.animateMe) {
		playersmoving = true;
		var player, el;
		if (userid == "|me|") {
			player = vars.character;
			el = $("#player");
			player.oldCoordinates = {x: player.coordinates.x, y: player.coordinates.y};
		} else {
			player = vars.ccm.players[userid];
			el = $("#p" + userid);
		}
		var direction = player.direction;
		player.cycle++;
		if (player.cycle == 3) player.cycle = 0;
		var css = '';
		css += 'url(' + vars.spritesURL + ') ';
		css += (vars.character[player.cycleType][direction][player.cycle].x * -1) + 'px ';
		css += (vars.character[player.cycleType][direction][player.cycle].y * -1) + 'px';
		var nextX = player.coordinates.x + (vars[player.cycleType + "Velocity"] * directionPlusOrMinus[direction]),
				nextY = player.coordinates.y + (vars[player.cycleType + "Velocity"] * directionPlusOrMinus[direction]),
				cachedCoordinates = {x: player.coordinates.x, y: player.coordinates.y};
		if (direction == "right" || direction == "left") {
			player.coordinates.x = nextX;
			player.x = nextX;
		}
		if (direction == "up" || direction == "down") {
			player.coordinates.y = nextY;
			player.y = nextY;
		}
		if (vars.map[0][player.coordinates.y] && vars.map[0][player.coordinates.y][player.coordinates.x] != undefined && vars.map[0][player.coordinates.y][player.coordinates.x] < 0) {
			//negative values on the map stop movements
			player.coordinates = {
				x: cachedCoordinates.x,
				y: cachedCoordinates.y
			};
			player.x = cachedCoordinates.x;
			player.y = cachedCoordinates.y;
		}
		el.css("background", css);
		if (userid != "|me|") vars.ccm.updateCoordinates(player);
	}
	if (playersmoving) callLoop = callLoop();
	vars.updateMap();
};
for (var step = 0; step < 24; step++) {
	var walkOrRunStep = "walk";
	if (step > 11) walkOrRunStep = "run";
	var direction = vars.character.directionsOrder[Math.floor(step / 3)];
	if (Math.floor(step / 3) == step / 3) vars.character[walkOrRunStep][direction] = new Array();
	var currentX = vars.character.x + (vars.blockWidth * step);
	var currentY = vars.character.y;
	vars.character[walkOrRunStep][direction].push({
		x: currentX,
		y: currentY
	});
}
//functions
vars.gameControls = function(event) {
	if (event.substr(0, 7) == "keydown" && vars.character.walk[event.substr(7)]) {
		//if it exists that means it is a direction
		var direction = event.substr(7);
		vars.character.direction = direction;
		vars.directions[direction] = true;
		vars.animateMe["|me|"] = true;
		vars.initMovementLoop();
		
		
		if (vars.sentDirection != direction) {
			vars.sentDirection = direction;
			client.send('/u m|' + direction);
		}
	}
	if (event.substr(0, 5) == "keyup" && vars.character.walk[event.substr(5)]) {
		var direction = event.substr(5);
		delete vars.directions[direction];
		if (Object.keys(vars.directions).length == 0) vars.character.direction = false;
		
		if (vars.sentDirection == direction) {
			delete vars.animateMe["|me|"];
			vars.sentDirection = "";
			client.send('/u m||' + vars.character.coordinates.x + "|" + vars.character.coordinates.y);
		}
	}
};
$(function() {
	var insides = '';
	insides += '<div id="canvasContainer">';
	insides += '<div class="relative" style="overflow: hidden;">';
	insides += '<div id="canvas" class="canvas"></div>';
	insides += '<div id="layer1" class="canvas"></div>';
	insides += '</div>';
	insides += '</div>';
	$('body').append(insides);
	$("body").append('<style>#canvas .block {width: ' + vars.blockWidth + 'px;height: ' + vars.blockHeight + 'px;}</style>');
	$("#canvasContainer").css({
		width: vars.blockWidth * vars.blocksShown.x,
		height: vars.blockHeight * vars.blocksShown.y
	});
	for (var y = 0; y < vars.blocksShown.y; y++) for (var x = 0; x < vars.blocksShown.x; x++) $("#canvas").append('<div id="b' + x + '-' + y + '" class="block"></div>');
	var characterCoordinates = $("#b" + vars.character.coordinates.x + "-" + vars.character.coordinates.y);
	$("body").append('<div id="player" class="player" style="background: url(' + vars.spritesURL + ') ' + (vars.character.x * -1) + 'px ' + (vars.character.y * -1) + 'px;width: ' + vars.blockWidth + 'px;height: ' + vars.blockHeight + 'px;top: ' + characterCoordinates.position().top + 'px;left: ' + characterCoordinates.position().left + 'px;"></div>');
	vars.updateMap();
	function screenResize() {
		var canvas = $("#canvasContainer"),
				body = $("body");
		var spaceAvailable = body.height() - canvas.height();
		var percentZoom = spaceAvailable / canvas.height() * 100;
		$("body").css("zoom", 100 + percentZoom + "%");
	}
	screenResize();
	
	$(document).keydown(function(e) {
		var keys = {
			37: "left",
			38: "up",
			39: "right",
			40: "down"
		};
		var key = keys[e.keyCode];
		if (key && search.username) vars.gameControls("keydown" + key);
	}).keyup(function(e) {
		var keys = {
			37: "left",
			38: "up",
			39: "right",
			40: "down"
		};
		var key = keys[e.keyCode];
		if (key && search.username) vars.gameControls("keyup" + key);
	});
})