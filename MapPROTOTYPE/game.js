var game = new Phaser.Game(1024, 500, Phaser.CANVAS, '', {preload: preload, create: create, update: update});

function preload() {

    game.load.image('star', 'sprites/star.png');
    game.load.spritesheet('healthBar', 'assets/health-bar.png', 36, 30);
    game.load.image('life', 'assets/life.png');
    game.load.image('key', 'assets/key.png');
    // game.load.image('cave', 'images/cave.png');

    game.load.image('bossBullets', 'assets/undefined3.png');
    game.load.image('boss', 'assets/boss.png');
    game.load.image('zero', 'assets/zero.png');
    game.load.image('one', 'assets/one.png');

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

    game.load.image('doorImage', 'images/door.png');

}

var player,
    cursors,
    spaceKey,
    lives = 3,
    healthBar = [],
    stars,
    key,
    isKeyTaken = true,
    score = 0,
    scoreText,
    stateText,
    keyText,
    keyBar,
    keyTextBar,
    keyTextStyle,
    healthText,
    layer,
    map,
    badDudes,
    trapsLayer,
    countOverlap = 0,
    hits = 0,
    boss,
    bossSpeed = 2000,
    bullet,
    bullets,
    bulletCount,
    bulletTime = 1000,
    firingTimer = 0,
    zeroes,
    ones,
    zeroCount = 1,
    oneCount = 1,
    takenZero = false,
    takenOne = false,
    door,
    doorObjectFromTileMap,
    winzone,
    doorLayer,
    traps;

function createDoor() {
    door = game.add.group();
    door.enableBody = true;

    door.create(doorObjectFromTileMap.x, doorObjectFromTileMap.y, "doorImage");
    // map.createFromObjects("obj", 181, 'doorImage', 0, true, false, door);
    // door.physicsBodyType = Phaser.Physics.ARCADE;
}
function tryEnterDoor() {
    if (spaceKey.isDown && !isKeyTaken) {
        warningMessage();
    }
    if (!isKeyTaken || !spaceKey.isDown) {
        player.x -= 10;
    } else if (isKeyTaken && spaceKey.isDown) {
        // this will teleport Pesho to the other side of the door
        player.x += 100;

        // this will make the door disappear
        // door.y += 10;
    }
}
function trapsCreation() {
    traps = game.add.group();
    traps.enableBody = true;

    trapsLayer.forEach(function (currentTrap) {
        traps.create(currentTrap.x, currentTrap.y);
    })
}
function testTraps() {
    console.log("KILLLLLLLLL")
}
function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#787878';
    map = game.add.tilemap('level1');
    // map images
    map.addTilesetImage('tech', 'sci-fi');
    map.addTilesetImage('traps', 'trapsSprite');
    map.setCollisionByExclusion([13, 14, 15, 16, 46, 47, 48, 49, 50, 51]);
    //.setCollision([1,2],true,'level1');
    bg = game.add.tileSprite(0, 0, 1024, 500, 'background');
    bg.fixedToCamera = true;
    layer = map.createLayer(0);
    layer.resizeWorld();

    // door
    doorObjectFromTileMap = map.objects["obj"][0];
    winzone = map.objects['obj'][1];
    trapsLayer = map.objects['TrapsObj'];

    trapsCreation();


    createDoor();
    // Adding player
    //<<<<<<< .mine
    //player = game.add.sprite(game.world.width - 500, game.world.height - 200, 'player');

    //=======

    player = game.add.sprite(32, 32, 'player');
    //>>>>>>> .theirs

    game.physics.arcade.enable(player);
    player.body.gravity.y = 350;
    player.body.collideWorldBounds = true;

    //  Add animations to player
    player.animations.add('left', [4, 3, 2, 1, 0], 14, true);
    player.animations.add('right', [6, 7, 8, 9, 10], 14, true);
    player.animations.add('jump_right', [11], 14, true);
    player.animations.add('jump_left', [12], 14, true);
    player.animations.add('dead', [13], 14, true);

    // moving
    game.camera.follow(player);

    //adding bullets, ones and zeroes

    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    for (var j = 0; j < 50; j++) {
        var b = bullets.create(0, 0, 'bossBullets');
        b.name = 'bossBullets' + j;
        b.exists = false;
        b.visible = false;
        b.checkWorldBounds = true;
        b.events.onOutOfBounds.add(resetBullet, this);
    }

    zeroes = game.add.group();
    zeroes.enableBody = true;
    createZero();

    ones = game.add.group();
    ones.enableBody = true;
    createOne();

    boss = game.add.sprite(2960, 3050, 'boss');
    game.physics.arcade.enable(boss);

    //  Create an animation called 'move'
    boss.animations.add('move');

    //  Play the animation at 10fps on a loop
    boss.animations.play('move', 10, true);

    game.add.tween(boss).to({y: 2820}, bossSpeed, Phaser.Easing.Linear.None, true, 0, 1000, true);

    //Add lifes
    // hearts = game.add.group();
    // hearts.enableBody = true;

    // for (i = 0; i < 2; i += 1) {
    //     var heart = hearts.create(((Math.random() * (game.world.width / 2) | 0) + game.world.width - 400), game.world.height - 100, 'health');

    // }
    healthText = game.add.text(14, 40, 'Lives: ', {font: 'bold 24px Consolas', fill: '#FFF'});
    healthText.fixedToCamera = true;

    //Add health bar
    for (var i = 0; i < 3; i += 1) {
        var oneUp;
        oneUp = game.add.sprite(100 + (40 * i), 35, 'healthBar');
        oneUp.animations.add('full', [0]);
        oneUp.animations.add('empty', [1]);
        oneUp.fixedToCamera = true;
        oneUp.animations.play(i < lives ? 'full' : 'empty', 0, false);

        healthBar.push(oneUp);
    }

    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var l = 0; l < 12; l++) {
        //  Create a star inside of the 'stars' group
        var star = stars.create(l * 30, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.5 + Math.random() * 0.2;
    }

    // Add key
    key = game.add.sprite(2432, 64, 'key');
    //key = game.add.sprite(400, 100, 'key');

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

    // Add bar behind the key
    keyBar = game.add.graphics();
    keyBar.beginFill(0xFFFFFF);
    keyBar.drawCircle(990, 35, 50);
    game.physics.arcade.enable(keyBar);
    keyBar.enableBody = true;
    keyBar.fixedToCamera = true;
    keyBar.visible = false;

    keyTextStyle = {font: "bold 24px Consolas", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle"};
    keyText = game.add.text(0, 0, 'Go get the key first!', keyTextStyle);
    keyText.fixedToCamera = true;
    keyText.setTextBounds(200, 100, 300, 50);
    keyText.visible = false;

    //Add score text
    scoreText = game.add.text(14, 14, 'Score: 0', {font: 'bold 24px Consolas', fill: '#FFF'});
    scoreText.fixedToCamera = true;

    // Add state text
    stateText = game.add.text(100, 100, ' ', {font: 'bold 24px Consolas', fill: '#FFF'});
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
    // Door - key Handler
    game.physics.arcade.overlap(player, door, tryEnterDoor, null, this);
    // Interaction between player and surroundings
    game.physics.arcade.collide(player, layer);
    //game.physics.arcade.collide(player, trapsLayer);
    game.physics.arcade.overlap(player, traps, takeDamage, null, this);

    game.physics.arcade.overlap(player, stars, collectStar, null, this);
    game.physics.arcade.overlap(player, key, collectKey, null, this);

    // Interaction between enemies and layer
    game.physics.arcade.collide(badDudes, layer);
    game.physics.arcade.collide(stars, layer);

    // Interaction between player and boss
    game.physics.arcade.overlap(player, boss, takeDamage, null, this);

    // Interaction between player and ones/zeros
    game.physics.arcade.overlap(player, zeroes, collectZero, null, this);
    //    if(bulletTime < game.time.now){
    //        killBulllet();
    //    }

    if (takenZero) {
        createZero();
    }

    game.physics.arcade.collide(player, ones, collectOne, null, this);

    if (takenOne) {
        createOne();
    }

    if (game.time.now > bulletTime) {
        fireBullet();
    }

    // Player behaviour
    if (player.alive) {
        checkIfPlayerReachedTheEndOfTheLevel();

        player.body.velocity.x = 0;
        player.enableBody = true;
        player.alpha = 1;

        if (cursors.left.isDown) {
            //  Move to the left
            if (player.body.onFloor()) {

                player.animations.play('left');
                player.body.velocity.x = -200;

            } else {

                player.animations.play('jump_left');
                player.body.velocity.x = -150;

            }
        }
        else if (cursors.right.isDown) {
            //  Move to the right
            if (player.body.onFloor()) {

                player.animations.play('right');
                player.body.velocity.x = 200;

            } else {

                player.animations.play('jump_right');
                player.body.velocity.x = 150;

            }

        } else {
            // Stand still
            player.animations.stop();

            player.frame = 5;
        }

        // Jump
        if (cursors.up.isDown && player.body.onFloor()) {
            player.body.velocity.y = -300;
            console.log(winzone);
        }

        // Interaction between player and enemies
        if (game.physics.arcade.overlap(player, badDudes, collisionHandler, processHandler, this) ||
            game.physics.arcade.overlap(player, bullets, collisionHandler, null, this)) {
            countOverlap += 1;

            player.enableBody = false;
            player.play('dead');

            if (countOverlap === 1) {

                hits += 1;

                if (hits <= 3) {
                    lives--;
                    updateLife();
                }
            }
        }
        else {
            player.enableBody = true;
            countOverlap = 0;
        }

    }

}

function collisionHandler(sprite, group) {

    var spriteBounds = sprite.getBounds(),
        groupBounds = group.getBounds();

    return Phaser.Rectangle.intersects(spriteBounds, groupBounds);

}

function processHandler(sprite, group) {
    return true;
}

function takeDamage() {

    player.kill();
    restart();
}

function updateLife() {

    var total = healthBar.length;
    for (var i = 0; i < total; i += 1) {
        healthBar[i].animations.play(i < lives ? 'full' : 'empty', 0, false);
    }

    if (lives === 0) {
        player.kill();
        hits = 0;

        stateText.text = " GAME OVER \n Click to restart";
        stateText.visible = true;

        // the "click to restart" handler
        game.input.onTap.addOnce(restart, this);
    }
}

function CreateBadDudes() {
    //                    y   | x

    var startPosition = [[160, 650, 1300],
        [416, 1472, 1408, 192],
        [672, 128, 896],
        [992, 672, 1568],
        [1248, 672, 1376],
        [1504, 992, 928],
        [2496, 704],
        [2816, 1312]];
    var endXPositon = [[1000, 1664],
        [1984, 960, 576],
        [384, 1344],
        [224, 1792],
        [1056, 1760],
        [1248, 640],
        [960],
        [1824]];
    for (var y = 0; y < startPosition.length; y++) {
        for (var x = 1; x < startPosition[y].length; x++) {
            var octoCat = badDudes.create(startPosition[y][x], startPosition[y][0], 'octo-cat');
            octoCat.scale.setTo(0.4, 0.4);
            game.physics.arcade.enable(octoCat);
            octoCat.body.gravity.y = 800;
            octoCat.body.collideWorldBounds = true;
            game.add.tween(octoCat).to({x: endXPositon[y][x - 1]}, 3000, Phaser.Easing.Linear.None, true, 0, 1000, true);
        }
    }
    //>>>>>>> .theirs
}
//<<<<<<< .mine
//=======

//>>>>>>> .theirs


function fireBullet() {
    bulletTime = game.time.now + 2000;

    bulletCount += 1;

    for (var i = 1; i < bulletCount; i += 1) {
        bullet.kill();
    }

    if (game.time.now < bulletTime) {
        bullet = bullets.getFirstExists(false);

        if (bullet) {
            bullet.reset(boss.x - 150, boss.y + 50);
            bullet.body.velocity.x = -300;
            //   bulletTime = game.time.now + 200;
        }
    }
}

function resetBullet(bullet) {

    bullet.kill();

}

// function killBulllet()
// {
//     bullets.kill();
// }

function createZero() {
    if (zeroCount == 1) {
        zeroCount = 0;
    }
    for (var i = 0; i < 1; i++) {
        //  Create a star inside of the 'stars' group
        var zero = zeroes.create(i, i, 'zero');

        zero.x = game.rnd.between(2200, 3010);
        zero.y = game.rnd.between(3000, 3100);

        takenZero = false;

        // zero.visible = true;
    }
}

function createOne() {
    if (oneCount == 1) {
        oneCount = 0;
    }
    for (var i = 0; i < 1; i++) {
        //  Create a star inside of the 'stars' group
        var one = ones.create(i, i, 'one');

        one.x = game.rnd.between(2200, 3010);
        one.y = game.rnd.between(3000, 3100);

        takenOne = false;

        // zero.visible = true;
    }
}

function collectZero(player, zero) {
    zeroCount = 1;
    zero.kill();
    takenZero = true;
}

function collectOne(player, one) {
    oneCount = 1;
    one.kill();
    takenOne = true;
}

function collectKey() {

    isKeyTaken = true;
    keyBar.visible = true;
    game.world.bringToTop(key);
    key.x = 966;
    key.y = 10;
    key.fixedToCamera = true;
}

function collectStar(player, star) {

    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;
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
    // revives the player
    player.x = 32;
    player.y = 32;
    player.revive();
    boss.revive();
    game.paused = false;
    // lifes reset
    lives = 3;
    updateLife();

    // key reset
    keyBar.visible = false;
    key.fixedToCamera = false;
    key.x = 2432;
    key.y = 64;
    isKeyTaken = false;

    // hides the text
    stateText.visible = false;

    // reset the score
    score = 0;
    scoreText.text = 'Score: ' + score;
}
function checkIfPlayerReachedTheEndOfTheLevel() {
    if (player.x === winzone.x && player.y === winzone.y) {
        stateText.text = " YOU WIN  \n Click to restart";
        stateText.visible = true;
        boss.kill();
        bullet.kill();
        game.paused = true;
        game.input.onTap.addOnce(restart, this);
    }
}
