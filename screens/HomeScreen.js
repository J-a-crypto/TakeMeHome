import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { SoundContext } from '../context/SoundContext';
import { deleteGame } from '../utils/storage';

export default function HomeScreen({ navigation }) {
    const { playRandomMusic } = useContext(SoundContext);

    const handleStartGame = async () => {
        await playRandomMusic();
        navigation.navigate("PetList");
    };

    const handleResetGame = async () => {
        await deleteGame();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome To Your Daily Dose of Pet Cuteness</Text>

            <TouchableOpacity style={styles.button} onPress={handleStartGame}>
                <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
            <Button title="Reset Game (Dev)" onPress={handleResetGame} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#fffaf0'
    },
    title: {
        fontSize: 22,
        marginTop: 50,
        fontWeight: '700'
    },
    button: {
        marginTop: 15,
        backgroundColor: '#ff6f61',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600'
    }
});
