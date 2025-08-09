import { MATCHING_NETWORKS } from './constants';

export class MatchingNetworks {
    static applyMatching(impedance, networkType) {
        if (!networkType) {
            return { impedance, matchingType: "None" };
        }
        
        const config = MATCHING_NETWORKS[networkType];
        if (!config) {
            return { impedance, matchingType: "Unknown" };
        }
        
        if (networkType === 'use1to1Balun') {
            return { 
                impedance: {
                    resistance: impedance.resistance,
                    reactance: impedance.reactance
                }, 
                matchingType: config.name 
            };
        }
        
        const transformedImpedance = {
            resistance: impedance.resistance / config.ratio,
            reactance: impedance.reactance / config.ratio
        };
        
        return {
            impedance: transformedImpedance,
            matchingType: config.name
        };
    }
}
