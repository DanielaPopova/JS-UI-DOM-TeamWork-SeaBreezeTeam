var game = new Phaser.Game(1024, 500, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('sky', 'sprites/sky.png');
    game.load.image('ground', 'sprites/platform.png');
    game.load.image('star', 'sprites/star.png');
    game.load.image('health', 'assets/health.png');
    game.load.image('live', 'assets/live.png');
    game.load.image('dead', 'assets/dead.png');
    game.load.spritesheet('baddie', 'sprites/baddie.png', 33, 32);
    game.load.spritesheet('pesho', 'assets/pesho.png', 49, 63);
    // loading map resoruces
    game.load.image('background', 'images/bg.png');
    //game.load.spritesheet('ninja', 'images/dude.png', 32, 48);
    game.load.tilemap('level1', 'level1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'images/tileMapDiagram1.png');
    game.load.image('sci-fi', 'images/TileSets/scifi_platformTiles_32x32.png');

    game.load.spritesheet('octo-cat','images/octocat.png',169,150,25);

}

var player;
var baddie;
var platforms;
var cursors;

var hearts;
var lives;
var stars;
var score = 0;
var scoreText;
var stateText;
var healthText;
var layer;
var map;
var jumpTimer =0 ;
var bg;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#787878';
    map = game.add.tilemap('level1');
    map.addTilesetImage('Work', 'tiles');
    map.addTilesetImage('tech','sci-fi');
    map.setCollisionByExclusion([13, 14, 15, 16, 46, 47, 48, 49, 50, 51]);
    bg = game.add.tileSprite(0, 0, 1024, 500, 'background');
    bg.fixedToCamera = true;
    layer = map.createLayer(0);
    layer.resizeWorld();

    // Adding PESHO and baddie
     player = game.add.sprite(32, 32, 'pesho');

     baddie = game.add.sprite(game.world.width - 50, game.world.height - 230, 'baddie');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);
    game.physics.arcade.enable(baddie);

    // Add health to player
    //player.health = 3;
    //player.maxHealth = 3;
    
    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.1;
    player.body.gravity.y = 400;
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [4, 3, 2, 1, 0], 12, true);
    player.animations.add('right', [6, 7, 8, 9, 10], 12, true);
    player.animations.add('jump', [11], 12, true);

    // moving
    game.camera.follow(player);

    // Baddie
    baddie.body.collideWorldBounds = true;    

    baddie.animations.add('move', [0, 1], 4, true);
    baddie.animations.play('move',3,true);
    game.add.tween(baddie).to( { x: 400}, 3000, Phaser.Easing.Quadratic.InOut, true, 0, 1000, true);

    //Add hearts
    hearts = game.add.group();
    hearts.enableBody = true;

    for (i = 0; i < 2; i += 1) {
        var heart = hearts.create(((Math.random() * (game.world.width / 2) | 0) + game.world.width - 400), game.world.height - 100, 'health');    
        
    }
    healthText = game.add.text(14, 40, 'Lives: ', { font: 'bold 24px Consolas', fill: '#000'});

    //Add lives 
    lives = game.add.group();
    for (i = 0; i < 2; i += 1) {
        var live = lives.create(game.world.width - 700 + (40 * i), 35, 'live');
        //live.anchor.setTo(0.5, 0,5);
        live.scale.setTo(0.7, 0.7);

    }

    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 30, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.5 + Math.random() * 0.2;
    }

    scoreText = game.add.text(14, 14, 'Score: 0', { font: 'bold 24px Consolas', fill: '#000'});

    // Add state text    
    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: 'bold 24px Consolas', fill: '#000'});
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    cursors = game.input.keyboard.createCursorKeys();


    //////////// adding octocat
    octoCat=game.add.sprite(600,30,'octo-cat');
    game.physics.arcade.enable(octoCat);

    octoCat.body.gravity.y=800;
    octoCat.body.collideWorldBounds = true;
    octoCat.scale.setTo(0.4,0.4);

    octoCat.animations.add('wlak', [0,1]);
    octoCat.animations.play('wlak',3,true);
    game.add.tween(octoCat).to( { x: 1000}, 3000, Phaser.Easing.Quadratic.InOut, true, 0, 1000, true);

}

function update() {
  //  PESHO and platforms -need group from Stoyan
    game.physics.arcade.collide(stars, layer);
    game.physics.arcade.collide(octoCat, layer);
    game.physics.arcade.collide(player, layer);

      //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
      game.physics.arcade.overlap(player, stars, collectStar, null, this);

      //  Checks to see if the player overlaps with any of the hearts, if he does call the heal function
      game.physics.arcade.collide(player, hearts, heal, null, this);
      game.physics.arcade.overlap(player, octoCat, takeDamage, null, this);
      // Damage from baddie or spike
      game.physics.arcade.collide(player, baddie, takeDamage, null, this);


    if (player.alive) {

        player.body.velocity.x = 0;

        if (cursors.left.isDown)
        {
            //  Move to the left
            player.body.velocity.x = -500;

            player.animations.play('left');
        }
        else if (cursors.right.isDown)
        {
            //  Move to the right
            player.body.velocity.x = 500;

            player.animations.play('right');
        } else if (cursors.up.isDown){
            player.animations.play('jump');
        }
        else
        {
            //  Stand still
            player.animations.stop();

            player.frame = 5;
        }
        
        //  Allow the player to jump if he is touching the ground.
        if (cursors.up.isDown && player.body.onFloor() && game.time.now > jumpTimer) {
            player.body.velocity.y = -400;
            jumpTimer = game.time.now ;
            player.animations.play('jump');
        }

    }

}

function collectStar (player, star) {
    
    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;

}

function heal () {
    
    // Removes the heart from the screen
    hearts.getFirstAlive().kill();

    //  Add and update to the health
    // if (lives.countLiving < 3) {
        
    //     var live = lives.create(game.world.width - 200, 35, 'live');
        
        
    // }

    //healthText.text = 'Health: ' + player.health;

}

function takeDamage() {

    player.kill();
    console.log('killed');
    player.x = 50;
    player.y = 20 ;
    player.revive();

    
}

function collectKey() {
  // body...
}
// load dead png
//load live ong - fix lives
// fix falling down of a platform
//  game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.1);

function restart () {

    //  A new level starts
    
    //resets the life count
    lives.callAll('revive'); 

    //revives the player
    player.x = 5;
    player.y = game.world.height - 150;
    player.revive();

    //hides the text
    stateText.visible = false;

    // reset the score
    score = 0;
    scoreText.text = 'Score: ' + score;

}