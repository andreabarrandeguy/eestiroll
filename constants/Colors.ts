// Category colors (same for both themes)
export const CategoryColors = {
    yellow: '#E7CF61',
    red: '#BD492C',
    purple: '#5A3B76',
    lightpurple: '#C8A2C8',
    blue: '#DDC690',
    lightblue: '#90A9E4',
    pink: '#AD6F83',
    lightpink: '#DBABC1',
    green: '#4B7C6B',
    lightgreen: '#9ED6AF'
} as const;

// Theme-specific colors
export const DarkTheme = {
    background: '#0A0A0A',
    text: '#F2F2F2',
    cardBackground: '#1a1a1a',
    inputBackground: '#F2F2F2',
    inputText: '#0A0A0A',
    border: '#2a2a2a',
    iconInactive: '#666',
    // UI accent (buttons, active tab, progress bar) — same blue as the
    // hand-drawn arrow on the empty-state screen, kept separate from
    // CategoryColors.yellow so the PLACE/NOUN word-card color isn't affected.
    accent: '#35529D',
    accentText: '#FFFFFF',
    ...CategoryColors
} as const;

export const LightTheme = {
    background: '#F2F2F2',
    text: '#0A0A0A',
    cardBackground: '#FFFFFF',
    inputBackground: '#FFFFFF',
    inputText: '#0A0A0A',
    border: '#E0E0E0',
    iconInactive: '#999',
    accent: '#35529D',
    accentText: '#FFFFFF',
    ...CategoryColors
} as const;

// For backwards compatibility - default to dark
export const Colors = DarkTheme;

export type Theme = typeof DarkTheme;
export type ThemeMode = 'light' | 'dark';