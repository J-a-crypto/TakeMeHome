import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { deleteGame } from '../utils/storage';
import { SoundContext } from '../context/SoundContext'

export default function HomeScreen({ navigation }) {
    const { playRandomMusic } = useContext(SoundContext);
    const handleStartGame = async () => {
        await playRandomMusic();
        navigation.navigate('PetList');
    }
    const handleResetGame = async () => {
        await deleteGame();
    };

    return (
        <ImageBackground
            source={require('../assets/home_bg.jpg')} // cozy background
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                {/* Love Message */}
                <View style={styles.messageBox}>
                    <Text style={styles.messageTitle}>💖 Just for You</Text>
                    <Text style={styles.messageText}>
                        Hey love, I know you’ve always wanted a pet.
                        I made this little game so you can finally have one of your own!
                    </Text>
                </View>

                {/* Cute Pet Preview */}
                <View style={styles.petPreview}>
                    <Image
                        source={require('../assets/dog.png')}
                        style={styles.petImage}
                    />
                    <Text style={styles.petText}>Your first pet is waiting for you! 🐾</Text>
                </View>

                {/* Navigation Buttons */}
                <View style={styles.buttons}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleStartGame}
                    >
                        <Text style={styles.buttonText}>See My Pets 🐶🐱</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleResetGame}>
                        <Text style={styles.buttonText}>Reset</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(255,245,230,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    messageBox: {
        backgroundColor: '#fff8f0',
        padding: 20,
        borderRadius: 20,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    messageTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#ff6f61',
        textAlign: 'center',
    },
    messageText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#555',
        lineHeight: 22,
    },
    petPreview: {
        alignItems: 'center',
        marginBottom: 40,
    },
    petImage: {
        width: 180,
        height: 180,
        resizeMode: 'contain',
        marginBottom: 10,
    },
    petText: {
        fontSize: 16,
        color: '#777',
        fontWeight: '600',
    },
    buttons: {
        width: '100%',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#ff8c42',
        paddingVertical: 14,
        paddingHorizontal: 50,
        borderRadius: 30,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonSecondary: {
        backgroundColor: '#81c784',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});
