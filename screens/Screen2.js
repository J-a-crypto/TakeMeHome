// I know this will be where all her pets will be stored but i don't know what to call it 
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';

export default function PetListScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Pets</Text>
            <Text>List of pets will be displayed here.</Text>
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
    }
});