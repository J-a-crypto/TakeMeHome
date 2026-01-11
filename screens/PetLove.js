import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Dimensions, StyleSheet, Text, ImageBackground } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import Matter from 'matter-js';
import { Audio } from 'expo-av';
import { PetsContext } from '../context/PetContext';

const { width, height } = Dimensions.get('window');

const HAPPINESS_VALUES = {
    positive: 25,
    negative: -3,
};

// ------------------ Game Renderers ------------------
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

const TargetCircle = ({ body, hitsLeft, radius, type }) => {
    const color = type === 'positive' ? '#2ecc71' : '#e74c3c';
    return (
        <View
            style={{
                position: 'absolute',
                left: body.position.x - radius,
                top: body.position.y - radius,
                width: radius * 2,
                height: radius * 2,
                borderRadius: radius,
                backgroundColor: color,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
                {hitsLeft}
            </Text>
        </View>
    );
};

const FloatingMessage = ({ position, message, type }) => {
    const color = type === 'positive' ? '#2ecc71' : '#e74c3c';
    return (
        <View
            style={{
                position: 'absolute',
                left: position.x - 60,
                top: position.y - 20,
                width: 120,
                padding: 6,
                backgroundColor: color,
                borderRadius: 8,
                alignItems: 'center',
            }}
        >
            <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
                {message}
            </Text>
        </View>
    );
};

const TrajectoryPreview = ({ start, end, active, walls }) => {
    if (!active || !start || !end) return null;

    let dx = end.x - start.x;
    let dy = end.y - start.y;

    const points = [];
    let pos = { x: start.x, y: start.y };
    const forceScale = 0.05;
    let vel = { x: dx * forceScale, y: dy * forceScale };
    const gravity = 0.98;
    const restitution = 1.5;

    for (let i = 0; i < 50; i++) {
        vel.y += gravity * 0.016;
        pos.x += vel.x;
        pos.y += vel.y;

        walls.forEach((w) => {
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

// ------------------ Physics System ------------------
const Physics = (entities, { time }) => {
    Matter.Engine.update(entities.physics.engine, time.delta);
    return entities;
};

// ------------------ Game Logic ------------------
let ballId = 0;
const TARGET_ZONE = { xMin: 50, xMax: width - 50, yMin: 300, yMax: height - 100 };
const POSITIVE_MESSAGES = ['Nice!', 'Great job!', 'Keep going!', 'You got this!', 'Well done!'];
const NEGATIVE_MESSAGES = ['Missed!', 'Try again', 'Oops', 'Not this one', 'Focus!'];

const createSingleTarget = (world, index) => {
    const radius = 25;
    const hits = Math.floor(Math.random() * 15) + 10;
    const isPositive = Math.random() < 0.5;
    const message = isPositive
        ? POSITIVE_MESSAGES[Math.floor(Math.random() * POSITIVE_MESSAGES.length)]
        : NEGATIVE_MESSAGES[Math.floor(Math.random() * NEGATIVE_MESSAGES.length)];

    const body = Matter.Bodies.circle(
        Math.random() * (TARGET_ZONE.xMax - TARGET_ZONE.xMin) + TARGET_ZONE.xMin,
        Math.random() * (TARGET_ZONE.yMax - TARGET_ZONE.yMin) + TARGET_ZONE.yMin,
        radius + 1.5,
        { isStatic: true, restitution: 1, label: 'target' }
    );

    Matter.World.add(world, body);

    return {
        [`target_${index}`]: {
            body,
            radius,
            hitsLeft: hits,
            message,
            type: isPositive ? 'positive' : 'negative',
            renderer: TargetCircle,
        },
    };
};

const createTargets = (world, count = 10) => {
    let targets = {};
    for (let i = 0; i < count; i++) {
        targets = { ...targets, ...createSingleTarget(world, i) };
    }
    return targets;
};

// ------------------ Main Component ------------------
export default function BouncyShooter({ navigation, route }) {
    const totalBalls = 10;
    const [ballCount, setBallCount] = useState(totalBalls);
    const { state, dispatch } = useContext(PetsContext);
    const { petId } = route.params;
    const pet = state.pets.find(p => p.id === petId);
    const [gameFinished, setGameFinished] = useState(false);
    const [showEndMessage, setShowEndMessage] = useState(false);



    // ----- Audio Setup -----
    const ballSound = useRef(new Audio.Sound());
    const hitPositiveSound = useRef(new Audio.Sound());
    const hitNegativeSound = useRef(new Audio.Sound());

    useEffect(() => {
        const loadSounds = async () => {
            try {
                await ballSound.current.loadAsync(require('../assets/sounds/shoot.wav'));
                await hitPositiveSound.current.loadAsync(require('../assets/sounds/positive_hit.wav'));
                await hitNegativeSound.current.loadAsync(require('../assets/sounds/negative_hit.wav'));
            } catch (error) {
                console.log('Error loading sounds:', error);
            }
        };
        loadSounds();

        return () => {
            ballSound.current.unloadAsync();
            hitPositiveSound.current.unloadAsync();
            hitNegativeSound.current.unloadAsync();
        };
    }, []);



    const handleHappinessChange = (delta) => {
        if (!petId) return;

        dispatch({
            type: 'CHANGE_PET_STAT',
            payload: {
                id: petId,
                stat: 'happiness',
                delta,
            },
        });
    };
    useEffect(() => {
        if (!pet) return;

        if (pet.happiness >= 100 && !gameFinished) {
            setGameFinished(true);
            setShowEndMessage(true);

            // After message, go back to PetHome
            setTimeout(() => {
                setShowEndMessage(false);
                navigation.navigate('PetHome', { petId });
            }, 2500);
        }
    }, [pet?.happiness]);



    // ----- MatterJS Setup -----
    const engine = Matter.Engine.create({ enableSleeping: false });
    const world = engine.world;
    engine.gravity.y = 1;

    const targets = createTargets(world, 8);

    const ceiling = Matter.Bodies.rectangle(width / 2, 80, width, 20, { isStatic: true, restitution: 1 });
    const floor = Matter.Bodies.rectangle(width / 2, height - 30, width, 20, { isStatic: true, isSensor: true, label: 'killFloor' });
    const leftWall = Matter.Bodies.rectangle(-10, height / 2, 20, height, { isStatic: true, restitution: 1 });
    const rightWall = Matter.Bodies.rectangle(width + 10, height / 2, 20, height, { isStatic: true, restitution: 1 });
    Matter.World.add(world, [ceiling, floor, leftWall, rightWall]);

    const walls = [
        { x: 0, y: 0, width: 20, height, isVertical: true },
        { x: width, y: 0, width: 20, height, isVertical: true },
    ];

    // ------------------ Systems ------------------
    const TargetHitSystem = (entities, { onHappiness }) => {
        const engine = entities.physics.engine;
        const world = entities.physics.world;

        if (entities._collisionListenerAdded) return entities;
        entities._collisionListenerAdded = true;

        Matter.Events.on(engine, 'collisionStart', (event) => {
            event.pairs.forEach(({ bodyA, bodyB }) => {
                const ball = bodyA.label === 'ball' ? bodyA : bodyB.label === 'ball' ? bodyB : null;
                const targetBody = bodyA.label === 'target' ? bodyA : bodyB.label === 'target' ? bodyB : null;
                if (!ball || !targetBody) return;

                const targetKey = Object.keys(entities).find((key) => entities[key]?.body === targetBody);
                if (!targetKey) return;

                const target = entities[targetKey];
                target.hitsLeft -= 1;

                if (target.hitsLeft <= 0) {
                    const { x, y } = target.body.position;
                    onHappiness(target.type === 'positive' ? HAPPINESS_VALUES.positive : HAPPINESS_VALUES.negative);

                    // Play SFX
                    try {
                        if (target.type === 'positive') hitPositiveSound.current.replayAsync();
                        else hitNegativeSound.current.replayAsync();
                    } catch (e) {
                        console.log('Error playing hit sound', e);
                    }

                    Matter.World.remove(world, targetBody);
                    delete entities[targetKey];

                    // Spawn floating message
                    const messageKey = `message_${Date.now()}`;
                    entities[messageKey] = {
                        position: { x, y },
                        message: target.message,
                        type: target.type,
                        life: 60,
                        renderer: FloatingMessage,
                    };

                    Object.assign(entities, createSingleTarget(world, Date.now()));
                }
            });
        });

        return entities;
    };

    const Controls = (entities, { touches }) => {
        const world = entities.physics.world;
        if (!entities.aim) entities.aim = { active: false, start: null, end: null, renderer: TrajectoryPreview };
        if (entities.ballCount.count <= 0) return entities;

        const topBarHeight = 100;
        const topBarTop = 30;
        const ballRadius = 18;
        const topCenter = { x: width / 2, y: topBarTop + topBarHeight - ballRadius };

        touches.forEach((touch) => {
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
                    restitution: 0.9,
                    friction: 0,
                    frictionAir: 0.005,
                    label: 'ball',
                });

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

                // Play ball throw sound
                try {
                    ballSound.current.replayAsync();
                } catch (e) {
                    console.log('Error playing ball sound', e);
                }

                entities.aim.active = false;
                entities.aim.start = null;
                entities.aim.end = null;
            }
        });

        return entities;
    };

    const MessageCleanupSystem = (entities) => {
        Object.keys(entities).forEach((key) => {
            const e = entities[key];
            if (e?.life !== undefined) {
                e.life -= 1;
                e.position.y -= 0.3;
                if (e.life <= 0) delete entities[key];
            }
        });
        return entities;
    };

    const BallCleanupSystem = (entities) => {
        const world = entities.physics.world;
        if (!entities.ballsInPlay) entities.ballsInPlay = [];

        entities.ballsInPlay.forEach((ballKey) => {
            const ballEntity = entities[ballKey];
            if (!ballEntity) return;
            const ballBody = ballEntity.body;
            if (ballBody.position.y >= height - 40) {
                Matter.World.remove(world, ballBody);
                delete entities[ballKey];
            }
        });

        entities.ballsInPlay = entities.ballsInPlay.filter((key) => entities[key]);
        if (entities.ballsInPlay.length === 0 && entities.ballCount.count === 0) {
            entities.ballCount.count = totalBalls;
        }
        setBallCount(entities.ballCount.count);
        return entities;
    };

    const StuckBallSystem = (entities) => {
        if (!entities.ballsInPlay) return entities;
        entities.ballsInPlay.forEach((key) => {
            const ball = entities[key]?.body;
            if (!ball) return;
            const speed = Math.hypot(ball.velocity.x, ball.velocity.y);
            if (speed < 0.2) {
                Matter.Body.applyForce(ball, ball.position, { x: (Math.random() - 0.5) * 0.002, y: -0.003 });
            }
        });
        return entities;
    };

    return (

        <ImageBackground
            source={pet.backgrounds.love}
            style={styles.container}
            resizeMode="cover"
        >
            {showEndMessage && (
                <View style={styles.endOverlay}>
                    <Text style={styles.endText}>
                        I love you so much c:
                    </Text>
                </View>
            )}
            <View style={styles.topBar}>
                <View style={styles.ballCircle}>
                    <Text style={styles.ballCount}>{ballCount}</Text>
                </View>
            </View>

            <GameEngine
                style={styles.gameContainer}
                systems={gameFinished ? [] : [Physics, StuckBallSystem, Controls, BallCleanupSystem, (e, a) => TargetHitSystem(e, { ...a, onHappiness: handleHappinessChange }), MessageCleanupSystem]}
                entities={{
                    physics: { engine, world },
                    ballCount: { count: totalBalls },
                    ballsInPlay: [],
                    aim: { active: false, start: null, end: null, renderer: (props) => <TrajectoryPreview {...props} walls={walls} /> },
                    floor: { body: floor, size: [width, 20], renderer: Box },
                    leftWall: { body: leftWall, size: [20, height], renderer: Box },
                    rightWall: { body: rightWall, size: [20, height], renderer: Box },
                    ceiling: { body: ceiling, size: [width, 20], renderer: Box },
                    ...targets,
                }}
            />
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    topBar: {
        position: 'absolute',
        top: 0,
        width,
        height: 120,
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
        top: 20
    },
    ballCount: { color: '#111', fontWeight: 'bold', fontSize: 20 },
    gameContainer: { flex: 1 },
    endOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    endText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        paddingHorizontal: 20,
    },

});
