import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Download, Radio } from 'lucide-react'

export default function ExamplesPage() {
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
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium">
              Home
            </Link>
            <Link href="/design" className="text-sm font-medium">
              Design
            </Link>
            <Link href="/learn" className="text-sm font-medium">
              Learn
            </Link>
            <Link href="/examples" className="text-sm font-medium text-primary">
              Examples
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Example Antenna Designs</h1>
            <p className="text-muted-foreground">
              Browse through pre-configured antenna designs for various applications and frequencies
            </p>
          </div>

          <Tabs defaultValue="communications" className="space-y-4">
            <TabsList className="grid grid-cols-1 md:grid-cols-4 h-auto">
              <TabsTrigger value="communications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Communications
              </TabsTrigger>
              <TabsTrigger value="broadcasting" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Broadcasting
              </TabsTrigger>
              <TabsTrigger value="satellite" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Satellite
              </TabsTrigger>
              <TabsTrigger value="educational" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Educational
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="communications" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: "2m Band Yagi",
                    description: "3-element Yagi antenna for 144-148 MHz amateur radio band",
                    type: "Yagi-Uda",
                    frequency: "146 MHz",
                    gain: "7.1 dBi",
                    image: "2m-yagi-antenna",
                  },
                  {
                    title: "70cm Dipole",
                    description: "Simple dipole antenna for 430-450 MHz UHF amateur radio band",
                    type: "Dipole",
                    frequency: "435 MHz",
                    gain: "2.15 dBi",
                    image: "70cm-dipole-antenna",
                  },
                  {
                    title: "WiFi Patch Antenna",
                    description: "Compact patch antenna for 2.4 GHz WiFi applications",
                    type: "Patch",
                    frequency: "2.45 GHz",
                    gain: "6.0 dBi",
                    image: "wifi-patch-antenna",
                  },
                  {
                    title: "4G/LTE Log-Periodic",
                    description: "Wideband log-periodic antenna for cellular communications",
                    type: "Log-Periodic",
                    frequency: "700-2600 MHz",
                    gain: "8.5 dBi",
                    image: "lte-log-periodic-antenna",
                  },
                  {
                    title: "RFID Reader Antenna",
                    description: "Circular polarized antenna for UHF RFID applications",
                    type: "Patch",
                    frequency: "915 MHz",
                    gain: "5.8 dBi",
                    image: "rfid-antenna",
                  },
                  {
                    title: "ISM Band Helical",
                    description: "Helical antenna for 915 MHz ISM band applications",
                    type: "Helical",
                    frequency: "915 MHz",
                    gain: "10.2 dBi",
                    image: "ism-helical-antenna",
                  },
                ].map((example, index) => (
                  <Card key={index} className="overflow-hidden">
                    <img
                      src={`/abstract-geometric-shapes.png?height=160&width=320&query=${example.image}`}
                      alt={example.title}
                      className="w-full h-40 object-cover"
                      width={320}
                      height={160}
                    />
                    <CardHeader>
                      <CardTitle>{example.title}</CardTitle>
                      <CardDescription>{example.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Type:</span> {example.type}
                        </div>
                        <div>
                          <span className="font-medium">Frequency:</span> {example.frequency}
                        </div>
                        <div>
                          <span className="font-medium">Gain:</span> {example.gain}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Link href={`/design?example=${index}`}>
                        <Button size="sm">
                          Open in Designer
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="broadcasting" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: "FM Broadcast Dipole",
                    description: "Half-wave dipole for FM radio broadcasting",
                    type: "Dipole",
                    frequency: "98 MHz",
                    gain: "2.15 dBi",
                    image: "fm-broadcast-dipole",
                  },
                  {
                    title: "AM Broadcast Tower",
                    description: "Vertical monopole antenna for AM broadcasting",
                    type: "Monopole",
                    frequency: "1 MHz",
                    gain: "1.8 dBi",
                    image: "am-broadcast-tower",
                  },
                  {
                    title: "TV Broadcast Panel",
                    description: "Panel antenna for UHF television broadcasting",
                    type: "Panel Array",
                    frequency: "600 MHz",
                    gain: "12.0 dBi",
                    image: "tv-broadcast-panel",
                  },
                  {
                    title: "DAB Radio Antenna",
                    description: "Antenna for Digital Audio Broadcasting",
                    type: "Dipole Array",
                    frequency: "220 MHz",
                    gain: "6.5 dBi",
                    image: "dab-radio-antenna",
                  },
                ].map((example, index) => (
                  <Card key={index} className="overflow-hidden">
                    <img
                      src={`/abstract-geometric-shapes.png?height=160&width=320&query=${example.image}`}
                      alt={example.title}
                      className="w-full h-40 object-cover"
                      width={320}
                      height={160}
                    />
                    <CardHeader>
                      <CardTitle>{example.title}</CardTitle>
                      <CardDescription>{example.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Type:</span> {example.type}
                        </div>
                        <div>
                          <span className="font-medium">Frequency:</span> {example.frequency}
                        </div>
                        <div>
                          <span className="font-medium">Gain:</span> {example.gain}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Link href={`/design?example=${index + 100}`}>
                        <Button size="sm">
                          Open in Designer
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="satellite" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: "GPS Patch Antenna",
                    description: "Ceramic patch antenna for GPS reception (L1 band)",
                    type: "Patch",
                    frequency: "1575.42 MHz",
                    gain: "4.5 dBi",
                    image: "gps-patch-antenna",
                  },
                  {
                    title: "Ku-Band Dish",
                    description: "Parabolic dish antenna for satellite TV reception",
                    type: "Parabolic",
                    frequency: "12 GHz",
                    gain: "35.0 dBi",
                    image: "ku-band-dish-antenna",
                  },
                  {
                    title: "Helical Feed",
                    description: "Helical feed antenna for satellite ground stations",
                    type: "Helical",
                    frequency: "2.2 GHz",
                    gain: "15.0 dBi",
                    image: "helical-feed-antenna",
                  },
                  {
                    title: "Iridium Patch Array",
                    description: "Patch array for Iridium satellite communications",
                    type: "Patch Array",
                    frequency: "1621 MHz",
                    gain: "8.0 dBi",
                    image: "iridium-patch-array",
                  },
                  {
                    title: "S-Band Ground Station",
                    description: "Yagi antenna for CubeSat communications",
                    type: "Yagi-Uda",
                    frequency: "2.4 GHz",
                    gain: "16.0 dBi",
                    image: "s-band-ground-station",
                  },
                ].map((example, index) => (
                  <Card key={index} className="overflow-hidden">
                    <img
                      src={`/abstract-geometric-shapes.png?height=160&width=320&query=${example.image}`}
                      alt={example.title}
                      className="w-full h-40 object-cover"
                      width={320}
                      height={160}
                    />
                    <CardHeader>
                      <CardTitle>{example.title}</CardTitle>
                      <CardDescription>{example.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Type:</span> {example.type}
                        </div>
                        <div>
                          <span className="font-medium">Frequency:</span> {example.frequency}
                        </div>
                        <div>
                          <span className="font-medium">Gain:</span> {example.gain}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Link href={`/design?example=${index + 200}`}>
                        <Button size="sm">
                          Open in Designer
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="educational" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: "Basic Half-Wave Dipole",
                    description: "Simple half-wave dipole for educational demonstrations",
                    type: "Dipole",
                    frequency: "100 MHz",
                    gain: "2.15 dBi",
                    image: "basic-dipole-educational",
                  },
                  {
                    title: "3-Element Yagi Demo",
                    description: "Demonstration Yagi antenna with adjustable elements",
                    type: "Yagi-Uda",
                    frequency: "144 MHz",
                    gain: "7.1 dBi",
                    image: "yagi-demo-educational",
                  },
                  {
                    title: "Patch Antenna Kit",
                    description: "Educational kit for building and testing patch antennas",
                    type: "Patch",
                    frequency: "2.4 GHz",
                    gain: "6.0 dBi",
                    image: "patch-kit-educational",
                  },
                  {
                    title: "Polarization Demonstrator",
                    description: "Antenna set for demonstrating polarization effects",
                    type: "Dipole Array",
                    frequency: "900 MHz",
                    gain: "3.0 dBi",
                    image: "polarization-demo-educational",
                  },
                  {
                    title: "Antenna Matching Kit",
                    description: "Educational kit for learning impedance matching techniques",
                    type: "Various",
                    frequency: "50-500 MHz",
                    gain: "Varies",
                    image: "matching-kit-educational",
                  },
                  {
                    title: "Radiation Pattern Visualizer",
                    description: "Interactive setup to visualize antenna radiation patterns",
                    type: "Various",
                    frequency: "100-1000 MHz",
                    gain: "Varies",
                    image: "pattern-visualizer-educational",
                  },
                ].map((example, index) => (
                  <Card key={index} className="overflow-hidden">
                    <img
                      src={`/abstract-geometric-shapes.png?height=160&width=320&query=${example.image}`}
                      alt={example.title}
                      className="w-full h-40 object-cover"
                      width={320}
                      height={160}
                    />
                    <CardHeader>
                      <CardTitle>{example.title}</CardTitle>
                      <CardDescription>{example.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Type:</span> {example.type}
                        </div>
                        <div>
                          <span className="font-medium">Frequency:</span> {example.frequency}
                        </div>
                        <div>
                          <span className="font-medium">Gain:</span> {example.gain}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Link href={`/design?example=${index + 300}`}>
                        <Button size="sm">
                          Open in Designer
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">AntennaLab</span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © 2025 AntennaLab. Educational tool for antenna design and simulation.
          </p>
        </div>
      </footer>
    </div>
  )
}
