import React from 'react';
import { View, Text } from 'react-native';

// ----------------------
// Ball Renderer
// ----------------------
export const Ball = ({ body }) => {
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

// ----------------------
// Box Renderer (Walls, Floor, Ceiling)
// ----------------------
export const Box = ({ body, size, color = '#555' }) => (
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

// ----------------------
// Target Circle Renderer
// ----------------------
export const TargetCircle = ({ body, hitsLeft, radius, type }) => {
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

// ----------------------
// Floating Message Renderer
// ----------------------
export const FloatingMessage = ({ position, message, type }) => {
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

// ----------------------
// Trajectory Preview Renderer
// ----------------------
export const TrajectoryPreview = ({ start, end, active, walls }) => {
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

        if (pos.y >= walls[0].height - 30) break;
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
