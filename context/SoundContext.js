import React, { createContext, useState } from 'react';

export const SoundContext = createContext();

export function SoundProvider({ children }) {
    const [enabled, setEnabled] = useState(true);

    const toggleSound = () => setEnabled(prev => !prev);

    return (
        <SoundContext.Provider value={{ enabled, toggleSound }}>
            {children}
        </SoundContext.Provider>
    );
}
