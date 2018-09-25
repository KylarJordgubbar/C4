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
var lastFired = 0;
var wepon1=["pistol", "katana"];
var wepon2=wepon1;

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
	this.load.spritesheet('katana', 'assets/katana.png',
		{ frameWidth: 26, frameHeight: 26 }
	);
	this.load.spritesheet('king', 'assets/king.png',
		{ frameWidth: 20, frameHeight: 24 }
	);
	this.load.spritesheet('link', 'assets/link.png',
		{ frameWidth: 20, frameHeight: 24 }
	);

	this.load.audio('music', 'assets/backgroundSound.mp3');
}

function create ()
{
  //  A simple backplatform for our game	(Math.round(Math.random() * 1400-20)+10)
	this.add.image(700, 350, 'sky');

// A soundtrack which load with the game and plays repeatedly
	let soundSample = this.sound.add('music');
	soundSample.loop = true;
	soundSample.play();

//  The platforms group contains the platform and the 2 ledges we can jump on
	platforms = this.physics.add.staticGroup();

  //  Here we create the ground
    platforms.create(700, (700-30), 'ground').setScale(2).refreshBody();

  //  Now let's create some ledges
    platforms.create(600, 400, 'platform').refreshBody();
    platforms.create(50, 250, 'platform');
    platforms.create(750, 220, 'platformshort');
	platforms.create(1000, 500, 'platform');

	//rotatingPlatform = this.physics.add.image(500, 100, 'health');

  // The player and its settings
    player = this.physics.add.sprite(1300, 450, 'king');
    player2 = this.physics.add.sprite(100, 450, 'link');
	player.setScale(2);
	player2.setScale(2);

	//The gun and its settings
	gun = this.add.sprite(player.x, player.y, 'gun');
	gun2 = this.add.sprite(player2.x, player2.y, 'gun');
	gun.setScale(1.5);
	gun2.setScale(1.5);
	 
	gun.setVisible(1);
	gun2.setVisible(1);

	//the katana 
	katana1 = this.add.sprite(player.x, player.y, 'katana').setScale(1.5);
	katana2 = this.add.sprite(player2.x, player2.y, 'katana').setScale(1.5);

	katana1.setVisible(0);
	katana2.setVisible(0);

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

	//katana animation
	var sa = { key: 'katana', frame: 1 };
	this.anims.create({
		key: 'strike',
		frames: [ sa, sa, sa, sa, sa, sa, sa, sa, sa, sa, sa, sa, sa, sa, sa, sa, sa, sa, sa, sa, sa, { key: 'katana', frame: 0 }  ],
		//frameRate: 1,
		duration: 1500
		//nextTick: 10
	});

	//makes sure he starts facing the correct way
	player.flipX=1;
	gun.flipX=1;

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
	this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
	this.keySpacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

	//Bullet
	var Bullet = new Phaser.Class({

        //Extends: Phaser.GameObjects.Image,
		Extends: Phaser.Physics.Arcade.Image, 

        initialize:

        function Bullet (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
			this.speed = Phaser.Math.GetSpeed(400, 1);
			this.damage = 10;
        },

        fire: function (x, y, direction)//direction is +1 for right and -1 for left	
        {
			this.setPosition(x, y);	
            this.setActive(true);
			this.setVisible(true);
			this.speed = Phaser.Math.GetSpeed(direction*800, 1);
			this.flipX=(direction/-2+0.5);
        },

        update: function (time, delta)
        {
			this.x += this.speed * delta;		
			if(this.x < 0)
			{
				this.setActive(false);
				this.setVisible(false);
			}
			
			if(this.x > 1400)
			{
				this.setActive(false);
				this.setVisible(false);
			}
			
			if (this.x > player.x-20 && //player 1 hit detection
				this.x < player.x+20 &&
				this.y < player.y+24 &&
				this.y > player.y-24)
			{
				//hit
				this.setActive(false);
				this.setVisible(false);
				player1HP-=this.damage;
				player1HPinfo.setText('HP:'+player1HP+'/120');
				if(player1HP <= 0)
				{
					player.setActive(false);
					player.setVisible(false);
					gun.setActive(false);
					gun.setVisible(false);
					player1Respawn();
				}
			}
			if (this.x > player2.x-20 && //player 2 hit detection
				this.x < player2.x+20 &&
				this.y < player2.y+24 &&
				this.y > player2.y-24)
			{
				//hit
				this.setActive(false);
				this.setVisible(false);
				player2HP-=this.damage;
				player2HPinfo.setText('HP:'+player2HP+'/120');
				if(player2HP <= 0)
				{
					player2.setActive(false);
					player2.setVisible(false);
					gun2.setActive(false);
					gun2.setVisible(false);
					player2Respawn();
				}
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

	katana2.flipX=true;
	katana2.setPosition(player2.x - 32, player2.y - 0);
	}
	else if (this.keyD.isDown)
	{
    player2.setVelocityX(speed);
    player2.anims.play('D', true);
	player2.flipX=false;

	gun2.flipX = false;
	gun2.setPosition(player2.x + 23, player2.y + 5);

	katana2.flipX=false;
	katana2.setPosition(player2.x + 32, player2.y + 0);
	}
	else
	{
    player2.setVelocityX(0);
	player2.anims.play('turn2');

	gun2.setPosition(player2.x + (23*(gun2.flipX-0.5) * -2), player2.y + 5);

	katana2.setPosition(player2.x  + (32*(gun2.flipX-0.5) * -2), player2.y + 0);
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

	katana1.flipX=true;
	katana1.setPosition(player.x - 32, player.y - 0);
	}
	else if (cursors.right.isDown)
	{
    player.setVelocityX(speed);
    player.anims.play('right', true);
	player.flipX=false;

	gun.flipX = false;
	gun.setPosition(player.x + 23, player.y + 5);

	katana1.flipX=false;
	katana1.setPosition(player.x + 32, player.y - 0);
	}
	else
	{
    player.setVelocityX(0);
	player.anims.play('turn');

	gun.setPosition(player.x + (23*(gun.flipX-0.5) * -2), player.y + 5);

	katana1.setPosition(player.x  + (32*(gun.flipX-0.5) * -2), player.y + 0);
	}
	if (cursors.up.isDown && player.body.touching.down)
	{
    player.setVelocityY(jumpheight*(-1));
	}

	//Fire bullet
	if (this.keyEnter.isDown && time > lastFired)
	{	
		if (gun.visible)
		{
			firedBullet = bullets.get();
			if (firedBullet)
			{
				firedBullet.fire(player.x - 30* (gun.flipX-0.5) * 2, player.y, (gun.flipX-0.5) * -2);
				lastFired = time + 500;
			}
		}
		else if (katana1.visible)
		{
			katana1.anims.play("strike", true);
			katanaStrike(1);
			lastFired = time + 700;
		}
	}
	if (this.keySpacebar.isDown && time > lastFired)
	{
		if (gun2.visible)
		{
			firedBullet = bullets.get();
			if (firedBullet)
			{
				firedBullet.fire(player2.x - 30* (gun2.flipX-0.5) * 2, player2.y, (gun2.flipX-0.5) * -2);
				lastFired = time + 500;
			}
		}
		else if (katana2.visible)
		{
			katana2.anims.play("strike", true);
			katanaStrike(2);
			lastFired = time + 700;
		}
		
	}
	
	//switch wepon
	if(this.keyS.isDown)
	{
		this.keyS.reset();
		if(gun2.visible)
		{
			gun2.setVisible(0);
			katana2.setVisible(1);
		}
		else
		{
			gun2.setVisible(1);
			katana2.setVisible(0);
		}
	}
	
	if(cursors.down.isDown)
	{
		cursors.down.reset();
		if(gun.visible)
		{
			gun.setVisible(0);
			katana1.setVisible(1);
		}
		else
		{
			gun.setVisible(1);
			katana1.setVisible(0);
		}
	}
}
function katanaStrike(striker)//striker=1 if player 1, vice verca
{
	if(striker==1)
	{// its player 1
		if(!gun.flipX)
		{//right strike
			if(
			player2.x-player.x<77 &&
			player2.x-player.x>0  &&
			player2.y-player.y<24 &&
			player2.y-player.y>-24)
			{//hit
				hp(-30, 2);
			}
		}
		else
		{//left strike
			if(
			player.x-player2.x<77 &&
			player.x-player2.x>0  &&
			player2.y-player.y<24 &&
			player2.y-player.y>-24)
			{//hit
				
				hp(-30, 2);
			}
		}
	}
	else if(striker==2)
	{//player 2
		if(!gun2.flipX)
		{//right strike
			console.log("right strike");
			if(
			player.x-player2.x<77 &&
			player.x-player2.x>0  &&
			player.y-player2.y<24 &&
			player.y-player2.y>-24)
			{//hit
				hp(-30, 1);
			}
		}
		else
		{//left strike
			console.log("left strike");
			if(
			player2.x-player.x<77 &&
			player2.x-player.x>0  &&
			player.y-player2.y<24 &&
			player.y-player2.y>-24)
			{//hit
				hp(-30, 1);
			}
		}

	}
}
//Respawn
function player1Respawn()
{
	player.setPosition(1300,450);
	player.setActive(true);
	player.setVisible(true);
	gun.setPosition(player.x, player.y);
	gun.setActive(true);
	gun.setVisible(true);
	player1HPinfo.setText('HP: 100/120');
	player1HP = 100;
}
function player2Respawn()
{
	player2.setPosition(100,450);
	player2.setActive(true);
	player2.setVisible(true);
	gun2.setPosition(player2.x, player2.y);
	gun2.setActive(true);
	gun2.setVisible(true);
	player2HPinfo.setText('HP: 100/120');
	player2HP = 100;
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
	player1HPinfo.setText('HP:'+player1HP+'/120');
	player2HPinfo.setText('HP:'+player2HP+'/120');
	return 0;
}

function player1HPpickup()
{
	hp(20, 1);
	HPpickupRespawn();
}

function player2HPpickup()
{
	hp(20, 2);
	HPpickupRespawn();
}

function HPpickupRespawn()
{
	healthPickup.setPosition((Math.round(Math.random() * 1400-20)+10), -150);
}
