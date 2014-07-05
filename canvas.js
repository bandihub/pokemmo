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
vars.battling = function() {
	var battling = false;
	for (var roomid in client.rooms) if (client.rooms[roomid].battling) return true;
	return battling;
};
vars.rates = {
	encounterRate: [1.25, 3.33, 6.75, 8.5, 10],
};
vars.me = {
	team: new Array(),
	//inside team {"pokemonid": {exp: 100, nextLevelExp: 1000, leve: 99, //the rest of it is normal}}
	expDivision: new Object(),
	encounteredMon: false,
	money: 0,
};
//assign team if new game or don't have team or w/e
//for right now give them a random pokemon to run around with
assignMon = function() {
	var pokemonKeys = Object.keys(BattlePokedex);
	var randomMon = Math.floor(Math.random() * pokemonKeys.length);
	var pokemon = BattlePokedex[pokemonKeys[randomMon]];
	var starterLevel = 5,
		ability = Math.floor(Math.random() * Object.keys(pokemon.abilities).length),
		moves = new Array(),
		hasMove = new Object(),
		hasAttackingMove = false,
		learnset = BattleLearnsets[toId(pokemon.species)].learnset;
	var learnsetKeys = Object.keys(learnset);
	while(moves.length < 4) {
		var ranMove = Math.floor(Math.random() * learnsetKeys.length);
		var move = BattleMovedex[learnsetKeys[ranMove]];
		if (!hasMove[move]) {
			if (move.length == 3 && move.category == "Status" && !hasAttackingMove) {} else {
				moves.push(move.name);
				hasMove[move.name] = true;
				if (move.category != "Status") hasAttackingMove = true;
			}
		}
	}
	var shinyRate = 1 / 1000;
	var team = [{
		species: pokemon.species,
		nature: "Serious",
		ability: pokemon.abilities[Object.keys(pokemon.abilities)[ability]],
		level: starterLevel,
		moves: moves,
		shiny: ((chance(shinyRate * 100)) ? true : false),
		exp: 0,
		nextLevelExp: 50,
	}];
	vars.me.team = team;
}();
vars.grassSpriteValue = {"32": true, "29": true};
vars.me.gainExp = function() {
	var numMons = Object.keys(vars.me.expDivision).length,
		expGain = 100;
	expGain = expGain / numMons;
	for (var monKey in vars.me.expDivision) {
		var mon = vars.me.team[monKey];
		mon.exp += expGain;
		if (mon.exp > mon.nextLevelExp) {
			mon.exp = mon.exp - mon.nextLevelExp;
			mon.nextLevelExp += 50;
			mon.level += 1;
			if (mon.level > 100) {
				mon.level = 100;
				mon.exp = 0;
				mon.nextLevelExp = 0;
			}
			alert("Your pokemon just leveled up to level " + mon.level);
		}
	}
	vars.me.expDivison = new Object();
	vars.me.encounteredMon = false;
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
			insides += 'width: ' + vars.blockWidth + 'px;';
			insides += 'height: ' + vars.blockHeight + 'px;';
			insides += '">';
			insides += '<div class="p" style="';
			insides += 'background: url(' + vars.spritesURL + ') ' + (vars.character.x * -1) + 'px ' + (vars.character.y * -1) + 'px;';
			insides += 'width: ' + vars.character.width + 'px;';
			insides += 'height: ' + vars.character.height + 'px;';
			insides += '">';
			insides += '</div>';
			insides += '<span class="nametag">' + userid + '</span>';
			insides += '</div>';
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
//vars.encounterMons should be loaded with the new maps aswell as a sort of grass patch map so we know what spots will be the places we can encounter wild pokemon
vars.minEncounterMonLevel = 1;
vars.map = [[[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],[-1,1,1,32,1,1,1,1,32,1,1,1,32,32,32,32,32,32,1,32,1,1,1,1,1,1,1,1,1,1,-1],[-1,32,1,-1,-1,1,32,1,1,1,1,32,32,32,32,32,32,32,32,1,1,1,32,1,1,-1,-1,1,1,1,-1],[-1,32,32,-1,-1,1,1,1,1,1,32,32,32,32,32,32,32,32,32,32,1,32,1,1,1,-1,-1,1,1,32,-1],[-1,32,32,32,32,1,1,1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,1,1,1,1,1,1,1,1,1,-1],[-1,1,32,1,1,1,32,1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,1,1,1,1,1,1,1,1,-1],[-1,1,1,1,1,1,1,-1,-1,-1,-1,1,1,1,1,1,1,1,1,1,-1,-1,-1,1,1,32,1,1,1,1,-1],[-1,1,1,1,32,1,1,-1,-1,-1,1,1,1,1,-1,-1,1,1,1,1,-1,-1,-1,32,1,1,1,1,1,1,-1],[-1,1,1,1,1,1,1,-1,-1,-1,1,1,1,1,-1,-1,1,1,1,1,-1,-1,-1,32,32,1,1,1,32,1,-1],[-1,-1,32,1,1,1,1,-1,-1,-1,1,1,1,1,1,1,1,1,1,1,-1,-1,-1,32,32,32,32,1,1,-1,-1],[-1,-1,32,32,1,1,1,-1,-1,-1,-1,1,1,1,1,1,1,1,1,-1,-1,-1,-1,32,32,32,32,1,1,-1,-1],[-1,1,32,32,32,32,1,-1,-1,-1,-1,-1,1,1,1,1,1,1,-1,-1,-1,-1,-1,32,32,32,32,32,1,32,32],[-1,1,32,32,32,32,1,-1,-1,-1,-1,-1,-1,1,1,1,1,-1,-1,-1,-1,-1,-1,32,-1,-1,-1,-1,-1,32,-1],[-1,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,-1,1,1,1,-1,32,-1],[-1,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,1,32,-1,1,1,1,-1,32,-1],[-1,1,1,1,32,1,1,1,1,32,32,32,32,1,32,1,1,32,32,32,32,1,1,32,32,-1,-1,-1,-1,32,-1],[-1,1,1,1,1,1,1,1,1,32,32,32,1,1,1,1,1,32,32,32,1,32,1,1,32,32,32,32,32,32,-1],[-1,1,1,-1,-1,1,1,1,1,32,32,1,1,1,1,32,1,1,32,32,1,1,1,-1,-1,1,1,1,1,1,-1],[-1,1,1,-1,-1,1,1,32,1,32,1,1,1,32,1,1,1,32,1,32,1,1,1,-1,-1,1,1,32,1,1,-1],[-1,32,1,1,1,1,1,1,1,32,1,32,1,1,1,32,1,1,1,32,1,1,32,1,1,1,1,1,1,1,-1],[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],[0,0,0,0,0,0,0,6,0,6,0,0,0,6,0,0,0,0,19,16,0,18,0,0,0,0,0,0,0,0,0],[0,0,0,19,0,0,0,17,0,0,0,0,19,16,19,0,19,0,0,0,0,6,18,0,0,0,0,19,0,0,0],[0,0,0,0,6,0,0,6,19,0,18,0,0,0,0,17,0,0,6,0,0,0,0,0,16,0,0,0,19,0,0],[0,0,6,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,6,0,0,0,6,0,0,0,0,0,6],[0,0,0,0,0,18,0,0,0,0,19,19,0,0,0,0,0,0,0,19,17,0,0,0,18,19,0,19,0,0,0],[0,0,6,0,0,0,6,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0],[0,17,6,0,0,16,19,0,6,0,6,19,0,0,19,0,0,0,0,0,0,0,0,0,17,0,19,0,0,0,0],[0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0],[0,0,0,0,19,0,0,0,19,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,6,0,6,0],[0,17,0,0,6,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,19,0,0,0,6,0],[6,0,6,0,0,16,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,19,0,0,6,0,0,0,0,0,6,0,0,0,0,0,0,0,6,0,0,0,6,0,0,19,18,0,0],[0,0,0,18,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,17,0,19,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,6,6,0,0],[0,0,0,0,6,0,0,19,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,19,0,6,0,6,0,0,19],[0,0,6,0,6,0,17,18,0,0,0,0,0,0,18,0,6,0,0,16,0,0,19,0,6,0,6,0,0,0,0],[0,0,0,6,18,18,19,0,6,0,0,0,16,0,0,0,0,0,0,18,0,0,6,6,6,17,17,0,0,0,0],[0,0,0,0,6,18,0,0,0,0,0,19,17,19,0,0,19,0,0,0,0,0,18,0,19,18,6,0,0,0,0],[0,0,0,0,0,16,0,16,0,18,19,0,0,0,6,0,6,0,6,0,0,0,6,19,0,0,0,19,0,0,0],[0,0,16,0,0,0,6,6,0,0,0,6,0,0,0,0,0,6,17,0,0,6,19,6,17,6,0,0,6,0,0],[6,6,0,16,0,0,0,0,6,0,6,0,0,0,0,0,6,6,0,0,0,0,0,0,0,0,0,6,0,0,0]],[{"sprite":8,"column":4,"row":7},{"sprite":5,"column":2,"row":25},{"sprite":5,"column":2,"row":3},{"sprite":5,"column":17,"row":23},{"sprite":5,"column":17,"row":3},{"sprite":5,"column":8,"row":29},{"sprite":5,"column":8,"row":0},{"sprite":23,"column":12,"row":24},{"sprite":24,"column":7,"row":13},{"sprite":14,"column":7,"row":14}]];
vars.encounterMons = {
	"swalot": 0,
	"rattata": 1,
	"magikarp": 2,
	"pikachu": 3,
	"bidoof": 4,
};
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
	width: 14,
	height: 19,
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
		var player, sprite, container;
		if (userid == "|me|") {
			player = vars.character;
			sprite = $("#player .p"), container = $("#player");
			player.oldCoordinates = {x: player.coordinates.x, y: player.coordinates.y};
		} else {
			player = vars.ccm.players[userid];
			sprite = $("#p" + userid + " .p"), container = $("#p" + userid);
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
		var backgroundSpriteValue, moved;
		if (vars.map[0][player.coordinates.y] && vars.map[0][player.coordinates.y][player.coordinates.x] != undefined) backgroundSpriteValue = vars.map[0][player.coordinates.y][player.coordinates.x];
		if (backgroundSpriteValue < 0) {
			//negative values on the map stop movements
			player.coordinates = {
				x: cachedCoordinates.x,
				y: cachedCoordinates.y
			};
			player.x = cachedCoordinates.x;
			player.y = cachedCoordinates.y;
		}
		else {
				//if we have changed our coordinates and we're on a place where pokemon is encounterable
				moved = true;
				function encounterMon() {
					for (var monId in vars.encounterMons) {
						var monEncounterRank = vars.encounterMons[monId];
						var probability = vars.rates.encounterRate[monEncounterRank] / 187.5;
						probability = probability * 100;
						if (chance(probability)) {
							//set our own team
							client.send('/utm ' + Tools.packTeam(vars.me.team));
							//send the server the pokemon we've encountered
							client.send('/e ' + monId + "|" + vars.minEncounterMonLevel);
							//on server create pokemon based on the monId
							//on server do Rooms.global.startBattle(VS BOOTY BOT and set her team as monId pokemon we created)
							vars.me.encounteredMon = monId;
						}
					}
				}
				if (!vars.me.encounteredMon && !vars.battling() && vars.grassSpriteValue[backgroundSpriteValue] && moved) encounterMon();
			}
		sprite.css("background", css);
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
	var playerInsides = '';
		playerInsides += '<div id="player" class="player" style="';
		playerInsides += 'left: ' + characterCoordinates.position().left + 'px;';
		playerInsides += 'top: ' + characterCoordinates.position().top + 'px;';
		playerInsides += 'width: ' + vars.blockWidth + 'px;';
		playerInsides += 'height: ' + vars.blockHeight + 'px;';
		playerInsides += '">';
		playerInsides += '<div class="p" style="';
		playerInsides += 'background: url(' + vars.spritesURL + ') ' + (vars.character.x * -1) + 'px ' + (vars.character.y * -1) + 'px;';
		playerInsides += 'width: ' + vars.character.width + 'px;';
		playerInsides += 'height: ' + vars.character.height + 'px;';
		playerInsides += '">';
		playerInsides += '</div>';
		playerInsides += '<span class="nametag"><font color=red>ME</font></span>';
		playerInsides += '</div>';
	$("body").append(playerInsides);

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
		if (key && search.username && !vars.battling()) vars.gameControls("keydown" + key);
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
function chance(percent) {
	var random = Math.floor(Math.random() * 100) + 1;
	if (random > percent) return false;
	return true;
}