// physics/nodescalculator.js
import { NODES_CONFIG } from './constants';

export class NodesCalculator {
    constructor() {
        this.tolerance = NODES_CONFIG.POSITION_TOLERANCE;
        this.minThreshold = NODES_CONFIG.MIN_AMPLITUDE_THRESHOLD;
    }

    calculateNodesAndAntinodes(model) {
        const { length, frequency, feedPosition } = model;
        const k = model.waveNumber;
        const electricalLength = model.electricalLength;
        
        const currentNodes = this._calculateCurrentNodes(length, k, feedPosition);
        const currentAntinodes = this._calculateCurrentAntinodes(length, k, feedPosition);
        const voltageNodes = this._calculateVoltageNodes(length, k, feedPosition);
        const voltageAntinodes = this._calculateVoltageAntinodes(length, k, feedPosition);
        
        const harmonicNumber = this._getHarmonicNumber(electricalLength);
        
        return {
            current: {
                nodes: currentNodes,
                antinodes: currentAntinodes
            },
            voltage: {
                nodes: voltageNodes,
                antinodes: voltageAntinodes
            },
            harmonic: harmonicNumber,
            isResonant: this._isResonant(model)
        };
    }

    getResonanceGuidance(model) {
        const impedance = model.calculateImpedance();
        const reactance = impedance.reactance;
        const resistance = impedance.resistance;
        const { PhysicsUtils } = require('./physicsutils');
        const isResonant = PhysicsUtils.isResonant(impedance);
        
        if (isResonant) {
            return {
                status: 'Resonant',
                guidance: 'Antenna is well-matched',
                color: '#00ff00',
                lengthAdjustment: null
            };
        }
        
        const currentLength = model.length;
        let guidance, lengthAdjustment, targetLength;
        
        if (reactance < -15) {
            const reactanceRatio = Math.abs(reactance) / 377;
            lengthAdjustment = reactanceRatio * model.wavelength * 0.1;
            targetLength = currentLength + lengthAdjustment;
            guidance = `Too Short - Add ~${lengthAdjustment.toFixed(1)}m wire (Target: ${targetLength.toFixed(1)}m)`;
        } else if (reactance > 15) {
            const reactanceRatio = reactance / 377;
            lengthAdjustment = reactanceRatio * model.wavelength * 0.1;
            targetLength = currentLength - lengthAdjustment;
            guidance = `Too Long - Remove ~${lengthAdjustment.toFixed(1)}m wire (Target: ${targetLength.toFixed(1)}m)`;
        } else {
            guidance = 'Nearly Resonant - Minor adjustment needed';
            lengthAdjustment = 0;
        }
        
        return {
            status: 'Not Resonant',
            guidance: guidance,
            color: '#ff6600',
            lengthAdjustment: lengthAdjustment,
            reactance: reactance
        };
    }

    getDetailedResonanceInfo(model) {
        const basicInfo = this.calculateNodesAndAntinodes(model);
        const guidance = this.getResonanceGuidance(model);
        const impedance = model.calculateImpedance();
        
        const wavelength = model.wavelength;
        const currentLength = model.length;
        
        const commonResonantLengths = [
            { length: wavelength * 0.25, name: 'Î»/4 (Quarter Wave)' },
            { length: wavelength * 0.5, name: 'Î»/2 (Half Wave)' },
            { length: wavelength * 0.75, name: '3Î»/4 (Three Quarter)' },
            { length: wavelength * 1.0, name: 'Î» (Full Wave)' },
            { length: wavelength * 1.5, name: '3Î»/2 (One and Half)' }
        ];
        
        let closestResonant = commonResonantLengths[0];
        let minDifference = Math.abs(currentLength - closestResonant.length);
        
        commonResonantLengths.forEach(resonant => {
            const difference = Math.abs(currentLength - resonant.length);
            if (difference < minDifference) {
                minDifference = difference;
                closestResonant = resonant;
            }
        });
        
        return {
            ...basicInfo,
            guidance: guidance,
            impedance: impedance,
            closestResonant: {
                ...closestResonant,
                difference: currentLength - closestResonant.length,
                percentOff: ((currentLength - closestResonant.length) / closestResonant.length * 100)
            }
        };
    }

    _calculateCurrentNodes(length, k, feedPosition = 0.5) {
        const nodes = [];
        const halfLength = length / 2;
        
        // End-fed antennas have current nodes at the ends
        if (feedPosition === 0 || feedPosition === 1) {
            nodes.push(-halfLength);
            nodes.push(halfLength);
        } else {
            // Center-fed and off-center fed have current nodes at wire ends
            nodes.push(-halfLength);
            nodes.push(halfLength);
        }
        
        // Calculate internal current nodes based on standing wave pattern
        for (let n = 0; n < NODES_CONFIG.MAX_HARMONICS; n++) {
            const nodePosition = ((n + 0.5) * Math.PI) / k;
            if (nodePosition < halfLength - NODES_CONFIG.EDGE_BUFFER) {
                nodes.push(nodePosition);
                nodes.push(-nodePosition);
            }
        }
        
        return [...new Set(nodes)].sort((a, b) => a - b);
    }

    _calculateCurrentAntinodes(length, k, feedPosition = 0.5) {
        const antinodes = [];
        const halfLength = length / 2;
        
        // Center-fed antennas have current antinode at center
        if (feedPosition === 0.5) {
            antinodes.push(0);
        } else if (feedPosition === 0 || feedPosition === 1) {
            // End-fed antennas have current antinode at feed point
            const feedPos = feedPosition === 0 ? -halfLength : halfLength;
            antinodes.push(feedPos);
        } else {
            // Off-center fed has antinode at feed position
            const feedPos = (feedPosition - 0.5) * length;
            antinodes.push(feedPos);
        }
        
        // Calculate internal current antinodes
        for (let n = 1; n < NODES_CONFIG.MAX_HARMONICS; n++) {
            const antinodePosition = (n * Math.PI) / k;
            if (antinodePosition < halfLength - NODES_CONFIG.EDGE_BUFFER) {
                antinodes.push(antinodePosition);
                antinodes.push(-antinodePosition);
            }
        }
        
        return [...new Set(antinodes)].sort((a, b) => a - b);
    }

    _calculateVoltageNodes(length, k, feedPosition = 0.5) {
        const nodes = [];
        const halfLength = length / 2;
        
        // Center-fed antennas have voltage node at center
        if (feedPosition === 0.5) {
            nodes.push(0);
        }
        // End-fed and off-center fed antennas have different voltage node patterns
        
        // Calculate voltage nodes based on standing wave pattern
        for (let n = 1; n < NODES_CONFIG.MAX_HARMONICS; n++) {
            const nodePosition = (n * Math.PI) / k;
            if (nodePosition < halfLength - NODES_CONFIG.EDGE_BUFFER) {
                nodes.push(nodePosition);
                nodes.push(-nodePosition);
            }
        }
        
        return [...new Set(nodes)].sort((a, b) => a - b);
    }

    _calculateVoltageAntinodes(length, k, feedPosition = 0.5) {
        const antinodes = [];
        const halfLength = length / 2;
        
        // All antenna types have voltage antinodes at the wire ends
        antinodes.push(-halfLength);
        antinodes.push(halfLength);
        
        // Calculate internal voltage antinodes
        for (let n = 0; n < NODES_CONFIG.MAX_HARMONICS; n++) {
            const antinodePosition = ((n + 0.5) * Math.PI) / k;
            if (antinodePosition < halfLength - NODES_CONFIG.EDGE_BUFFER && antinodePosition > NODES_CONFIG.EDGE_BUFFER) {
                antinodes.push(antinodePosition);
                antinodes.push(-antinodePosition);
            }
        }
        
        return [...new Set(antinodes)].sort((a, b) => a - b);
    }

    _getHarmonicNumber(electricalLength) {
        const harmonicFloat = electricalLength * 2;
        const harmonic = Math.round(harmonicFloat);
        return harmonic <= 0 ? 1 : harmonic;
    }

    _isResonant(model) {
        const impedance = model.calculateImpedance();
        const { PhysicsUtils } = require('./physicsutils');
        return PhysicsUtils.isResonant(impedance);
    }

    getHarmonicName(harmonicNumber) {
        const names = ['', '1st (Fundamental)', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
        return names[harmonicNumber] || `${harmonicNumber}th`;
    }
}
