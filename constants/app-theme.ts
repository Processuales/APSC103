export const appColors = {
    light: {
        background: '#FAF7F2',
        surface: '#FFFFFF',
        surfaceMuted: '#FFF5EB',
        border: '#E6DFD7',
        text: '#2C2420',
        subtext: '#8C7D73',
        accent: '#E06D3D',
        accentSoft: '#FBE9E2',
        success: '#59886B',
        warning: '#D49A36',
        shadow: 'rgba(44, 36, 32, 0.06)',
    },
    dark: {
        background: '#0B1220',
        surface: '#111827',
        surfaceMuted: '#0F172A',
        border: '#1F2937',
        text: '#F8FAFC',
        subtext: '#94A3B8',
        accent: '#7C93FF',
        accentSoft: '#172554',
        success: '#5EEAD4',
        warning: '#FBBF24',
        shadow: 'rgba(0, 0, 0, 0.28)',
    },
} as const;

export type AppScheme = keyof typeof appColors;