import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import Header from '../components/Header';
import { PetsContext } from '../context/PetContext';

// This will be the screen for the selected pet and the user will have 3 things to do here, 
export default function PetHome({ navigation }) {
    const { state } = useContext(PetsContext);
    const pets = state.pets.find(pet => pet.id === state.activePetId);

    if (!pets) {
        return (
            <View style={styles.container}>
                <Text>No active pet selected.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header title={"PetHome"} onBack={() => navigation.navigate("PetList")} />
            <Text style={styles.title}>This is 'Your Pet's Room</Text>
            <Text>Hunger: {pets.hunger}</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('PetFeed')}>
                <Text style={styles.btext}>FEED ME</Text>
            </TouchableOpacity>

            <Text>Happiness: {pets.happiness}</Text>


            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('PetLove')}>
                <Text style={styles.btext}>LOVE ME</Text>
            </TouchableOpacity>
            <Text>Health: {pets.health}</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('PetHeal')}>
                <Text style={styles.btext}>HEAL ME</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fffaf0',
        alignItems: 'center',
    },
    title: {
        textAlign: 'center',
        fontSize: 50,
        fontWeight: 'bold',
    },
    button: {
        marginTop: 15,
        backgroundColor: '#ff6f61',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5
    },
    btext: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
});