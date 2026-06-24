<div align="center">
  <img src="src/app/icon-bg.png" alt="Project Zenith Logo" width="150" />
  <h1>Project Zenith : The Celestial Eye</h1>
  <p><strong>An advanced, browser-based 3D orbital mechanics engine, real-time satellite tracker, and deep-space simulator.</strong></p>
</div>

---

## 🌌 Overview

**Project Zenith** is a high-performance, web-based space tracking platform. Designed with an ultra-premium, dark-mode glassmorphic interface, it allows users to track real-time satellite trajectories, explore a mathematically accurate 3D Solar System, and interact with hidden celestial physics simulations.

Built on the cutting edge of Next.js 16, Three.js, and WebGL, Zenith processes complex SGP4 orbital propagation mathematics directly in the browser to deliver a seamless 60 FPS experience. 

---

## ✨ Comprehensive Feature List

### 📡 1. The Global Radar System (`/radar`)
The heart of Zenith is the real-time satellite tracking globe, built with dynamic Next.js routing and `@react-three/fiber`.
*   **Holographic 3D Earth:** Powered by `react-globe.gl`, featuring high-resolution satellite imagery, topographic bump-mapping, day/night atmospheric cycles, and a custom glowing cloud layer.
*   **Real-Time Orbital Math:** Uses `satellite.js` (SGP4 propagation) to instantly calculate the exact Latitude, Longitude, and Altitude of active satellites using live TLE (Two-Line Element) data.
*   **Web Worker Multithreading:** Trajectory processing runs entirely off the main thread inside `orbitalWorker.ts`, ensuring zero UI stuttering even when tracking hundreds of objects.
*   **Multi-Constellation Tracking:** Simultaneously renders orbits for the International Space Station (ISS), Starlink networks, the Hubble Space Telescope, and designated orbital debris. Users can filter views using an interactive glassmorphic sidebar.
*   **User Localization:** Requests browser GPS coordinates to plot your exact location on the 3D globe with a glowing neon beacon.
*   **Sky Visibility Engine:** Mathematically calculates the horizon angle between your house and a satellite to tell you if the object is currently visible in your night sky.
*   **Zenith Time Machine:** Advanced timeline slider utilizing `useRadarStore` (Zustand) allowing you to fast-forward or rewind time (minutes to hours) to predict where a satellite will be in the future.
*   **3D Model Preview:** Dynamically inspect detailed, fully-textured 3D models of active satellites directly within the radar interface.
*   **Live Camera Feed Simulation:** A high-tech UI panel that simulates a noisy, static-filled video feed from the target satellite.
*   **Sci-Fi Lore & Anomaly Logs:** Immersive UI panels displaying categorized space debris warnings and deep-space anomalies.

### 🪐 2. Deep Space Solar System Viewer (`/solar-system`)
A macroscopic view of our cosmic neighborhood rendered using pure Three.js.
*   **Accurate Planetary Scale & Orbits:** A massive WebGL scene containing Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Each planet rotates at accurate relative speeds, tilt angles, and features realistic PBR textures.
*   **Dynamic Asteroid Belt:** Procedurally generated thousands of asteroids orbiting between Mars and Jupiter with subtle rotational momentum.
*   **Deep Space Missions:** Track the real-time estimated positions of legendary missions including **JWST**, **SMAP**, the **ISS**, **Voyager**, and the Mars **Perseverance Rover**.
*   **Live NASA EPIC Imagery:** When the "Visible Earth" layer is activated, the application pings the `epic.gsfc.nasa.gov` API to fetch the absolute latest true-color photograph of Earth taken by the DSCOVR satellite, projecting it onto the globe.
*   **Cosmic Time Manipulation:** Accelerate the universe to watch planetary alignments happen in seconds via smooth linear interpolation (lerping) and requestAnimationFrame loops.
*   **Smart Target Focus:** Click on any celestial body or active space mission to smoothly transition the camera and lock orbit controls to the target.

### 🖥️ 3. The Zenith Command Center (Homepage)
A beautifully crafted command dashboard providing an immersive entry point.
*   **Meet Orion:** Our AI hero and guide, ready to assist you through the celestial UI.
*   **Intelligent Chatbot:** An integrated AI chatbot that answers your space-related queries and guides you through the Zenith platform.
*   **Updated Articles & News:** A live feed displaying the latest articles, astronomical updates, and scientific breakthroughs.
*   **Knowledge Base:** A comprehensive encyclopedia containing rich information about planets, satellites, and the physics powering the engine.

---

## 🛠️ Technical Stack & Architecture

*   **Core Framework:** Next.js 16.2.9 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4 + Vanilla CSS (Custom Glassmorphism, Neon Glow Tokens, Custom Scrollbars)
*   **3D Rendering Engine:** 
    *   `three.js` (Core WebGL)
    *   `@react-three/fiber` (React bindings for Three.js)
    *   `@react-three/drei` (Advanced 3D helpers, textures, and camera controls)
    *   `react-globe.gl` (Geospatial data visualization)
*   **Orbital Mathematics:** `satellite.js` (SGP4 propagation)
*   **State Management:** `Zustand` (Global radar state, time-offsets, target selection, and user location syncing)
*   **Animations:** `framer-motion` (Micro-interactions, spring animations, and panel sliding)
*   **Icons:** `lucide-react`
*   **Deployment & Analytics:** Vercel

---

## ⚙️ Advanced Bundler Configuration (Turbopack + Webpack)

Due to the intense mathematical requirements of the orbital engine, `satellite.js` utilizes WebAssembly (`em-pthread`) to calculate trajectories, which deeply imports Node.js polyfills like `worker_threads` and `module`. 

To support Next.js 16's default `Turbopack` engine for lightning-fast local development while maintaining robust production builds on Vercel, Project Zenith utilizes a hybrid configuration in `next.config.ts`:

1.  **Local Development (Turbopack):** Utilizes `turbo.resolveAlias` to instantly map unsupported `node:module` and `node:worker_threads` schemes to a dummy `empty.js` file, preventing fatal `UnhandledSchemeError` crashes in the browser.
2.  **Production Builds (Webpack):** When `NODE_ENV === 'production'`, the config seamlessly falls back to a highly customized Webpack override. It uses `NormalModuleReplacementPlugin` to strip illegal `node:` prefixes during client-side bundling.
3.  **Client-Side Suspense Isolation:** WebGL `<Canvas>` initializations are carefully isolated from `next/navigation`'s `useSearchParams()` boundaries to prevent React Server Component bailout errors without crashing the Three.js context.
4.  **Transpile Packages:** Forces Next.js to transpile `three` and `@react-three` to prevent barrel-export memory leaks.

---

## 🚀 Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/02-rfq-07/Zenith.git
   cd Zenith
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server (Turbopack enabled):**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

<div align="center">
  <p><i>"The universe is under no obligation to make sense to you. But Zenith will try."</i></p>
</div>
