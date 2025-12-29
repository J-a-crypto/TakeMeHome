import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    Image,
    Animated,
    PanResponder,
    Dimensions,
    Text,
} from 'react-native';
import { PetsContext } from '../context/PetContext';
import Header from '../components/Header';

const { width, height } = Dimensions.get('window');

const FOODS = [
    { value: 10, image: require('../assets/apple.png') },
    { value: 15, image: require('../assets/apple1.png') },
    { value: 20, image: require('../assets/apple2.png') },
];

export default function PetFeed({ route, navigation }) {
    const { petId } = route.params;
    const { state, dispatch } = useContext(PetsContext);
    const pet = state.pets.find(p => p.id === petId);

    const [foods, setFoods] = useState([]);

    // Spawn food above
    useEffect(() => {
        const spawn = Array.from({ length: 5 }).map(() => {
            const food = FOODS[Math.floor(Math.random() * FOODS.length)];
            return {
                id: Math.random().toString(),
                value: food.value,
                image: food.image,
                x: Math.random() * (width - 80),
                y: 80 + Math.random() * 200,
            };
        });
        setFoods(spawn);
    }, []);

    const handleEat = food => {
        dispatch({
            type: 'CHANGE_PET_STAT',
            payload: {
                id: pet.id,
                stat: 'hunger',
                delta: food.value,
            },
        });

        setFoods(prev => prev.filter(f => f.id !== food.id));
    };

    return (
        <View style={styles.container}>
            <Header title="Feed Me!" onBack={() => navigation.goBack()} />

            {/* FOOD */}
            {foods.map(food => (
                <DraggableFood
                    key={food.id}
                    food={food}
                    onEat={handleEat}
                />
            ))}

            {/* PET DROP ZONE */}
            <View style={styles.petZone}>
                <Image source={pet.image} style={styles.pet} />
                <Text style={styles.dropText}>Drop food here</Text>
            </View>

            <Text style={styles.hunger}>
                Hunger: {pet.hunger}/100
            </Text>
        </View>
    );
}

function DraggableFood({ food, onEat }) {
    const pan = useRef(new Animated.ValueXY({ x: food.x, y: food.y })).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (_, gesture) => {
                // Pet zone is bottom 30% of screen
                if (gesture.moveY > height * 0.7) {
                    onEat(food);
                } else {
                    Animated.spring(pan, {
                        toValue: { x: food.x, y: food.y },
                        useNativeDriver: false,
                    }).start();
                }
            },
        })
    ).current;

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={[styles.food, pan.getLayout()]}
        >
            <Image source={food.image} style={styles.foodImage} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fffaf0',
    },

    petZone: {
        position: 'absolute',
        bottom: 80,
        width: '100%',
        alignItems: 'center',
    },

    pet: {
        width: 240,
        height: 240,
        resizeMode: 'contain',
    },

    dropText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
    },

    food: {
        position: 'absolute',
        width: 70,
        height: 70,
    },

    foodImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },

    hunger: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        fontSize: 18,
        fontWeight: '600',
    },
});
