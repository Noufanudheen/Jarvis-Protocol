# The JARVIS Protocol

The JARVIS Protocol is a cinematic 3D interface built with Three.js that showcases an immersive "Iron Man" style HUD. This project serves as a technical demonstration of bridging high-performance WebGL graphics with interactive, functional web elements.

---

## Three.js Showcase Highlights

This application demonstrates advanced 3D rendering and interaction techniques:

* **Triple-Renderer Architecture**: Utilizes WebGLRenderer for geometry, CSS3DRenderer for interactive HTML panels, and CSS2DRenderer for sharp, readable labels.
* **Dynamic Holographic Globe**: A rotating icosahedron featuring six interactive "Infinity Stone" nodes, each with unique lighting and local-vector behaviors.
* **Spatial Interaction**: Includes a Tesseract hologram that dynamically tracks mouse movement and cursor coordinates in 3D space.
* **The "Snap" Logic**: A reality-fracturing effect that synchronizes CSS animations with a 2D Canvas particle system to disintegrate UI elements into cosmic dust.
* **Cinematic HUD Overlays**: Custom-built scanline, vignette, and heartbeat-pulse layers for an atmospheric "visor" experience.

---

## Tech Stack

* **3D Engine**: Three.js (WebGL, CSS3D, CSS2D)
* **Logic**: JavaScript (ES6+), Web Speech API
* **Styling**: HTML5, CSS3 (Custom Animations), Google Fonts
* **Data Integration**: Navigator Battery API, WTTR.in API

---

## Key Features

* **Voice Control**: Navigate through nodes or trigger system protocols like "Scan Environment" or "Snap" using speech recognition.
* **Live Diagnostics**: Real-time fetching of environmental weather and device battery status directly into the holographic interface.
* **Era Selection (Themes)**: Seamlessly switch between "Jarvis" (Blue) and "Hellfire" (Orange) modes in real-time.
* **Fully Responsive**: Optimized for window resizing, touch-swipe navigation, and scroll-wheel interaction.

---

## How to Use

1. **Navigate**: Use the mouse scroll wheel or the on-screen buttons to cycle through the globe nodes.
2. **Select**: Click a node to focus the 3D camera and reveal its unique holographic data panel.
3. **Command**: Click the VOICE button and say commands like "Open Reality Stone" or "Snap" to interact with the system.
4. **Reset**: Use the "X" button in the navigation panel to return to the global overview.

---

*Built by Noufanudheen as a showcase of 3D web technologies.*