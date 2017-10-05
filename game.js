var game = new Phaser.Game(240, 160, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload () {
	game.load.baseURL = 'assets/';

	// Preload splash and area
	game.load.spritesheet('splash','splash.png',240,160);
	game.load.image('garden');
	game.load.image('statbar');

	// Preload all chao animations
	game.load.spritesheet('chao','chao.png',25,25);
	game.load.spritesheet('emball','emoteball.png',8,15);

	// Preload other assets
	game.load.spritesheet('ring','ring.png',14,14);
	game.load.spritesheet('numbers','numbers.png',7,7);
}

var objGroup;
var actions = ['idle','left','right','up','down','sit','think'];
var ballflip = {right: true, up: true};
var ballanim = {think: 'question'};
var timer;

var splash;
function create () {
	// scale the game 4x
	game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;  
	game.scale.setUserScale(4, 4);

	// enable crisp rendering
	game.renderer.renderSession.roundPixels = true;
	Phaser.Canvas.setImageRenderingCrisp(game.canvas);

	// draw splash screen
	splash = game.add.sprite(0, 0, 'splash');
	splash.animations.add('flash', [0,1], 2, true);
	splash.animations.play('flash');

	game.input.maxPointers = 1;
}

function setUp() {
	// start the physics
	game.physics.startSystem(Phaser.Physics.ARCADE);

	// build the garden
	game.add.image(176, 0, 'statbar');
	var garden = game.add.image(0, 0, 'garden');
	garden.anchor.setTo(0, 0);
	game.physics.arcade.setBounds(0, 20, garden.right, garden.bottom-20);

	// ready the game timer to handle events
	timer = game.time.create(false);

	// spawn chao
	objGroup = game.add.group();

	spawnChao(game.world.width / 2, game.world.height / 2)
	spawnChao(game.world.width / 3, game.world.height / 2)
	spawnChao(game.world.width*2 / 3, game.world.height / 2)

	//start the game timer
	timer.start();

	splash.kill();
}

function spawnChao(x,y) {
	var chao = game.add.sprite(x, y, 'chao');
	objGroup.add(chao);
	
	chao.anchor.setTo(0.5, 1);

	chao.animations.add('idle',[0]);
	chao.animations.add('sit',[1]);
	chao.animations.add('think',[2]);

	chao.animations.add('down', [3,4,5,4],     3, true);
	chao.animations.add('right',[6,7,8,7],     3, true);
	chao.animations.add('up',   [9,10,11,10],  3, true);
	chao.animations.add('left', [12,13,14,13], 3, true);

	game.physics.arcade.enable(chao);
	chao.body.collideWorldBounds = true;
	chao.body.setSize(19,10,3,15);

	var emball = game.add.sprite(5, -25, 'emball');
	chao.addChild(emball);

	emball.anchor.setTo(0.5, 1);

	emball.animations.add('normal',[0]);
	emball.animations.add('excite',[1]);
	emball.animations.add('question',[2]);
	emball.animations.add('love',[3]);

	chao.emball = emball;

	chao.data.action = 'nil';
	think(chao);
}

function update() {
	var cursor = game.input.activePointer;
	if(splash.alive) {
		if(cursor.isDown) { setUp(); }
		return;
	}

	game.physics.arcade.collide(objGroup, objGroup);

	objGroup.forEach(move,null,true);
	objGroup.sort('y', Phaser.Group.SORT_ASCENDING);
}

function move(chao) {
	chao.body.velocity.x = 0;
	chao.body.velocity.y = 0;
	
	switch(chao.data.action) {
	case 'left':
		//  Move to the left
		chao.body.velocity.x = -10;
		break;

	case 'right':
		//  Move to the right
		chao.body.velocity.x = 10;
		break;

	case 'up':
		//  Move up
		chao.body.velocity.y = -10;
		break;

	case 'down':
		//  Move down
		chao.body.velocity.y = 10;
		break;
	}
}

function think(chao) {
	chao.scale.x = 1;
	chao.emball.x = 5;
	
	if(chao.data.action != 'idle') {
		chao.data.action = 'idle';
		console.log("returning to idle");
	} else {
		var index = Math.floor(Math.random() * actions.length);
		chao.data.action = actions[index];
		console.log(chao.data.action);
	}
	chao.animations.play(chao.data.action);
	
	if(ballflip[chao.data.action]) {
		chao.emball.x = -5;
	}
	if(ballanim[chao.data.action]) {
		chao.emball.animations.play(ballanim[chao.data.action]);
	} else {
		chao.emball.animations.play('normal');
	}

	var delay = Math.random()*3000 + 1000;
	timer.add(delay,think,null,chao);
}