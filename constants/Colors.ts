// Category colors (same for both themes)
export const CategoryColors = {
    yellow: '#EFC320',
    red: '#E95A35',
    purple: '#5A3B76',
    lightpurple: '#B566FF',
    blue: '#3468DC',
    lightblue: '#6D91FF',
    pink: '#EB579C',
    lightpink: '#E591AD',
    green: '#3C8D5F',
    lightgreen: '#8EC7A3'
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
    ...CategoryColors
} as const;

// For backwards compatibility - default to dark
export const Colors = DarkTheme;

export type Theme = typeof DarkTheme;
export type ThemeMode = 'light' | 'dark';