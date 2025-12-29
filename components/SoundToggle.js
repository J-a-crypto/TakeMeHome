import React, { useContext } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { SoundContext } from '../context/SoundContext';

export default function SoundToggle() {
    const { enabled, toggleSound } = useContext(SoundContext);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Sound Effects</Text>
            <Switch
                value={enabled}
                onValueChange={toggleSound}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
    },
});
