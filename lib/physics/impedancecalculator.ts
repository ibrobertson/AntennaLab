import { PHYSICS_CONSTANTS, PHYSICS_LIMITS } from './constants.ts';
import { PhysicsUtils } from './physicsutils.ts';

export class ImpedanceCalculator {
    constructor() {
        this._cache = new Map();
    }

    calculateImpedance(params) {
        const { length, frequency, feedPosition, wireDiameter } = params;
        const key = `${length}_${frequency}_${feedPosition}_${wireDiameter}`;
        
        if (this._cache.has(key)) {
            return this._cache.get(key);
        }

        const wavelength = PHYSICS_CONSTANTS.SPEED_OF_LIGHT / frequency;
        const electricalLength = length / wavelength;
        const waveNumber = 2 * Math.PI / wavelength;
        const wireRadius = wireDiameter / 2000;
        const lengthToRadiusRatio = length / wireRadius;
        
        let impedance;
        if (feedPosition === 0.5) {
            impedance = this._calculateCenterFed(length, electricalLength, waveNumber, lengthToRadiusRatio);
        } else if (feedPosition === 0 || feedPosition === 1) {
            impedance = this._calculateEndFed(length, electricalLength, waveNumber, lengthToRadiusRatio);
        } else {
            impedance = this._calculateOffCenter(length, electricalLength, waveNumber, lengthToRadiusRatio, feedPosition);
        }
        
        const limitedImpedance = {
            resistance: PhysicsUtils.clamp(impedance.resistance, PHYSICS_LIMITS.MIN_RESISTANCE, PHYSICS_LIMITS.MAX_RESISTANCE),
            reactance: PhysicsUtils.clamp(impedance.reactance, PHYSICS_LIMITS.MIN_REACTANCE, PHYSICS_LIMITS.MAX_REACTANCE)
        };
        
        this._cache.set(key, limitedImpedance);
        return limitedImpedance;
    }

    _calculateCenterFed(length, eLen, k, lToR) {
        if (eLen < 0.1) {
            const resistance = Math.max(20 * Math.PI * Math.PI * eLen * eLen, 0.1);
            const reactance = -119.9 * (PhysicsUtils.log10(lToR) - 2.25) / (eLen * 2 * Math.PI);
            return { resistance, reactance };
        }
        
        if (Math.abs(eLen - 0.5) < 0.05) {
            const wireReactance = 42.5 * (PhysicsUtils.log10(lToR) - 2.25);
            return {
                resistance: PHYSICS_CONSTANTS.DIPOLE_BASE_RESISTANCE,
                reactance: wireReactance * 0.02
            };
        }
        
        const beta = k * length / 2;
        const sinBeta = Math.sin(beta);
        const cosBeta = Math.cos(beta);
        
        if (Math.abs(sinBeta) < 0.001) {
            return { resistance: 2000, reactance: 0 };
        }
        
        const resistance = PHYSICS_CONSTANTS.DIPOLE_BASE_RESISTANCE * sinBeta * sinBeta;
        const reactance = 43.1 * (cosBeta - Math.cos(k * length)) / sinBeta + 
                        42.5 * (PhysicsUtils.log10(lToR) - 2.25) * 0.1;
        
        return { resistance, reactance };
    }

    _calculateEndFed(length, eLen, k, lToR) {
        if (Math.abs(eLen - 0.25) < 0.02) {
            return {
                resistance: PHYSICS_CONSTANTS.DIPOLE_BASE_RESISTANCE / 2,
                reactance: 21.25 * (PhysicsUtils.log10(lToR) - 2.25)
            };
        }
        
        if (Math.abs(eLen - 0.5) < 0.02) {
            return { resistance: 2500, reactance: 0 };
        }
        
        const beta = k * length;
        const cosBeta = Math.cos(beta);
        const sinBeta = Math.sin(beta);
        
        if (Math.abs(sinBeta) < 0.001) {
            return { resistance: 5000, reactance: 0 };
        }
        
        const resistance = Math.min(PHYSICS_CONSTANTS.DIPOLE_BASE_RESISTANCE / (cosBeta * cosBeta), 15000);
        const reactance = PhysicsUtils.clamp(
            PHYSICS_CONSTANTS.FREE_SPACE_IMPEDANCE * Math.tan(beta / 2), 
            -5000, 
            5000
        );
        
        return { resistance, reactance };
    }

    _calculateOffCenter(length, eLen, k, lToR, feedPos) {
        const centerFed = this._calculateCenterFed(length, eLen, k, lToR);
        const offsetFromCenter = Math.abs(feedPos - 0.5);
        
        const electricalOffset = offsetFromCenter * k * length;
        const transformFactor = offsetFromCenter < 0.1 ?
            1 + offsetFromCenter * 2 :
            1 / (Math.cos(electricalOffset) ** 2);
        
        const currentScaling = Math.cos(electricalOffset);
        
        return {
            resistance: centerFed.resistance * transformFactor,
            reactance: centerFed.reactance * Math.sqrt(transformFactor) * currentScaling
        };
    }
}
