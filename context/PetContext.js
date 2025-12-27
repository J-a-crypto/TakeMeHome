import React, { createContext, useReducer, useEffect, useState } from 'react';
import { loadGame, saveGame } from '../utils/storage';
import { PET_TEMPLATES } from '../components/PetTemplates';

export const PetsContext = createContext();

const STAT_DECAY_SETTINGS = {
    intervalMs: 5000, //  1 hour -> 1000 * 60 * 60,
    rates: {
        hunger: 2,
        happiness: 1,
    },
    health: {
        base: 1,
        hungerZero: 3,
        happinessZero: 2,
    }
};

const createPetFromTemplate = (template, name) => ({
    id: Date.now().toString(),
    name,
    species: template.species,
    image: template.image,
    age: 0,
    hunger: 50,
    happiness: 20,
    health: 60,
    adoptedAt: Date.now(),
});

const applyDecay = (pets, intervals = 1) => {
    return pets.map(pet => {
        let { hunger, happiness, health } = pet;

        for (let i = 0; i < intervals; i++) {
            hunger = Math.max(0, hunger - STAT_DECAY_SETTINGS.rates.hunger);
            happiness = Math.max(0, happiness - STAT_DECAY_SETTINGS.rates.happiness);

            let healthLoss = STAT_DECAY_SETTINGS.health.base;
            if (hunger === 0) healthLoss += STAT_DECAY_SETTINGS.health.hungerZero;
            if (happiness === 0) healthLoss += STAT_DECAY_SETTINGS.health.happinessZero;

            health = Math.max(0, health - healthLoss);
        }

        return { ...pet, hunger, happiness, health };
    });
};

const defaultState = {
    pets: [],
    activePetId: null,
    pendingAdoption: null,
    nextRandomPetSpawn: null,
    nextRandomPetTemplate: null,

    lastDecay: Date.now(),
};

function reducer(state, action) {
    switch (action.type) {

        case 'LOAD_GAME': {
            const loaded = action.payload;
            const now = Date.now();

            const lastDecay = loaded.lastDecay ?? now;
            const elapsedMs = now - lastDecay;
            const intervalMs = STAT_DECAY_SETTINGS.intervalMs;
            const intervalsPassed = Math.floor(elapsedMs / intervalMs);

            return {
                ...loaded,
                pets:
                    intervalsPassed > 0
                        ? applyDecay(loaded.pets, intervalsPassed)
                        : loaded.pets,
                lastDecay: now,
            };
        }

        case 'CREATE_STARTER_PET': {
            if (state.pets.length > 0 || state.pendingAdoption) return state;

            return {
                ...state,
                pendingAdoption: PET_TEMPLATES[0],
            };
        }


        // Random pet appears
        case 'SPAWN_RANDOM_PET': {
            // Pick a random pet template
            const template = PET_TEMPLATES[Math.floor(Math.random() * PET_TEMPLATES.length)];

            const TEST_MODE = true; // change to false for real-day spawns

            let nextSpawnTime;
            if (TEST_MODE) {
                const minSeconds = 5;
                const maxSeconds = 15;
                nextSpawnTime = Date.now() + (Math.random() * (maxSeconds - minSeconds) + minSeconds) * 1000;
            } else {
                const minDays = 1;
                const maxDays = 2;
                nextSpawnTime = Date.now() + (Math.random() * (maxDays - minDays) + minDays) * 24 * 60 * 60 * 1000;
            }

            return {
                ...state,
                pendingAdoption: template,
                nextRandomPetSpawn: nextSpawnTime,
                nextRandomPetTemplate: template,
            };
        }


        case 'ADOPT_PET': {
            const pet = createPetFromTemplate(
                state.pendingAdoption,
                action.payload.name
            );

            return {
                ...state,
                pets: [...state.pets, pet],
                activePetId: pet.id,
                pendingAdoption: null,
            };
        }

        case 'SET_ACTIVE_PET':
            return { ...state, activePetId: action.payload };

        case 'CHANGE_PET_STAT': {
            const { id, stat, delta } = action.payload;

            return {
                ...state,
                pets: state.pets.map(p =>
                    p.id === id
                        ? { ...p, [stat]: Math.max(0, Math.min(100, p[stat] + delta)) }
                        : p
                ),
            };
        }

        case 'DECAY_STATS': {
            const { rates, health } = STAT_DECAY_SETTINGS;

            return {
                ...state,
                pets: applyDecay(state.pets),
                lastDecay: Date.now(),
            };
        }

        default:
            return state;
    }
}

export function PetsProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, defaultState);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        (async () => {
            const saved = await loadGame();
            if (saved) {
                dispatch({ type: 'LOAD_GAME', payload: saved });
            } else {
                console.log("No saved game found. Creating starter pet...");
                dispatch({ type: 'CREATE_STARTER_PET' }); // 👈 starter pet appears
            }
            setHydrated(true);
        })();
    }, []);

    useEffect(() => {
        if (!hydrated) {
            console.log("Hydration not complete, skipping save.");
            return;
        }
        const stateToSave = { ...state, lastDecay: state.lastDecay ?? Date.now() };
        console.log('Saving game state:', stateToSave);
        saveGame(stateToSave);
    }, [state, hydrated]);

    useEffect(() => {
        if (!hydrated) return;

        const interval = setInterval(() => {
            dispatch({ type: 'DECAY_STATS' });
        }, STAT_DECAY_SETTINGS.intervalMs);

        return () => clearInterval(interval);
    }, [hydrated]);



    return (
        <PetsContext.Provider value={{ state, dispatch }}>
            {children}
        </PetsContext.Provider>
    );
}
