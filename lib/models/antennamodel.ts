// models/antennamodel.ts
import { PhysicsUtils } from '../physics/physicsutils.ts';
import { ImpedanceCalculator } from '../physics/impedancecalculator.ts';
import { MatchingNetworks } from '../physics/matchingnetworks.ts';
import { PHYSICS_CONSTANTS } from '../physics/constants.ts';

class AntennaPhysicsEngine {
    constructor() {
        this.impedanceCalculator = new ImpedanceCalculator();
        this._distributionCache = new Map();
    }

    getWavelength(frequency) {
        return PHYSICS_CONSTANTS.SPEED_OF_LIGHT / frequency;
    }

    getElectricalLength(length, frequency) {
        return length / this.getWavelength(frequency);
    }

    getWaveNumber(frequency) {
        return 2 * Math.PI / this.getWavelength(frequency);
    }

    getLengthToRadiusRatio(length, wireDiameter) {
        const wireRadius = wireDiameter / 2000;
        return length / wireRadius;
    }

    calculateImpedance(params) {
        return this.impedanceCalculator.calculateImpedance(params);
    }

    calculatePhaseRelationship(impedance) {
        const phaseAngle = PhysicsUtils.calculatePhaseAngle(impedance.resistance, impedance.reactance);
        const isResonant = Math.abs(impedance.reactance) < Math.max(15, impedance.resistance * 0.2);
        
        return {
            phaseAngle,
            isResonant,
            phaseDegrees: phaseAngle * 180 / Math.PI
        };
    }

    calculateSpatialDistributions(params, positions) {
        const key = this._getDistributionCacheKey(params, positions.length);
        
        if (this._distributionCache.has(key)) {
            return this._distributionCache.get(key);
        }

        const { length, frequency } = params;
        const k = this.getWaveNumber(frequency);
        
        const distributions = positions.map(x => 
            this._calculateFieldAmplitudesAtPosition(k, length, x)
        );
        
        const result = {
            current: distributions.map(d => d.current),
            voltage: distributions.map(d => d.voltage),
            positions: positions
        };
        
        this._distributionCache.set(key, result);
        return result;
    }

    _calculateFieldAmplitudesAtPosition(k, wireLength, x) {
        const distanceFromCenter = Math.abs(x);
        const electricalDistance = k * distanceFromCenter;
        
        const currentAmp = Math.cos(electricalDistance) * 2;
        const phaseSign = x >= 0 ? 1 : -1;
        const voltageAmp = Math.sin(electricalDistance) * phaseSign * 4;
        
        return {
            current: PhysicsUtils.clamp(currentAmp, -10, 10),
            voltage: PhysicsUtils.clamp(voltageAmp, -10, 10)
        };
    }

    applyMatchingNetwork(impedance, networkType) {
        return MatchingNetworks.applyMatching(impedance, networkType);
    }

    classifyAntennaType(params, impedance) {
        const { feedPosition } = params;
        const electricalLength = this.getElectricalLength(params.length, params.frequency);
        const isResonant = Math.abs(impedance.reactance) < Math.max(15, impedance.resistance * 0.2);
        
        if (feedPosition === 0.5) {
            return this._classifyCenterFedAntenna(electricalLength, isResonant);
        } else if (feedPosition === 0 || feedPosition === 1) {
            return this._classifyEndFedAntenna(electricalLength, isResonant);
        } else {
            return this._classifyOffCenterAntenna(electricalLength, feedPosition);
        }
    }

    _classifyCenterFedAntenna(eLen, isResonant) {
        if (eLen < 0.1) return "Short Dipole";
        if (Math.abs(eLen - 0.5) < 0.1) {
            return isResonant ? "Half-Wave Dipole" : "Near Half-Wave Dipole";
        }
        if (Math.abs(eLen - 1.0) < 0.05) return "Full-Wave Loop";
        return eLen < 1.0 ? "Long Dipole" : "Multi-Wave Dipole";
    }

    _classifyEndFedAntenna(eLen, isResonant) {
        if (eLen < 0.1) return "Short Monopole";
        if (Math.abs(eLen - 0.25) < 0.02 && isResonant) return "Quarter-Wave Monopole";
        if (Math.abs(eLen - 0.5) < 0.02) return "End-Fed Half-Wave";
        return eLen < 1.0 ? "Long Monopole" : "Multi-Wave End-Fed";
    }

    _classifyOffCenterAntenna(eLen, feedPos) {
        const offsetPercent = Math.round(Math.abs(feedPos - 0.5) * 200);
        if (offsetPercent < 10) return "Near Center-Fed Dipole";
        if (Math.abs(eLen - 0.5) < 0.1) {
            return `OCF Dipole (${Math.round(feedPos * 100)}%)`;
        }
        return `Off-Center Fed (${Math.round(feedPos * 100)}%)`;
    }

    _getDistributionCacheKey(params, numPoints) {
        return `dist_${params.length}_${params.frequency}_${numPoints}`;
    }

    clearCache() {
        this.impedanceCalculator._cache.clear();
        this._distributionCache.clear();
    }

    getCacheStats() {
        return {
            impedanceCacheSize: this.impedanceCalculator._cache.size,
            distributionCacheSize: this._distributionCache.size
        };
    }
}

export class AntennaModel {
    constructor() {
        this.length = 20;
        this.frequency = 7.5;
        this.feedPosition = 0.5;
        this.wireDiameter = 2;
        this.matchingNetwork = null;
        this.physics = new AntennaPhysicsEngine();
    }
    
    get wavelength() { return this.physics.getWavelength(this.frequency); }
    get electricalLength() { return this.physics.getElectricalLength(this.length, this.frequency); }
    get waveNumber() { return this.physics.getWaveNumber(this.frequency); }
    get lengthToRadiusRatio() { return this.physics.getLengthToRadiusRatio(this.length, this.wireDiameter); }

    calculateImpedance() {
        return this.physics.calculateImpedance({
            length: this.length,
            frequency: this.frequency,
            feedPosition: this.feedPosition,
            wireDiameter: this.wireDiameter
        });
    }

    getPhaseAngle() {
        const impedance = this.calculateImpedance();
        return this.physics.calculatePhaseRelationship(impedance).phaseAngle;
    }

    getAntennaType() {
        const impedance = this.calculateImpedance();
        return this.physics.classifyAntennaType({
            length: this.length,
            frequency: this.frequency,
            feedPosition: this.feedPosition,
            wireDiameter: this.wireDiameter
        }, impedance);
    }
    
    applyMatching(impedance) {
        return this.physics.applyMatchingNetwork(impedance, this.matchingNetwork);
    }

    getSpatialDistributions(positions) {
        return this.physics.calculateSpatialDistributions({
            length: this.length,
            frequency: this.frequency,
            feedPosition: this.feedPosition,
            wireDiameter: this.wireDiameter
        }, positions);
    }
}
