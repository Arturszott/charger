// init phaser game
var batterylvl;

function onBatteryStatus(info) {
    console.log(info.level);
    batterylvl = info.level;
    config.percent = batterylvl;
    initGame();
}

var config = {
    blinkSpeed: 2,
    chargeSpeed: 7,
    percent: batterylvl || 67,
    chargeProgress: 0,
    circleWidth: 130,
    progressText: ''
}
var game;
var circle;
var floor;

var graphics;
var graphics2;

function totalCircle(radius, sides) {
    if (graphics) graphics.destroy();

    graphics = game.add.graphics(game.world.centerX, game.world.centerY + 50);
    graphics.lineStyle(2, 0x4f5255, 1);

    if (sides < 3) return;

    var a = (Math.PI * 2) / sides;

    for (var i = 0; i <= sides; i++) {
        if (i == 100 - (config.percent)) {
            graphics.lineStyle(7, 0x45c921, 1);
        }
        graphics.lineTo(radius * Math.cos(a * i), radius * Math.sin(a * i));
    }

    config.progressText.text = config.percent + '%';
}

function chargeProgressCircle(radius, sides) {
    if (graphics2) graphics2.destroy();

    graphics2 = game.add.graphics(game.world.centerX, game.world.centerY + 50);
    graphics2.lineStyle(2, 0x4f5255, 1);

    if (sides < 3) return;

    var a = (Math.PI * 2) / sides;

    for (var i = 0; i <= sides; i++) {
        if (i == 100 - (Math.floor(config.chargeProgress))) {
            graphics2.lineStyle(7, 0x4f5255, 1);
        }
        graphics2.lineTo(radius * Math.cos(a * i), radius * Math.sin(a * i));
    }
}

/////////////////// PRELOAD ///////////////////////
function preload() {

    //  37x45 is the size of each frame

    //  There are 18 frames in the PNG - you can leave this value blank if the frames fill up the entire PNG, but in this case there are some
    //  blank frames at the end, so we tell the loader how many to load

    // game.load.spritesheet('trash', 'assets/trash.png', 64, 80, 6);

    game.load.image('frame', 'assets/frame.png', 130, 61);
    game.load.image('hand', 'assets/swipe.png', 119, 72);
}
/////////////////// GAME CREATION ///////////////////////
function create() {
    this.game.stage.backgroundColor = '#23272b';

    var percentStyle = {
        font: "36px droid sans",
        fill: "#8798a9",
        align: "center"
    };

    config.progressText = game.add.text(game.world.centerX, game.world.centerY - 30, '', percentStyle);
    config.progressText.anchor.setTo(0.5, 0.5);

    var mainText = "Swipe to charge\nthe battery!"
    var style = {
        font: "40px droid sans",
        fill: "#fff",
        align: "center"
    };
    var t1 = game.add.text(game.world.centerX, 40, mainText, style);
    t1.anchor.setTo(0.5, 0);



    totalCircle(config.circleWidth, 100);
    chargeProgressCircle(config.circleWidth + 20, 100)

    // battery frame image
    var frame = this.game.add.sprite(game.world.centerX, game.world.centerY + 50, 'frame');
    frame.anchor.setTo(0.5, 0.5);
    frame.alpha = 0;


    function tweenBlink(obj, speed) {
        game.add.tween(obj).to({
            alpha: 1
        }, 1000 * (1 / (speed || config.blinkSpeed)), Phaser.Easing.Linear.None, true, 0, 1000, true);
    }
    // blink baterry frame
    tweenBlink(frame);
}
/////////////////// GAME LOOP ///////////////////////
function update() {
    var cords = {
        x: game.input.x,
        y: game.input.y
    }

    if (game.input.activePointer.isDown) {
        if (cords.x !== game.prevCords.x || cords.y !== game.prevCords.y) {

            config.chargeProgress = config.chargeProgress + 0.1 * config.chargeSpeed;

            if (config.chargeProgress > 100) {
                config.chargeProgress = 0;
                config.percent++;

                totalCircle(config.circleWidth, 100);
            }
            chargeProgressCircle(config.circleWidth + 20, 100);
        }
    }

    game.prevCords = cords;
}
function render() {
}

function initGame(){
    game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'game', {
        preload: preload,
        create: create,
        update: update,
        render: render
    });
}
function onDeviceReady(){
    console.log('device ready')
    window.addEventListener("batterystatus", onBatteryStatus, false);
}