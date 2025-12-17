import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

const FRUIT_SIZE = 80;

const FRUITS = [
    {
        id: 'apple',
        image: require('../assets/apple.png'),
        startX: -120,
        startY: 0,
    },
    {
        id: 'banana',
        image: require('../assets/apple.png'),
        startX: 0,
        startY: 0,
    },
    {
        id: 'grape',
        image: require('../assets/apple.png'),
        startX: 120,
        startY: 0,
    },
];

function DraggableFruit({ fruit, creatureLayout }) {
    const translateX = useSharedValue(fruit.startX);
    const translateY = useSharedValue(fruit.startY);
    const prevX = useSharedValue(fruit.startX);
    const prevY = useSharedValue(fruit.startY);
    const eaten = useSharedValue(false);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: eaten.value ? withTiming(0, { duration: 300 }) : 1 },
        ],
        opacity: eaten.value ? withTiming(0) : 1,
    }));

    const pan = Gesture.Pan()
        .onStart(() => {
            prevX.value = translateX.value;
            prevY.value = translateY.value;
        })
        .onUpdate((e) => {
            translateX.value = prevX.value + e.translationX;
            translateY.value = prevY.value + e.translationY;
        })
        .onEnd(() => {
            if (!creatureLayout || eaten.value) return;

            // Convert local translate values to screen coordinates
            const fruitX = width / 2 + translateX.value;
            const fruitY = height / 2 + translateY.value;

            const hit =
                fruitX + FRUIT_SIZE / 2 > creatureLayout.x &&
                fruitX - FRUIT_SIZE / 2 < creatureLayout.x + creatureLayout.width &&
                fruitY + FRUIT_SIZE / 2 > creatureLayout.y &&
                fruitY - FRUIT_SIZE / 2 < creatureLayout.y + creatureLayout.height;

            if (hit) {
                eaten.value = true;
            }
        });

    return (
        <GestureDetector gesture={pan}>
            <Animated.Image
                source={fruit.image}
                style={[styles.fruit, animatedStyle]}
                resizeMode="contain"
            />
        </GestureDetector>
    );
}

export default function App() {
    const [creatureLayout, setCreatureLayout] = useState(null);

    return (
        <GestureHandlerRootView style={styles.container}>
            {/* Creature (Drop Zone) */}
            <Image
                source={require('../assets/capybara.png')}
                style={styles.creature}
                resizeMode="contain"
                onLayout={(e) => setCreatureLayout(e.nativeEvent.layout)}
            />

            {/* Fruits */}
            {FRUITS.map((fruit) => (
                <DraggableFruit
                    key={fruit.id}
                    fruit={fruit}
                    creatureLayout={creatureLayout}
                />
            ))}
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fruit: {
        position: 'absolute',
        width: FRUIT_SIZE,
        height: FRUIT_SIZE,
    },
    creature: {
        position: 'absolute',
        bottom: 80,
        width: 240,
        height: 240,
    },
});
