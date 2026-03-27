# 🌎 Orbit — Interactive Solar System Simulator

> 3D educational solar system built with Three.js, featuring realistic planets, moons, CRUD controls, and a bonus spaceship flight mode.

---
## 🔴 Live Preview

[🔗 Open Live Demo](https://orbitforkids.netlify.app/)

---

## 🎥 GIF Preview

![Orbit Preview](./assets/orbit-preview.gif)

---

## 🌞 Overview 

Orbit is a **fully interactive, fully customizable 3D model of our Solar System**, built to help kids learn astronomy through hands-on experimentation.

This simulation allows users to:

- Explore planets & moons in 3D  
- Adjust the speed of time  
- Create, edit, or delete planets  
- View scientific info panels  
- Fly a spaceship through the solar system  
- View realistic textures, clouds, atmospheres & rings  
- Hover planets to view quick info  
- Search planets instantly  
- Reset the entire system at any time  

Orbit transforms abstract astronomy ideas into an immersive digital experience.

---

## 🚀 Features

### 🌞 Realistic Solar System

- Real planet textures (NASA-style look)
- Scaled sizes, distances, and orbital speeds
- Orbit paths for each planet
- The Sun emits light via a Three.js `PointLight`

### 🔄 Time Control (Simulation Speed)

Accessible through the left-side GUI panel:

- **Play / Stop** the simulation  
- **Speed Multiplier** slider (0–5x)  
- All planet & moon motion respects the time scale

### 🛠 CRUD: Create, Read, Update, Delete Planets

**Create** planets using the *Planet Factory* GUI:

- Name  
- Size  
- Distance from the Sun  
- Color  
- Orbit speed  

**Update** planets through their individual GUI folders:

- Adjust size  
- Move orbital distance  
- Change orbit speed  
- Recolor in real time  

**Delete** planets:

- Every planet except the Sun can be deleted  
- A Reset button restores the default solar system

### 🌑 Moons System

Planets can define moons in the `planetData` file. Each moon:

- Orbits its parent planet  
- Has its own miniature orbit line  
- Uses its own speed and distance  
- Is updated according to the global time scale

Examples include Earth’s Moon, Mars’ moons, and Jupiter’s Galilean moons.

### ☁ Clouds, Atmospheres & Rings

Planets support optional visual enhancements:

- Cloud layers (e.g. Earth)  
- Shader-based glowing atmospheres (e.g. Earth, Venus)  
- Rings (Saturn) built with `RingGeometry`

### 🛰 Camera Interaction & Hover Information

- **Hover** over a planet → A tooltip shows:  
  - Name  
  - Size  
  - Distance from the Sun  

- **Click** a planet → The camera smoothly transitions to a close orbital view and locks onto it.  
- Press **ESC** → Camera returns to a wide “whole system” overview.

### 📚 Detailed Planet Information Panel (HUD)

When a planet is focused, a right-side info panel slides in to show:

- Planet name  
- Descriptive text  
- Temperature  
- Surface gravity  
- Mass  

### 🔎 Planet Search

A search bar at the bottom center lets you type a planet name and jump to it instantly:

- Case-insensitive  
- Ignores extra whitespace  
- Centers the camera on the matching planet

### ✨ 3D Environment & Effects

- Galaxy sky sphere as the background  
- Dense, colorful starfield (10,000+ stars)  
- Smooth orbital camera controls via `OrbitControls`

---

## 🛸 Bonus Feature: Spaceship Game Mode

Orbit includes a bonus “spaceship mode” that turns the simulation into an arcade-style spaceflight experience.

### Enter / Exit Spaceship

- Use the **“ENTER SPACESHIP”** / **“EXIT SPACESHIP”** button in the top bar
- When active, normal orbit controls are disabled and spaceship controls are enabled

### Ship Types

Choose a craft from the **Hangar** modal:

1. **Retro Rocket** — High speed, powerful thrust  
2. **Cyber Speeder** — Balanced speed and handling  
3. **Alien Saucer** — Very agile, drifty handling  

Each ship has its own geometry and physics tuning (speed, acceleration, turn responsiveness, friction).

### Controls

| Key        | Action           |
|-----------|------------------|
| W         | Thrust forward   |
| S         | Brake / reverse  |
| Arrow ↑   | Pitch up         |
| Arrow ↓   | Pitch down       |
| Arrow ←   | Turn left (yaw)  |
| Arrow →   | Turn right (yaw) |

The camera follows behind the ship with a smooth lerped offset for a cinematic feel.

---

## 🧩 Technical Architecture

```text
src/
 ├── core/
 │    └── SceneSetup.js       # Scene, renderer, camera, lights, skybox
 ├── systems/
 │    ├── InputManager.js     # Mouse, raycasting, tooltips, camera focus
 │    ├── GuiManager.js       # Simulation controls + planet CRUD
 │    └── UIManager.js        # HUD + search bar logic
 ├── entities/
 │    ├── Planet.js           # Planet model, moons, textures, effects
 │    ├── Spaceship.js        # Spaceship physics + visuals
 │    └── StarField.js        # Background stars
 ├── data/
 │    └── planetData.js       # Default solar system configuration
 └── main.js                  # App entry point and glue code
```

### Core Ideas

- **SceneSetup**  
  Centralizes the Three.js `Scene`, `Camera`, `Renderer`, lights, and galaxy sky sphere.

- **Planet Entity**  
  Encapsulates:
  - Geometry + textures
  - Clouds, atmosphere, rings
  - Orbit path line
  - Moon creation
  - Update loop for rotation & revolution

- **GuiManager**  
  Uses `lil-gui` to:
  - Control global time scale
  - Create/reset planets
  - Provide a folder per planet for live property edits
  - Safely delete planets (except the Sun)

- **InputManager**  
  Handles:
  - Mouse move, click, drag detection
  - Raycasting for hovers/clicks
  - Tooltip display
  - Camera transitions and focus

- **UIManager**  
  Controls the DOM-based HUD:
  - Planet info panel
  - Search bar and query handling

- **Spaceship**  
  Implements a simple physics system with position, velocity, acceleration, and friction, and updates the camera to follow.

---

## 🏁 Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://gitea.kood.tech/abderahmanenouari/orbit.git
cd orbit
```

### 2️⃣ Start a local dev server

You can use any simple static server. For example:

```bash
npm install -g live-server
live-server
```

or

```bash
npx http-server .
```

### 3️⃣ Open in the browser

Go to:

```text
http://localhost:8080
```

(or whatever port your dev server prints).

---

 ## 🧪 Automated Testing Suite

To ensure the simulation remains stable across different browser engines, I implemented a functional End-to-End (E2E) testing suite using **Playwright**.

### Test Coverage
* **Initialization**: Verifies that the Three.js canvas mounts correctly and the scene initializes without console errors.
* [cite_start]**Search & UI Bridge**: Validates that the Search Bar correctly identifies planets and triggers the camera focus and info panel. [cite: 348]
* [cite_start]**Mode Switching**: Ensures the toggle logic between Orbit Mode and Spaceship Mode functions correctly, updating both the UI and the camera controls. [cite: 354-358]
* [cite_start]**Component Interaction**: Confirms that high-level UI elements like the Hangar Modal and Planet Info HUD respond correctly to user input. [cite: 332-334]

### Running the Tests
1. **Start your local server**: `npx http-server .` (Ensure it is running on port `8081`).
2. **Run tests in terminal**: `npx playwright test`
3. **Run with UI Dashboard**: `npx playwright test --ui`

---

## 🧠 Learning Outcomes

By building/reading this project, you can learn:

- Three.js scene setup and camera configuration
- Working with PBR materials, lights, and skyboxes
- Using `OrbitControls` for 3D navigation
- Implementing time-scaled animation loops
- Creating data-driven 3D entities (planets, moons)
- Handling raycasting-based interaction (hover + click)
- Integrating GUI libraries (`lil-gui`) with Three.js
- Managing UI state between DOM and WebGL
- Designing an extensible architecture for interactive 3D apps

---

## 🧡 Credits

- **Development:** Abdel (2025)  
- **3D Engine:** [Three.js](https://threejs.org/)  
- **GUI:** [lil-gui](https://lil-gui.georgealways.com/)  

