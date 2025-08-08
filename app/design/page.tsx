"use client"

import { useState } from "react"
import Link from "next/link"
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
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Download, Radio, Save, Share2 } from 'lucide-react'
import { useForm } from "react-hook-form"
import * as z from "zod"
import AntennaVisualization from "@/components/antenna-visualization"
import AntennaPerformance from "@/components/antenna-performance"
import { toast } from "sonner"

const formSchema = z.object({
  antennaType: z.string(),
  frequency: z.number().min(1).max(10000),
  elements: z.number().int().min(1).max(20),
  elementLength: z.number().min(0.1).max(10),
  elementSpacing: z.number().min(0.1).max(5),
  feedPoint: z.string(),
  material: z.string(),
})

export default function DesignPage() {
  // No need to destructure toast, it's directly imported
  const [activeTab, setActiveTab] = useState("design")
  const [antennaData, setAntennaData] = useState({
    type: "dipole",
    frequency: 300,
    elements: 1,
    elementLength: 0.5,
    elementSpacing: 0.25,
    feedPoint: "center",
    material: "copper",
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      antennaType: "dipole",
      frequency: 300,
      elements: 1,
      elementLength: 0.5,
      elementSpacing: 0.25,
      feedPoint: "center",
      material: "copper",
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
    })

    toast("Antenna design updated", { description: "Your antenna design has been updated and simulation results recalculated." })
  }

  function saveDesign() {
    toast("Design saved", { description: "Your antenna design has been saved to your account." })
  }

  function exportDesign() {
    toast("Design exported", { description: "Your antenna design has been exported as a JSON file." })
  }

  function shareDesign() {
    toast("Design shared", { description: "A shareable link has been copied to your clipboard." })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Radio className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">AntennaLab</span>
            </Link>
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
      <div className="container py-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Antenna Design Studio</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          <TabsContent value="design" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Antenna Parameters</CardTitle>
                <CardDescription>Configure your antenna design parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="antennaType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Antenna Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select antenna type" />
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
                            <FormDescription>Select the type of antenna to design</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="frequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequency (MHz)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>Operating frequency in MHz</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="elements"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Elements</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>Number of elements in the antenna</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="elementLength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Element Length (λ)</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Slider
                                  min={0.1}
                                  max={10}
                                  step={0.1}
                                  defaultValue={[field.value]}
                                  onValueChange={(vals) => field.onChange(vals[0])}
                                />
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted-foreground">0.1λ</span>
                                  <span className="text-xs">{field.value}λ</span>
                                  <span className="text-xs text-muted-foreground">10λ</span>
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription>Length of elements in wavelengths</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="elementSpacing"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Element Spacing (λ)</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Slider
                                  min={0.1}
                                  max={5}
                                  step={0.05}
                                  defaultValue={[field.value]}
                                  onValueChange={(vals) => field.onChange(vals[0])}
                                />
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted-foreground">0.1λ</span>
                                  <span className="text-xs">{field.value}λ</span>
                                  <span className="text-xs text-muted-foreground">5λ</span>
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription>Spacing between elements in wavelengths</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="feedPoint"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Feed Point</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="center" />
                                  </FormControl>
                                  <FormLabel className="font-normal">Center</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="offset" />
                                  </FormControl>
                                  <FormLabel className="font-normal">Offset</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="end" />
                                  </FormControl>
                                  <FormLabel className="font-normal">End</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormDescription>Location of the feed point</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="material"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Material</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select material" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="copper">Copper</SelectItem>
                                <SelectItem value="aluminum">Aluminum</SelectItem>
                                <SelectItem value="steel">Steel</SelectItem>
                                <SelectItem value="gold">Gold</SelectItem>
                                <SelectItem value="silver">Silver</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>Material of the antenna elements</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit">Update Design</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="visualization">
            <Card>
              <CardHeader>
                <CardTitle>3D Visualization</CardTitle>
                <CardDescription>Interactive 3D model of your antenna design</CardDescription>
              </CardHeader>
              <CardContent className="h-[500px] flex items-center justify-center">
                <AntennaVisualization antennaData={antennaData} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analysis</CardTitle>
                <CardDescription>Simulated performance metrics for your antenna design</CardDescription>
              </CardHeader>
              <CardContent>
                <AntennaPerformance antennaData={antennaData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
