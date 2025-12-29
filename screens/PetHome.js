import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Animated,
} from 'react-native';
import Header from '../components/Header';
import { PetsContext } from '../context/PetContext';

export default function PetHome({ navigation }) {
    const { state } = useContext(PetsContext);
    const pet = state.pets.find(p => p.id === state.activePetId);

    const translateY = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const [hearts, setHearts] = useState([]);

    // Idle animation
    useEffect(() => {
        const idle = Animated.loop(
            Animated.sequence([
                Animated.timing(translateY, {
                    toValue: -8,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        );
        idle.start();
        return () => idle.stop();
    }, []);

    const spawnHearts = (x, y) => {
        const newHearts = Array.from({ length: 4 }).map(() => ({
            id: Math.random().toString(),
            x,
            y,
            translateY: new Animated.Value(0),
            opacity: new Animated.Value(1),
        }));

        setHearts(prev => [...prev, ...newHearts]);

        newHearts.forEach(h => {
            Animated.parallel([
                Animated.timing(h.translateY, {
                    toValue: -120,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(h.opacity, {
                    toValue: 0,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setHearts(prev => prev.filter(x => x.id !== h.id));
            });
        });
    };

    const handlePetTap = e => {
        const { locationX, locationY } = e.nativeEvent;

        Animated.sequence([
            Animated.timing(scale, {
                toValue: 0.92,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();

        spawnHearts(locationX, locationY);
    };

    if (!pet) return null;

    return (
        <ImageBackground
            source={pet.backgrounds.home}
            style={styles.container}
            resizeMode="cover"
        >
            <Header title={pet.name} onBack={() => navigation.navigate('PetList')} />

            {/* STATS */}
            <View style={styles.statsPanel}>
                <Stat label="🍗 Hunger" value={pet.hunger} color="#ff9800" />
                <Stat label="😊 Happiness" value={pet.happiness} color="#e91e63" />
                <Stat label="❤️ Health" value={pet.health} color="#4caf50" />
            </View>

            {/* PET AREA */}
            <View style={styles.petArea}>
                {hearts.map(h => (
                    <Animated.Text
                        key={h.id}
                        style={[
                            styles.heart,
                            {
                                left: h.x,
                                top: h.y,
                                opacity: h.opacity,
                                transform: [{ translateY: h.translateY }],
                            },
                        ]}
                    >
                        ❤️
                    </Animated.Text>
                ))}

                <TouchableOpacity activeOpacity={1} onPressIn={handlePetTap}>
                    <Animated.Image
                        source={pet.image}
                        style={[
                            styles.pet,
                            {
                                transform: [{ translateY }, { scale }],
                            },
                        ]}
                    />
                </TouchableOpacity>
            </View>

            {/* ACTIONS */}
            <View style={styles.actionTray}>
                <Action emoji="🍎" label="Feed" onPress={() => navigation.navigate('PetFeed', { petId: pet.id })} />
                <Action emoji="❤️" label="Love" onPress={() => navigation.navigate('PetLove', { petId: pet.id })} />
                <Action emoji="🩺" label="Heal" onPress={() => navigation.navigate('PetHeal', { petId: pet.id })} />
            </View>
        </ImageBackground>
    );
}

function Stat({ label, value, color }) {
    return (
        <View style={styles.stat}>
            <Text style={styles.statLabel}>{label}</Text>
            <View style={styles.bar}>
                <View
                    style={[
                        styles.fill,
                        { width: `${value}%`, backgroundColor: color },
                    ]}
                />
            </View>
            <Text style={styles.statValue}>{value}/100</Text>
        </View>
    );
}

function Action({ emoji, label, onPress }) {
    return (
        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.actionLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },

    statsPanel: {
        width: '92%',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 16,
        padding: 12,
        marginTop: 10,
    },

    stat: {
        marginBottom: 8,
    },

    statLabel: {
        fontWeight: '600',
    },

    bar: {
        height: 10,
        backgroundColor: '#ddd',
        borderRadius: 6,
        overflow: 'hidden',
        marginVertical: 4,
    },

    fill: {
        height: '100%',
    },

    statValue: {
        fontSize: 12,
        color: '#444',
    },

    petArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    pet: {
        width: 260,
        height: 260,
        resizeMode: 'contain',
    },

    heart: {
        position: 'absolute',
        fontSize: 28,
    },

    actionTray: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingBottom: 20,
        paddingTop: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
    },

    actionButton: {
        alignItems: 'center',
        padding: 10,
    },

    emoji: {
        fontSize: 34,
    },

    actionLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
});
