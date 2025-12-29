import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    Image,
    Animated,
    PanResponder,
    Dimensions,
    Text,
    ImageBackground
} from 'react-native';
import { Audio } from 'expo-av';
import { PetsContext } from '../context/PetContext';
import Header from '../components/Header';

const { width, height } = Dimensions.get('window');

const FOODS = [
    { value: 10, image: require('../assets/foods/burgers.png'), draggable: true },
    { value: 15, image: require('../assets/foods/coffee.png'), draggable: true },
    { value: 20, image: require('../assets/foods/meal1.png'), draggable: true },
    { value: 20, image: require('../assets/foods/pho.png'), draggable: true },
    { value: 20, image: require('../assets/foods/ramen.png'), draggable: true },
    { value: 0, image: require('../assets/foods/coffee.png'), draggable: false }, // decoy
    { value: 0, image: require('../assets/foods/bbqchx.png'), draggable: false }, // decoy
];

export default function PetFeed({ route, navigation }) {
    const { petId } = route.params;
    const { state, dispatch } = useContext(PetsContext);
    const pet = state.pets.find(p => p.id === petId);

    const [foods, setFoods] = useState([]);
    const [soundEat, setSoundEat] = useState();
    const [soundMiss, setSoundMiss] = useState();
    const [gameOver, setGameOver] = useState(false);

    // Load sounds
    useEffect(() => {
        const loadSounds = async () => {
            const eat = new Audio.Sound();
            await eat.loadAsync(require('../assets/sounds/nomnom.wav'));
            setSoundEat(eat);

            const miss = new Audio.Sound();
            await miss.loadAsync(require('../assets/sounds/miss.wav'));
            setSoundMiss(miss);
        };
        loadSounds();

        return () => {
            soundEat?.unloadAsync();
            soundMiss?.unloadAsync();
        };
    }, []);

    // Spawn food periodically
    useEffect(() => {
        if (gameOver) return;
        const interval = setInterval(() => {
            const food = FOODS[Math.floor(Math.random() * FOODS.length)];
            setFoods(prev => [
                ...prev,
                {
                    id: Math.random().toString(),
                    value: food.value,
                    image: food.image,
                    draggable: food.draggable,
                    x: Math.random() * (width - 80),
                    y: -80,
                },
            ]);
        }, 1500);

        return () => clearInterval(interval);
    }, [gameOver]);

    // End feeding game
    const endGame = () => {
        setGameOver(true);
        setTimeout(() => navigation.navigate('PetHome', { petId: pet.id }), 2500);
    };

    const handleEat = async food => {
        if (gameOver) return;

        dispatch({
            type: 'CHANGE_PET_STAT',
            payload: { id: pet.id, stat: 'hunger', delta: food.value },
        });

        setFoods(prev => prev.filter(f => f.id !== food.id));
        soundEat && await soundEat.replayAsync();

        // If hunger reaches 100, end game
        const updatedPet = state.pets.find(p => p.id === petId);
        if ((updatedPet?.hunger ?? 0) + food.value >= 100) {
            endGame();
        }
    };

    const handleMiss = async food => {
        if (gameOver) return;
        setFoods(prev => prev.filter(f => f.id !== food.id));
        if (food.draggable) soundMiss && await soundMiss.replayAsync();
    };

    // Determine pet image based on hunger
    const getPetImage = () => {
        if (pet.hunger >= 98) return pet.emotes.full;
        return pet.emotes.eating;
    };

    return (
        <ImageBackground
            source={pet.backgrounds.feed}
            style={styles.container}
            resizeMode="cover"
        >
            <Header title="Feed Me!" onBack={() => navigation.goBack()} />

            {foods.map(food => (
                <FallingFood
                    key={food.id}
                    food={food}
                    onEat={handleEat}
                    onMiss={handleMiss}
                />
            ))}

            <View style={styles.petZone}>
                <Image source={getPetImage()} style={styles.pet} />

                {!gameOver && <Text style={styles.dropText}>Drop food here</Text>}
            </View>

            <Text style={styles.hunger}>Hunger: {pet.hunger}/100</Text>
        </ImageBackground>
    );
}

// Falling food component
function FallingFood({ food, onEat, onMiss }) {
    const pan = useRef(new Animated.ValueXY({ x: food.x, y: food.y })).current;
    const animation = useRef(null);
    const offset = useRef({ x: 0, y: 0 }).current;
    const isDragging = useRef(false);

    useEffect(() => {
        animation.current = Animated.timing(pan, {
            toValue: { x: food.x, y: height + 80 },
            duration: 5000,
            useNativeDriver: false,
        });

        animation.current.start(({ finished }) => {
            if (finished && !isDragging.current) onMiss(food);
        });

        return () => animation.current.stop();
    }, []);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => food.draggable,
            onPanResponderGrant: (_, gesture) => {
                if (!food.draggable) return;
                isDragging.current = true;
                animation.current.stop();
                offset.x = pan.x._value - gesture.x0;
                offset.y = pan.y._value - gesture.y0;
            },
            onPanResponderMove: (_, gesture) => {
                if (!food.draggable) return;
                pan.setValue({ x: gesture.moveX + offset.x, y: gesture.moveY + offset.y });
            },
            onPanResponderRelease: (_, gesture) => {
                if (!food.draggable) return;
                isDragging.current = false;

                if (gesture.moveY > height * 0.7) {
                    onEat(food);
                } else {
                    Animated.timing(pan, {
                        toValue: { x: pan.x._value, y: height + 80 },
                        duration: 3000,
                        useNativeDriver: false,
                    }).start(() => onMiss(food));
                }
            },
        })
    ).current;

    return (
        <Animated.View
            {...(food.draggable ? panResponder.panHandlers : {})}
            style={[styles.food, pan.getLayout()]}
        >
            <Image source={food.image} style={styles.foodImage} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fffaf0' },
    petZone: {
        position: 'absolute',
        bottom: 80,
        width: '100%',
        alignItems: 'center',
    },
    pet: { width: 240, height: 240, resizeMode: 'contain' },
    dropText: {
        marginTop: 8,
        fontSize: 16,
        color: '#666',
        fontWeight: 'bold',
    },
    food: { position: 'absolute', width: 70, height: 70 },
    foodImage: { width: '100%', height: '100%', resizeMode: 'contain' },
    hunger: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        fontSize: 18,
        fontWeight: '600',
    },
});
