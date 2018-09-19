var bombs;
var mouseTouchDown = false;

var config = {
    type: Phaser.AUTO,
    width: 1400,
    height: 700,
	//width: 1920,
    //height: 1080,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1500 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var speed=300;
var jumpheight=800;

function preload ()
{
	this.load.image('sky', 'assets/sky.png');
	this.load.image('platform', 'assets/platform.png');
	this.load.image('platformshort', 'assets/platformshort.png');
	this.load.image('ground', 'assets/ground.png');
	this.load.image('bomb', 'assets/bomb.png');
	this.load.spritesheet('king', 'assets/king.png',
		{ frameWidth: 20, frameHeight: 24 }
	);
	this.load.spritesheet('link', 'assets/link.png',
		{ frameWidth: 20, frameHeight: 24 }
	);
}

function create ()
{
  //  A simple backplatform for our game
  this.add.image(700, 350, 'sky');

//  The platforms group contains the platform and the 2 ledges we can jump on
  platforms = this.physics.add.staticGroup();

  //  Here we create the platform.
  //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(700, (700-30), 'ground').setScale(2).refreshBody();

  //  Now let's create some ledges
    platforms.create(600, 400, 'platform');
    platforms.create(50, 250, 'platform');
    platforms.create(750, 220, 'platformshort');
	  platforms.create(1000, 500, 'platform');


  // The player and its settings
    player = this.physics.add.sprite(100, 450, 'king');
    player2 = this.physics.add.sprite(400, 450, 'link');
	player.setScale(2);
	player2.setScale(2);

  //  Player physics properties. Give the little guy a slight bounce
player.setBounce(0.2);
player.setCollideWorldBounds(true);

player2.setBounce(0.2);
player2.setCollideWorldBounds(true);

//  Our player animations, turning, walking left and walking right.
this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('king', { start: 1, end: 4 }),
    frameRate: 10,
    repeat: -1
});

this.anims.create({
    key: 'turn',
    frames: [ { key: 'king', frame: 0 } ],
    frameRate: 10
});

this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('king', { start: 1, end: 4 }),
    frameRate: 10,
    repeat: -1
});

// Player 2 animations
this.anims.create({
    key: 'A',
    frames: this.anims.generateFrameNumbers('link', { start: 1, end: 4 }),
    frameRate: 10,
    repeat: -1
});

this.anims.create({
    key: 'turn2',
    frames: [ { key: 'link', frame: 0 } ],
    frameRate: 10
});

this.anims.create({
    key: 'D',
    frames: this.anims.generateFrameNumbers('link', { start: 1, end: 4 }),
    frameRate: 10,
    repeat: -1
});

//Makes sure the player doesn't fall through the platforms
this.physics.add.collider(player, platforms);
this.physics.add.collider(player2, platforms);

//  Input Events

cursors = this.input.keyboard.createCursorKeys();

this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

/*if (leftButton.isDown) {
  player2.setVelocityX(-160);
  player2.anims.play('left');
}
else if (rightButton.isDown) {
  player2.setVelocityX(160);
  player2.anims.play('right');
}
else {
  player2.setVelocityX(0);
  player2.anims.play('turn');
}*/
/*bombs = this.physics.add.group();
bombs.enableBody = true;
bombs.physicsBodyType = Phaser.Physics.ARCADE;
bombs.createMultiple(20, 'bomb');

bombs.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', resetLaser);
bombs.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
bombs.setAll('checkWorldBounds', true);*/



}

/*function resetLaser(bomb) {
	// Destroy the laser
	bomb.kill();
}*/

function update ()
{
  if (this.keyA.isDown) {
    player2.setVelocityX(-160);

    player2.anims.play('A', true);
 }
 else if (this.keyD.isDown)
 {
     player2.setVelocityX(160);

     player2.anims.play('D', true);
 }
 else
 {
     player2.setVelocityX(0);

     player2.anims.play('turn2');
 }

  if (cursors.left.isDown)
{
    player.setVelocityX(speed*(-1));

    player.anims.play('left', true);
}
else if (cursors.right.isDown)
{
    player.setVelocityX(speed);

    player.anims.play('right', true);
}
else
{
    player.setVelocityX(0);

    player.anims.play('turn');
}

if (cursors.up.isDown && player.body.touching.down)
{
    player.setVelocityY(jumpheight*(-1));
}

if (this.keyW.isDown && player2.body.touching.down) {
    player2.setVelocityY(-1000);
}

//bomber

/*if (game.input.activePointer.isDown) {
		// We'll manually keep track if the pointer wasn't already down
		if (!mouseTouchDown) {
			touchDown();
		}
	} else {
		if (mouseTouchDown) {
			touchUp();
		}
	}*/

}

/*function touchDown() {
	// Set touchDown to true, so we only trigger this once
	mouseTouchDown = true;
	fireLaser();
}

function touchUp() {
	// Set touchDown to false, so we can trigger touchDown on the next click
	mouseTouchDown = false;
}

function fireLaser() {
	// Get the first laser that's inactive, by passing 'false' as a parameter
	var bomb = bombs.getFirstExists(false);
	if (bomb) {
		// If we have a laser, set it to the starting position
		bomb.reset(400, 300 - 20);
		// Give it a velocity of -500 so it starts shooting
		bomb.body.velocity.y = -500;
	}

}
}*/
