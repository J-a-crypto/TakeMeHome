// I know this will be where all her pets will be stored but i don't know what to call it 
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React from 'react';

export default function PetListScreen({ navigation }) {
    return (
        //Every pet will have their own Name (chosen by user), picture, age(time since adopted), hunger level, happiness level, and boredom level)
        //So the easiest and most efficient way to save this info would be to have each pet as a TouchableOpacity component that when clicked opens a new screen with more detailed info and options for that specific pet
        <View style={styles.container}>
            <Text style={styles.title}>Your Pets</Text>
            <Text>List of pets will be displayed here.</Text>
            <TouchableOpacity style={styles.petShow} onPress={() => navigation.navigate('PetHome')}>
                <Image source={require('../assets/capybara.png')} style={{ width: 300, height: 300 }} />
                <Text style={styles.petStat}>Fluffy the Cat</Text>
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
    petShow: {
        position: 'center',
        backgroundColor: '#ff6f61',
        justifyContent: 'center',
        borderRadius: 10,
        padding: 25,
    },
    petStat: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
        marginTop: 10,
        textAlign: 'center'
    }
});