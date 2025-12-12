import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Header({ title, right, onBack }) {
    return (
        <View style={styles.header}>
            {onBack ? (
                <TouchableOpacity onPress={onBack} style={styles.back}>
                    <Text style={styles.text}>Back</Text>
                </TouchableOpacity>
            ) : <View style={{ width: 36 }}></View>}
            <Text style={styles.title}>{title}</Text>
            <View style={{ width: 36 }}>{right}</View>
        </View>
    )
}
const styles = StyleSheet.create({
    header: {
        flex: 0.2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
    },
    back: {
        width: 50,

    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    text: {
        fontSize: 22,
    },
});