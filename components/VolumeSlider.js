import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

export default function VolumeSlider({ label, value, onChange }) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={value}
                onValueChange={onChange}
                minimumTrackTintColor="#4caf50"
                maximumTrackTintColor="#ddd"
                thumbTintColor="#4caf50"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
    },
    slider: {
        width: '100%',
        height: 40,
    },
});
