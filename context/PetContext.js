import React, { createContext, useReducer, useEffect } from 'react';
import { loadGame, saveGame } from '../utils/storage.js'

export const PetContext = createContext();

const defaultState = {
    petName: '',
    petAge: 0,
    petHunger: 50,
    petHappiness: 20,
    petHealth: 60,
    lastPlayed: null,
    hasSeenIntro: false,
}

function reducer(state, action) {
    switch (action.type) {
        case 'LOAD_GAME':
            return { ...state, ...action, payload };
        case 'UPDATE_STATE':
            return { ...state, ...action.payload };
        case 'SET_NAME':
            return { ...state, petName: action.payload };
        case 'MARK_INTRO_SEEN':
            return { ...state, hasSeenIntro: true };
        default:
            return state;
    }
}

export function PetProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, defaultState);

    useEffect(() => {
        (async () => {
            const saved = await loadGame();
            if (saved) {
                dispatch({ type: 'LOAD_GAME', payload: saved });

            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                await saveGame(state);
            } catch (e) {
                console.warn('Failed to save game', e);
            }
        })();
    }, [state]);

    return (
        <PetContext.Provider value={{ state, dispatch }}>
            {children}
        </PetContext.Provider>
    );
}