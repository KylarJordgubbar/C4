var bombs;
var mouseTouchDown = false;
var dKey;

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
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

function preload ()
{
   this.load.image('sky', 'assets/sky.png');
   this.load.image('ground', 'assets/platform.png');
   this.load.image('bomb', 'assets/bomb.png');
   this.load.spritesheet('dude', 'assets/dude.png',
       { frameWidth: 32, frameHeight: 48 }
   );
}

function create ()
{
  //  A simple background for our game
  this.add.image(400, 300, 'sky');

//  The platforms group contains the ground and the 2 ledges we can jump on
  platforms = this.physics.add.staticGroup();

  //  Here we create the ground.
  //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

  //  Now let's create some ledges
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');



  // The player and its settings
    player = this.physics.add.sprite(100, 450, 'dude');
    player2 = this.physics.add.sprite(400, 450, 'dude');

  //  Player physics properties. Give the little guy a slight bounce
player.setBounce(0.2);
player.setCollideWorldBounds(true);

player2.setBounce(0.2);
player2.setCollideWorldBounds(true);

//  Our player animations, turning, walking left and walking right.
this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
});

this.anims.create({
    key: 'turn',
    frames: [ { key: 'dude', frame: 4 } ],
    frameRate: 20
});

this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
});

//Makes sure the player doesn't fall through the platforms
this.physics.add.collider(player, platforms);
this.physics.add.collider(player2, platforms);

//  Input Events

cursors = this.input.keyboard.createCursorKeys();
dKey = this.Input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

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
  if (cursors.left.isDown)
{
    player.setVelocityX(-160);

    player.anims.play('left', true);
}
else if (cursors.right.isDown)
{
    player.setVelocityX(160);

    player.anims.play('right', true);
}
else
{
    player.setVelocityX(0);

    player.anims.play('turn');
}

if (cursors.up.isDown && player.body.touching.down)
{
    player.setVelocityY(-330);
}
if (dKey.isDown) {
  player2.setVelocityX(160);

  player.anims.play('right', true);
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
