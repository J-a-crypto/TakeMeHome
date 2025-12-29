import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Image,
} from 'react-native';
import { Audio } from 'expo-av';
import Header from '../components/Header';
import { PetsContext } from '../context/PetContext';
import { SoundContext } from '../context/SoundContext';

const TOTAL_BITES = 4;
const BAR_WIDTH = 260;
const INDICATOR_WIDTH = 20;
const AUTO_RETURN_DELAY = 2500;



export default function PetHeal({ route, navigation }) {
    const { petId } = route.params;
    const { state, dispatch } = useContext(PetsContext);
    const pet = state.pets.find(p => p.id === petId);

    const [bites, setBites] = useState(0);
    const [result, setResult] = useState(null);
    const [speech, setSpeech] = useState('Feed me!');

    const position = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const sparkleOpacity = useRef(new Animated.Value(0)).current;

    // Pet animation
    const petScale = useRef(new Animated.Value(1)).current;
    const petBounce = useRef(new Animated.Value(0)).current;

    // Completion
    const completionOpacity = useRef(new Animated.Value(0)).current;
    const completionTranslate = useRef(new Animated.Value(30)).current;
    const autoReturnTimer = useRef(null);
    const hasNavigated = useRef(false);

    // 🔊 Sounds
    const biteSound = useRef(null);
    const missSound = useRef(null);
    const completeSound = useRef(null);

    useEffect(() => {
        startIndicator();
        loadSounds();

        return () => {
            unloadSounds();
            if (autoReturnTimer.current) clearTimeout(autoReturnTimer.current);
        };
    }, []);

    /* 🔊 SOUND SETUP */

    const loadSounds = async () => {
        biteSound.current = new Audio.Sound();
        missSound.current = new Audio.Sound();
        completeSound.current = new Audio.Sound();

        await biteSound.current.loadAsync(
            require('../assets/sounds/bite.wav')
        );
        await missSound.current.loadAsync(
            require('../assets/sounds/miss.wav')
        );
        await completeSound.current.loadAsync(
            require('../assets/sounds/complete.wav')
        );
    };

    const unloadSounds = async () => {
        await biteSound.current?.unloadAsync();
        await missSound.current?.unloadAsync();
        await completeSound.current?.unloadAsync();
    };

    const playSound = async soundRef => {
        if (!soundRef?.current) return;
        try {
            await soundRef.current.replayAsync();
        } catch { }
    };

    /* NAVIGATION */

    const navigateHome = () => {
        if (hasNavigated.current) return;
        hasNavigated.current = true;
        navigation.navigate('PetHome', { petId });
    };

    /* GAME LOGIC */

    const startIndicator = () => {
        position.setValue(0);
        Animated.loop(
            Animated.sequence([
                Animated.timing(position, {
                    toValue: BAR_WIDTH - INDICATOR_WIDTH,
                    duration: 1200,
                    useNativeDriver: false,
                }),
                Animated.timing(position, {
                    toValue: 0,
                    duration: 1200,
                    useNativeDriver: false,
                }),
            ])
        ).start();
    };

    const getAppleImage = () => {
        switch (bites) {
            case 0: return require('../assets/apple0.png');
            case 1: return require('../assets/apple1.png');
            case 2: return require('../assets/apple2.png');
            case 3: return require('../assets/apple3.png');
            default: return require('../assets/apple4.png');
        }
    };

    const animateBite = () => {
        Animated.sequence([
            Animated.timing(scale, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.sequence([
            Animated.timing(sparkleOpacity, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(sparkleOpacity, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    };

    /* 🐶 PET REACTIONS */

    const petPerfect = () => {
        setSpeech('Yay! So tasty!');
        Animated.sequence([
            Animated.spring(petBounce, { toValue: -20, useNativeDriver: true }),
            Animated.spring(petBounce, { toValue: 0, useNativeDriver: true }),
        ]).start();
    };

    const petMiss = () => {
        setSpeech('Oh no...');
        Animated.sequence([
            Animated.timing(petScale, { toValue: 0.95, duration: 120, useNativeDriver: true }),
            Animated.timing(petScale, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start();
    };

    const showCompletion = async () => {
        setSpeech('I feel much better!');
        await playSound(completeSound);

        Animated.parallel([
            Animated.timing(completionOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(completionTranslate, {
                toValue: 0,
                friction: 6,
                useNativeDriver: true,
            }),
        ]).start();

        autoReturnTimer.current = setTimeout(navigateHome, AUTO_RETURN_DELAY);
    };

    const handleBite = () => {
        if (bites >= TOTAL_BITES) return;

        position.stopAnimation(async value => {
            const center = BAR_WIDTH / 2;
            const distance = Math.abs(value - center);

            let heal = 0;
            let text = '';

            if (distance < 15) {
                heal = 15;
                text = '⭐ PERFECT!';
                petPerfect();
                playSound(biteSound);
            } else if (distance < 40) {
                heal = 8;
                text = '🙂 Good!';
                setSpeech('Nom nom!');
                playSound(biteSound);
            } else {
                text = '❌ Miss!';
                petMiss();
                playSound(missSound);
            }

            if (heal > 0) {
                dispatch({
                    type: 'CHANGE_PET_STAT',
                    payload: {
                        id: pet.id,
                        stat: 'health',
                        delta: heal,
                    },
                });

                setBites(prev => {
                    const next = prev + 1;
                    if (next === TOTAL_BITES) showCompletion();
                    return next;
                });

                animateBite();
            }

            setResult(text);
            setTimeout(() => {
                setResult(null);
                if (bites + 1 < TOTAL_BITES) setSpeech('Feed me!');
            }, 900);

            if (bites + 1 < TOTAL_BITES) startIndicator();
        });
    };

    return (
        <View style={styles.container}>
            <Header title="Healing Time" onBack={() => navigation.goBack()} />
            <Text style={styles.health}>❤️ Health: {pet.health}/100</Text>

            {bites < TOTAL_BITES && (
                <>
                    <Text style={styles.instructions}>Tap the apple at the right moment!</Text>

                    <View style={styles.bar}>
                        <View style={styles.perfectZone} />
                        <Animated.View style={[styles.indicator, { left: position }]} />
                    </View>

                    <TouchableOpacity activeOpacity={0.9} onPress={handleBite}>
                        <Animated.Image
                            source={getAppleImage()}
                            style={[styles.apple, { transform: [{ scale }] }]}
                        />
                    </TouchableOpacity>
                </>
            )}

            {result && <Text style={styles.result}>{result}</Text>}

            {/* 🐾 PET */}
            <View style={styles.petSlot} pointerEvents="none">
                <View style={styles.speechBubble}>
                    <Text style={styles.speechText}>{speech}</Text>
                </View>

                <Animated.Image
                    source={pet.image}
                    style={[
                        styles.petImage,
                        {
                            transform: [
                                { scale: petScale },
                                { translateY: petBounce },
                            ],
                        },
                    ]}
                />
            </View>

            {/* COMPLETION */}
            {bites >= TOTAL_BITES && (
                <Animated.View style={[styles.completionOverlay, { opacity: completionOpacity }]}>
                    <Animated.View style={{ transform: [{ translateY: completionTranslate }], alignItems: 'center' }}>
                        <Text style={styles.completionTitle}>🍎 An Apple a Day</Text>
                        <Text style={styles.completionSubtitle}>Keeps the Doctor Away!</Text>
                        <TouchableOpacity style={styles.backButton} onPress={navigateHome}>
                            <Text style={styles.backButtonText}>Back to Pet Home</Text>
                        </TouchableOpacity>
                        <Text style={styles.autoText}>Returning automatically…</Text>
                    </Animated.View>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fffaf0', alignItems: 'center', justifyContent: 'center' },
    health: { position: 'absolute', top: 90, fontSize: 18, fontWeight: '600' },
    instructions: { fontSize: 16, marginBottom: 10 },
    bar: { width: BAR_WIDTH, height: 14, backgroundColor: '#ddd', borderRadius: 8, marginBottom: 20, overflow: 'hidden' },
    perfectZone: { position: 'absolute', left: BAR_WIDTH / 2 - 15, width: 30, height: '100%', backgroundColor: '#81c784' },
    indicator: { position: 'absolute', width: INDICATOR_WIDTH, height: 22, backgroundColor: '#ff5252', borderRadius: 4, top: -4 },
    apple: { width: 220, height: 220, resizeMode: 'contain' },
    result: { position: 'absolute', bottom: 160, fontSize: 26, fontWeight: '700' },

    petSlot: { position: 'absolute', bottom: 20, alignItems: 'center' },
    petImage: { width: 120, height: 120, resizeMode: 'contain' },
    speechBubble: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, marginBottom: 6 },
    speechText: { fontSize: 14, fontWeight: '600' },

    completionOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,250,240,0.95)', alignItems: 'center', justifyContent: 'center' },
    completionTitle: { fontSize: 30, fontWeight: '800' },
    completionSubtitle: { fontSize: 20, fontWeight: '600', color: '#4caf50', marginBottom: 24 },
    backButton: { backgroundColor: '#ff6f61', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 30 },
    backButtonText: { color: '#fff', fontWeight: '700' },
    autoText: { marginTop: 10, fontSize: 12, color: '#777' },
});
