import { PHYSICS_CONSTANTS, PHYSICS_LIMITS } from './constants';
import { PhysicsUtils } from './physicsutils';

export class ImpedanceCalculator {
    constructor() {
        this._cache = new Map();
    }

    calculateImpedance(params) {
        const { length, frequency, feedPosition, wireDiameter } = params;
        const key = `imp_${length.toFixed(3)}_${frequency.toFixed(3)}_${feedPosition.toFixed(3)}_${wireDiameter.toFixed(1)}`;
        
        if (this._cache.has(key)) {
            return this._cache.get(key);
        }

        const wavelength = PHYSICS_CONSTANTS.SPEED_OF_LIGHT / (frequency * 1000000); // MHz to Hz
        const electricalLength = length / wavelength;
        const waveNumber = 2 * Math.PI / wavelength;
        const wireRadius = (wireDiameter * PHYSICS_CONSTANTS.MM_TO_M) / 2;
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
            // Short dipole formulas - Kraus & Marhefka 4th ed.
            const resistance = Math.max(20 * Math.PI * Math.PI * eLen * eLen, 0.1);
            const reactance = -PHYSICS_CONSTANTS.FREE_SPACE_IMPEDANCE / (2 * Math.PI) * 
                            (PhysicsUtils.log10(2 * lToR) - 0.577);
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
            return { resistance: PHYSICS_CONSTANTS.CURRENT_NULL_RESISTANCE, reactance: 0 };
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
            return { resistance: PHYSICS_CONSTANTS.HALF_WAVE_END_FED_RESISTANCE, reactance: 0 };
        }
        
        const beta = k * length;
        const cosBeta = Math.cos(beta);
        const sinBeta = Math.sin(beta);
        
        if (Math.abs(sinBeta) < 0.001) {
            return { resistance: PHYSICS_CONSTANTS.END_FED_HIGH_IMPEDANCE, reactance: 0 };
        }
        
        const resistance = Math.min(PHYSICS_CONSTANTS.DIPOLE_BASE_RESISTANCE / (cosBeta * cosBeta), PHYSICS_CONSTANTS.HIGH_IMPEDANCE_LIMIT);
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
