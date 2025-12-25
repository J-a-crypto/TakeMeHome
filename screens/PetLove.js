import React, { useState } from 'react';
import { View, Dimensions, StyleSheet, Text } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import Matter from 'matter-js';

const { width, height } = Dimensions.get('window');

const Ball = ({ body }) => {
    const r = body.circleRadius;
    return (
        <View
            style={{
                position: 'absolute',
                left: body.position.x - r,
                top: body.position.y - r,
                width: r * 2,
                height: r * 2,
                borderRadius: r,
                backgroundColor: 'orange',
            }}
        />
    );
};

const Box = ({ body, size, color = '#555' }) => (
    <View
        style={{
            position: 'absolute',
            left: body.position.x - size[0] / 2,
            top: body.position.y - size[1] / 2,
            width: size[0],
            height: size[1],
            backgroundColor: color,
        }}
    />
);

const TrajectoryPreview = ({ start, end, active, walls }) => {
    if (!active || !start || !end) return null;

    let dx = end.x - start.x;
    let dy = end.y - start.y;

    const points = [];
    let pos = { x: start.x, y: start.y };
    const forceScale = 0.05;
    let vel = { x: dx * forceScale, y: dy * forceScale };
    const gravity = 1;
    const restitution = 1;

    for (let i = 0; i < 50; i++) {
        vel.y += gravity * 0.016;
        pos.x += vel.x;
        pos.y += vel.y;

        walls.forEach(w => {
            if (w.isVertical && pos.x <= w.x + w.width / 2 && pos.x >= w.x - w.width / 2) {
                vel.x = -vel.x * restitution;
            }
            if (
                w.isPlatform &&
                pos.y >= w.y - w.height / 2 &&
                pos.y <= w.y + w.height / 2 &&
                pos.x >= w.x - w.width / 2 &&
                pos.x <= w.x + w.width / 2
            ) {
                vel.y = -vel.y * restitution;
            }
        });

        if (pos.y >= height - 30) break;
        points.push({ x: pos.x, y: pos.y });
    }

    return (
        <>
            {points.map((p, i) => (
                <View
                    key={i}
                    style={{
                        position: 'absolute',
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        left: p.x - 2,
                        top: p.y - 2,
                    }}
                />
            ))}
        </>
    );
};

const Physics = (entities, { time }) => {
    Matter.Engine.update(entities.physics.engine, time.delta);
    return entities;
};

let ballId = 0;

const Controls = (entities, { touches }) => {
    const world = entities.physics.world;

    if (!entities.aim) {
        entities.aim = { active: false, start: null, end: null, renderer: TrajectoryPreview };
    }

    if (entities.ballCount.count <= 0) return entities;

    const topBarHeight = 100;
    const topBarTop = 30;
    const ballRadius = 18;

    const topCenter = {
        x: width / 2,
        y: topBarTop + topBarHeight - ballRadius,
    };

    touches.forEach(touch => {
        if (touch.type === 'start') {
            entities.aim.active = true;
            entities.aim.start = topCenter;
            entities.aim.end = { x: touch.event.pageX, y: touch.event.pageY };
        }

        if (touch.type === 'move' && entities.aim.start) {
            entities.aim.end = { x: touch.event.pageX, y: touch.event.pageY };
        }

        if (touch.type === 'end' && entities.aim.start) {
            let dx = touch.event.pageX - entities.aim.start.x;
            let dy = touch.event.pageY - entities.aim.start.y;

            const ball = Matter.Bodies.circle(entities.aim.start.x, entities.aim.start.y, ballRadius, {
                restitution: 1,
                friction: 0,
                frictionAir: 0,
                label: 'ball',
            });

            // Optional: limit max force
            const maxForce = 0.05;
            const length = Math.sqrt(dx * dx + dy * dy);
            if (length > 0) {
                dx = (dx / length) * maxForce;
                dy = (dy / length) * maxForce;
            }

            Matter.Body.applyForce(ball, ball.position, { x: dx, y: dy });
            Matter.World.add(world, ball);

            const ballKey = `ball_${ballId++}`;
            entities[ballKey] = { body: ball, renderer: Ball };

            if (!entities.ballsInPlay) entities.ballsInPlay = [];
            entities.ballsInPlay.push(ballKey);

            entities.ballCount.count = Math.max(entities.ballCount.count - 1, 0);

            entities.aim.active = false;
            entities.aim.start = null;
            entities.aim.end = null;
        }
    });

    return entities;
};

export default function BouncyShooter() {
    const totalBalls = 10;
    const [ballCount, setBallCount] = useState(totalBalls);

    const engine = Matter.Engine.create({ enableSleeping: false });
    const world = engine.world;
    engine.gravity.y = 1;

    const floor = Matter.Bodies.rectangle(width / 2, height - 30, width, 20, {
        isStatic: true,
        isSensor: true,
        label: 'killFloor',
    });
    const leftWall = Matter.Bodies.rectangle(-10, height / 2, 20, height, { isStatic: true, restitution: 1 });
    const rightWall = Matter.Bodies.rectangle(width + 10, height / 2, 20, height, { isStatic: true, restitution: 1 });
    const platform1 = Matter.Bodies.rectangle(width / 2, height - 180, 160, 15, { isStatic: true, restitution: 1 });

    Matter.World.add(world, [floor, leftWall, rightWall, platform1]);

    const walls = [
        { x: 0, y: 0, width: 20, height, isVertical: true },
        { x: width, y: 0, width: 20, height, isVertical: true },
        { x: platform1.position.x, y: platform1.position.y, width: 160, height: 15, isPlatform: true },
    ];

    const BallCleanupSystem = (entities) => {
        const world = entities.physics.world;
        if (!entities.ballsInPlay) entities.ballsInPlay = [];

        entities.ballsInPlay.forEach(ballKey => {
            const ballEntity = entities[ballKey];
            if (!ballEntity) return;

            const ballBody = ballEntity.body;

            if (ballBody.position.y >= height - 40) {
                Matter.World.remove(world, ballBody);
                delete entities[ballKey];
            }
        });

        entities.ballsInPlay = entities.ballsInPlay.filter(key => entities[key]);

        if (entities.ballsInPlay.length === 0 && entities.ballCount.count === 0) {
            entities.ballCount.count = totalBalls;
        }

        setBallCount(entities.ballCount.count);
        return entities;
    };

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <View style={styles.ballCircle}>
                    <Text style={styles.ballCount}>{ballCount}</Text>
                </View>
            </View>

            <GameEngine
                style={styles.gameContainer}
                systems={[Physics, Controls, BallCleanupSystem]}
                entities={{
                    physics: { engine, world },
                    ballCount: { count: totalBalls },
                    ballsInPlay: [],
                    aim: { active: false, start: null, end: null, renderer: (props) => <TrajectoryPreview {...props} walls={walls} /> },
                    floor: { body: floor, size: [width, 20], renderer: Box },
                    leftWall: { body: leftWall, size: [20, height], renderer: Box },
                    rightWall: { body: rightWall, size: [20, height], renderer: Box },
                    platform1: { body: platform1, size: [160, 15], renderer: Box },
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111' },
    topBar: {
        position: 'absolute',
        top: 30,
        width,
        height: 100,
        backgroundColor: '#222',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    ballCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'orange',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ballCount: { color: '#111', fontWeight: 'bold', fontSize: 20 },
    gameContainer: { flex: 1 },
});
