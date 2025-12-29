import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
} from 'react-native';
import { SoundContext } from '../context/SoundContext';
import VolumeSlider from './VolumeSlider';

export default function SettingsModal() {
    const {
        isSettingsOpen,
        closeSettings,
        sfxVolume,
        musicVolume,
        setSfxVolume,
        setMusicVolume,
    } = useContext(SoundContext);

    return (
        <Modal
            visible={isSettingsOpen}
            animationType="fade"
            transparent
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>⚙️ Settings</Text>

                    <VolumeSlider
                        label="Sound Effects"
                        value={sfxVolume}
                        onChange={setSfxVolume}
                    />

                    <VolumeSlider
                        label="Music"
                        value={musicVolume}
                        onChange={setMusicVolume}
                    />

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={closeSettings}
                    >
                        <Text style={styles.closeText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '85%',
        backgroundColor: '#fffaf0',
        borderRadius: 20,
        padding: 20,
        elevation: 6,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 10,
        textAlign: 'center',
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#ff6f61',
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
    },
    closeText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
});
