var bombs;
var mouseTouchDown = false;

var config = {
    type: Phaser.WEBGL,
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
var player1HP=100, player2HP =100;
var bullets;
var firedBullet;
var lastFired = 0

function preload ()
{
	this.load.image('sky', 'assets/sky.png');
	this.load.image('gun', 'assets/gun.png');
    this.load.image('bullet', 'assets/bullet1.png');
	this.load.image('platform', 'assets/platform.png');
	this.load.image('platformshort', 'assets/platformshort.png');
	this.load.image('ground', 'assets/ground.png');
	this.load.image('bomb', 'assets/bomb.png');
	this.load.image('health', 'assets/health.png');
	this.load.spritesheet('king', 'assets/king.png',
		{ frameWidth: 20, frameHeight: 24 }
	);
	this.load.spritesheet('link', 'assets/link.png',
		{ frameWidth: 20, frameHeight: 24 }
	);
}

function create ()
{
  //  A simple backplatform for our game	(Math.round(Math.random() * 1400-20)+10)
	this.add.image(700, 350, 'sky');

//  The platforms group contains the platform and the 2 ledges we can jump on
	platforms = this.physics.add.staticGroup();

  //  Here we create the ground
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

	//The gun and its settings
	gun = this.add.sprite(player.x, player.y, 'gun');
	gun2 = this.add.sprite(player2.x, player2.y, 'gun');
	gun.setScale(1.5);
	gun2.setScale(1.5);

  //  Player physics properties. Give the little guy a slight bounce
	player.setBounce(0.2);
	player.setCollideWorldBounds(true);

	player2.setBounce(0.2);
	player2.setCollideWorldBounds(true);

	//Adding helath info textsHP:'+player1HP+'/120
	player2HPinfo = this.add.text(16, 16, 'HP:'+player2HP+'/120', { fontSize: '32px', fill: '#1f7c25' });//
	player1HPinfo = this.add.text(1180, 16, 'HP:'+player1HP+'/120', { fontSize: '32px', fill: '#5729a0' });

	healthPickup = this.physics.add.image((Math.round(Math.random() * 1400-20)+10), -50, 'health');
	healthPickup.setMaxVelocity(0, 40)//makes it fall slower
	
	//
	this.physics.add.overlap(player, healthPickup, player1HPpickup, null, this);
	this.physics.add.overlap(player2, healthPickup, player2HPpickup, null, this);

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
	this.physics.add.collider(healthPickup, platforms);

	//  Input Events

	cursors = this.input.keyboard.createCursorKeys();

	this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
	this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
	this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
	this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

	//Bullet
	var Bullet = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

        function Bullet (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
			this.speed = Phaser.Math.GetSpeed(400, 1);
        },

        fire: function (x, y)
        {
			this.setPosition(x, y);		
            this.setActive(true);
			this.setVisible(true);
        },

        update: function (time, delta)
        {
			this.x += this.speed * delta;		
			if(this.x < 0)
			{
				this.setActive(false);
				this.setVisible(false);
			}
			
			if (this.x > 1400)
			{
				this.setActive(false);
				this.setVisible(false);
			}
        }

    });

    bullets = this.add.group({
        classType: Bullet,
        maxSize: 30,
        runChildUpdate: true
	});
}

function update (time, delta)
	{
	if (this.keyA.isDown) {
    player2.setVelocityX(speed*(-1));
    player2.anims.play('A', true);
	player2.flipX=true;
	gun2.flipX=true;
	gun2.setPosition(player2.x - 23, player2.y + 5);
	}
	else if (this.keyD.isDown)
	{
    player2.setVelocityX(speed);
    player2.anims.play('D', true);
	player2.flipX=false;
	gun2.flipX = false;
	gun2.setPosition(player2.x + 23, player2.y + 5);
	}
	else
	{
    player2.setVelocityX(0);
	player2.anims.play('turn2');
	gun2.setPosition(player2.x + 23, player2.y + 5);
	}
	if (this.keyW.isDown && player2.body.touching.down) 
	{
    player2.setVelocityY(jumpheight*(-1));
	}

	if (cursors.left.isDown)
	{
    player.setVelocityX(speed*(-1));
    player.anims.play('left', true);
	player.flipX=true;
	gun.flipX=true;	
	gun.setPosition(player.x - 23, player.y + 5);
	}
	else if (cursors.right.isDown)
	{
    player.setVelocityX(speed);
    player.anims.play('right', true);
	player.flipX=false;
	gun.flipX = false;
	gun.setPosition(player.x + 23, player.y + 5);
	}
	else
	{
    player.setVelocityX(0);
	player.anims.play('turn');
	gun.setPosition(player.x + 23, player.y + 5);
	}
	if (cursors.up.isDown && player.body.touching.down)
	{
    player.setVelocityY(jumpheight*(-1));
	}

	//Fire bullet
	if (cursors.down.isDown && time > lastFired)
	{
		firedBullet = bullets.get();
		if (firedBullet)
		{
			firedBullet.fire(player.x + 30, player.y);
			lastFired = time + 500;
		}
	}
	if (this.keyS.isDown && time > lastFired)
	{
		firedBullet = bullets.get();
		if (firedBullet)
		{
			firedBullet.fire(player2.x + 30, player2.y);
			lastFired = time + 500;
		}
	}
}

function hp(change, plr)
{
	if(plr==1)
	{
		player1HP+=change;
		if(player1HP>120)
		{
			player1HP-=(player1HP%120)
		}
	}
	else if (plr==2)
	{
		player2HP+=change;
		if(player2HP>120)
		{
			player2HP-=(player2HP%120)
		}
	}
	else
	{
		return (-1);
	}
	return 0;
}

function player1HPpickup()
{
	hp(20, 1);
	player1HPinfo.setText('HP:'+player1HP+'/120');
	HPpickupRespawn();
}

function player2HPpickup()
{
	hp(20, 2);
	player2HPinfo.setText('HP:'+player2HP+'/120');
	HPpickupRespawn();
}

function HPpickupRespawn()
{
	healthPickup.setPosition((Math.round(Math.random() * 1400-20)+10), -150);
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
