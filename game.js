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
var lastFired1 = 0, lastFired2 = 0;
var tinted1=0, tinted2=0;
var justTinted1=false, justTinted2=false;
var platformVerticalY=300;
var move_direction_V=1;
var move_direction_H=1;

function preload ()
{
	this.load.image('sky', 'assets/sky.png');
	this.load.image('gun', 'assets/gun.png');
    this.load.image('bullet', 'assets/bullet1.png');
	this.load.image('platform', 'assets/platform.png');
	this.load.image('platformshort', 'assets/platformshort.png');
	this.load.image('platformtiny', 'assets/platformtiny.png');
	this.load.image('clound', 'assets/cloud.png');
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
	this.load.audio('sound', 'assets/jump.mp3');
}

function create ()
{
  //  A simple background for our game
	this.add.image(700, 350, 'sky');

// A soundtrack which load with the game and plays repeatedly
	let soundTrack = this.sound.add('music');
	soundTrack.loop = true;
	soundTrack.play();

	let jumpSound = this.sound.add('sound');

	platforms = this.physics.add.staticGroup();
    platforms.create(700, (700-30), 'ground').setScale(2).refreshBody();

  //  Now let's create some platforms
	platforms.create(400, 599, 'platformshort');//verical
	platforms.create(700, 350, 'clound');//horisontal
    platforms.create(-20, 500, 'platform');
	platforms.create(-20, 250, 'platform');
    platforms.create(1000, 450, 'platformshort');
	platforms.create(1400, 250, 'platformshort');
	platforms.create(1050, 200, 'platformtiny');
	platforms.create(750, 200, 'platformtiny');
	platforms.create(700, 550, 'platformshort');

  // The player and its settings
    player = this.physics.add.sprite(1300, 450, 'king');
    player2 = this.physics.add.sprite(100, 450, 'link');
	player.setScale(2);
	player2.setScale(2);

	//The guns and its settings
	gun = this.add.sprite(player.x, player.y, 'gun');
	gun2 = this.add.sprite(player2.x, player2.y, 'gun');
	gun.setScale(1.5);
	gun2.setScale(1.5);

	gun.setVisible(1);
	gun2.setVisible(1);

	//the katanas
	katana1 = this.add.sprite(player.x, player.y, 'katana').setScale(1.5);
	katana2 = this.add.sprite(player2.x, player2.y, 'katana').setScale(1.5);

	katana1.setVisible(0);
	katana2.setVisible(0);

  //  Player physics properties. Give the little guy a slight bounce
	player.setBounce(0.2);
	player.setCollideWorldBounds(true);

	player2.setBounce(0.2);
	player2.setCollideWorldBounds(true);

	//Adding helath stuff
	player2HPinfo = this.add.text(16, 16, 'HP:'+player2HP+'/120', { fontSize: '32px', fill: '#1f7c25' });//
	player1HPinfo = this.add.text(1180, 16, 'HP:'+player1HP+'/120', { fontSize: '32px', fill: '#5729a0' });

	healthPickup = this.physics.add.image((Math.round(Math.random() * 1400-20)+10), -50, 'health');
	healthPickup.setMaxVelocity(0, 40)//makes it fall slower
	
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
	katana1.flipX=1;

	//Makes sure the players doesn't fall through the platforms

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
	var Bullet = new Phaser.Class(
	{

        Extends: Phaser.Physics.Arcade.Image, 

        initialize:

        function Bullet (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
			this.speed = Phaser.Math.GetSpeed(400, 1);
        },

        fire: function (x, y, direction)
        {
			this.setPosition(x, y);		
            this.setActive(true);
			this.setVisible(true);
			this.speed = Phaser.Math.GetSpeed(direction*800, 1);
			this.flipX=(direction/-2+0.5);
			this.damage=-10;
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
			
			if (this.x > player.x-20 && //player 1 hit detection
				this.x < player.x+20 &&
				this.y < player.y+24 &&
				this.y > player.y-24)
			{
				//hit
				this.setActive(false);
				this.setVisible(false);
				hp(this.damage, 1);
			}
			if (this.x > player2.x-20 && //player 2 hit detection
				this.x < player2.x+20 &&
				this.y < player2.y+24 &&
				this.y > player2.y-24)
			{
				//hit
				this.setActive(false);
				this.setVisible(false);
				hp(this.damage, 2);
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
	
	//flash red when hit 
	if(player.isTinted && !justTinted1)
	{
		tinted1=time+100;
		justTinted1=true;
	}
	
	if(player2.isTinted && !justTinted2)
	{
		tinted2=time+100;
		justTinted2=true;
	}
	
	if(tinted1<time && justTinted1)
	{
		player.clearTint();
		justTinted1=false;
	}
	
		if(tinted2<time && justTinted2)
	{
		player2.clearTint();
		justTinted2=false;
	}
		
	//moving platforms
	if(platforms.getFirstNth(nth=2, visible=true).y < 100)
	{//too high up
		move_direction_V= 1;
	}
	else if (platforms.getFirstNth(nth=2, visible=true).y > 550)
	{// too low
		move_direction_V= -1;
	}
	platforms.getFirstNth(nth=2, visible=true).setPosition(platforms.getFirstNth(nth=2, visible=true).x, platformVerticalY+move_direction_V);
	platformVerticalY+=move_direction_V;
	platforms.getFirstNth(nth=2, visible=true).refreshBody();
	
	if(platforms.getFirstNth(nth=3, visible=true).x < 100)
	{//too far left
		move_direction_H= 1;
	}
	else if (platforms.getFirstNth(nth=3, visible=true).x > 1300)
	{// too right
		move_direction_H= -1;
	}
	platforms.getFirstNth(nth=3, visible=true).setPosition(
		platforms.getFirstNth(nth=3, visible=true).x+move_direction_H, 
		(Math.sin(platforms.getFirstNth(nth=3, visible=true).x/20)*30+350));
		//platforms.getFirstNth(nth=3, visible=true).y);
	platforms.getFirstNth(nth=3, visible=true).x+=move_direction_H;
	platforms.getFirstNth(nth=3, visible=true).refreshBody();
	
	//key inputs
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
	
	//Attacking
	if (this.keyEnter.isDown && time > lastFired1)
	{	
		if (gun.visible)
		{
			firedBullet = bullets.get();
			if (firedBullet)
			{
				firedBullet.fire(player.x - 30* (gun.flipX-0.5) * 2, player.y, (gun.flipX-0.5) * -2);
				lastFired1 = time + 500;
			}
		}
		else if (katana1.visible)
		{
			katanaStrike(1);
			lastFired1 = time + 700;
		}
	}
	
	if (this.keySpacebar.isDown && time > lastFired2)
	{
		if (gun2.visible)
		{
			firedBullet = bullets.get();
			if (firedBullet)
			{
				firedBullet.fire(player2.x - 30* (gun2.flipX-0.5) * 2, player2.y, (gun2.flipX-0.5) * -2);
				lastFired2 = time + 500;
			}
		}
		else if (katana2.visible)
		{
			katanaStrike(2);
			lastFired2 = time + 700;
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
	var katanaDmg=-35;
	if(striker==1)
	{// its player 1
		if(katana1.anims.isPlaying){return 0}
		katana1.anims.play("strike", true);
		if(!gun.flipX)
		{//right strike
			if(
			player2.x-player.x<77 &&
			player2.x-player.x>0  &&
			player2.y-player.y<24 &&
			player2.y-player.y>-24)
			{//hit
				hp(katanaDmg, 2);
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
				
				hp(katanaDmg, 2);
			}
		}
	}
	else if(striker==2)
	{//player 2
		if(katana2.anims.isPlaying){return 0}
		katana2.anims.play("strike", true);
		if(!gun2.flipX)
		{//right strike
			console.log("right strike");
			if(
			player.x-player2.x<77 &&
			player.x-player2.x>0  &&
			player.y-player2.y<24 &&
			player.y-player2.y>-24)
			{//hit
				hp(katanaDmg, 1);
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
				hp(katanaDmg, 1);
			}
		}
	}
}

function isAlive(who)
{
	if(who==1)
	{
		if(player1HP <= 0)
		{
		player.setActive(false);
		player.setVisible(false);
		gun.setActive(false);
		gun.setVisible(false);
		player1Respawn();
		}
	}
	else if(who==2)
	{
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
	katana1.visible=0;
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
	katana2.visible=0;
}

function hp(change, who)
{
	if(who==1)
	{
		if(change<0)
		{
			player.setTint(0xff0000);
		}
		else
		{
			player.setTint(0x5cf442);
		}
		
		player1HP+=change;
		isAlive(1);
		
		if(player1HP>120)
		{
			player1HP-=(player1HP%120)
		}
		player1HPinfo.setText('HP:'+player1HP+'/120');
	}
	else if (who==2)
	{
		if(change<0)
		{
			player2.setTint(0xff0000);
		}
		else
		{
			player2.setTint(0x5cf442);
		}
		
		player2HP+=change;
		isAlive(2);

		if(player2HP>120)
		{
			player2HP-=(player2HP%120)
		}
		player2HPinfo.setText('HP:'+player2HP+'/120');
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
