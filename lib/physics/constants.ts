export const PHYSICS_CONSTANTS = {
    SPEED_OF_LIGHT: 300,
    FREE_SPACE_IMPEDANCE: 377,
    STANDARD_IMPEDANCE: 50,
    DIPOLE_BASE_RESISTANCE: 73.1,
};

export const PHYSICS_LIMITS = {
    MIN_RESISTANCE: 0.1,
    MAX_RESISTANCE: 50000,
    MIN_REACTANCE: -5000,
    MAX_REACTANCE: 5000,
    MIN_SWR: 1.0,
    MAX_SWR: 999
};

export const MATCHING_NETWORKS = {
    'use1to1Balun': { ratio: 1, name: '1:1 Balun', type: 'balun' },
    'use4to1Balun': { ratio: 4, name: '4:1 Balun', type: 'balun' },
    'use9to1UnUn': { ratio: 9, name: '9:1 UnUn', type: 'unun' },
    'use49to1UnUn': { ratio: 49, name: '49:1 UnUn', type: 'unun' }
};
