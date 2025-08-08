// physics/nodescalculator.js
import { NODES_CONFIG } from '../config/rendering.ts';

export class NodesCalculator {
    constructor() {
        this.tolerance = NODES_CONFIG.POSITION_TOLERANCE;
        this.minThreshold = NODES_CONFIG.MIN_AMPLITUDE_THRESHOLD;
    }

    calculateNodesAndAntinodes(model) {
        const { length, frequency } = model;
        const k = model.waveNumber;
        const electricalLength = model.electricalLength;
        
        const currentNodes = this._calculateCurrentNodes(length, k);
        const currentAntinodes = this._calculateCurrentAntinodes(length, k);
        const voltageNodes = this._calculateVoltageNodes(length, k);
        const voltageAntinodes = this._calculateVoltageAntinodes(length, k);
        
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
        const isResonant = Math.abs(reactance) < Math.max(15, resistance * 0.2);
        
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

    _calculateCurrentNodes(length, k) {
        const nodes = [];
        const halfLength = length / 2;
        
        nodes.push(-halfLength);
        nodes.push(halfLength);
        
        for (let n = 0; n < 8; n++) {
            const nodePosition = ((n + 0.5) * Math.PI) / k;
            if (nodePosition < halfLength - 0.1) {
                nodes.push(nodePosition);
                nodes.push(-nodePosition);
            }
        }
        
        return [...new Set(nodes)].sort((a, b) => a - b);
    }

    _calculateCurrentAntinodes(length, k) {
        const antinodes = [];
        const halfLength = length / 2;
        
        antinodes.push(0);
        
        for (let n = 1; n < 8; n++) {
            const antinodePosition = (n * Math.PI) / k;
            if (antinodePosition < halfLength - 0.1) {
                antinodes.push(antinodePosition);
                antinodes.push(-antinodePosition);
            }
        }
        
        return [...new Set(antinodes)].sort((a, b) => a - b);
    }

    _calculateVoltageNodes(length, k) {
        const nodes = [];
        const halfLength = length / 2;
        
        nodes.push(0);
        
        for (let n = 1; n < 8; n++) {
            const nodePosition = (n * Math.PI) / k;
            if (nodePosition < halfLength - 0.1) {
                nodes.push(nodePosition);
                nodes.push(-nodePosition);
            }
        }
        
        return [...new Set(nodes)].sort((a, b) => a - b);
    }

    _calculateVoltageAntinodes(length, k) {
        const antinodes = [];
        const halfLength = length / 2;
        
        antinodes.push(-halfLength);
        antinodes.push(halfLength);
        
        for (let n = 0; n < 8; n++) {
            const antinodePosition = ((n + 0.5) * Math.PI) / k;
            if (antinodePosition < halfLength - 0.1 && antinodePosition > 0.1) {
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
        return Math.abs(impedance.reactance) < Math.max(15, impedance.resistance * 0.2);
    }

    getHarmonicName(harmonicNumber) {
        const names = ['', '1st (Fundamental)', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
        return names[harmonicNumber] || `${harmonicNumber}th`;
    }
}
