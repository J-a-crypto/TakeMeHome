import React, { createContext, useReducer, useEffect } from 'react';
import { loadGame, saveGame } from '../utils/storage';
import { PET_TEMPLATES } from '../components/PetTemplates';

export const PetsContext = createContext();

const createPetFromTemplate = (template, name) => ({
    id: Date.now().toString(),
    name,
    species: template.species,
    image: template.image,
    age: 0,
    hunger: 50,
    happiness: 20,
    health: 60,
    boredom: 30,
    adoptedAt: Date.now(),
});

const defaultState = {
    pets: [],
    activePetId: null,
    pendingAdoption: null, // 👈 important
    nextRandomPetSpawn: null,
    nextRandomPetTemplate: null,
};

function reducer(state, action) {
    switch (action.type) {

        case 'LOAD_GAME':
            return { ...state, ...action.payload };

        // Starter pet (runs once)
        case 'CREATE_STARTER_PET': {
            if (state.pets.length > 0) return state;

            const starterTemplate = PET_TEMPLATES[0];

            return {
                ...state,
                pendingAdoption: starterTemplate, // pending starter pet
            };
        }


        // Random pet appears
        case 'SPAWN_RANDOM_PET': {
            // Pick a random pet template
            const template = PET_TEMPLATES[Math.floor(Math.random() * PET_TEMPLATES.length)];

            // Decide next spawn in 1–3 days
            const minDays = 1;
            const maxDays = 3;
            const now = Date.now();
            const nextSpawnTime = now + (Math.random() * (maxDays - minDays) + minDays) * 24 * 60 * 60 * 1000;

            return {
                ...state,
                pendingAdoption: template,
                nextRandomPetSpawn: nextSpawnTime,
                nextRandomPetTemplate: template,
            };
        }




        // User names + adopts
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

        default:
            return state;
    }
}

export function PetsProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, defaultState);

    useEffect(() => {
        (async () => {
            const saved = await loadGame();
            if (saved) {
                dispatch({ type: 'LOAD_GAME', payload: saved });
            } else {
                dispatch({ type: 'CREATE_STARTER_PET' });
            }
        })();
    }, []);

    useEffect(() => {
        saveGame(state);
    }, [state]);

    return (
        <PetsContext.Provider value={{ state, dispatch }}>
            {children}
        </PetsContext.Provider>
    );
}
