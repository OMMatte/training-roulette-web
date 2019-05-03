import React from 'react';
import Konva from 'konva'
import './App.css';

function App() {
    var width = 400;
    var height = 400;

    Konva.angleDeg = false;
    var angularVelocity = 0;
    var angularVelocities = [];
    var lastRotation = 0;
    var controlled = false;
    var numWedges = 25;
    var angularFriction = 0.2;
    var target, activeWedge, stage, layer, wheel, pointer;
    var finished = true;

    function getAverageAngularVelocity() {
        var total = 0;
        var len = angularVelocities.length;

        if (len === 0) {
            return 0;
        }

        for (var n = 0; n < len; n++) {
            total += angularVelocities[n];
        }

        return total / len;
    }
    function purifyColor(color) {
        var randIndex = Math.round(Math.random() * 3);
        color[randIndex] = 0;
        return color;
    }
    function getRandomColor() {
        var r = 100 + Math.round(Math.random() * 55);
        var g = 100 + Math.round(Math.random() * 55);
        var b = 100 + Math.round(Math.random() * 55);
        return purifyColor([r, g, b]);
    }

    function getRandomReward() {
        var mainDigit = Math.round(Math.random() * 9);
        return mainDigit + '\n0\n0';
    }
    function addWedge(n) {
        var s = getRandomColor();
        var reward = getRandomReward();
        var r = s[0];
        var g = s[1];
        var b = s[2];
        var angle = (2 * Math.PI) / numWedges;

        var endColor = 'rgb(' + r + ',' + g + ',' + b + ')';
        r += 100;
        g += 100;
        b += 100;

        var startColor = 'rgb(' + r + ',' + g + ',' + b + ')';

        var wedge = new Konva.Group({
            rotation: (2 * n * Math.PI) / numWedges
        });

        var wedgeBackground = new Konva.Wedge({
            radius: 180,
            angle: angle,
            fillRadialGradientStartPoint: {x: 0, y: 0},
            fillRadialGradientStartRadius: 0,
            fillRadialGradientEndPoint: {x: 0, y: 0},
            fillRadialGradientEndRadius: 180,
            fillRadialGradientColorStops: [0, startColor, 1, endColor],
            fill: '#64e9f8',
            fillPriority: 'radial-gradient',
            stroke: '#ccc',
            strokeWidth: 2
        });

        wedge.add(wedgeBackground);

        var text = new Konva.Text({
            text: reward,
            fontFamily: 'Calibri',
            fontSize: 10,
            fill: 'white',
            align: 'center',
            stroke: 'yellow',
            strokeWidth: 1,
            rotation: (Math.PI + angle) / 2,
            x: 160,
            y: 18,
            listening: false
        });

        wedge.add(text);
        text.cache();

        wedge.startRotation = wedge.rotation();

        wheel.add(wedge);
    }
    function animate(frame) {
        // handle wheel spin
        var angularVelocityChange =
            (angularVelocity * frame.timeDiff * (1 - angularFriction)) / 1000;
        angularVelocity -= angularVelocityChange;

        // activate / deactivate wedges based on point intersection
        var shape = stage.getIntersection({
            x: stage.width() / 2,
            y: 100
        });

        if (controlled) {
            if (angularVelocities.length > 10) {
                angularVelocities.shift();
            }

            angularVelocities.push(
                ((wheel.rotation() - lastRotation) * 1000) / frame.timeDiff
            );
        } else {
            var diff = (frame.timeDiff * angularVelocity) / 1000;
            if (diff > 0.0001) {
                wheel.rotate(diff);
            } else if (!finished && !controlled) {
                if (shape) {
                    var text = shape
                        .getParent()
                        .findOne('Text')
                        .text();
                    var price = text.split('\n').join('');
                    console.log('You price is ' + price);
                }
                finished = true;
            }
        }
        lastRotation = wheel.rotation();

        if (shape) {
            if (shape && (!activeWedge || shape._id !== activeWedge._id)) {
                pointer.y(20);

                new Konva.Tween({
                    node: pointer,
                    duration: 0.3,
                    y: 30,
                    easing: Konva.Easings.ElasticEaseOut
                }).play();

                if (activeWedge) {
                    activeWedge.fillPriority('radial-gradient');
                }
                shape.fillPriority('fill');
                activeWedge = shape;
            }
        }
    }
    function init() {
        stage = new Konva.Stage({
            container: 'container',
            width: width,
            height: height
        });
        layer = new Konva.Layer();
        wheel = new Konva.Group({
            x: stage.width() / 2,
            y: 200
        });

        for (var n = 0; n < numWedges; n++) {
            addWedge(n);
        }
        pointer = new Konva.Wedge({
            fillRadialGradientStartPoint: {x: 0, y: 0},
            fillRadialGradientStartRadius: 0,
            fillRadialGradientEndPoint: {x: 0, y: 0},
            fillRadialGradientEndRadius: 30,
            fillRadialGradientColorStops: [0, 'white', 1, 'red'],
            stroke: 'white',
            strokeWidth: 2,
            lineJoin: 'round',
            angle: 1,
            radius: 30,
            x: stage.width() / 2,
            y: 33,
            rotation: -90,
            shadowColor: 'black',
            shadowOffset: {x: 0, y: 0},
            shadowBlur: 2,
            shadowOpacity: 0.5
        });

        var circle = new Konva.Circle({
            x: stage.width() / 2,
            y: stage.height() / 2,
            radius: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        // var spinText = new Konva.Text({
        //     x: stage.width() / 2 - 32,
        //     y: stage.height() / 2 -12,
        //     align: "center",
        //     verticalAlign: 'middle',
        //     text: 'SPIN',
        //     fontSize: 30,
        //     fontFamily: 'Calibri',
        //     fill: 'green'
        // });

        // add components to the stage
        layer.add(wheel);
        layer.add(pointer);
        layer.add(circle); //TODO add to wheel
        // layer.add(spinText); //TODO add to wheel
        stage.add(layer);

        circle.on("mouseup", function(evt) {
            angularVelocity = 6;
            controlled = false;
            target = evt.target;
            finished = false;

        });

        // spinText.on("mouseup", function(evt) {
        //     angularVelocity = 6;
        //     controlled = false;
        //     target = evt.target;
        //     finished = false;
        //
        // });

        // bind events
        wheel.on('mousedown touchstart', function(evt) {
            angularVelocity = 0;
            controlled = true;
            target = evt.target;
            finished = false;

        });
        // add listeners to container
        wheel.on(
            'mouseup touchend',
            function() {
                console.log(angularVelocity);

                controlled = false;
                angularVelocity = getAverageAngularVelocity() * 5;
                console.log(angularVelocity);

                if (angularVelocity > 20) {
                    angularVelocity = 20;
                } else if (angularVelocity < -20) {
                    angularVelocity = -20;
                }

                angularVelocities = [];
            }
        );

        stage.addEventListener(
            'mousemove touchmove',
            function(evt) {
                var mousePos = stage.getPointerPosition();
                if (controlled && mousePos && target) {
                    var x = mousePos.x - wheel.getX();
                    var y = mousePos.y - wheel.getY();
                    var atan = Math.atan(y / x);
                    var rotation = x >= 0 ? atan : atan + Math.PI;
                    var targetGroup = target.getParent();

                    wheel.rotation(
                        rotation - targetGroup.startRotation - target.angle() / 2
                    );
                }
            },
            false
        );

        var anim = new Konva.Animation(animate, layer);
        anim.start()

        // // wait one second and then spin the wheel
        // setTimeout(function() {
        //     anim.start();
        // }, 1000);
    }
    init();

  return (
    <div className="App">
    </div>
  );
}

export default App;
