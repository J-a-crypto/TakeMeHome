import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const PetHeal = () => {
    // Total bites needed to finish the apple
    const totalBites = 4;

    // State to track bites taken
    const [bites, setBites] = useState(0);

    // Function to handle apple tap
    const handleBite = () => {
        if (bites < totalBites) {
            setBites(bites + 1);
        }
    };

    // Calculate which apple image to show based on bites
    const getAppleImage = () => {
        switch (bites) {
            case 0:
                return require('../assets/apple0.png'); // full apple
            case 1:
                return require('../assets/apple1.png'); // 1 bite
            case 2:
                return require('../assets/apple2.png'); // 2 bites
            case 3:
                return require('../assets/apple3.png'); // 3 bites
            case 4:
                return require('../assets/apple4.png'); // 4 bites
            case 5:
                return require('../assets/apple5.png'); // empty core
            default:
                return require('../assets/apple0.png');
        }
    };

    return (
        <View style={styles.container}>
            {bites < totalBites ? (
                <TouchableOpacity onPress={handleBite}>
                    <Image source={getAppleImage()} style={styles.apple} />
                </TouchableOpacity>
            ) : (
                <Text style={styles.surpriseText}>
                    An apple a day will keep the doctor away 🍎
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    apple: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
    },
    surpriseText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginHorizontal: 20,
    },
});

export default PetHeal;
