import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { GameEngine } from "react-native-game-engine";
import Matter from "matter-js";

const { width, height } = Dimensions.get("window");

/* ---------------- PHYSICS SYSTEM ---------------- */
const Physics = (entities, { time }) => {
    if (!entities.physics) return entities;

    // Clamp delta to avoid warnings
    const delta = Math.min(time.delta, 16.667);
    Matter.Engine.update(entities.physics.engine, delta);

    return entities;
};

/* ---------------- BALL SHOOTER GAME ---------------- */
export default function BallShooterGame() {
    const [entities, setEntities] = useState(null);

    useEffect(() => {
        console.log("🚀 Initializing Matter engine");

        const engine = Matter.Engine.create();
        const world = engine.world;
        world.gravity.y = 1;

        // Ground
        const ground = Matter.Bodies.rectangle(width / 2, height - 20, width, 40, {
            isStatic: true,
        });
        Matter.World.add(world, ground);

        setEntities({
            physics: { engine, world },
            ground: {
                body: ground,
                size: [width, 40],
                color: "green",
                renderer: Ground,
            },
        });

        console.log("✅ Entities initialized with ground");
    }, []);

    const shootBalls = (x, y) => {
        console.log("👆 Screen touched at:", x, y);

        setEntities((prev) => {
            if (!prev) return prev;

            const { world } = prev.physics;
            const startX = width / 2;
            const startY = height - 60;
            const angle = Math.atan2(y - startY, x - startX);
            const speed = 15;
            const vx = speed * Math.cos(angle);
            const vy = speed * Math.sin(angle);

            const newBalls = {};

            for (let i = 0; i < 10; i++) {
                const ball = Matter.Bodies.circle(startX, startY, 8, { restitution: 0.9 });
                Matter.Body.setVelocity(ball, { x: vx, y: vy });
                Matter.World.add(world, ball);

                newBalls[`ball_${ball.id}`] = {
                    body: ball,
                    size: [16, 16],
                    color: "black",
                    renderer: Ball,
                };

                console.log(`⚫ Ball ${i + 1} created, id: ${ball.id}`);
            }

            // Return a new object reference so GameEngine re-renders
            return {
                ...prev,
                ...newBalls,
                physics: { ...prev.physics },
            };
        });
    };

    if (!entities) return null;

    return (
        <View
            style={styles.container}
            onStartShouldSetResponder={() => true}
            onResponderRelease={(e) => {
                const { pageX, pageY } = e.nativeEvent;
                shootBalls(pageX, pageY);
            }}
        >
            <GameEngine style={styles.container} systems={[Physics]} entities={entities} />
        </View>
    );
}

/* ---------------- RENDERERS ---------------- */
const Ball = ({ body, size, color }) => {
    const x = body.position.x - size[0] / 2;
    const y = body.position.y - size[1] / 2;

    return (
        <View
            style={[
                styles.ball,
                {
                    width: size[0],
                    height: size[1],
                    backgroundColor: color,
                    left: x,
                    top: y,
                },
            ]}
        />
    );
};

const Ground = ({ body, size, color }) => {
    const x = body.position.x - size[0] / 2;
    const y = body.position.y - size[1] / 2;

    return (
        <View
            style={{
                position: "absolute",
                width: size[0],
                height: size[1],
                backgroundColor: color,
                left: x,
                top: y,
            }}
        />
    );
};

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    ball: {
        position: "absolute",
        borderRadius: 8,
    },
});
