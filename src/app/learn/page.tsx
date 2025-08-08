import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Compass, FileText, GraduationCap, Radio, Video } from 'lucide-react'

export default function LearnPage() {
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
            <Link href="/learn" className="text-sm font-medium text-primary">
              Learn
            </Link>
            <Link href="/examples" className="text-sm font-medium">
              Examples
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Antenna Theory & Design</h1>
            <p className="text-muted-foreground">
              Comprehensive educational resources to help you understand antenna fundamentals and RF engineering
              principles.
            </p>
          </div>

          <Tabs defaultValue="fundamentals" className="space-y-4">
            <TabsList className="grid grid-cols-1 md:grid-cols-4 h-auto">
              <TabsTrigger value="fundamentals" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Fundamentals
              </TabsTrigger>
              <TabsTrigger value="types" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Antenna Types
              </TabsTrigger>
              <TabsTrigger value="parameters" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Parameters
              </TabsTrigger>
              <TabsTrigger value="applications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Applications
              </TabsTrigger>
            </TabsList>
            <TabsContent value="fundamentals" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: "Introduction to Antennas",
                    description: "Learn the basic principles of antennas and electromagnetic radiation.",
                    icon: <BookOpen className="h-5 w-5" />,
                    level: "Beginner",
                  },
                  {
                    title: "Electromagnetic Waves",
                    description: "Understanding the physics of electromagnetic wave propagation.",
                    icon: <Compass className="h-5 w-5" />,
                    level: "Beginner",
                  },
                  {
                    title: "Radiation Patterns",
                    description: "How antennas radiate energy in different directions.",
                    icon: <Compass className="h-5 w-5" />,
                    level: "Intermediate",
                  },
                  {
                    title: "Impedance Matching",
                    description: "Techniques for matching antenna impedance to transmission lines.",
                    icon: <FileText className="h-5 w-5" />,
                    level: "Advanced",
                  },
                  {
                    title: "Antenna Polarization",
                    description: "Understanding linear, circular, and elliptical polarization.",
                    icon: <GraduationCap className="h-5 w-5" />,
                    level: "Intermediate",
                  },
                  {
                    title: "Antenna Arrays",
                    description: "How multiple antennas work together to improve performance.",
                    icon: <GraduationCap className="h-5 w-5" />,
                    level: "Advanced",
                  },
                ].map((topic, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{topic.title}</CardTitle>
                        {topic.icon}
                      </div>
                      <CardDescription>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                          {topic.level}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{topic.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/learn/fundamentals/${topic.title.toLowerCase().replace(/\s+/g, "-")}`}>
                        <Button size="sm">Start Learning</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="types" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: "Dipole Antennas",
                    description: "The most basic and widely used antenna design.",
                    image: "dipole-antenna-diagram",
                  },
                  {
                    title: "Yagi-Uda Antennas",
                    description: "Directional antennas with multiple elements for increased gain.",
                    image: "yagi-antenna-diagram",
                  },
                  {
                    title: "Patch Antennas",
                    description: "Low-profile antennas used in modern wireless devices.",
                    image: "patch-antenna-diagram",
                  },
                  {
                    title: "Log-Periodic Antennas",
                    description: "Wideband antennas with consistent performance across frequencies.",
                    image: "log-periodic-antenna-diagram",
                  },
                  {
                    title: "Helical Antennas",
                    description: "Antennas that provide circular polarization for satellite communications.",
                    image: "helical-antenna-diagram",
                  },
                  {
                    title: "Parabolic Antennas",
                    description: "High-gain antennas used for long-distance communications.",
                    image: "parabolic-antenna-diagram",
                  },
                ].map((type, index) => (
                  <Card key={index} className="overflow-hidden">
                    <img
                      src={`/abstract-geometric-shapes.png?height=160&width=320&query=${type.image}`}
                      alt={type.title}
                      className="w-full h-40 object-cover"
                      width={320}
                      height={160}
                    />
                    <CardHeader>
                      <CardTitle>{type.title}</CardTitle>
                      <CardDescription>{type.description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Link href={`/learn/types/${type.title.toLowerCase().replace(/\s+/g, "-")}`}>
                        <Button size="sm">Learn More</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="parameters" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Gain",
                    description:
                      "Understand antenna gain, how it's measured, and its importance in antenna performance.",
                    formula: "G = 4πA/λ²",
                  },
                  {
                    title: "Directivity",
                    description:
                      "Learn about how antennas focus energy in specific directions and the measurement of directivity.",
                    formula: "D = Umax/U0",
                  },
                  {
                    title: "Radiation Efficiency",
                    description:
                      "Explore how efficiently antennas convert input power to radiated electromagnetic waves.",
                    formula: "e = Prad/Pin",
                  },
                  {
                    title: "Bandwidth",
                    description:
                      "Understand the frequency range over which an antenna operates effectively.",
                    formula: "BW = (fh - fl)/fc",
                  },
                  {
                    title: "Standing Wave Ratio (SWR)",
                    description:
                      "Learn about impedance matching and how SWR affects antenna performance.",
                    formula: "SWR = (1 + |Γ|)/(1 - |Γ|)",
                  },
                  {
                    title: "Beamwidth",
                    description:
                      "Explore the angular width of the main lobe in an antenna's radiation pattern.",
                    formula: "θ-3dB",
                  },
                ].map((param, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{param.title}</CardTitle>
                      <CardDescription>{param.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-md">
                        <p className="font-mono text-center">$${ param.formula }$$</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/learn/parameters/${param.title.toLowerCase().replace(/\s+/g, "-")}`}>
                        <Button size="sm">Detailed Explanation</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="applications" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: "Wireless Communications",
                    description: "How antennas are used in cellular networks, Wi-Fi, and Bluetooth systems.",
                    icon: <Radio className="h-5 w-5" />,
                  },
                  {
                    title: "Satellite Communications",
                    description: "Antenna designs for ground stations and satellite systems.",
                    icon: <Compass className="h-5 w-5" />,
                  },
                  {
                    title: "Broadcasting",
                    description: "Antennas used in radio and television broadcasting.",
                    icon: <Video className="h-5 w-5" />,
                  },
                  {
                    title: "Radar Systems",
                    description: "Specialized antennas for detection and ranging applications.",
                    icon: <Compass className="h-5 w-5" />,
                  },
                  {
                    title: "IoT Devices",
                    description: "Compact antenna designs for Internet of Things applications.",
                    icon: <Radio className="h-5 w-5" />,
                  },
                  {
                    title: "Medical Applications",
                    description: "Antennas used in medical imaging and treatment systems.",
                    icon: <FileText className="h-5 w-5" />,
                  },
                ].map((app, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{app.title}</CardTitle>
                        {app.icon}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{app.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/learn/applications/${app.title.toLowerCase().replace(/\s+/g, "-")}`}>
                        <Button size="sm">Explore</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 bg-muted/40 p-6 rounded-lg">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Interactive Learning Resources</h2>
                <p className="text-muted-foreground mb-4">
                  Enhance your understanding with our interactive tutorials and simulations.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link href="/learn/interactive/wave-propagation">
                    <Button variant="outline" size="sm">
                      Wave Propagation
                    </Button>
                  </Link>
                  <Link href="/learn/interactive/radiation-patterns">
                    <Button variant="outline" size="sm">
                      Radiation Patterns
                    </Button>
                  </Link>
                  <Link href="/learn/interactive/impedance-matching">
                    <Button variant="outline" size="sm">
                      Impedance Matching
                    </Button>
                  </Link>
                  <Link href="/learn/interactive/polarization">
                    <Button variant="outline" size="sm">
                      Polarization
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="w-full md:w-1/3">
                <img
                  src="/placeholder-asdur.png"
                  alt="Interactive antenna simulation"
                  className="rounded-lg w-full"
                  width={300}
                  height={200}
                />
              </div>
            </div>
          </div>
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
