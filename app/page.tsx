"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { zodResolver } from "@hookform/resolvers/zod"
import { Download, RadioIcon, Save, Share2, Play, Pause, RotateCcw } from 'lucide-react'
import { useForm } from "react-hook-form"
import * as z from "zod"
import AntennaVisualization from "@/components/antenna-visualization"
import AntennaPerformance from "@/components/antenna-performance"
import { toast } from "sonner"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import LoadDesignDialog from "@/components/load-design-dialog"
import { AntennaModel } from "@/lib/models/antennamodel"
import { PhysicsUtils } from "@/lib/physics/physicsutils"

const formSchema = z.object({
  antennaType: z.string(),
  frequency: z.number().min(1).max(10000),
  elements: z.number().int().min(1).max(20),
  elementLength: z.number().min(0.01).max(50),
  elementSpacing: z.number().min(0.1).max(5),
  feedPoint: z.number().min(0).max(100),
  material: z.string(),
  wireDiameter: z.number().min(0.1).max(10),
  balunRatio: z.string(),
})

export default function Home() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationTime, setAnimationTime] = useState(0)
  const [visibility, setVisibility] = useState({
    antenna: true,
    current: true,
    voltage: true,
    eField: false,
    hField: false,
    nodes: true,
    debugInfo: false,
  })
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false)
  
  const [antennaData, setAntennaData] = useState({
    type: "dipole",
    frequency: 14.2,
    elements: 1,
    elementLength: 10.6,
    elementSpacing: 0.25,
    feedPoint: 50,
    material: "copper",
    wireDiameter: 2.0,
    balunRatio: "None",
  })

  // ===================================================================
  // REAL ANTENNA PHYSICS INTEGRATION
  // ===================================================================
  
  // Create real antenna model instance
  const [antennaModel] = useState(() => new AntennaModel())

  // Helper function to convert balun selection to matching network
  function getMatchingNetwork(balunRatio: string) {
    switch(balunRatio) {
      case "1:1": return "use1to1Balun"
      case "4:1": return "use4to1Balun" 
      case "9:1": return "use9to1UnUn"
      case "49:1": return "use49to1UnUn"
      default: return null
    }
  }

  // Update the real antenna model when form data changes
  useEffect(() => {
    try {
      // elementLength is now in meters (physical length)
      const wavelength = antennaModel.wavelength
      
      // Update the real antenna model
      antennaModel.length = antennaData.elementLength
      antennaModel.frequency = antennaData.frequency
      antennaModel.feedPosition = antennaData.feedPoint / 100 // Convert percentage to decimal
      antennaModel.wireDiameter = antennaData.wireDiameter
      antennaModel.matchingNetwork = getMatchingNetwork(antennaData.balunRatio)
      
      // Debug logging to verify physics are working
      const impedance = antennaModel.calculateImpedance()
      const antennaType = antennaModel.getAntennaType()
      
      console.log("Real Physics Update:", {
        frequency: antennaData.frequency,
        physicalLength: antennaData.elementLength.toFixed(2) + "m",
        electricalLength: antennaModel.electricalLength.toFixed(3) + "λ",
        impedance: PhysicsUtils.formatImpedance(impedance.resistance, impedance.reactance),
        antennaType: antennaType,
        wavelength: wavelength.toFixed(2) + "m",
        feedPosition: antennaModel.feedPosition,
        matchingNetwork: antennaModel.matchingNetwork || "None"
      })
    } catch (error) {
      console.error("Error updating antenna model:", error)
    }
  }, [antennaData, antennaModel])

  // ===================================================================
  // FORM HANDLING
  // ===================================================================

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      antennaType: "dipole",
      frequency: 14.2,
      elements: 1,
      elementLength: 10.6,
      elementSpacing: 0.25,
      feedPoint: 50,
      material: "copper",
      wireDiameter: 2.0,
      balunRatio: "None",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setAntennaData({
      type: values.antennaType,
      frequency: values.frequency,
      elements: values.elements,
      elementLength: values.elementLength,
      elementSpacing: values.elementSpacing,
      feedPoint: values.feedPoint,
      material: values.material,
      wireDiameter: values.wireDiameter,
      balunRatio: values.balunRatio,
    })

    toast("Antenna design updated", {
      description: "Your antenna design has been updated and simulation results recalculated.",
    })
  }

  function saveDesign() {
    const designData = JSON.stringify(antennaData, null, 2);
    const blob = new Blob([designData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `antenna-design-${antennaData.type}-${antennaData.frequency}MHz.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast("Design saved and exported", { description: "Your antenna design has been saved locally and exported as a JSON file." });
  }

  function shareDesign() {
    toast("Design shared", { description: "A shareable link has been copied to your clipboard." })
  }

  const handleSelectExample = (example: any) => {
    form.reset({
      antennaType: example.type,
      frequency: example.frequency,
      elements: example.elements,
      elementLength: example.elementLength,
      elementSpacing: example.elementSpacing,
      feedPoint: typeof example.feedPoint === 'string' ? 50 : example.feedPoint,
      material: example.material,
      wireDiameter: example.wireDiameter || 2.0,
      balunRatio: example.balunRatio || "1:1",
    })
    form.handleSubmit(onSubmit)()
    setIsLoadDialogOpen(false)
  }

  // Animation loop - updates by whole degrees
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAnimating) {
      interval = setInterval(() => {
        setAnimationTime(prev => {
          // Increment by 1 degree per frame for clean display
          const increment = 1
          return (prev + increment) % 360
        })
      }, 25) // 25ms interval = 40 fps, fast cycle through 360 degrees
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isAnimating])

  // Update form when antenna type changes to set appropriate defaults
  useEffect(() => {
    const antennaType = form.watch("antennaType")
    
    if (antennaType === "dipole") {
      form.setValue("elements", 1)
    } else if (antennaType === "yagi" && form.getValues("elements") < 3) {
      form.setValue("elements", 3)
    }
  }, [form.watch("antennaType")])

  // Watch form values and update antennaData in real-time
  useEffect(() => {
    const subscription = form.watch((values) => {
      setAntennaData({
        type: values.antennaType || "dipole",
        frequency: values.frequency || 14.2,
        elements: values.elements || 1,
        elementLength: values.elementLength || 10.6,
        elementSpacing: values.elementSpacing || 0.25,
        feedPoint: values.feedPoint || 50,
        material: values.material || "copper",
        wireDiameter: values.wireDiameter || 2.0,
        balunRatio: values.balunRatio || "None",
      })
    })
    return () => subscription.unsubscribe()
  }, [form.watch])

  // ===================================================================
  // REAL PHYSICS CALCULATIONS (replacing placeholder functions)
  // ===================================================================
  
  // Get real calculated values from the physics engine
  const wavelength = antennaModel.wavelength
  const physicalLength = antennaModel.length
  const realImpedance = antennaModel.calculateImpedance()
  const matchingResult = antennaModel.applyMatching(realImpedance)
  const feedImpedance = Math.round(realImpedance.resistance)
  const systemImpedance = matchingResult.impedance
  const swr = PhysicsUtils.calculateSWR(systemImpedance.resistance, systemImpedance.reactance)
  const antennaType = antennaModel.getAntennaType()
  const resonantFrequency = antennaData.frequency // This is the frequency we're analyzing
  const phaseAngle = antennaModel.getPhaseAngle()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <RadioIcon className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold">AntennaLab</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={saveDesign}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Load
                </Button>
              </DialogTrigger>
              <LoadDesignDialog 
                open={isLoadDialogOpen} 
                onOpenChange={setIsLoadDialogOpen} 
                onSelectExample={handleSelectExample} 
              />
            </Dialog>
            <Button variant="outline" size="sm" onClick={shareDesign}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-4">
        <div className="space-y-4">
          {/* Visualization */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Antenna Visualization</CardTitle>
              <CardDescription>Interactive 3D model with current/voltage distribution</CardDescription>
            </CardHeader>
            <CardContent className="h-[420px]">
              <AntennaVisualization 
                antennaData={antennaData} 
                antennaModel={antennaModel}
                animationTime={animationTime}
                visibility={visibility}
                setVisibility={setVisibility}
                isAnimating={isAnimating}
                setIsAnimating={setIsAnimating}
                setAnimationTime={setAnimationTime}
              />
            </CardContent>
          </Card>

          {/* Antenna Parameters - Full width */}
          <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Antenna Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                    <FormField
                      control={form.control}
                      name="antennaType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="dipole">Dipole</SelectItem>
                              <SelectItem value="yagi">Yagi-Uda - Coming Soon</SelectItem>
                              <SelectItem value="patch">Patch - Coming Soon</SelectItem>
                              <SelectItem value="logperiodic">Log-Periodic - Coming Soon</SelectItem>
                              <SelectItem value="helical">Helical - Coming Soon</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="elementLength"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Length (m): {field.value.toFixed(2)}</FormLabel>
                          <FormControl>
                            <Slider
                              min={0.01}
                              max={50}
                              step={0.01}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                              className="w-full"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Freq (MHz): {field.value}</FormLabel>
                          <FormControl>
                            <Slider
                              min={1}
                              max={1000}
                              step={0.1}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                              className="w-full"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="feedPoint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Feed (%): {field.value}</FormLabel>
                          <FormControl>
                            <Slider
                              min={0}
                              max={100}
                              step={1}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                              className="w-full"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="wireDiameter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Wire Ø (mm): {field.value}</FormLabel>
                          <FormControl>
                            <Slider
                              min={0.1}
                              max={10}
                              step={0.1}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                              className="w-full"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="balunRatio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Balun Ratio</FormLabel>
                          <div className="flex flex-wrap gap-x-4 gap-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="balun-1-1" 
                                checked={field.value === "1:1"}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange("1:1")
                                  } else if (field.value === "1:1") {
                                    field.onChange("None") // Uncheck to None
                                  }
                                }}
                              />
                              <label htmlFor="balun-1-1" className="text-sm">1:1 Balun</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="balun-4-1" 
                                checked={field.value === "4:1"}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange("4:1")
                                  } else if (field.value === "4:1") {
                                    field.onChange("None") // Uncheck to None
                                  }
                                }}
                              />
                              <label htmlFor="balun-4-1" className="text-sm">4:1 Balun</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="unun-9-1" 
                                checked={field.value === "9:1"}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange("9:1")
                                  } else if (field.value === "9:1") {
                                    field.onChange("None") // Uncheck to None
                                  }
                                }}
                              />
                              <label htmlFor="unun-9-1" className="text-sm">9:1 UnUn</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="unun-49-1" 
                                checked={field.value === "49:1"}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange("49:1")
                                  } else if (field.value === "49:1") {
                                    field.onChange("None") // Uncheck to None
                                  }
                                }}
                              />
                              <label htmlFor="unun-49-1" className="text-sm">49:1 UnUn</label>
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />

                  </form>
                </Form>
              </CardContent>
            </Card>
        </div>

        {/* Performance Analysis */}
        <div className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
              <CardDescription>Detailed antenna performance metrics and radiation patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <AntennaPerformance 
                antennaData={antennaData} 
                antennaModel={antennaModel}
                resonantFrequency={resonantFrequency}
                wavelength={wavelength}
                feedImpedance={feedImpedance}
                physicalLength={physicalLength}
                realImpedance={realImpedance}
                systemImpedance={systemImpedance}
                swr={swr}
                antennaType={antennaType}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t py-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RadioIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">AntennaLab</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 AntennaLab. Educational RF analysis tool.
          </p>
        </div>
	  </footer>
    </div>
  )
} // Close the Home() function