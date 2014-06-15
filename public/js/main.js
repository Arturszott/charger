var batterylvl;

function onBatteryStatus(info) {
    console.log(info);
    window.removeEventListener('batterystatus', onBatteryStatus, false);

    batterylvl = info.level;
    config.percent = batterylvl;
    initGame();
}

document.addEventListener("touchstart", function(e) {
    onStart(e);
}, false);

function onStart(touchEvent) {
    if (navigator.userAgent.match(/Android/i)) {
        touchEvent.preventDefault();
    }
}

var config = {
    blinkSpeed: 2,
    swipeSpeed: 0,
    chargeSpeed: 9,
    percent: batterylvl || 67,
    chargeProgress: 0,
    circleWidth: 130,
    progressText: '',
    mainText: '',
    swipinArray: [
        'Yes... swipe more!',
        'Do you feel the power?',
        'Faster, please!',
        'Kinetic energy is flowing...',
        'Your battery is grateful.',
        "Omg, it's working!",
        "It's getting hotter..."
    ],
    notSwipinArray: [
        'Your battery is sad.'
    ],
    coords: null

}
var game;
var circle;
var floor;

var graphics;
var graphics2;

function totalCircle(radius, sides) {
    if (game.t2) {
        game.t2.setText(config.percent + "%");
    }
    if (game.finished) return false;

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
    if (game.finished) return false;
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
    game.load.spritesheet('frame', 'assets/frame.png', 130, 61, 4);
    game.load.image('hand', 'assets/swipe.png', 119, 72);
}
/////////////////// GAME CREATION ///////////////////////

function tweenBlink(obj, speed) {
    return game.add.tween(obj).to({
        alpha: 1
    }, 1000 * (1 / (speed || config.blinkSpeed)), Phaser.Easing.Linear.None, true, 0, 1000, true);
}


function newText(text) {
    if (config.mainText === text) {
        return false;
    } else {
        var tween = game.add.tween(game.t1).to({
            alpha: 0,
            y: game.t1.y - 20
        }, 300, Phaser.Easing.Linear.None, true);
        config.mainText = text;
        tween.onComplete.add(function() {
            game.t1.setText(text);
            game.t1.y += 20;
            game.add.tween(game.t1).to({
                alpha: 1
            }, 300, Phaser.Easing.Linear.None, true);
        });
    }
}

function createText() {

    var percentStyle = {
        font: "36px Roboto",
        fill: "#fff",
        align: "center"
    };

    game.t2 = game.add.text(game.world.centerX, game.world.centerY - 30, '', percentStyle);
    game.t2.setText(config.percent + "%");
    game.t2.anchor.setTo(0.5, 0.5);

    config.mainText = "Swipe to charge\nthe battery!";

    var style = {
        font: "28px Roboto",
        weight: 100,
        fill: "#fff",
        align: "center"
    };

    game.t1 = game.add.text(game.world.centerX, 40, '', style);
    game.t1.anchor.setTo(0.5, 0);
    game.t1.alpha = 0;
    game.t1.setText(config.mainText);
    game.t1.y += 20;
    game.add.tween(game.t1).to({
        alpha: 1
    }, 300, Phaser.Easing.Linear.None, true);
}

function create() {
    this.game.stage.backgroundColor = '#23272b';

    game._tweens = {};
    createText();



    totalCircle(config.circleWidth, 100);
    chargeProgressCircle(config.circleWidth + 20, 100)

    // battery frame image
    var frame = this.game.add.sprite(game.world.centerX, game.world.centerY + 50, 'frame');

    frame.animations.add('charge');
    frame.anchor.setTo(0.5, 0.5);
    frame.alpha = 0;

    game.frame = frame;

    // blink baterry frame
    game._tweens.frameBlink = tweenBlink(frame);
    game._tweens.frameBlink.pause();
}
/////////////////// GAME LOOP ///////////////////////
function getDist(position, target) {
    return Math.sqrt(Math.pow((target.x - position.x), 2) + Math.pow((target.y - position.y), 2));
}

function update() {
    var position, distance;
    if (game.input.activePointer.isDown && !game.finished) {

        position = {
            x: game.input.x,
            y: game.input.y
        }

        game.position = game.position || position;
        distance = getDist(game.position, position);


        if (distance > 0) {
            config.swipeSpeed = distance * 0.0015;
            config.chargeProgress = config.chargeProgress + config.swipeSpeed * config.chargeSpeed;

            if (game._tweens.frameBlink) {
                game.frame.alpha = 0;
                game.frame.animations.play('charge', 1, true);
                game._tweens.frameBlink.resume();
                game._tweens.frameBlink.isRunning = true;
            }

            // outer circle is full, let's modify the green one
            if (config.chargeProgress > 100) {
                var randomSwipinText = config.swipinArray[Math.floor(Math.random() * config.swipinArray.length)];
                newText(randomSwipinText);

                config.chargeProgress = 0;
                config.percent++;

                if (config.percent >= 100) {
                    finishCharging();
                } else {
                    totalCircle(config.circleWidth, 100);
                }
            }
            chargeProgressCircle(config.circleWidth + 20, 100);

        }

        game.position = position;
    } else {
        if (game._tweens.frameBlink && game._tweens.frameBlink.isRunning) {
            game._tweens.frameBlink.pause();
            game.frame.animations.stop();
            game._tweens.frameBlink.isRunning = false;
            game.frame.alpha = 1;

            if (game.t1 && !game.finished) {
                var randomSwipinText = config.notSwipinArray[Math.floor(Math.random() * config.notSwipinArray.length)];
                newText(randomSwipinText);
            }

            // game._tweens.frameBlink.pause();
        }
    }
}

function render() {}

function initGame() {
    game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'game', {
        preload: preload,
        create: create,
        update: update,
        render: render
    });
}

function finishCharging() {
    game.t2.setText('100%')
    newText('You battery is happy!\n Visit app later!');
    graphics.alpha = 0;
    graphics.destroy(true);
    graphics2.destroy(true);
    game.finished = true;
}

function onDeviceReady() {
    // $('#initBtn').remove();
    console.log('device ready');
    window.addEventListener("batterystatus", onBatteryStatus, false);
}