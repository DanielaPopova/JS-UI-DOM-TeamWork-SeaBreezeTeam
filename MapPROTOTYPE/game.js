var game = new Phaser.Game(1024, 500, Phaser.CANVAS, '', {preload: preload, create: create, update: update});

function preload() {
    
    game.load.image('star', 'sprites/star.png');
    game.load.image('health', 'assets/health.png');
    game.load.image('live', 'assets/live.png');
    game.load.image('key', 'assets/key.png');
    // game.load.image('cave', 'images/cave.png');    
    
    game.load.spritesheet('player', 'assets/player.png', 49, 63);
    // loading map resoruces
    game.load.image('background', 'images/bg.png');
    //game.load.spritesheet('ninja', 'images/dude.png', 32, 48);
    game.load.tilemap('level1', 'level1.json', null, Phaser.Tilemap.TILED_JSON);
    //game.load.image('tiles', 'images/tileMapDiagram1.png');
    game.load.image('sci-fi', 'images/TileSets/scifi_platformTiles_32x32.png');
    game.load.image('trapsSprite', 'images/TrapsSprite.png');
    game.load.image('octo-cat', 'images/robo-octocat-small.png');
//    game.load.spritesheet('octo-cat', 'images/robo-octocat.png', 169, 150, 25, 169, 150, 25);

}

var player,    
    cursors,
    hearts,
    lives,
    stars,
    key,
    spaceKey,
    isKeyTaken = false,
    score = 0,
    scoreText,
    stateText,
    keyText,
    keyTextBar,
    keyTextStyle,
    healthText,
    layer,
    map,    
    badDudes,    
    trapsLayer,
    countOverlap = 0,
    hits = 0;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#787878';
    map = game.add.tilemap('level1');
    // map images
    map.addTilesetImage('tech', 'sci-fi');
    map.addTilesetImage('traps', 'trapsSprite');
    map.setCollisionByExclusion([13, 14, 15, 16, 46, 47, 48, 49, 50, 51]);
    bg = game.add.tileSprite(0, 0, 1024, 500, 'background');
    bg.fixedToCamera = true;
    layer = map.createLayer(0);
    // trapsLayer = map.createLayer(1);
    // trapsLayer.resizeWorld();
    layer.resizeWorld();

    // Adding player
//<<<<<<< .mine
    //player = game.add.sprite(32, 32, 'player');

//=======
    //player = game.add.sprite(game.world.width - 1000, game.world.height - 200, 'player');
    player = game.add.sprite(32, 32, 'player');
//>>>>>>> .theirs
    
    game.physics.arcade.enable(player);
    player.body.gravity.y = 350;
    player.body.collideWorldBounds = true;

    //  Add animations to plauer
    player.animations.add('left', [4, 3, 2, 1, 0], 14, true);
    player.animations.add('right', [6, 7, 8, 9, 10], 14, true);
    player.animations.add('jump_right', [11], 14, true);
    player.animations.add('jump_left', [12], 14, true);
    player.animations.add('dead', [13], 14, true);

    // moving
    game.camera.follow(player);    

    //Add hearts
    hearts = game.add.group();
    hearts.enableBody = true;

    for (i = 0; i < 2; i += 1) {
        var heart = hearts.create(((Math.random() * (game.world.width / 2) | 0) + game.world.width - 400), game.world.height - 100, 'health');

    }
    healthText = game.add.text(14, 40, 'Lives: ', {font: 'bold 24px Consolas', fill: '#FFF'});
    healthText.fixedToCamera = true;

    //Add lives
    lives = game.add.group();
    for (i = 0; i < 3; i += 1) {
        var live = lives.create(100 + (40 * i), 35, 'live');
        live.fixedToCamera = true;
        live.scale.setTo(0.9, 0.9);

    }

    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++) {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 30, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.5 + Math.random() * 0.2;
    }

    // Add key
    key = game.add.sprite(2432, 64, 'key');    
    game.physics.arcade.enable(key);
    key.enableBody = true;

    // Add warning text for key
     keyTextBar = game.add.graphics();
    keyTextBar.beginFill(0x173B0B);    
    keyTextBar.drawRoundedRect(200, 100, 300, 50, 10);
    game.physics.arcade.enable(keyTextBar);
    keyTextBar.enableBody = true;    
    keyTextBar.fixedToCamera = true;

    keyTextBar.visible = false;

    keyTextStyle = { font: "bold 24px Consolas", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
    keyText = game.add.text(0, 0, 'Go get the key first!', keyTextStyle);    
    keyText.fixedToCamera = true;
    keyText.setTextBounds(200, 100, 300, 50);
    
    keyText.visible = false;   

    //Add score text
    scoreText = game.add.text(14, 14, 'Score: 0', {font: 'bold 24px Consolas', fill: '#FFF'});
    scoreText.fixedToCamera = true;

    // Add state text
    stateText = game.add.text(100, 100,' ', {font: 'bold 24px Consolas', fill: '#FFF'});
    stateText.fixedToCamera = true;
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = true;

    // Enable keyboard
    cursors = game.input.keyboard.createCursorKeys();
    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    //  create badDudes

    badDudes = game.add.group();
    CreateBadDudes();

}

function update() {
    //  player and platforms -need group from Stoyan
    game.physics.arcade.collide(stars, layer);
    game.physics.arcade.collide(badDudes, layer);
    game.physics.arcade.collide(player, layer);


    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);
    game.physics.arcade.overlap(player, key, collectKey, null, this);
    //  Checks to see if the player overlaps with any of the hearts, if he does call the heal function
    game.physics.arcade.collide(player, hearts, heal, null, this);
    //game.physics.arcade.overlap(player, badDudes, takeDamage, null, this);    

    // map kill

     if (player.alive) {

        player.body.velocity.x = 0;
        player.enableBody = true;
        player.alpha = 1;

        if (cursors.left.isDown)
        {
            //  Move to the left
            if (player.body.onFloor()) {
              player.animations.play('left');
            } else {
              player.animations.play('jump_left');
            }

            player.body.velocity.x = -200;

        }
        else if (cursors.right.isDown)
        {
            //  Move to the right
            if (player.body.onFloor()) {
              player.animations.play('right');
            } else {
              player.animations.play('jump_right');
            }
            
            player.body.velocity.x = 200;

        } else {
            //  Stand still
            player.animations.stop();

            player.frame = 5;
        }
        
        //  Allow the player to jump if he is touching the ground.
        if (cursors.up.isDown && player.body.onFloor())
        {
            player.body.velocity.y = -350;
        }

        if (spaceKey.isDown && !isKeyTaken) {
            warningMessage();
        } else if (spaceKey.isDown && isKeyTaken){
            openDoor();
        }
              

        if (game.physics.arcade.overlap(player, badDudes, collisionHandler, processHandler, this))
        {
            countOverlap += 1;

            player.enableBody = false;
            player.play('dead');
            player.alpha = 0.9;

            if (countOverlap === 1) {

                hits += 1;
               
                if (hits <= 3) {
                    live = lives.getFirstAlive();

                    if (live)
                    {
                        live.kill();
                    }
                }

                if (hits === 3) {
                    player.kill();
                    hits = 0;

                    stateText.text=" GAME OVER \n Click to restart";
                     stateText.visible = true;

                    //the "click to restart" handler
                     game.input.onTap.addOnce(restart,this);
                } 
                
            }         
        }
        else
        {
            player.enableBody = true;
            player.alpha = 1;
            countOverlap = 0;
        }

       
    }

}

function collisionHandler(player, octocat) {

    var playerBounds = player.getBounds(),
        octocatBounds = octocat.getBounds();
        
  return Phaser.Rectangle.intersects(playerBounds, octocatBounds);
    
}

function processHandler(player, octoCat) {
    return true;
}

function collectStar(player, star) {

    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;

}

function CreateBadDudes() {
  //                    y   | x
    
     var startPosition = [[ 160,  650, 1300],
                         [ 416, 1472, 1408,  192],
                         [ 672,  128,  896],
                         [ 992,  672, 1568],
                         [1248,  672, 1376],
                         [1504,  992,  928]];
    var endXPositon = [[1000, 1664],
                       [1984, 960, 576],
                       [ 384, 1344],
                       [ 224, 1792],
                       [1056, 1760],
                       [1248, 640]];
    for (var y = 0; y < startPosition.length; y++) {
        for (var x = 1; x < startPosition[y].length; x++) {
             var octoCat = badDudes.create(startPosition[y][x], startPosition[y][0], 'octo-cat');
             octoCat.scale.setTo(0.5, 0.5);
             game.physics.arcade.enable(octoCat);
             octoCat.body.gravity.y = 800;
             octoCat.body.collideWorldBounds = true;
             game.add.tween(octoCat).to({x: endXPositon[y][x-1]}, 3000, Phaser.Easing.Linear.None, true, 0, 1000, true);        
        }
}
//>>>>>>> .theirs
}
//<<<<<<< .mine
//=======
  
//>>>>>>> .theirs
function heal() {

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
    player.y = 20;
    player.revive();


}

function collectKey() {
    console.log('action');
    isKeyTaken = true;
    key.kill();
}

function openDoor() {
    // body...
}

function warningMessage() {
    
    keyText.visible = true;
    keyTextBar.visible = true;
    game.time.events.add(Phaser.Timer.SECOND * 2, function () {
       keyText.visible = false;
       keyTextBar.visible = false;
    }, this);   
}

function restart() {

    //resets the life count
    lives.callAll('revive');

    //revives the player
    player.x = 32;
    player.y = 32;
    player.revive();

    // key reset
    key.x = 2432;
    key.y = 64;
    key.revive();
    isKeyTaken = false;

    //hides the text
    stateText.visible = false;

    // reset the score
    score = 0;
    scoreText.text = 'Score: ' + score;

}