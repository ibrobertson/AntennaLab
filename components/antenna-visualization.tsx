"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, EyeIcon, Play, Pause, RotateCcw } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface AntennaData {
  type: string
  frequency: number
  elements: number
  elementLength: number
  elementSpacing: number
  feedPoint: number
  material: string
  wireDiameter: number
  balunRatio: string
}

interface VisibilitySettings {
  antenna: boolean
  current: boolean
  voltage: boolean
  eField: boolean
  hField: boolean
  nodes: boolean
  debugInfo: boolean
}

// LearnTenna Physics Integration
class NodesCalculator {
  tolerance: number;
  minThreshold: number;

  constructor() {
    this.tolerance = 0.05;
    this.minThreshold = 0.1;
  }

  calculateNodesAndAntinodes(antennaModel: any) {
    const k = antennaModel.waveNumber;
    const length = antennaModel.length;
    const electricalLength = antennaModel.electricalLength;
    
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
      isResonant: this._isResonant(antennaModel)
    };
  }

  _calculateCurrentNodes(length: number, k: number) {
    const nodes = [];
    const halfLength = length / 2;
    const wavelength = 2 * Math.PI / k;
    const electricalLength = length / wavelength;
    
    // Always include the wire ends (current nodes for dipole)
    nodes.push(-halfLength);
    nodes.push(halfLength);
    
    // Calculate internal nodes - scale with antenna length
    const maxNodes = Math.ceil(electricalLength * 4); // More nodes for longer antennas
    const edgeBuffer = Math.min(0.1, wavelength * 0.05); // Proportional edge buffer
    
    for (let n = 0; n < maxNodes; n++) {
      const nodePosition = ((n + 0.5) * Math.PI) / k;
      if (nodePosition < halfLength - edgeBuffer) {
        nodes.push(nodePosition);
        nodes.push(-nodePosition);
      }
    }
    
    return [...new Set(nodes)].sort((a, b) => a - b);
  }

  _calculateCurrentAntinodes(length: number, k: number) {
    const antinodes = [];
    const halfLength = length / 2;
    const wavelength = 2 * Math.PI / k;
    const electricalLength = length / wavelength;
    
    // Always include center (current antinode for dipole)
    antinodes.push(0);
    
    // Calculate internal antinodes - scale with antenna length
    const maxAntinodes = Math.ceil(electricalLength * 4); // More antinodes for longer antennas
    const edgeBuffer = Math.min(0.1, wavelength * 0.05); // Proportional edge buffer
    
    for (let n = 1; n < maxAntinodes; n++) {
      const antinodePosition = (n * Math.PI) / k;
      if (antinodePosition < halfLength - edgeBuffer) {
        antinodes.push(antinodePosition);
        antinodes.push(-antinodePosition);
      }
    }
    
    return [...new Set(antinodes)].sort((a, b) => a - b);
  }

  _calculateVoltageNodes(length: number, k: number) {
    const nodes = [];
    const halfLength = length / 2;
    const wavelength = 2 * Math.PI / k;
    const electricalLength = length / wavelength;
    
    // Always include center (voltage node for dipole)
    nodes.push(0);
    
    // Calculate internal nodes - scale with antenna length
    const maxNodes = Math.ceil(electricalLength * 4); // More nodes for longer antennas
    const edgeBuffer = Math.min(0.1, wavelength * 0.05); // Proportional edge buffer
    
    for (let n = 1; n < maxNodes; n++) {
      const nodePosition = (n * Math.PI) / k;
      if (nodePosition < halfLength - edgeBuffer) {
        nodes.push(nodePosition);
        nodes.push(-nodePosition);
      }
    }
    
    return [...new Set(nodes)].sort((a, b) => a - b);
  }

  _calculateVoltageAntinodes(length: number, k: number) {
    const antinodes = [];
    const halfLength = length / 2;
    const wavelength = 2 * Math.PI / k;
    const electricalLength = length / wavelength;
    
    // Always include wire ends (voltage antinodes for dipole)
    antinodes.push(-halfLength);
    antinodes.push(halfLength);
    
    // Calculate internal antinodes - scale with antenna length
    const maxAntinodes = Math.ceil(electricalLength * 4); // More antinodes for longer antennas
    const edgeBuffer = Math.min(0.1, wavelength * 0.05); // Proportional edge buffer
    const centerBuffer = Math.max(0.1, wavelength * 0.05); // Avoid center overlap
    
    for (let n = 0; n < maxAntinodes; n++) {
      const antinodePosition = ((n + 0.5) * Math.PI) / k;
      if (antinodePosition < halfLength - edgeBuffer && antinodePosition > centerBuffer) {
        antinodes.push(antinodePosition);
        antinodes.push(-antinodePosition);
      }
    }
    
    return [...new Set(antinodes)].sort((a, b) => a - b);
  }

  _getHarmonicNumber(electricalLength: number) {
    const harmonicFloat = electricalLength * 2;
    const harmonic = Math.round(harmonicFloat);
    return harmonic <= 0 ? 1 : harmonic;
  }

  _isResonant(antennaModel: any) {
    const impedance = antennaModel.calculateImpedance();
    return Math.abs(impedance.reactance) < Math.max(15, impedance.resistance * 0.2);
  }
}

export default function AntennaVisualization({ 
  antennaData, 
  antennaModel, // Add this prop from your page.tsx
  animationTime = 0,
  visibility,
  setVisibility,
  isAnimating,
  setIsAnimating,
  setAnimationTime
}: { 
  antennaData: AntennaData
  antennaModel?: any // Add this to your interface
  animationTime?: number
  visibility: VisibilitySettings
  setVisibility: React.Dispatch<React.SetStateAction<VisibilitySettings>>
  isAnimating: boolean
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
  setAnimationTime: React.Dispatch<React.SetStateAction<number>>
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const currentNodesRef = useRef<THREE.Group>(new THREE.Group())
  const voltageNodesRef = useRef<THREE.Group>(new THREE.Group())
  const nodesCalculatorRef = useRef(new NodesCalculator())
  const currentCurveRef = useRef<THREE.Line | null>(null)
  const voltageCurveRef = useRef<THREE.Line | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize scene with dark background like LearnTenna
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000) // Pure black like LearnTenna
    sceneRef.current = scene

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(15, 10, 15) // LearnTenna camera position
    cameraRef.current = camera

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controlsRef.current = controls

    // Add LearnTenna style lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    scene.add(directionalLight)

    // Add coordinate axes like LearnTenna
    const axisLength = 15
    const axisOpacity = 0.3
    
    const axes = [
      { color: 0xff0000, direction: [axisLength, 0, 0] },
      { color: 0x00ff00, direction: [0, axisLength, 0] },
      { color: 0x0000ff, direction: [0, 0, axisLength] }
    ];

    axes.forEach(axis => {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(axis.direction[0], axis.direction[1], axis.direction[2])
      ]);
      const material = new THREE.LineBasicMaterial({ 
        color: axis.color, 
        transparent: true, 
        opacity: axisOpacity 
      });
      const line = new THREE.Line(geometry, material);
      scene.add(line);
    });

    // Add current and voltage node groups
    scene.add(currentNodesRef.current)
    scene.add(voltageNodesRef.current)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return
      
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }
    }
  }, [])

  useEffect(() => {
    if (!sceneRef.current) return

    // Clear previous antenna model
    const scene = sceneRef.current
    scene.children = scene.children.filter(
      (child) => !(child instanceof THREE.Mesh && child.userData.isAntenna)
    )

    // Clear node groups
    currentNodesRef.current.clear()
    voltageNodesRef.current.clear()
    
    // Clean up existing curves 
    cleanupCurves()

    // Material color based on selected material
    const materialColors = {
      copper: 0xffff00, // Yellow like LearnTenna
      aluminum: 0xd3d3d3,
      steel: 0x71797e,
      gold: 0xffd700,
      silver: 0xc0c0c0,
    }
    
    const materialColor = materialColors[antennaData.material as keyof typeof materialColors] || 0xffff00

    // Create antenna based on type (keeping your existing antenna creation logic)
    switch (antennaData.type) {
      case "dipole":
        createDipoleAntenna(scene, antennaData, materialColor)
        break
      case "yagi":
        createYagiAntenna(scene, antennaData, materialColor)
        break
      case "patch":
        createPatchAntenna(scene, antennaData, materialColor)
        break
      case "logperiodic":
        createLogPeriodicAntenna(scene, antennaData, materialColor)
        break
      case "helical":
        createHelicalAntenna(scene, antennaData, materialColor)
        break
      default:
        createDipoleAntenna(scene, antennaData, materialColor)
    }

    // Add LearnTenna physics-based current/voltage visualization
    if (antennaModel && (visibility.current || visibility.voltage || visibility.nodes)) {
      addLearnTennaVisualization(antennaModel, animationTime)
    }
  }, [antennaData, antennaModel, visibility, animationTime])

  // Update animation with LearnTenna physics
  useEffect(() => {
    if (antennaModel && (visibility.current || visibility.voltage || visibility.nodes)) {
      addLearnTennaVisualization(antennaModel, animationTime)
    }
  }, [animationTime, antennaModel, visibility])

  // Create animated current/voltage curves like LearnTenna
  const createCurrentVoltageCurves = (model: any) => {
    if (!sceneRef.current) return

    const wireLength = model.length
    const numPoints = 50 // Same as LearnTenna's CURVE_POINTS
    
    // Create position array along the antenna length
    const positions = []
    for (let i = 0; i < numPoints; i++) {
      const x = (i / (numPoints - 1)) * wireLength - wireLength / 2
      positions.push(x)
    }
    
    // Get spatial distributions from the physics engine
    const distributions = model.getSpatialDistributions(positions)
    
    // Create current curve (blue/cyan)
    const currentPoints = positions.map(x => new THREE.Vector3(x, 0, 0))
    const currentGeometry = new THREE.BufferGeometry().setFromPoints(currentPoints)
    const currentMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00aaff, // LearnTenna current color
      transparent: true, 
      opacity: 0.8,
      linewidth: 3
    })
    
    // Remove existing current curve
    if (currentCurveRef.current) {
      sceneRef.current.remove(currentCurveRef.current)
      currentCurveRef.current.geometry.dispose()
      currentCurveRef.current.material.dispose()
    }
    
    currentCurveRef.current = new THREE.Line(currentGeometry, currentMaterial)
    currentCurveRef.current.userData = {
      amplitudes: distributions.current,
      positions: positions,
      curveType: 'current'
    }
    currentCurveRef.current.visible = visibility.current
    sceneRef.current.add(currentCurveRef.current)
    
    // Create voltage curve (orange/red)
    const voltagePoints = positions.map(x => new THREE.Vector3(x, 0, 0))
    const voltageGeometry = new THREE.BufferGeometry().setFromPoints(voltagePoints)
    const voltageMaterial = new THREE.LineBasicMaterial({ 
      color: 0xff6b35, // LearnTenna voltage color
      transparent: true, 
      opacity: 0.8,
      linewidth: 3
    })
    
    // Remove existing voltage curve
    if (voltageCurveRef.current) {
      sceneRef.current.remove(voltageCurveRef.current)
      voltageCurveRef.current.geometry.dispose()
      voltageCurveRef.current.material.dispose()
    }
    
    voltageCurveRef.current = new THREE.Line(voltageGeometry, voltageMaterial)
    voltageCurveRef.current.userData = {
      amplitudes: distributions.voltage,
      positions: positions,
      curveType: 'voltage'
    }
    voltageCurveRef.current.visible = visibility.voltage
    sceneRef.current.add(voltageCurveRef.current)
  }

  // Update animated curves like LearnTenna
  const updateAnimatedCurves = (model: any, time: number) => {
    if (!model) return

    const impedance = model.calculateImpedance()
    const phaseAngle = Math.atan2(impedance.reactance, impedance.resistance)
    const timeInRadians = (time * Math.PI) / 180 // Convert degrees to radians
    
    // Update current curve (no phase shift)
    if (currentCurveRef.current && currentCurveRef.current.userData.amplitudes) {
      updateCurveGeometry(currentCurveRef.current, timeInRadians, 0)
    }
    
    // Update voltage curve (with phase shift)
    if (voltageCurveRef.current && voltageCurveRef.current.userData.amplitudes) {
      updateCurveGeometry(voltageCurveRef.current, timeInRadians, phaseAngle)
    }
  }

  // Update individual curve geometry
  const updateCurveGeometry = (curve: THREE.Line, time: number, phaseShift: number) => {
    if (!curve || !curve.geometry || !curve.geometry.attributes.position) return
    
    const positions = curve.geometry.attributes.position.array
    const amplitudes = curve.userData.amplitudes
    
    if (amplitudes) {
      for (let i = 0; i < amplitudes.length; i++) {
        const amplitude = amplitudes[i]
        const animatedY = Math.sin(time + phaseShift) * amplitude * 0.5 // Scale for visibility
        if (i * 3 + 1 < positions.length) {
          positions[i * 3 + 1] = animatedY
        }
      }
      curve.geometry.attributes.position.needsUpdate = true
    }
  }

  // Update curve visibility
  const updateCurveVisibility = () => {
    if (currentCurveRef.current) {
      currentCurveRef.current.visible = visibility.current
    }
    if (voltageCurveRef.current) {
      voltageCurveRef.current.visible = visibility.voltage
    }
  }

  // Clean up curves
  const cleanupCurves = () => {
    if (currentCurveRef.current && sceneRef.current) {
      sceneRef.current.remove(currentCurveRef.current)
      currentCurveRef.current.geometry.dispose()
      currentCurveRef.current.material.dispose()
      currentCurveRef.current = null
    }
    if (voltageCurveRef.current && sceneRef.current) {
      sceneRef.current.remove(voltageCurveRef.current)
      voltageCurveRef.current.geometry.dispose()
      voltageCurveRef.current.material.dispose()
      voltageCurveRef.current = null
    }
  }

  const addLearnTennaVisualization = (model: any, time: number) => {
    if (!sceneRef.current) return

    // Clear existing nodes
    currentNodesRef.current.clear()
    voltageNodesRef.current.clear()

    // Create curves only if they don't exist and are needed
    const needCurrentCurve = visibility.current && !currentCurveRef.current
    const needVoltageCurve = visibility.voltage && !voltageCurveRef.current
    
    if (needCurrentCurve || needVoltageCurve) {
      createCurrentVoltageCurves(model)
    }

    // Update curve animations
    updateAnimatedCurves(model, time)
    
    // Update curve visibility
    updateCurveVisibility()

    // Get real nodes from LearnTenna physics
    const nodesData = nodesCalculatorRef.current.calculateNodesAndAntinodes(model)
    const timeInRadians = (time * Math.PI) / 180
    const impedance = model.calculateImpedance()
    const phaseAngle = Math.atan2(impedance.reactance, impedance.resistance)

    // Create current nodes (I=0 points) - RED
    if (visibility.nodes || visibility.current) {
      nodesData.current.nodes.forEach((position: number) => {
        const nodeGeometry = new THREE.SphereGeometry(0.25, 16, 16) // LearnTenna node size
        const nodeMaterial = new THREE.MeshLambertMaterial({ 
          color: 0xff0000, // Red for current nodes
          transparent: true,
          opacity: 0.6 + 0.2 * Math.sin(timeInRadians * 0.5)
        })
        const nodeMarker = new THREE.Mesh(nodeGeometry, nodeMaterial)
        nodeMarker.position.set(position, 0, 0)
        currentNodesRef.current.add(nodeMarker)
      })

      // Create current antinodes (I=max points) - ORANGE
      nodesData.current.antinodes.forEach((position: number) => {
        const antinodeGeometry = new THREE.SphereGeometry(0.35, 16, 16) // LearnTenna antinode size
        const antinodeMaterial = new THREE.MeshLambertMaterial({ 
          color: 0xff6600, // Orange for current antinodes
          transparent: true,
          opacity: 0.8 + 0.2 * Math.sin(timeInRadians * 2)
        })
        const antinodeMarker = new THREE.Mesh(antinodeGeometry, antinodeMaterial)
        antinodeMarker.position.set(position, 0, 0)
        antinodeMarker.scale.setScalar(0.9 + 0.1 * Math.sin(timeInRadians * 3))
        currentNodesRef.current.add(antinodeMarker)

        // Add glow effect for antinodes
        const glowGeometry = new THREE.SphereGeometry(0.35 * 1.4, 12, 12)
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: 0xff6600,
          transparent: true,
          opacity: 0.3
        })
        const glow = new THREE.Mesh(glowGeometry, glowMaterial)
        glow.position.set(position, 0, 0)
        currentNodesRef.current.add(glow)
      })
    }

    // Create voltage nodes (V=0 points) - BLUE
    if (visibility.nodes || visibility.voltage) {
      nodesData.voltage.nodes.forEach((position: number) => {
        const nodeGeometry = new THREE.SphereGeometry(0.25, 16, 16)
        const nodeMaterial = new THREE.MeshLambertMaterial({ 
          color: 0x0066ff, // Blue for voltage nodes
          transparent: true,
          opacity: 0.6 + 0.2 * Math.sin(timeInRadians * 0.5)
        })
        const nodeMarker = new THREE.Mesh(nodeGeometry, nodeMaterial)
        nodeMarker.position.set(position, 0.1, 0) // Slight Y offset
        voltageNodesRef.current.add(nodeMarker)
      })

      // Create voltage antinodes (V=max points) - CYAN
      nodesData.voltage.antinodes.forEach((position: number) => {
        const antinodeGeometry = new THREE.SphereGeometry(0.35, 16, 16)
        const antinodeMaterial = new THREE.MeshLambertMaterial({ 
          color: 0x00aaff, // Cyan for voltage antinodes
          transparent: true,
          opacity: 0.8 + 0.2 * Math.sin(timeInRadians * 2)
        })
        const antinodeMarker = new THREE.Mesh(antinodeGeometry, antinodeMaterial)
        antinodeMarker.position.set(position, 0.1, 0) // Slight Y offset
        antinodeMarker.scale.setScalar(0.9 + 0.1 * Math.sin(timeInRadians * 3))
        voltageNodesRef.current.add(antinodeMarker)
      })
    }

    // Add feed point indicator (RED sphere like LearnTenna)
    const feedPosition = (model.feedPosition - 0.5) * model.length
    const feedGeometry = new THREE.SphereGeometry(0.3, 16, 16)
    const feedMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 })
    const feedPoint = new THREE.Mesh(feedGeometry, feedMaterial)
    feedPoint.position.set(feedPosition, 0, 0)
    feedPoint.userData.isAntenna = true
    sceneRef.current.add(feedPoint)
  }

  // Keep your existing antenna creation functions
  const createDipoleAntenna = (
    scene: THREE.Scene,
    antennaData: AntennaData,
    materialColor: number
  ) => {
    // Convert to physical length if we have antennaModel
    let physicalLength = antennaData.elementLength
    if (antennaModel) {
      physicalLength = antennaModel.length
    }
    
    const material = new THREE.MeshLambertMaterial({ color: materialColor }) // Use MeshLambertMaterial like LearnTenna
    
    // Create the dipole wire
    const wireRadius = antennaData.wireDiameter / 2000 // Convert mm to meters and scale
    
    const geometry = new THREE.CylinderGeometry(0.05, 0.05, physicalLength, 16) // LearnTenna wire thickness
    const dipole = new THREE.Mesh(geometry, material)
    dipole.rotation.z = Math.PI / 2
    dipole.userData.isAntenna = true
    scene.add(dipole)
  }

  const createYagiAntenna = (
    scene: THREE.Scene,
    antennaData: AntennaData,
    materialColor: number
  ) => {
    const material = new THREE.MeshStandardMaterial({ color: materialColor })
    const wireRadius = antennaData.wireDiameter / 2000
    const boomRadius = wireRadius * 2
    
    // Create boom
    const boomLength = (antennaData.elements - 1) * antennaData.elementSpacing + 0.5
    const boomGeometry = new THREE.CylinderGeometry(boomRadius, boomRadius, boomLength, 16)
    const boom = new THREE.Mesh(boomGeometry, material)
    boom.rotation.z = Math.PI / 2
    boom.userData.isAntenna = true
    scene.add(boom)
    
    // Create elements
    for (let i = 0; i < antennaData.elements; i++) {
      let elementLength
      if (i === 0) {
        elementLength = antennaData.elementLength * 1.05 // Reflector
      } else if (i === 1) {
        elementLength = antennaData.elementLength // Driven element
      } else {
        elementLength = antennaData.elementLength * (0.95 - (i - 2) * 0.02) // Directors
      }
      
      const elementGeometry = new THREE.CylinderGeometry(wireRadius, wireRadius, elementLength, 16)
      const element = new THREE.Mesh(elementGeometry, material)
      
      const xPos = -boomLength / 2 + i * antennaData.elementSpacing
      element.position.set(xPos, 0, 0)
      element.rotation.x = Math.PI / 2
      element.userData.isAntenna = true
      
      scene.add(element)
    }
  }

  const createPatchAntenna = (
    scene: THREE.Scene,
    antennaData: AntennaData,
    materialColor: number
  ) => {
    // Create ground plane
    const groundSize = antennaData.elementLength * 2
    const groundGeometry = new THREE.BoxGeometry(groundSize, groundSize, 0.05)
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 })
    const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial)
    groundPlane.position.set(0, 0, -0.1)
    groundPlane.userData.isAntenna = true
    scene.add(groundPlane)
    
    // Create patch
    const patchSize = antennaData.elementLength
    const patchGeometry = new THREE.BoxGeometry(patchSize, patchSize, 0.02)
    const patchMaterial = new THREE.MeshStandardMaterial({ color: materialColor })
    const patch = new THREE.Mesh(patchGeometry, patchMaterial)
    patch.position.set(0, 0, 0)
    patch.userData.isAntenna = true
    scene.add(patch)
  }

  const createLogPeriodicAntenna = (
    scene: THREE.Scene,
    antennaData: AntennaData,
    materialColor: number
  ) => {
    const material = new THREE.MeshStandardMaterial({ color: materialColor })
    const wireRadius = antennaData.wireDiameter / 2000
    const boomRadius = wireRadius * 2
    
    // Create booms
    const boomLength = antennaData.elements * antennaData.elementSpacing
    const boomGeometry = new THREE.CylinderGeometry(boomRadius, boomRadius, boomLength, 16)
    
    const boom1 = new THREE.Mesh(boomGeometry, material)
    boom1.rotation.z = Math.PI / 2
    boom1.position.set(0, 0.2, 0)
    boom1.userData.isAntenna = true
    scene.add(boom1)
    
    const boom2 = new THREE.Mesh(boomGeometry, material)
    boom2.rotation.z = Math.PI / 2
    boom2.position.set(0, -0.2, 0)
    boom2.userData.isAntenna = true
    scene.add(boom2)
    
    // Create elements with decreasing length
    const tau = 0.8
    let currentLength = antennaData.elementLength
    
    for (let i = 0; i < antennaData.elements; i++) {
      const elementGeometry = new THREE.CylinderGeometry(wireRadius, wireRadius, currentLength, 16)
      const element = new THREE.Mesh(elementGeometry, material)
      
      const xPos = -boomLength / 2 + i * antennaData.elementSpacing * Math.pow(tau, i)
      element.position.set(xPos, 0, 0)
      element.rotation.x = Math.PI / 2
      element.userData.isAntenna = true
      
      scene.add(element)
      currentLength *= tau
    }
  }

  const createHelicalAntenna = (
    scene: THREE.Scene,
    antennaData: AntennaData,
    materialColor: number
  ) => {
    const material = new THREE.MeshStandardMaterial({ color: materialColor })
    
    // Create ground plane
    const groundSize = antennaData.elementLength * 1.5
    const groundGeometry = new THREE.CylinderGeometry(groundSize / 2, groundSize / 2, 0.05, 32)
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 })
    const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial)
    groundPlane.position.set(0, -0.5, 0)
    groundPlane.rotation.x = Math.PI / 2
    groundPlane.userData.isAntenna = true
    scene.add(groundPlane)
    
    // Create helical coil
    const coilRadius = antennaData.elementLength / 4
    const coilTurns = antennaData.elements
    const coilHeight = coilTurns * antennaData.elementSpacing
    const coilSegments = coilTurns * 16
    
    const curve = new THREE.CatmullRomCurve3(
      Array(coilSegments + 1)
        .fill(0)
        .map((_, i) => {
          const t = i / coilSegments
          const angle = t * Math.PI * 2 * coilTurns
          const x = coilRadius * Math.cos(angle)
          const z = coilRadius * Math.sin(angle)
          const y = -0.5 + t * coilHeight
          return new THREE.Vector3(x, y, z)
        })
    )
    
    const tubeGeometry = new THREE.TubeGeometry(curve, coilSegments, antennaData.wireDiameter / 2000, 8, false)
    const coil = new THREE.Mesh(tubeGeometry, material)
    coil.userData.isAntenna = true
    scene.add(coil)
  }

  function toggleAnimation() {
    setIsAnimating(!isAnimating)
  }

  function resetAnimation() {
    setIsAnimating(false)
    setAnimationTime(0)
  }

  // Calculate real phase information
  const impedance = antennaModel ? antennaModel.calculateImpedance() : { resistance: 73, reactance: 0 }
  const phaseAngle = Math.atan2(impedance.reactance, impedance.resistance) * 180 / Math.PI

  return (
    <div className="relative w-full h-full rounded-md overflow-hidden bg-gray-900">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Legend overlay in top left - Updated with LearnTenna colors */}
      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-xs text-white">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span><span className="text-red-500">●</span> I=0</span>
          <span><span className="text-orange-500">●</span> I=max</span>
          <span><span className="text-blue-500">●</span> V=0</span>
          <span><span className="text-cyan-500">●</span> V=max</span>
        </div>
      </div>

      {/* Visibility Controls Dropdown in top right */}
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <EyeIcon className="h-4 w-4" />
              <span className="sr-only">Toggle visibility</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Toggle Visibility</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(visibility).map(([key, value]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={value}
                onCheckedChange={(checked) => 
                  setVisibility(prev => ({ ...prev, [key]: checked }))
                }
              >
                {key === 'eField' ? 'E-Field' : 
                 key === 'hField' ? 'H-Field' : 
                 key === 'debugInfo' ? 'Debug Info' :
                 key.replace(/([A-Z])/g, ' $1').trim()}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Animation Controls Overlay in bottom center - Updated with real phase info */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-3 text-white">
        <Button 
          size="sm" 
          variant="ghost"
          onClick={toggleAnimation}
          className="h-8 w-8 p-0 text-white hover:bg-white/20"
        >
          {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="sr-only">{isAnimating ? "Pause" : "Play"} Animation</span>
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={resetAnimation}
          className="h-8 w-8 p-0 text-white hover:bg-white/20"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="sr-only">Reset Animation</span>
        </Button>
        <div className="text-xs text-white/80">
          Time: {Math.round(animationTime)}° | RF Phase: {phaseAngle.toFixed(1)}°
        </div>
      </div>
    </div>
  )
}