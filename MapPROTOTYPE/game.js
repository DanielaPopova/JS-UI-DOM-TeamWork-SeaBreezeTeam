function preload() {
    game.load.image('background', 'images/mother-board.png');
    game.load.spritesheet('ninja', 'images/dude.png', 32, 48);
    game.load.tilemap('level1', 'level1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'images/tileMapDiagram1.png');
    game.load.image('key','images/Key-icon.png');
}

var map;
var layer;
var cursors;
var emitter;
var bg;
var player;
var jumpButton;
var facing = 'left';
var jumpTimer = 0;

function create() {

    game.stage.backgroundColor = '#787878';
    map = game.add.tilemap('level1');

    map.setCollisionByExclusion([13, 14, 15, 16, 46, 47, 48, 49, 50, 51]);

    map.addTilesetImage('Work', 'tiles');
    bg = game.add.tileSprite(0, 0, 800, 600, 'background');
    bg.fixedToCamera = true;
    layer = map.createLayer(0);
    layer.resizeWorld();
    // adding ninja

    //////////////
    game.physics.arcade.gravity.y = 250;

    player = game.add.sprite(32, 32, 'ninja');
    game.physics.enable(player, Phaser.Physics.ARCADE);

    player.body.bounce.y = 0.2;
    player.body.collideWorldBounds = true;
    player.body.setSize(20, 32, 5, 16);

    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('turn', [4], 20, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    game.camera.follow(player);

    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

}

function particleBurst() {


}

function update() {

    game.physics.arcade.collide(player, layer);

    player.body.velocity.x = 0;

    if (cursors.left.isDown) {
        player.body.velocity.x = -500;
        // scrolling the bg
       // bg.tilePosition.x +=2;

        if (facing != 'left') {
            player.animations.play('left');
            facing = 'left';
        }
    }
    else if (cursors.right.isDown) {
        player.body.velocity.x = 500;
        // scrolling the bg
        //bg.tilePosition.x -=2;

        if (facing != 'right') {
            player.animations.play('right');
            facing = 'right';
        }
    }
    else {
        if (facing != 'idle') {
            player.animations.stop();

            if (facing == 'left') {
                player.frame = 0;
            }
            else {
                player.frame = 5;
            }

            facing = 'idle';
        }
    }

    if (jumpButton.isDown && player.body.onFloor() && game.time.now > jumpTimer) {
        player.body.velocity.y = -250;
        jumpTimer = game.time.now + 750;
    }

}

function render() {

    // game.debug.body(sprite);

}

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', {
    preload: preload,
    create: create,
    update: update
    // render: render
});