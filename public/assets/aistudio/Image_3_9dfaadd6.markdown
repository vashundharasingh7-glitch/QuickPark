---
name: Obsidian Telemetry
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#353944'
  surface-container-lowest: '#0a0e18'
  surface-container-low: '#171b26'
  surface-container: '#1c1f2a'
  surface-container-high: '#262a35'
  surface-container-highest: '#313540'
  on-surface: '#dfe2f1'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#dfe2f1'
  inverse-on-surface: '#2c303b'
  outline: '#849495'
  outline-variant: '#3b494b'
  surface-tint: '#00dbe9'
  primary: '#dbfcff'
  on-primary: '#00363a'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#006970'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#d8ffe7'
  on-tertiary: '#003824'
  tertiary-container: '#65f2b5'
  on-tertiary-container: '#006d4a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0f131d'
  on-background: '#dfe2f1'
  surface-variant: '#313540'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  mono-metric:
    fontFamily: JetBrains Mono
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.02em
  mono-badge:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style
The brand personality embodies precision engineering, intelligent spatial awareness, and real-time operational authority. Tailored for infrastructure operators, mobility fleet managers, and enterprise drivers, the interface commands trust through hyper-responsive data visualization and architectural clarity.

The visual direction fuses **Dark Precision Minimalist SaaS** with **Tactile IoT Glassmorphism**:
- Deep, absorbing dark canvas layers eliminate visual clutter and reduce visual fatigue during 24/7 monitoring.
- High-clarity micro-borders frame interactive modules with millimeter-precision aesthetics.
- Controlled luminous accents and stateful glows elevate physical hardware telemetry (microcontrollers, ultrasonic/IR arrays, RFID gates, barrier actuators) into intuitive digital representations.
- Interactive components convey physical feedback through low-latency surface shifts and restrained ambient lighting.

## Colors
The palette is calibrated strictly for high-density dark displays, anchoring structural stability while delivering rapid status recognition across large parking bays:

- **Canvas & Structural Surfaces:**
  - Base Background: `#0B0F19` (Obsidian Charcoal) provides zero-glare spatial depth.
  - Surface Card / Raised Container: `#111827` (Deep Navy Slab).
  - Surface Overlay / Modals: `#1E293B` with high-frequency opacity blending.
  - Structural Borders: `#1F293D` (Subtle boundary line) and `#334155` (Active focus line).

- **Core Brand Accents:**
  - Primary Electric Cyan: `#00F0FF` for key indicators, active telemetric states, high-priority interactive switches, and micro-glow highlights.
  - Secondary Mobility Cobalt: `#3B82F6` and `#2563EB` for standard buttons, primary interactions, link affordances, and selected zone frames.

- **Status & Bay Telemetry:**
  - **Available:** `#10B981` (Emerald Green) with faint radial emission for vacant bays and online sensors.
  - **Occupied:** `#EF4444` (Vivid Crimson) for real-time detected vehicles and blocked zones.
  - **Reserved / In-Transit:** `#F59E0B` (Amber Orange) for pending QR/RFID clearances and temporary holds.
  - **Hardware Diagnostic Neutral:** `#64748B` (Muted Slate) for offline sensors or standby servo barriers.

## Typography
The typographical hierarchy balances consumer-grade scanning speed with engineering-grade data telemetry:

- **Headlines (Plus Jakarta Sans):** Geometric curves and clear apertures provide a modern mobility posture, delivering high contrast against dark foundations without visual clutter.
- **Body & Controls (Inter):** Clean, utilitarian, and optimized for dense UI layouts. Form labels, modal texts, and spatial analytics maintain supreme clarity across standard and OLED displays.
- **Hardware Telemetry & Metrics (JetBrains Mono):** Dedicated to technical data strings, MAC/IP hardware bindings, ESP32 packet logs, RFID UID reads, duration timers, and bay capacity counters. Ensures horizontal tabular alignment across dynamic numeric shifts.

## Layout & Spacing
The layout employs a high-density, desktop-first 12-column responsive fluid grid system designed for complex operational cockpits, telemetry sidebars, and interactive slot grids:

- **Desktop Form Factor (1280px+):** Max layout bounds are clamped at 1680px for expansive mission-control layouts. Standard desktop gutters are fixed at `1.5rem` (`24px`) with `2.5rem` (`40px`) outer safety bounds. The parking bay floorplan utilizes dynamic CSS subgrids aligned to module cards.
- **Tablet Form Factor (768px - 1024px):** Reflows 12 columns into an 8-column layout. Telemetry monitoring collapses into sliding drawers or secondary tabs, maintaining focus on active slot grids. Gutters compress to `1.25rem` (`20px`).
- **Mobile Handheld (320px - 640px):** Single-column stacked stream with fixed bottom control dock. Margins tighten to `1rem` (`16px`). Parking spots translate from a 2D floor visualizer into a sequential interactive swipe card deck or compacted slot list.
- **Rhythm Model:** Built on a rigorous 4px baseline. Interior component padding scales symmetrically using `space-xs` (4px), `space-sm` (8px), `space-md` (16px), and `space-lg` (24px) to preserve mechanical alignment.

## Elevation & Depth
Depth is constructed through optical transparency, dark tonal stacking, and edge illumination rather than heavy drop shadows:

- **Surface Levels:**
  - **Level 0 (Canvas):** Pure `#0B0F19` background.
  - **Level 1 (Card/Container):** Translucent Navy `#111827` at 85% opacity with an active `backdrop-filter: blur(12px)`. Enclosed by a 1px border of `#1F293D`.
  - **Level 2 (Popovers/Drawers/Overlays):** `#1E293B` at 92% opacity, `backdrop-filter: blur(16px)`, enclosed by `#334155`.
- **Micro-Glows & Optical Edges:**
  - **Idle State:** Surface elements carry a 1px inner highlight via `box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.05)`.
  - **Active / Primary Glow:** Focused interactive items or selected parking nodes project an electric glow: `box-shadow: 0 0 16px -2px rgba(0, 240, 255, 0.25), 0 0 0 1px #00F0FF`.
  - **Sensor Status Glows:** Available parking bays project an ultra-subtle green wash (`0 0 20px -4px rgba(16, 185, 129, 0.15)`), while occupied nodes render a crisp inner red edge (`inset 0 0 12px -2px rgba(239, 68, 68, 0.2)`).

## Shapes
The shape language uses tight, machined corner profiles (`roundedness: 1`) to reinforce precision engineering and technical rigor:

- **Base Components (Inputs, Buttons, Micro-Badges):** `4px` (`0.25rem`) radius. Yields crisp, structural silhouettes reminiscent of rugged industrial displays.
- **Containers & Glass Cards:** `8px` (`0.5rem`, `rounded-lg`) radius. Softens content modules without compromising the high-density grid.
- **Modal Panels & Large Bay Canvas Frames:** `12px` (`0.75rem`, `rounded-xl`) radius.
- **Sensor Status Indicators & Circular Metrics:** Absolute `9999px` (Pill/Circle) reserved exclusively for live pulse dots, switch toggles, and radial occupancy gauges.

## Components

### Buttons & Trigger Elements
- **Primary Action (Reserve, Clear Barrier):** Solid gradient fill (`linear-gradient(135deg, #00F0FF 0%, #2563EB 100%)`), dark slate text `#0B0F19` with font-weight `600`, 4px radius, 1px border in `rgba(255, 255, 255, 0.2)`. On hover: `box-shadow: 0 0 14px rgba(0, 240, 255, 0.4)`.
- **Secondary / Ghost (Filter, Diagnostic):** Transparent navy fill `#111827`, text `#F8FAFC`, border 1px solid `#1F293D`. On hover: border transitions to `#38BDF8`, subtle background tint `#1E293B`.
- **Destructive (Emergency Halt / Gate Lock):** Deep crimson tint `#EF4444` background at 15% opacity, text `#EF4444`, border 1px solid `#EF4444`.

### Parking Bay Grid Slots
- High-fidelity interactive cards displaying: Bay Code (`JetBrains Mono`, bold), state icon (car, clock, checkmark), reservation countdown, and live IR sensor status.
- **Available Bay:** Border `#10B981` (40% opacity), background `rgba(16, 185, 129, 0.05)`. Hover: 100% border, ambient green aura.
- **Occupied Bay:** Border `#EF4444` (30% opacity), background `rgba(239, 68, 68, 0.04)`.
- **Reserved Bay:** Border `#F59E0B` (50% opacity), background `rgba(245, 158, 11, 0.06)`, pulsing reservation ticker.

### IoT Hardware Telemetry Badges
- Compact rectangular chips with a 4px corner radius, `#0B0F19` core fill, 1px border `#1F293D`.
- Left-aligned 6px pulsating status LED dot:
  - **ESP32 Core:** Displays Wi-Fi RSSI (e.g., `-54 dBm`) and packet frequency.
  - **IR Sensor Array:** Digital state read (`HIGH`/`LOW`) with active signal timing.
  - **RC522 RFID Module:** Scanned UID tag capture preview with instant auth state.
  - **SG90 / MG996R Servo Barrier:** Real-time angular position indicator (`0° CLOSED` / `90° OPEN`).

### Form Controls & Input Fields
- Inputs feature a dark navy slate base (`#0D1322`), 1px structural border (`#1F293D`), and crisp white text.
- Focus state activates a sharp 1px `#00F0FF` outline and micro-glow ring (`rgba(0, 240, 255, 0.15)`).
- Search fields for vehicle license plate recognition (ALPR) feature built-in monospaced formatting with uppercase auto-casing.

### Data Tables & Event Logs
- Alternating dark transparent row stripes with borderless row divisions relying on 1px `#1F293D` horizontal separators.
- Timestamp fields render in `JetBrains Mono` at `12px` with `#94A3B8` muted color.
- Event badges categorize physical access events: `RFID_TAP`, `IR_BREAK_BEAM`, `SERVO_TIMEOUT`, and `GATE_OVERRIDE`.