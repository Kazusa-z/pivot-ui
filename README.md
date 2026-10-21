# Pivot UI

A comprehensive UI component library designed for building professional 3D editors and interactive tools in the browser. This monorepo contains two complementary packages that work together to provide both low-level UI components and high-level GUI solutions.

This repository is a local-only pnpm workspace. Both packages are consumed through the workspace or `pnpm link`; they are not published to npm. The packages are source-only, so there is no `dist` / UMD build step in this repository.

## @pivot-ui/editor

A dedicated React component library for building 3D editor interfaces, featuring:

- **Basic Components**: `Button`, `Input`, `Slider`, etc.
- **Editor-Specific Components**: `ColorPicker`, `BezierCurveEditor`, `GradientSlider`, `ParticleSlider`, `AssetPicker`
- **Accessibility First**: All components are designed with accessibility in mind
- **Theme Support**: Built-in light and dark themes
- **TypeScript**: Full type safety and IntelliSense support
- **Controllable State**: Most components support both controlled and uncontrolled modes

```tsx
import { Button, ColorPicker } from '@pivot-ui/editor'

function App() {
  return (
    <div>
      <Button>Pivot Editor</Button>
      <ColorPicker mode="solid" value={color} onValueChange={setColor} />
    </div>
  )
}
```

## @pivot-ui/gui

An opinionated GUI library built on top of `@pivot-ui/editor`, providing:

- **Imperative API**: dat.gui-like interface for quick prototyping
- **Declarative Components**: React form components for complex UIs
- **Rich Input Types**: Vector inputs, color pickers, sliders, and more
- **Group Management**: Organize controls into collapsible groups
- **Engine Agnostic**: Works with SceneGraph data from any 3D engine or plain objects

```javascript
// Imperative API (similar to dat.gui)
const gui = new GUI(sceneData, [
  {
    label: 'Camera Position',
    bindPath: 'camera.position',
    type: 'Vector3',
    onChange(value) {
      camera.transform.setPosition(value.x, value.y, value.z)
    },
  },
])
```

```tsx
// Declarative React Components
import { FormItemVector3, FormItemColor } from '@pivot-ui/gui'

function ScenePanel() {
  return (
    <div>
      <FormItemVector3 label="Position" value={position} onChange={setPosition} />
      <FormItemColor label="Light Color" value={lightColor} onChange={setLightColor} />
    </div>
  )
}
```

## Quick Start

This repository is a local pnpm workspace. Start with:

```bash
pnpm install

# Storybook for @pivot-ui/editor
pnpm dev

# Storybook for @pivot-ui/gui
pnpm dev:gui

# Demo app
pnpm dev:demo
```

To consume a package from another local project, link it instead of installing from a registry:

```bash
# In the consuming project
pnpm link ../editor-ui/packages/ui
# or, for the GUI package
pnpm link ../editor-ui/packages/gui
```

## Use Cases

- **3D Scene Editors**: Build professional 3D content creation tools
- **Game Development Tools**: Create level editors and asset management interfaces
- **Data Visualization**: Interactive controls for complex visualizations
- **Prototyping**: Quickly add GUI controls to 3D experiments
- **Editor Plugins**: Extend your own editor tools and panels

## Key Features

- **🎛️ Dual API**: Choose between imperative (dat.gui-style) or declarative (React) approaches
- **🎨 Rich Components**: Specialized components for 3D editor workflows
- **♿ Accessible**: WCAG compliant with full keyboard navigation
- **🌗 Themeable**: Built-in light/dark themes with customization options
- **📱 Responsive**: Works seamlessly across desktop and mobile devices
- **🔧 TypeScript**: Complete type definitions for better DX
- **⚡ Performance**: Optimized for real-time 3D applications

## Integration Examples

### With Three.js

```javascript
import * as THREE from 'three'
import { GUI } from '@pivot-ui/gui'

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const gui = new GUI({ camera: { position: { x: 0, y: 0, z: 5 } } }, [
  {
    label: 'Camera Position',
    bindPath: 'camera.position',
    type: 'Vector3',
    onChange(value) {
      camera.position.set(value.x, value.y, value.z)
    },
  },
])
```

## 📚 Documentation

- [Editor UI Documentation](./packages/ui/README.md)
- [GUI Documentation](./packages/gui/README.md)

Run `pnpm dev` or `pnpm dev:gui` to browse the component documentation and examples locally.

## 🛠️ Development

Use Node.js 26.12.0 (see `.node-version`) and pnpm 12.14.0. The supported Node.js ranges are 22.18+, 24.11+, or 26+. React 19.3.1 or newer within React 19 is required by both libraries.

```bash
# Install dependencies
pnpm install

# Start development server for editor-ui
pnpm dev

# Start development server for gui
pnpm dev:gui
# Start the demo app
pnpm dev:demo

# Check source types
pnpm typecheck

# Build the demo app
pnpm build:app

# Build both component documentation sites
pnpm build:storybook

# Quick local check (formatting + types)
pnpm verify:quick

# Full local check (formatting + types + demo + Storybook builds)
pnpm verify

# Remove generated build files and caches
pnpm clean
```

`pnpm verify:quick` runs automatically as a pre-push hook.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

Built with these excellent open-source projects:

- [@radix-ui](https://radix-ui.com/) - Accessible component primitives
- [@stitches/react](https://stitches.dev/) - CSS-in-JS solution
- [react-colorful](https://github.com/omgovich/react-colorful) - Color picker component
- [colord](https://github.com/omgovich/colord) - Color manipulation utilities

---
