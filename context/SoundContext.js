import React, { createContext, useState, useRef } from 'react';
import { Audio } from 'expo-av';

export const SoundContext = createContext();

export function SoundProvider({ children }) {
    const [sfxVolume, setSfxVolume] = useState(1);
    const [musicVolume, setMusicVolume] = useState(0.5);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const musicRef = useRef(new Audio.Sound());
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);

    const openSettings = () => setIsSettingsOpen(true);
    const closeSettings = () => setIsSettingsOpen(false);

    // Your list of music tracks
    const musicPlaylist = [
        require('../assets/music/game-music3.wav'),
        require('../assets/music/game-music4.wav'),
        require('../assets/music/game-music5.wav'),
        require('../assets/music/game-music6.wav'),
    ];

    // Play a music track and set up the "on end" listener
    const playMusic = async (source) => {
        try {
            await musicRef.current.unloadAsync();
            await musicRef.current.loadAsync(source, { volume: musicVolume, isLooping: false });
            await musicRef.current.playAsync();
            setIsMusicPlaying(true);

            // Listen for end of playback
            musicRef.current.setOnPlaybackStatusUpdate(async (status) => {
                if (status.didJustFinish) {
                    playRandomMusic();
                }
            });
        } catch (e) {
            console.log("Error playing music:", e);
        }
    };

    // Pick a random track and play it
    const playRandomMusic = () => {
        const randomIndex = Math.floor(Math.random() * musicPlaylist.length);
        playMusic(musicPlaylist[randomIndex]);
    };

    // Stop music
    const stopMusic = async () => {
        try {
            await musicRef.current.stopAsync();
            setIsMusicPlaying(false);
        } catch (e) {
            console.log("Error stopping music:", e);
        }
    };

    const setMusicVolumeAsync = async (volume) => {
        setMusicVolume(volume);
        try {
            await musicRef.current.setVolumeAsync(volume);
        } catch (e) {
            console.log("Error setting music volume:", e);
        }
    };

    return (
        <SoundContext.Provider
            value={{
                sfxVolume,
                musicVolume,
                setSfxVolume,
                setMusicVolume: setMusicVolumeAsync,
                isSettingsOpen,
                openSettings,
                closeSettings,
                musicRef,
                isMusicPlaying,
                playMusic,
                playRandomMusic,
                stopMusic,
            }}
        >
            {children}
        </SoundContext.Provider>
    );
}
