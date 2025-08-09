export const PHYSICS_CONSTANTS = {
    SPEED_OF_LIGHT: 299792458, // m/s - exact value
    FREE_SPACE_IMPEDANCE: 376.730313668, // Ω - exact value  
    STANDARD_IMPEDANCE: 50,
    DIPOLE_BASE_RESISTANCE: 73.1,
    // Unit conversion constants
    MM_TO_M: 0.001,
    // Wire diameter constants for impedance calculations
    WIRE_DIAMETER_DIVISOR: 2000, // mm to radius conversion
    // Impedance calculation constants
    HIGH_IMPEDANCE_LIMIT: 15000,
    CURRENT_NULL_RESISTANCE: 2000,
    HALF_WAVE_END_FED_RESISTANCE: 2500,
    END_FED_HIGH_IMPEDANCE: 5000,
    // Resonance detection
    RESONANCE_REACTANCE_THRESHOLD: 15,
    RESONANCE_PERCENTAGE_THRESHOLD: 0.2,
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

export const NODES_CONFIG = {
    POSITION_TOLERANCE: 0.01,
    MIN_AMPLITUDE_THRESHOLD: 0.1,
    MAX_HARMONICS: 8,
    EDGE_BUFFER: 0.1
};
