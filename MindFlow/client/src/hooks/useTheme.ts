import { useState } from 'react';

export function useTheme() {
    // For now, return a static dark theme object
    // You can expand this to read from a context or local storage later
    const [theme] = useState('dark');

    return {
        theme,
        colors: {
            background: '#0f172a',
            primary: '#6366f1',
            text: '#f8fafc'
        }
    };
}
