"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface AntennaData {
  type: string
  frequency: number
  elements: number
  elementLength: number
  elementSpacing: number
  feedPoint: number // Changed from string to number
  material: string
  wireDiameter: number // Added
  balunRatio: string // Added
}

interface AntennaPerformanceProps {
  antennaData: AntennaData
  antennaModel?: any  // Real physics model
  resonantFrequency: number
  wavelength: number
  feedImpedance: number
  physicalLength: number
  realImpedance?: any  // Real calculated impedance
  systemImpedance?: any  // Impedance after matching network
  swr?: number  // Real calculated SWR
  antennaType?: string  // Real antenna type classification
}

export default function AntennaPerformance({ 
  antennaData,
  antennaModel,
  resonantFrequency, 
  wavelength,
  feedImpedance,
  physicalLength,
  realImpedance,
  systemImpedance,
  swr,
  antennaType: realAntennaType
}: AntennaPerformanceProps) {
  const [activeTab, setActiveTab] = useState("radiation")

  // Use real physics data when available
  const useRealPhysics = antennaModel && realImpedance && systemImpedance

  // Calculate nodes and antinodes using real physics
  const calculateNodesAndAntinodes = () => {
    if (!antennaModel) {
      // Fallback to approximate calculations
      return {
        currentNodes: Math.max(2, Math.floor(antennaData.elementLength * 2)),
        voltageNodes: Math.max(1, Math.floor(antennaData.elementLength * 2) + 1),
        currentAntinodes: Math.max(1, Math.floor(antennaData.elementLength * 2) - 1),
        voltageAntinodes: Math.max(2, Math.floor(antennaData.elementLength * 2))
      }
    }

    // Use the same improved NodesCalculator as the visualization
    const k = antennaModel.waveNumber
    const length = antennaModel.length
    const halfLength = length / 2
    const wavelength = 2 * Math.PI / k
    const electricalLength = length / wavelength

    // Calculate current nodes (I = 0) - improved algorithm
    const currentNodes = []
    currentNodes.push(-halfLength, halfLength) // Always at ends
    const maxNodes = Math.ceil(electricalLength * 4) // Scale with antenna length
    const edgeBuffer = Math.min(0.1, wavelength * 0.05) // Proportional edge buffer
    
    for (let n = 0; n < maxNodes; n++) {
      const nodePosition = ((n + 0.5) * Math.PI) / k
      if (nodePosition < halfLength - edgeBuffer) {
        currentNodes.push(nodePosition, -nodePosition)
      }
    }

    // Calculate current antinodes (I = max) - improved algorithm
    const currentAntinodes = [0] // Always at center
    const maxAntinodes = Math.ceil(electricalLength * 4) // Scale with antenna length
    
    for (let n = 1; n < maxAntinodes; n++) {
      const antinodePosition = (n * Math.PI) / k
      if (antinodePosition < halfLength - edgeBuffer) {
        currentAntinodes.push(antinodePosition, -antinodePosition)
      }
    }

    // Calculate voltage nodes (V = 0) - improved algorithm
    const voltageNodes = [0] // Always at center
    for (let n = 1; n < maxNodes; n++) {
      const nodePosition = (n * Math.PI) / k
      if (nodePosition < halfLength - edgeBuffer) {
        voltageNodes.push(nodePosition, -nodePosition)
      }
    }

    // Calculate voltage antinodes (V = max) - improved algorithm
    const voltageAntinodes = []
    voltageAntinodes.push(-halfLength, halfLength) // Always at ends
    const centerBuffer = Math.max(0.1, wavelength * 0.05) // Avoid center overlap
    
    for (let n = 0; n < maxAntinodes; n++) {
      const antinodePosition = ((n + 0.5) * Math.PI) / k
      if (antinodePosition < halfLength - edgeBuffer && antinodePosition > centerBuffer) {
        voltageAntinodes.push(antinodePosition, -antinodePosition)
      }
    }

    return {
      currentNodes: [...new Set(currentNodes)].length,
      voltageNodes: [...new Set(voltageNodes)].length,
      currentAntinodes: [...new Set(currentAntinodes)].length,
      voltageAntinodes: [...new Set(voltageAntinodes)].length
    }
  }

  const nodesData = calculateNodesAndAntinodes()

  // Calculate simulated performance metrics based on antenna parameters
  const calculateGain = () => {
    let baseGain = 0
    
    switch (antennaData.type) {
      case "dipole":
        baseGain = 2.15 // Dipole gain in dBi
        break
      case "yagi":
        // Yagi gain increases with number of elements
        baseGain = 3 + 3 * Math.log2(antennaData.elements)
        break
      case "patch":
        baseGain = 6 + antennaData.elementLength * 2
        break
      case "logperiodic":
        baseGain = 7 + antennaData.elements / 2
        break
      case "helical":
        // Helical gain depends on circumference and number of turns
        const circumference = 2 * Math.PI * (antennaData.elementLength / 4)
        // Ensure the argument to Math.log10 is positive and not zero
        const logArg = 15 * (circumference / calculatedWavelength) ** 2 * antennaData.elements;
        baseGain = 10 * Math.log10(Math.max(0.001, logArg)); // Clamp logArg to avoid log(0) or log(negative)
        break
      default:
        baseGain = 2.15
    }
    
    // Material efficiency factor
    const materialEfficiency = {
      copper: 0.95,
      aluminum: 0.9,
      steel: 0.8,
      gold: 0.93,
      silver: 0.97,
    }
    
    const efficiency = materialEfficiency[antennaData.material as keyof typeof materialEfficiency] || 0.9
    
    return baseGain * efficiency
  }

  const gain = calculateGain()
  
  // Use real SWR or calculate if not available
  const finalSWR = (swr !== undefined && swr !== null) ? swr : (() => {
    // Fallback SWR calculation (simplified model)
    let optimalLength = 0
    
    switch (antennaData.type) {
      case "dipole":
        optimalLength = 0.5
        break
      case "yagi":
        optimalLength = 0.5
        break
      case "patch":
        optimalLength = 0.49
        break
      case "logperiodic":
        optimalLength = 0.45
        break
      case "helical":
        optimalLength = 0.25
        break
      default:
        optimalLength = 0.5
    }
    
    const lengthRatio = antennaData.elementLength / optimalLength
    const deviation = Math.abs(1 - lengthRatio)
    let swrValue = 1 + deviation * 5
    
    if (antennaData.feedPoint === 50 && (antennaData.type === "dipole" || antennaData.type === "yagi")) {
      swrValue *= 0.9
    }
    
    return Math.min(10, Math.max(1, swrValue))
  })()
  
  // Calculate bandwidth based on antenna type and parameters
  const calculateBandwidth = () => {
    let relativeBandwidth = 0
    
    switch (antennaData.type) {
      case "dipole":
        relativeBandwidth = 0.1 // About 10% of center frequency
        break
      case "yagi":
        relativeBandwidth = 0.05 + 0.01 * antennaData.elements // Narrower bandwidth
        break
      case "patch":
        relativeBandwidth = 0.03 + 0.01 * antennaData.elementLength // Very narrow
        break
      case "logperiodic":
        relativeBandwidth = 0.5 + 0.1 * antennaData.elements // Very wide bandwidth
        break
      case "helical":
        relativeBandwidth = 0.2 + 0.05 * antennaData.elements // Medium bandwidth
        break
      default:
        relativeBandwidth = 0.1
    }
    
    return relativeBandwidth * antennaData.frequency // Return in MHz
  }

  const bandwidth = calculateBandwidth()
  
  // Generate radiation pattern data based on antenna type
  const generateRadiationPattern = () => {
    const points = 16
    const data = []
    
    for (let i = 0; i < points; i++) {
      const angle = (i * 360) / points
      let relativeAmplitude = 0 // Represents the shape of the pattern (0 to 1)
      
      switch (antennaData.type) {
        case "dipole":
          relativeAmplitude = Math.abs(Math.sin((angle * Math.PI) / 180));
          break;
        case "yagi":
          if (angle > 270 || angle < 90) {
            relativeAmplitude = Math.cos((angle * Math.PI) / 180) ** 2;
          } else {
            relativeAmplitude = 0.2; // Back lobe relative to max
          }
          break;
        case "patch":
          if (angle > 180 && angle < 360) {
            relativeAmplitude = Math.cos(((angle - 270) * Math.PI) / 180) ** 2;
          } else {
            relativeAmplitude = 0.1; // Almost no radiation behind ground plane
          }
          break;
        case "logperiodic":
          if (angle > 270 || angle < 90) {
            relativeAmplitude = Math.cos((angle * Math.PI) / 180) ** 1.5;
          } else {
            relativeAmplitude = 0.3; // Larger back lobe than Yagi
          }
          break;
        case "helical":
          if (angle > 315 || angle < 45) {
            relativeAmplitude = Math.cos((angle * Math.PI) / 90) ** 3;
          } else {
            relativeAmplitude = 0.1; // Very small side/back lobes
          }
          break;
        default:
          relativeAmplitude = Math.abs(Math.sin((angle * Math.PI) / 180));
      }
      
      // Calculate the actual dBi value for this angle
      // If the overall gain is negative, the pattern will be scaled down proportionally.
      const actualDbiAtAngle = gain * relativeAmplitude;

      data.push({
        angle: angle.toString(),
        gain: actualDbiAtAngle, // Use the actual (potentially negative) dBi value
      });
    }
    
    return data
  }

  // Generate SWR vs frequency data
  const generateSWRData = () => {
    const points = 21
    const centerFreq = antennaData.frequency
    const freqSpan = bandwidth * 2
    const data = []
    
    for (let i = 0; i < points; i++) {
      const freq = centerFreq - freqSpan / 2 + (i * freqSpan) / (points - 1)
      
      // Calculate frequency deviation from center
      const deviation = Math.abs(freq - centerFreq) / centerFreq
      
      // SWR increases as we move away from center frequency
      let swrValue = finalSWR + deviation * 20
      
      // Add some randomness for realism
      swrValue += (Math.random() - 0.5) * 0.5
      
      data.push({
        frequency: freq.toFixed(1),
        swr: Math.max(1, Math.min(10, swrValue)),
      })
    }
    
    return data
  }

  // Generate impedance vs frequency data using real physics when available
  const generateImpedanceData = () => {
    const points = 21
    const centerFreq = antennaData.frequency
    const freqSpan = bandwidth * 2
    const data = []
    
    // Get base impedance from real physics or fallback
    let baseResistance = 73
    let baseReactance = 0
    
    if (useRealPhysics && realImpedance) {
      baseResistance = realImpedance.resistance
      baseReactance = realImpedance.reactance
    } else {
      // Fallback calculations
      switch (antennaData.type) {
        case "dipole":
          baseResistance = 73
          break
        case "yagi":
          baseResistance = 50 + 10 * Math.log10(antennaData.elements)
          break
        case "patch":
          baseResistance = 50 + 20 * antennaData.elementLength
          break
        case "logperiodic":
          baseResistance = 60 + 5 * antennaData.elements
          break
        case "helical":
          baseResistance = 140
          break
        default:
          baseResistance = 73
      }
      
      // Feed point adjustment
      if (antennaData.feedPoint === 25) {
        baseResistance *= 0.8
      } else if (antennaData.feedPoint === 0 || antennaData.feedPoint === 100) {
        baseResistance *= 2.5
      }
    }
    
    for (let i = 0; i < points; i++) {
      const freq = centerFreq - freqSpan / 2 + (i * freqSpan) / (points - 1)
      const deviation = (freq - centerFreq) / centerFreq
      
      // Resistance varies less with frequency
      const resistance = baseResistance * (1 + deviation * 0.3)
      
      // Reactance varies more and crosses zero at resonance
      const reactance = baseReactance + (deviation * baseResistance * 1.5)
      
      data.push({
        frequency: freq.toFixed(1),
        resistance: resistance.toFixed(1),
        reactance: reactance.toFixed(1),
      })
    }
    
    return data
  }

  const radiationData = generateRadiationPattern()
  const swrData = generateSWRData()
  const impedanceData = generateImpedanceData()

  // Calculate min and max gain for the radar chart domain
  const minPlottingGain = radiationData.length > 0 
    ? Math.min(...radiationData.map(d => d.gain)) 
    : 0;
  const maxPlottingGain = radiationData.length > 0 
    ? Math.max(...radiationData.map(d => d.gain)) 
    : 0;

  // Ensure the domain has a reasonable range, especially if min/max are very close or both negative
  const radarChartDomainLowerBound = Math.floor(minPlottingGain - (Math.abs(minPlottingGain) * 0.1 || 1)); // Add padding, or at least -1
  const radarChartDomainUpperBound = Math.ceil(maxPlottingGain + (Math.abs(maxPlottingGain) * 0.1 || 1)); // Add padding, or at least 1

  // Ensure the domain is not collapsed if min and max are the same (e.g., all zeros)
  const finalRadarDomain = [
    radarChartDomainLowerBound,
    Math.max(radarChartDomainLowerBound + 2, radarChartDomainUpperBound) // Ensure at least a 2 unit range
  ];

  return (
    <>
      <div className="space-y-3 text-sm mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Gain</div>
            <div className="text-lg font-bold">{gain.toFixed(2)} dBi</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">SWR</div>
            <div className="text-lg font-bold">{finalSWR.toFixed(2)}:1</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Bandwidth</div>
            <div className="text-lg font-bold">{bandwidth.toFixed(1)} MHz</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Feed Position</div>
            <div className="text-lg font-bold">{antennaData.feedPoint}%</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Antenna Impedance</div>
            <div className="text-lg font-bold">
              {useRealPhysics && realImpedance ? 
                `${realImpedance.resistance.toFixed(1)} ${realImpedance.reactance >= 0 ? '+' : ''}${realImpedance.reactance.toFixed(1)}j Ω` :
                `${feedImpedance}Ω`
              }
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">System Impedance</div>
            <div className="text-lg font-bold">
              {useRealPhysics && systemImpedance ? 
                `${systemImpedance.resistance.toFixed(1)} ${systemImpedance.reactance >= 0 ? '+' : ''}${systemImpedance.reactance.toFixed(1)}j Ω` :
                `${feedImpedance}Ω`
              }
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Antenna Type</div>
            <div className="text-lg font-bold">{realAntennaType || antennaData.type}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Matching Network</div>
            <div className="text-lg font-bold">{antennaData.balunRatio}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Physical Length</div>
            <div className="text-lg font-bold">{physicalLength.toFixed(2)}m</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Electrical Length</div>
            <div className="text-lg font-bold">
              {antennaModel ? 
                `${antennaModel.electricalLength.toFixed(3)}λ` :
                `${(antennaData.elementLength / wavelength).toFixed(3)}λ`
              }
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Wavelength</div>
            <div className="text-lg font-bold">{wavelength.toFixed(2)}m</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Current Nodes</div>
            <div className="text-lg font-bold">{nodesData.currentNodes}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Current Antinodes</div>
            <div className="text-lg font-bold">{nodesData.currentAntinodes}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Voltage Nodes</div>
            <div className="text-lg font-bold">{nodesData.voltageNodes}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Voltage Antinodes</div>
            <div className="text-lg font-bold">{nodesData.voltageAntinodes}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Impedance Magnitude</div>
            <div className="text-lg font-bold">
              {useRealPhysics && realImpedance ? 
                `${Math.sqrt(realImpedance.resistance ** 2 + realImpedance.reactance ** 2).toFixed(1)} Ω` :
                `${feedImpedance} Ω`
              }
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Phase Angle</div>
            <div className="text-lg font-bold">
              {useRealPhysics && realImpedance ? 
                `${(Math.atan2(realImpedance.reactance, realImpedance.resistance) * 180 / Math.PI).toFixed(1)}°` :
                `0.0°`
              }
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Reactance Type</div>
            <div className="text-lg font-bold">
              {useRealPhysics && realImpedance ? 
                (realImpedance.reactance > 15 ? "Inductive" : 
                 realImpedance.reactance < -15 ? "Capacitive" : "Resistive") :
                "Resistive"
              }
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="radiation">Radiation Pattern</TabsTrigger>
          <TabsTrigger value="swr">SWR</TabsTrigger>
          <TabsTrigger value="impedance">Impedance</TabsTrigger>
        </TabsList>
        <TabsContent value="radiation" className="space-y-4">
          <div className="p-4 rounded-lg border">
            <div className="mb-2">
              <h3 className="text-lg font-medium">Radiation Pattern</h3>
              <p className="text-sm text-muted-foreground">Antenna gain (dBi) vs. angle (degrees)</p>
            </div>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  gain: {
                    label: "Gain (dBi)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
              >
                <RadarChart data={radiationData} outerRadius={120}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="angle" />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={finalRadarDomain} 
                    tickFormatter={(value: number) => `${value} dBi`} 
                  />
                  <Radar name="Gain" dataKey="gain" stroke="var(--color-gain)" fill="var(--color-gain)" fillOpacity={0.6} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RadarChart>
              </ChartContainer>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="swr" className="space-y-4">
          <div className="p-4 rounded-lg border">
            <div className="mb-2">
              <h3 className="text-lg font-medium">SWR vs Frequency</h3>
              <p className="text-sm text-muted-foreground">Standing Wave Ratio across frequency range</p>
            </div>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  swr: {
                    label: "SWR",
                    color: "hsl(var(--chart-2))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={swrData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="frequency" 
                      label={{ value: 'Frequency (MHz)', position: 'insideBottom', offset: -5 }} 
                    />
                    <YAxis 
                      domain={[1, 10]} 
                      label={{ value: 'SWR', angle: -90, position: 'insideLeft' }} 
                    />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="swr" 
                      stroke="var(--color-swr)" 
                      strokeWidth={2} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="impedance" className="space-y-4">
          <div className="p-4 rounded-lg border">
            <div className="mb-2">
              <h3 className="text-lg font-medium">Impedance vs Frequency</h3>
              <p className="text-sm text-muted-foreground">Resistance and reactance across frequency range</p>
            </div>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  resistance: {
                    label: "Resistance (Ω)",
                    color: "hsl(var(--chart-1))",
                  },
                  reactance: {
                    label: "Reactance (Ω)",
                    color: "hsl(var(--chart-3))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={impedanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="frequency" 
                      label={{ value: 'Frequency (MHz)', position: 'insideBottom', offset: -5 }} 
                    />
                    <YAxis 
                      label={{ value: 'Impedance (Ω)', angle: -90, position: 'insideLeft' }} 
                    />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="resistance" 
                      name="Resistance" 
                      stroke="var(--color-resistance)" 
                      strokeWidth={2} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="reactance" 
                      name="Reactance" 
                      stroke="var(--color-reactance)" 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
