# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
AntennaLab is a Next.js TypeScript application for interactive antenna design and RF analysis. It provides real-time 3D visualization of antennas with physics-based calculations for impedance, SWR, and current/voltage distributions.

## Development Commands

### Build and Development
- `npm run dev` - Start development server
- `npm run build` - Production build 
- `npm run start` - Start production server
- `npm run lint` - Run ESLint (configured to ignore build errors)

## Architecture

### Core Structure
- **Next.js 15** with App Router pattern (`app/` directory)
- **TypeScript** with strict mode enabled
- **Tailwind CSS** with shadcn/ui component system
- **Three.js** for 3D antenna visualization
- **React Hook Form** with Zod validation for form handling

### Key Directories
- `app/` - Next.js app router pages and layouts
- `components/` - React components including comprehensive UI library
- `lib/` - Core business logic and utilities
  - `lib/models/` - Antenna physics models
  - `lib/physics/` - RF calculation engines
- `hooks/` - Custom React hooks
- `public/` - Static assets

### Physics Engine Architecture
The application features a sophisticated RF physics simulation:

**AntennaModel** (`lib/models/antennamodel.ts`):
- Main antenna modeling class with real physics calculations
- Integrates impedance calculation, matching networks, and field distributions
- Supports various antenna types (dipole, monopole, OCF, etc.)

**Physics Modules**:
- `physicsutils.ts` - Utility functions for RF calculations (SWR, impedance formatting)
- `impedancecalculator.ts` - Complex impedance calculations
- `matchingnetworks.ts` - Balun/UnUn transformations (1:1, 4:1, 9:1, 49:1)
- `constants.ts` - Physical constants for RF calculations
- `nodescalculator.ts` - Standing wave node/antinode analysis

### Component Architecture
- **AntennaVisualization** - Three.js 3D rendering with real-time animation
- **AntennaPerformance** - Performance metrics and analysis displays
- **Form Components** - Zod-validated parameter inputs with real-time updates
- **UI Components** - Complete shadcn/ui implementation

### State Management
- Form state managed by React Hook Form with Zod schemas
- Antenna physics state managed through custom hooks and effects
- Real-time synchronization between form inputs and physics calculations

## Development Notes

### Physics Integration
The application uses real RF physics calculations, not approximations. When modifying antenna parameters:
- Length is converted from wavelengths to physical meters
- Frequency directly affects impedance and resonance calculations  
- Feed position affects impedance and antenna classification
- Wire diameter impacts characteristic impedance

### 3D Visualization
Three.js integration includes:
- Real-time current/voltage distribution visualization
- Standing wave animation capabilities
- Node/antinode highlighting
- Interactive camera controls

### Build Configuration
- ESLint and TypeScript errors ignored during builds (see `next.config.mjs`)
- Images configured as unoptimized for static export compatibility
- Tailwind configured with custom design system tokens

### Testing
No test framework is currently configured. When adding tests, determine appropriate framework based on component vs. physics testing needs.