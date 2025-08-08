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

export default function AntennaVisualization({ 
  antennaData, 
  animationTime = 0,
  visibility,
  setVisibility,
  isAnimating,
  setIsAnimating,
  setAnimationTime
}: { 
  antennaData: AntennaData
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

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize scene with dark background like LearnTenna
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a1a)
    sceneRef.current = scene

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(3, 2, 5)
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

    // Add subtle lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    // Add grid helper (darker)
    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222)
    scene.add(gridHelper)

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

    // Material color based on selected material
    const materialColors = {
      copper: 0xb87333,
      aluminum: 0xd3d3d3,
      steel: 0x71797e,
      gold: 0xffd700,
      silver: 0xc0c0c0,
    }
    
    const materialColor = materialColors[antennaData.material as keyof typeof materialColors] || 0xb87333

    // Create antenna based on type
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

    // Add current/voltage visualization
    if (visibility.current || visibility.voltage || visibility.nodes) {
      addCurrentVoltageVisualization(antennaData, animationTime)
    }
  }, [antennaData, visibility])

  // Update animation
  useEffect(() => {
    if (visibility.current || visibility.voltage || visibility.nodes) {
      addCurrentVoltageVisualization(antennaData, animationTime)
    }
  }, [animationTime])

  const addCurrentVoltageVisualization = (data: AntennaData, time: number) => {
    if (!sceneRef.current) return

    // Clear existing nodes
    currentNodesRef.current.clear()
    voltageNodesRef.current.clear()

    const elementLength = data.elementLength
    const numPoints = Math.max(10, Math.floor(elementLength * 20))
    
    for (let i = 0; i <= numPoints; i++) {
      const position = (i / numPoints - 0.5) * elementLength
      const phase = (time * Math.PI / 180) + (position * 2 * Math.PI / elementLength)
      
      // Current distribution (sinusoidal along wire)
      const currentAmplitude = Math.abs(Math.cos(position * Math.PI / elementLength))
      const currentPhase = Math.sin(phase) * currentAmplitude
      
      // Voltage distribution (90 degrees out of phase with current)
      const voltageAmplitude = Math.abs(Math.sin(position * Math.PI / elementLength))
      const voltagePhase = Math.cos(phase) * voltageAmplitude
      
      if (visibility.current && currentAmplitude > 0.1) {
        const currentGeometry = new THREE.SphereGeometry(0.02 + currentAmplitude * 0.03, 8, 8)
        const currentMaterial = new THREE.MeshBasicMaterial({ 
          color: currentPhase > 0 ? 0xff0000 : 0xff8800 // Red for max current, orange for antinodes
        })
        const currentNode = new THREE.Mesh(currentGeometry, currentMaterial)
        currentNode.position.set(position, 0, 0)
        currentNodesRef.current.add(currentNode)
      }
      
      if (visibility.voltage && voltageAmplitude > 0.1) {
        const voltageGeometry = new THREE.SphereGeometry(0.02 + voltageAmplitude * 0.03, 8, 8)
        const voltageMaterial = new THREE.MeshBasicMaterial({ 
          color: voltagePhase > 0 ? 0x0000ff : 0x00ffff // Blue for max voltage, cyan for antinodes
        })
        const voltageNode = new THREE.Mesh(voltageGeometry, voltageMaterial)
        voltageNode.position.set(position, 0.1, 0)
        voltageNodesRef.current.add(voltageNode)
      }
    }

    // Add feed point indicator
    const feedPosition = (data.feedPoint / 100 - 0.5) * elementLength
    const feedGeometry = new THREE.SphereGeometry(0.05, 16, 16)
    const feedMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const feedPoint = new THREE.Mesh(feedGeometry, feedMaterial)
    feedPoint.position.set(feedPosition, 0, 0)
    feedPoint.userData.isAntenna = true
    sceneRef.current.add(feedPoint)
  }

  const createDipoleAntenna = (
    scene: THREE.Scene,
    antennaData: AntennaData,
    materialColor: number
  ) => {
    const material = new THREE.MeshStandardMaterial({ color: materialColor })
    
    // Create the dipole wire
    const elementLength = antennaData.elementLength
    const wireRadius = antennaData.wireDiameter / 2000 // Convert mm to meters and scale
    
    const geometry = new THREE.CylinderGeometry(wireRadius, wireRadius, elementLength, 16)
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

  return (
    <div className="relative w-full h-full rounded-md overflow-hidden bg-gray-900">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Legend overlay in top left */}
      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-xs text-white">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span><span className="text-red-500">●</span> I=max</span>
          <span><span className="text-orange-500">●</span> I=min</span>
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

      {/* Animation Controls Overlay in bottom center */}
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
          Time: {animationTime}° | RF Phase: {(animationTime / 360).toFixed(2)}λ
        </div>
      </div>
    </div>
  )
}
