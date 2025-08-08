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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { Download, RadioIcon, Save, Share2, Play, Pause, RotateCcw } from 'lucide-react'
import { useForm } from "react-hook-form"
import * as z from "zod"
import AntennaVisualization from "@/components/antenna-visualization"
import AntennaPerformance from "@/components/antenna-performance"
import AntennaExamples from "@/components/antenna-examples"

const formSchema = z.object({
  antennaType: z.string(),
  frequency: z.number().min(1).max(10000),
  elements: z.number().int().min(1).max(20),
  elementLength: z.number().min(0.1).max(10),
  elementSpacing: z.number().min(0.1).max(5),
  feedPoint: z.number().min(0).max(100),
  material: z.string(),
  wireDiameter: z.number().min(0.1).max(10),
  balunRatio: z.string(),
})

export default function Home() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("performance")
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
  
  const [antennaData, setAntennaData] = useState({
    type: "dipole",
    frequency: 14.2,
    elements: 1,
    elementLength: 0.5,
    elementSpacing: 0.25,
    feedPoint: 50,
    material: "copper",
    wireDiameter: 2.0,
    balunRatio: "1:1",
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      antennaType: "dipole",
      frequency: 14.2,
      elements: 1,
      elementLength: 0.5,
      elementSpacing: 0.25,
      feedPoint: 50,
      material: "copper",
      wireDiameter: 2.0,
      balunRatio: "1:1",
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

    toast({
      title: "Antenna design updated",
      description: "Your antenna design has been updated and simulation results recalculated.",
    })
  }

  function saveDesign() {
    toast({
      title: "Design saved",
      description: "Your antenna design has been saved locally.",
    })
  }

  function exportDesign() {
    toast({
      title: "Design exported",
      description: "Your antenna design has been exported as a JSON file.",
    })
  }

  function shareDesign() {
    toast({
      title: "Design shared",
      description: "A shareable link has been copied to your clipboard.",
    })
  }

  // Animation loop
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAnimating) {
      interval = setInterval(() => {
        setAnimationTime(prev => (prev + 1) % 360)
      }, 50)
    }
    return () => clearInterval(interval)
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

  // Calculate derived values
  const wavelength = 299.792458 / antennaData.frequency // meters
  const physicalLength = antennaData.elementLength * wavelength // meters
  const feedImpedance = calculateFeedImpedance(antennaData)
  const resonantFrequency = calculateResonantFrequency(antennaData)

  function calculateFeedImpedance(data: typeof antennaData) {
    // Simplified impedance calculation based on antenna type and feed position
    let baseZ = 73 // Dipole center impedance
    
    if (data.type === "dipole") {
      // Impedance varies with feed position for dipole
      const feedRatio = data.feedPoint / 100
      if (feedRatio === 0.5) {
        baseZ = 73 // Center feed
      } else {
        // Off-center feed - impedance increases towards ends
        const offset = Math.abs(feedRatio - 0.5) * 2
        baseZ = 73 + offset * 2000 // Simplified model
      }
    } else if (data.type === "yagi") {
      baseZ = 50 + 10 * Math.log10(data.elements)
    } else if (data.type === "patch") {
      baseZ = 50 + 20 * data.elementLength
    }
    
    return Math.round(baseZ)
  }

  function calculateResonantFrequency(data: typeof antennaData) {
    // Simplified resonance calculation
    const velocityFactor = 0.95 // Typical for wire antennas
    const resonantLength = data.type === "dipole" ? 0.5 : data.elementLength
    return (299.792458 * velocityFactor) / (resonantLength * wavelength)
  }

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
            <Button variant="outline" size="sm" onClick={exportDesign}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={shareDesign}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left column - Visualization */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Antenna Visualization</CardTitle>
                <CardDescription>Interactive 3D model with current/voltage distribution</CardDescription>
              </CardHeader>
              <CardContent className="h-[420px]"> {/* Reduced height here */}
                <AntennaVisualization 
                  antennaData={antennaData} 
                  animationTime={animationTime}
                  visibility={visibility}
                  setVisibility={setVisibility}
                  isAnimating={isAnimating}
                  setIsAnimating={setIsAnimating}
                  setAnimationTime={setAnimationTime}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right column - Controls */}
          <div className="space-y-4">
            {/* Antenna Parameters */}
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
                              <SelectItem value="yagi">Yagi-Uda</SelectItem>
                              <SelectItem value="patch">Patch</SelectItem>
                              <SelectItem value="logperiodic">Log-Periodic</SelectItem>
                              <SelectItem value="helical">Helical</SelectItem>
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
                          <FormLabel className="text-sm">Length (λ): {field.value.toFixed(2)}</FormLabel>
                          <FormControl>
                            <Slider
                              min={0.1}
                              max={2.0}
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
                                onCheckedChange={() => field.onChange("1:1")}
                              />
                              <label htmlFor="balun-1-1" className="text-sm">1:1 Balun</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="balun-4-1" 
                                checked={field.value === "4:1"}
                                onCheckedChange={() => field.onChange("4:1")}
                              />
                              <label htmlFor="balun-4-1" className="text-sm">4:1 Balun</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="unun-9-1" 
                                checked={field.value === "9:1"}
                                onCheckedChange={() => field.onChange("9:1")}
                              />
                              <label htmlFor="unun-9-1" className="text-sm">9:1 UnUn</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="unun-49-1" 
                                checked={field.value === "49:1"}
                                onCheckedChange={() => field.onChange("49:1")}
                              />
                              <label htmlFor="unun-49-1" className="text-sm">49:1 UnUn</label>
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" size="sm" className="w-full">Update Design</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabbed content */}
        <div className="mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2"> {/* Changed to grid-cols-2 */}
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="examples">Save/Load</TabsTrigger> {/* Renamed tab */}
            </TabsList>
            
            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analysis</CardTitle>
                  <CardDescription>Detailed antenna performance metrics and radiation patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <AntennaPerformance 
                    antennaData={antennaData} 
                    resonantFrequency={resonantFrequency}
                    wavelength={wavelength}
                    feedImpedance={feedImpedance}
                    physicalLength={physicalLength}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="examples" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Amateur Radio Examples</CardTitle>
                  <CardDescription>Pre-configured antenna designs for ham radio applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <AntennaExamples onSelectExample={(example) => {
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
                  }} />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Removed "About" TabsContent */}
          </Tabs>
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
}
