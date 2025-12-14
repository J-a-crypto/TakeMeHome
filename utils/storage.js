//Through the use of AsyncStorage, I want to save and load game data
//This is my storage system for my game data
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "petData_v1";

export async function saveGame(gameData) {
    if (!gameData) return;
    const JStext = JSON.stringify(gameData);
    await AsyncStorage.setItem(STORAGE_KEY, JStext);
}

export async function loadGame() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.warn('Failed to save game data:', e);
        return null;
    }
}

export async function deleteGame() {
    await AsyncStorage.removeItem(STORAGE_KEY);
}