import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SoundContext } from '../context/SoundContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Header({ title, onBack }) {
    const { openSettings } = useContext(SoundContext);

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.side}>
                    {onBack && (
                        <TouchableOpacity onPress={onBack}>
                            <Text style={styles.back}>←</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={styles.title}>{title}</Text>


                <View style={styles.side}>
                    <TouchableOpacity onPress={openSettings}>
                        <Text style={styles.settings}>⚙️</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        backgroundColor: '#fffaf0', // same as your header/game background
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 10,
        height: 20, // flexible header height
    },
    side: {
        width: 250,
        alignItems: 'center',
        justifyContent: 'center',
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    back: {
        fontSize: 20,
    },
    settings: {
        fontSize: 20,
    },
});
