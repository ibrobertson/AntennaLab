"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function AntennaEducation() {
  const [activeTab, setActiveTab] = useState("fundamentals")

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
          <TabsTrigger value="types">Antenna Types</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fundamentals" className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="intro">
              <AccordionTrigger>Introduction to Antennas</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    An antenna is a device that converts electrical energy into electromagnetic waves and vice versa. 
                    It serves as the transitional structure between free-space and a guiding device (such as a transmission line).
                  </p>
                  <p>
                    Antennas operate based on the principle that an accelerating electric charge produces electromagnetic radiation. 
                    When alternating current flows through a conductor, it creates a time-varying electromagnetic field that radiates away from the antenna.
                  </p>
                  <p>
                    The size and shape of an antenna are typically related to the wavelength of the signal it's designed to transmit or receive. 
                    Most antennas are resonant devices, which operate efficiently over a relatively narrow frequency band.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="waves">
              <AccordionTrigger>Electromagnetic Waves</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    Electromagnetic waves consist of oscillating electric and magnetic fields that propagate through space at the speed of light.
                    These waves are characterized by their frequency (f) and wavelength (λ), which are related by the equation:
                  </p>
                  <div className="bg-muted p-2 rounded-md my-2">
                    <p className="font-mono text-center">$$\lambda = \frac{c}{f}$$</p>
                  </div>
                  <p>
                    Where c is the speed of light (approximately 3×10⁸ m/s). For antennas, the wavelength determines many physical characteristics
                    of the design. For example, a half-wave dipole antenna has a length of approximately λ/2.
                  </p>
                  <p>
                    Electromagnetic waves carry energy and momentum and can propagate through vacuum, unlike mechanical waves which require a medium.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="radiation">
              <AccordionTrigger>Radiation Patterns</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    A radiation pattern is a graphical representation of the radiation properties of an antenna as a function of space coordinates.
                    It describes how an antenna radiates energy in different directions.
                  </p>
                  <p>
                    Radiation patterns typically have a main lobe (or main beam) where most of the energy is concentrated, and several minor lobes.
                    The direction of maximum radiation determines the antenna's directivity.
                  </p>
                  <p>
                    Antennas can be broadly classified based on their radiation patterns:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Omnidirectional:</strong> Radiates equally in all directions in one plane</li>
                    <li><strong>Directional:</strong> Radiates more effectively in some directions than in others</li>
                    <li><strong>Isotropic:</strong> Theoretical antenna that radiates equally in all directions (not physically realizable)</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
        
        <TabsContent value="types" className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="dipole">
              <AccordionTrigger>Dipole Antennas</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    A dipole antenna consists of two conductive elements such as metal wires or rods. The driving signal from the transmitter
                    is applied, or for receiving antennas the output signal to the receiver is taken, between the two halves of the antenna.
                  </p>
                  <p>
                    The most common form is the half-wave dipole, which is approximately a half-wavelength long. The radiation pattern of a
                    half-wave dipole is omnidirectional in the plane perpendicular to the antenna, with nulls along the axis of the antenna.
                  </p>
                  <p>
                    Key characteristics of dipole antennas:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Impedance: Approximately 73 ohms for a half-wave dipole in free space</li>
                    <li>Gain: 2.15 dBi (compared to an isotropic radiator)</li>
                    <li>Bandwidth: Typically 10-20% of the center frequency</li>
                    <li>Polarization: Determined by the orientation of the elements</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="yagi">
              <AccordionTrigger>Yagi-Uda Antennas</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    The Yagi-Uda antenna, commonly known as a Yagi antenna, consists of multiple parallel elements:
                    a driven element (typically a half-wave dipole), a reflector, and one or more directors.
                  </p>
                  <p>
                    The reflector is slightly longer than the driven element and is placed behind it. The directors are
                    progressively shorter and are placed in front of the driven element. This arrangement creates a
                    highly directional radiation pattern.
                  </p>
                  <p>
                    Key characteristics of Yagi-Uda antennas:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>High gain (increases with the number of elements)</li>
                    <li>Narrow beamwidth</li>
                    <li>Unidirectional radiation pattern</li>
                    <li>Relatively narrow bandwidth</li>
                    <li>Commonly used for television reception, point-to-point communications, and amateur radio</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="patch">
              <AccordionTrigger>Patch Antennas</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    A patch antenna (also known as a microstrip antenna) consists of a flat rectangular sheet or "patch"
                    of metal, mounted over a larger sheet of metal called a ground plane. The patch is usually made from
                    copper or another conductive material.
                  </p>
                  <p>
                    Patch antennas are low-profile, conformable to planar and non-planar surfaces, simple and inexpensive
                    to manufacture using modern printed-circuit technology. They are widely used in portable wireless devices.
                  </p>
                  <p>
                    Key characteristics of patch antennas:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Low profile and lightweight</li>
                    <li>Hemispherical radiation pattern (radiates forward from the patch)</li>
                    <li>Narrow bandwidth (typically 1-5%)</li>
                    <li>Moderate gain (5-8 dBi)</li>
                    <li>Can be designed for various polarizations</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
        
        <TabsContent value="parameters" className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="gain">
              <AccordionTrigger>Gain</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    Antenna gain is a measure of how well an antenna converts input power into radio waves in a specified direction,
                    compared to a reference antenna (usually an isotropic radiator or a dipole).
                  </p>
                  <p>
                    Gain is expressed in decibels (dB) and is typically specified as dBi (gain relative to an isotropic radiator)
                    or dBd (gain relative to a dipole antenna). The relationship between these units is: dBi = dBd + 2.15.
                  </p>
                  <p>
                    Gain is related to directivity and efficiency by the equation:
                  </p>
                  <div className="bg-muted p-2 rounded-md my-2">
                    <p className="font-mono text-center">$$G = \eta D$$</p>
                  </div>
                  <p>
                    Where G is the gain, η is the efficiency (a value between 0 and 1), and D is the directivity.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="swr">
              <AccordionTrigger>Standing Wave Ratio (SWR)</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    Standing Wave Ratio (SWR) is a measure of how efficiently radio-frequency power is transmitted from a power
                    source, through a transmission line, into a load (such as an antenna).
                  </p>
                  <p>
                    It is defined as the ratio of the maximum to minimum amplitude of a standing wave pattern along a transmission line.
                    SWR is related to the reflection coefficient (Γ) by:
                  </p>
                  <div className="bg-muted p-2 rounded-md my-2">
                    <p className="font-mono text-center">{'$$SWR = \\frac{1 + |\\Gamma|}{1 - |\\Gamma|}$$'}</p>
                  </div>
                  <p>
                    An SWR of 1:1 indicates perfect impedance matching and maximum power transfer. Higher SWR values indicate
                    impedance mismatch, which leads to power reflection and reduced efficiency.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="bandwidth">
              <AccordionTrigger>Bandwidth</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    Antenna bandwidth is the range of frequencies over which the antenna can properly radiate or receive energy.
                    It is typically defined as the frequency range where the antenna maintains specified performance characteristics,
                    such as VSWR ≤ 2:1 or gain within 3 dB of the maximum.
                  </p>
                  <p>
                    Bandwidth can be expressed in two ways:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Absolute bandwidth:</strong> The difference between the upper and lower frequencies (in Hz)</li>
                    <li><strong>Fractional bandwidth:</strong> The bandwidth divided by the center frequency (expressed as a percentage)</li>
                  </ul>
                  <p>
                    Different antenna types have different bandwidth characteristics. For example, dipoles typically have moderate
                    bandwidth (10-20%), while log-periodic antennas can have very wide bandwidths ({'>'}100%).
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
        
        <TabsContent value="applications" className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="wireless">
              <AccordionTrigger>Wireless Communications</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    Antennas are essential components in all wireless communication systems, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Cellular networks:</strong> Base station antennas and mobile device antennas</li>
                    <li><strong>Wi-Fi:</strong> Access point antennas and client device antennas</li>
                    <li><strong>Bluetooth:</strong> Small embedded antennas in portable devices</li>
                    <li><strong>Two-way radio:</strong> Handheld and vehicle-mounted antennas</li>
                  </ul>
                  <p>
                    Each application has specific requirements for gain, radiation pattern, size, and cost. For example,
                    cellular base stations often use sector antennas with high gain and specific coverage patterns, while
                    mobile devices use compact antennas optimized for omnidirectional coverage.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="satellite">
              <AccordionTrigger>Satellite Communications</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    Satellite communication systems use specialized antennas for both ground stations and the satellites themselves:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Parabolic dish antennas:</strong> Used for high-gain, directional communication with satellites</li>
                    <li><strong>Helical antennas:</strong> Provide circular polarization for satellite links</li>
                    <li><strong>Phased arrays:</strong> Used in modern satellite systems for electronic beam steering</li>
                    <li><strong>GPS patch antennas:</strong> Small, low-profile antennas for satellite navigation receivers</li>
                  </ul>
                  <p>
                    Satellite communication antennas must deal with challenges such as long distances (requiring high gain),
                    atmospheric effects, and in some cases, tracking moving satellites.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="radar">
              <AccordionTrigger>Radar Systems</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    Radar (Radio Detection and Ranging) systems use antennas to transmit radio waves and receive reflections
                    from objects. Radar antennas are designed for specific applications:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Weather radar:</strong> Often uses parabolic dishes or phased arrays</li>
                    <li><strong>Air traffic control:</strong> Typically uses rotating antennas with narrow azimuth beamwidth</li>
                    <li><strong>Automotive radar:</strong> Uses compact patch arrays or other planar antennas</li>
                    <li><strong>Military radar:</strong> May use sophisticated phased arrays for electronic scanning</li>
                  </ul>
                  <p>
                    Radar antennas are characterized by high gain, narrow beamwidth, and low sidelobes to maximize
                    detection capability and minimize interference.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  )
}
