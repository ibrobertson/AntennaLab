"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight } from 'lucide-react'

interface ExampleAntenna {
  title: string
  description: string
  type: string
  frequency: number
  elements: number
  elementLength: number
  elementSpacing: number
  feedPoint: number
  material: string
  wireDiameter: number
  balunRatio: string
  category: string
}

export default function AntennaExamples({ 
  onSelectExample 
}: { 
  onSelectExample: (example: Omit<ExampleAntenna, "title" | "description" | "category">) => void 
}) {
  const [activeCategory, setActiveCategory] = useState("hf")

  const examples: ExampleAntenna[] = [
    // HF Amateur Radio
    {
      title: "20m Center-Fed Dipole",
      description: "Classic half-wave dipole for 20 meter band",
      type: "dipole",
      frequency: 14.2,
      elements: 1,
      elementLength: 0.5,
      elementSpacing: 0.25,
      feedPoint: 50,
      material: "copper",
      wireDiameter: 2.0,
      balunRatio: "1:1",
      category: "hf",
    },
    {
      title: "40m Off-Center Fed",
      description: "Off-center fed dipole for multi-band operation",
      type: "dipole",
      frequency: 7.1,
      elements: 1,
      elementLength: 0.5,
      elementSpacing: 0.25,
      feedPoint: 33,
      material: "copper",
      wireDiameter: 2.5,
      balunRatio: "4:1",
      category: "hf",
    },
    {
      title: "10m 3-Element Yagi",
      description: "Compact beam antenna for 10 meter DX",
      type: "yagi",
      frequency: 28.4,
      elements: 3,
      elementLength: 0.5,
      elementSpacing: 0.2,
      feedPoint: 50,
      material: "aluminum",
      wireDiameter: 6.0,
      balunRatio: "1:1",
      category: "hf",
    },
    {
      title: "80m End-Fed Halfwave",
      description: "End-fed antenna for 80 meter band",
      type: "dipole",
      frequency: 3.75,
      elements: 1,
      elementLength: 0.5,
      elementSpacing: 0.25,
      feedPoint: 100,
      material: "copper",
      wireDiameter: 2.0,
      balunRatio: "49:1",
      category: "hf",
    },
    
    // VHF/UHF Amateur Radio
    {
      title: "2m Quarter-Wave Vertical",
      description: "Simple vertical for 2 meter repeater work",
      type: "dipole",
      frequency: 146,
      elements: 1,
      elementLength: 0.25,
      elementSpacing: 0.25,
      feedPoint: 100,
      material: "copper",
      wireDiameter: 3.0,
      balunRatio: "1:1",
      category: "vhf",
    },
    {
      title: "2m 5-Element Yagi",
      description: "High-gain beam for weak signal work",
      type: "yagi",
      frequency: 144.1,
      elements: 5,
      elementLength: 0.5,
      elementSpacing: 0.25,
      feedPoint: 50,
      material: "aluminum",
      wireDiameter: 4.0,
      balunRatio: "1:1",
      category: "vhf",
    },
    {
      title: "70cm J-Pole",
      description: "J-pole antenna for 70cm amateur band",
      type: "dipole",
      frequency: 435,
      elements: 1,
      elementLength: 0.75,
      elementSpacing: 0.25,
      feedPoint: 25,
      material: "copper",
      wireDiameter: 2.0,
      balunRatio: "1:1",
      category: "vhf",
    },
    {
      title: "1.25m Patch",
      description: "Patch antenna for 1.25 meter band",
      type: "patch",
      frequency: 223.5,
      elements: 1,
      elementLength: 0.49,
      elementSpacing: 0.25,
      feedPoint: 25,
      material: "copper",
      wireDiameter: 1.0,
      balunRatio: "1:1",
      category: "vhf",
    },
    
    // Digital/Data Modes
    {
      title: "Meshtastic 915 MHz",
      description: "Optimized for Meshtastic mesh networking",
      type: "dipole",
      frequency: 915,
      elements: 1,
      elementLength: 0.5,
      elementSpacing: 0.25,
      feedPoint: 50,
      material: "copper",
      wireDiameter: 1.5,
      balunRatio: "1:1",
      category: "digital",
    },
    {
      title: "LoRa 433 MHz",
      description: "Quarter-wave monopole for LoRa applications",
      type: "dipole",
      frequency: 433,
      elements: 1,
      elementLength: 0.25,
      elementSpacing: 0.25,
      feedPoint: 100,
      material: "copper",
      wireDiameter: 1.0,
      balunRatio: "1:1",
      category: "digital",
    },
    {
      title: "APRS 144.39 MHz",
      description: "Tuned specifically for APRS frequency",
      type: "dipole",
      frequency: 144.39,
      elements: 1,
      elementLength: 0.5,
      elementSpacing: 0.25,
      feedPoint: 50,
      material: "copper",
      wireDiameter: 2.0,
      balunRatio: "1:1",
      category: "digital",
    },
    {
      title: "FT8 Multi-band",
      description: "Log-periodic for FT8 digital modes",
      type: "logperiodic",
      frequency: 14.074,
      elements: 6,
      elementLength: 0.45,
      elementSpacing: 0.3,
      feedPoint: 100,
      material: "aluminum",
      wireDiameter: 4.0,
      balunRatio: "4:1",
      category: "digital",
    },
    
    // Microwave Amateur Radio
    {
      title: "10 GHz Horn Feed",
      description: "Horn antenna for 10 GHz microwave band",
      type: "patch",
      frequency: 10368,
      elements: 1,
      elementLength: 0.6,
      elementSpacing: 0.25,
      feedPoint: 50,
      material: "copper",
      wireDiameter: 0.5,
      balunRatio: "1:1",
      category: "microwave",
    },
    {
      title: "3.4 GHz Patch Array",
      description: "High-gain patch array for 3.4 GHz",
      type: "patch",
      frequency: 3400,
      elements: 4,
      elementLength: 0.49,
      elementSpacing: 0.5,
      feedPoint: 50,
      material: "copper",
      wireDiameter: 0.8,
      balunRatio: "1:1",
      category: "microwave",
    },
    {
      title: "5.7 GHz Helical",
      description: "Circular polarized helical for 5.7 GHz",
      type: "helical",
      frequency: 5760,
      elements: 8,
      elementLength: 0.25,
      elementSpacing: 0.25,
      feedPoint: 50,
      material: "copper",
      wireDiameter: 1.0,
      balunRatio: "1:1",
      category: "microwave",
    },
    {
      title: "24 GHz Dish Feed",
      description: "Precision feed for 24 GHz parabolic dish",
      type: "patch",
      frequency: 24048,
      elements: 1,
      elementLength: 0.5,
      elementSpacing: 0.25,
      feedPoint: 50,
      material: "gold",
      wireDiameter: 0.3,
      balunRatio: "1:1",
      category: "microwave",
    },
  ]

  return (
    <div className="space-y-4">
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hf">HF Bands</TabsTrigger>
          <TabsTrigger value="vhf">VHF/UHF</TabsTrigger>
          <TabsTrigger value="digital">Digital/Data</TabsTrigger>
          <TabsTrigger value="microwave">Microwave</TabsTrigger>
        </TabsList>
        
        {["hf", "vhf", "digital", "microwave"].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examples
                .filter((example) => example.category === category)
                .map((example, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border">
                    <div className="mb-2">
                      <h3 className="text-lg font-medium">{example.title}</h3>
                      <p className="text-sm text-muted-foreground">{example.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>
                        <span className="font-medium">Freq:</span> {example.frequency} MHz
                      </div>
                      <div>
                        <span className="font-medium">Feed:</span> {example.feedPoint}%
                      </div>
                      <div>
                        <span className="font-medium">Wire:</span> {example.wireDiameter}mm
                      </div>
                      <div>
                        <span className="font-medium">Balun:</span> {example.balunRatio}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => onSelectExample({
                        type: example.type,
                        frequency: example.frequency,
                        elements: example.elements,
                        elementLength: example.elementLength,
                        elementSpacing: example.elementSpacing,
                        feedPoint: example.feedPoint,
                        material: example.material,
                        wireDiameter: example.wireDiameter,
                        balunRatio: example.balunRatio,
                      })}
                    >
                      Load Design
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
