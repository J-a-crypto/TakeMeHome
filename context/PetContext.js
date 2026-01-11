import React, { createContext, useReducer, useEffect, useState } from 'react';
import { loadGame, saveGame } from '../utils/storage';
import { PET_TEMPLATES } from '../components/PetTemplates';

export const PetsContext = createContext();

const STAT_DECAY_SETTINGS = {
    intervalMs: 1000 * 60 * 2, //  1 hour -> 1000 * 60 * 60,
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
    backgrounds: template.backgrounds,
    emotes: template.emotes,
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

const scheduleNextSpawn = () => {
    const minMinutes = 10;
    const maxMinutes = 80;
    return (
        Date.now() +
        (Math.random() * (maxMinutes - minMinutes) + minMinutes) * 60 * 1000
    );
};

const defaultState = {
    pets: [],
    activePetId: null,
    pendingAdoption: null,
    nextRandomPetSpawn: null,

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
            console.log('[REDUCER] SPAWN_RANDOM_PET fired');

            // Hard guards
            if (state.pendingAdoption || !state.nextRandomPetSpawn) {
                return state;
            }

            // Get species the player already owns
            const ownedSpecies = new Set(state.pets.map(p => p.species));

            // Filter templates to only NEW species
            const availableTemplates = PET_TEMPLATES.filter(
                t => !ownedSpecies.has(t.species)
            );

            // If no new species remain, stop spawning forever
            if (availableTemplates.length === 0) {
                console.log('[REDUCER] All species collected. No more spawns.');
                return {
                    ...state,
                    nextRandomPetSpawn: null,
                };
            }

            // Pick a random NEW species
            const template =
                availableTemplates[
                Math.floor(Math.random() * availableTemplates.length)
                ];

            console.log('[REDUCER] Spawned NEW species:', template.species);

            return {
                ...state,
                pendingAdoption: template,
                nextRandomPetSpawn: null, // invalidate spawn
            };
        }


        case 'SCHEDULE_NEXT_SPAWN': {
            const next = scheduleNextSpawn();
            console.log(
                '[REDUCER] Scheduling next spawn at:',
                new Date(next).toLocaleTimeString()
            );

            return {
                ...state,
                nextRandomPetSpawn: next,
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
                pets: state.pets.map(pet => {
                    if (pet.id !== id) return pet;

                    return {
                        ...pet,
                        [stat]: Math.min(100, Math.max(0, pet[stat] + delta)),
                    };
                }),
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
                dispatch({ type: 'CREATE_STARTER_PET' });
            }
            setHydrated(true);
        })();
    }, []);
    useEffect(() => {
        if (!hydrated) {
            console.log('[SPAWN WATCHER] Not hydrated yet');
            return;
        }

        if (!state.nextRandomPetSpawn) {
            console.log('[SPAWN WATCHER] No spawn scheduled');
            return;
        }

        if (state.pendingAdoption) {
            console.log('[SPAWN WATCHER] Pending adoption already exists');
            return;
        }

        console.log(
            '[SPAWN WATCHER] Watching spawn time:',
            new Date(state.nextRandomPetSpawn).toLocaleTimeString()
        );

        const checkSpawn = () => {
            const now = Date.now();
            const diff = state.nextRandomPetSpawn - now;

            console.log(
                `[SPAWN WATCHER] Checking... now=${now}, spawnAt=${state.nextRandomPetSpawn}, diff=${diff}`
            );

            if (diff <= 0) {
                console.log('[SPAWN WATCHER] ⏰ TIME REACHED → SPAWNING PET');
                dispatch({ type: 'SPAWN_RANDOM_PET' });
            }
        };

        checkSpawn(); // catch-up if app reopened

        const interval = setInterval(checkSpawn, 1000);
        return () => {
            console.log('[SPAWN WATCHER] Clearing interval');
            clearInterval(interval);
        };
    }, [
        hydrated,
        state.nextRandomPetSpawn,
        state.pendingAdoption,
    ]);

    useEffect(() => {
        if (!hydrated) return;
        saveGame(state);
    }, [state, hydrated]);

    useEffect(() => {
        if (!hydrated) return;

        const ownedSpecies = new Set(state.pets.map(p => p.species));
        const hasRemainingSpecies = PET_TEMPLATES.some(
            t => !ownedSpecies.has(t.species)
        );

        if (
            hasRemainingSpecies &&
            state.pets.length > 0 &&
            !state.pendingAdoption &&
            !state.nextRandomPetSpawn
        ) {
            dispatch({ type: 'SCHEDULE_NEXT_SPAWN' });
        }
    }, [
        hydrated,
        state.pets,
        state.pendingAdoption,
        state.nextRandomPetSpawn,
    ]);


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
