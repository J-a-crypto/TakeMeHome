import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import React from 'react';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome To Your Daily Dose of Pet Cuteness</Text>

            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#ffaf0'
    },
    title: {
        fontSize: 22,
        marginTop: 12,
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
