# WebGL, three.js, React Three Fiber and 3D production

## Contents
- Should this be real-time 3D?
- Scene brief
- Scene architecture
- Surface, light and colour
- Shaders
- Asset pipeline
- Transfer, decode and GPU memory are different costs
- Rendering efficiency and quality tiers
- Lifecycle: load, warm up, run, pause, lose, restore, dispose
- React Three Fiber patterns
- Accessibility and fallbacks for 3D
- WebGPU
- Testing 3D
- Production handoff when 3D tooling is unavailable

## Should this be real-time 3D?

Compare it honestly with the alternatives before committing:

| Approach | Strengths | Costs | Choose when |
| --- | --- | --- | --- |
| CSS 3D transforms and layered images | Cheap, accessible, crisp text | Limited lighting and geometry | Depth and parallax suggestion is enough |
| SVG and canvas 2D | Diagrams, line work, data | Not volumetric | The idea is explanatory or graphic |
| Video | Cinematic lighting, any complexity, predictable | No agency, heavy, hard to scrub smoothly | A fixed viewpoint tells the story |
| Image sequence | Scrubbable, offline-rendered quality | Memory, transfer, limited angles | One axis of control is enough, such as rotation or an exploded view |
| Prerendered stills | Highest quality per byte | Static | Product detail pages, fallback states |
| **Real-time 3D** | Visitor-controlled viewpoint, material response, procedural or data-driven behaviour, continuity across sections | Asset production, engineering, device variance, accessibility work, testing, maintenance | **Interaction, viewpoint, material response, procedural behaviour or narrative continuity justifies the cost** |

Ask: what can the visitor *do or understand* in real time that a film or an image sequence couldn't give them? If the answer is "it looks impressive", choose the cheaper medium and spend the budget on content.

## Scene brief

Write one for every approved 3D direction:

| Field | Decide |
| --- | --- |
| Subject | What is modelled, at what fidelity, and what is deliberately abstracted |
| Composition | Framing at desktop and portrait, subject scale on screen, negative space for HTML content |
| Scale | Real-world units (glTF uses metres) and how scale is communicated |
| Materials | PBR set (base colour, metalness, roughness, normal, AO), plus special cases (transmission, clearcoat, sheen) and their costs |
| Lighting | Environment map, key lights, baked versus dynamic, shadows and the strategy behind them |
| Camera language | Lens (FOV), movement vocabulary (orbit, dolly, rack focus), constraints, what triggers moves |
| Interaction | What the visitor manipulates, by which inputs, and its keyboard and button equivalents |
| Relationship to page content | Which HTML sections drive or respond to the scene, and how DOM and canvas align |
| Asset pipeline | Source (supplied, generated, procedural, commissioned or missing), tools, compression, owner |
| Performance envelope | Per-tier triangles, draw calls, texture memory, DPR cap and frame-time target on named devices |
| Equivalent fallback | What visitors without WebGL, or on the low tier, get, and how it preserves the concept |

## Scene architecture

- **Camera:** perspective with a narrow FOV (about 20–35°) for product work, to reduce distortion. Orthographic for diagrammatic or isometric views. Animate FOV sparingly.
- **Coordinates:** glTF is Y-up, in metres. Keep pivots meaningful, such as a gear's axle at its rotation centre. Organise the scene graph by narrative element (`orrery > sun, armatures > mars-arm > mars`) so that choreography targets groups.
- **Responsive framing:** compute the camera distance from the subject's bounding sphere and the current aspect ratio. In portrait, widen the distance or reframe, rather than cropping the subject. Recompute on resize.
- **DOM/canvas alignment:** choose deliberately between
  - one fixed, full-viewport canvas behind the HTML, where the scene responds to scroll. It is efficient with one context but needs careful event routing, or
  - section-scoped canvases, which are simpler but risk the context limit. Browsers cap the number of live WebGL contexts and silently drop the oldest when it is exceeded, so check the current limit for your target browsers.
  - For several 3D "windows" sharing one context, use scissor rendering (drei `<View>`).
- **Event routing:** HTML owns primary actions (links, buttons, forms). Give the canvas `pointer-events` only where 3D interaction happens. Raycast against simplified proxy meshes, not high-poly geometry.

## Surface, light and colour

- **PBR metallic-roughness** is the glTF standard. Get the roughness variation right, because it is what makes metal read as metal.
- **Environment lighting:** an HDRI or `RoomEnvironment` processed through `PMREMGenerator`, giving prefiltered, mipmapped radiance. Often this plus one key light is enough.
- **Baked versus dynamic:** bake ambient occlusion and lightmaps in Blender for static objects. It is far cheaper at runtime. Use dynamic shadows only for moving parts that need them. Shadow-map resolution, `PCFSoftShadowMap` and every shadow-casting light cost GPU time. Contact shadows or a baked ground shadow are cheaper alternatives.
- **Colour management** (three.js r152 and later): `renderer.outputColorSpace = THREE.SRGBColorSpace` is the default. Set `texture.colorSpace = THREE.SRGBColorSpace` for colour maps (base colour, emissive), and leave data maps (normal, roughness, metalness, AO) linear. GLTFLoader sets these correctly for glTF textures.
- **Tone mapping:** `ACESFilmicToneMapping` (filmic, shifts hues), `AgXToneMapping` (gentler highlight roll-off) or `NeutralToneMapping` (keeps product colours closer to their base colour, which suits commerce). Tune `toneMappingExposure`. Match tone mapping to the photography the scene sits beside.
- **Transparency:** sorting artefacts appear with overlapping transparent meshes. Prefer alpha-tested cut-outs, `alphaHash`, or splitting meshes. `transmission` adds an extra render pass, so budget for it.
- **Post-processing:** each full-screen pass costs about pixel count × DPR². Bloom, depth of field and SSAO are expensive on phones. Merge effects into fewer passes (pmndrs `postprocessing` merges effects into a single EffectPass). Render effects at reduced resolution, and gate them by tier.

## Shaders

- **Vertex shader:** position, displacement and morphing. Displacement needs enough subdivision, and normals must be recomputed or derived. **Fragment shader:** colour, lighting tweaks, distortion and procedural texture.
- **Uniforms:** time, progress (0–1 from the shared timeline), pointer (normalised, damped), resolution and DPR. Update uniforms, not materials, per frame.
- **Noise:** value, simplex or curl noise, plus fbm with a capped octave count. Every octave costs per-pixel time. Precompute into a texture where possible.
- **Precision:** `mediump` is fast on mobile but loses precision for large positions and long-running time. Wrap the time uniform (for example `uTime % 1000.0`) and use `highp` where artefacts appear. Test on real mobile GPUs.
- **Debugging:** output intermediate values as colour, temporarily keep `renderer.debug.checkShaderErrors` on, and use Spector.js for frame capture. Isolate one effect at a time.
- **Render targets, ping-pong buffers and GPU simulation** (for example `GPUComputationRenderer`) only when the concept needs persistent simulated state, such as fluid, trails or particle physics. They multiply memory and complexity.
- **Shading languages:** GLSL with `ShaderMaterial` or `onBeforeCompile` for WebGL. For three.js's node system (TSL), which targets WebGPU and WebGL2 through `WebGPURenderer`, use it when the team accepts its maturity and you've verified the current docs.

## Asset pipeline

Typical path: **source (CAD, Blender, scan, procedural) → cleanup → UV and bake → glTF/GLB export → optimise and compress → validate → integrate.**

- **Provenance:** record each asset in the [asset manifest](../templates/asset-manifest.md) as supplied, generated, procedural, commissioned or missing. A model *described* in text is not a production asset. AI-generated meshes are blockout or concept material until their topology, UVs, scale and materials pass review.
- **CAD sources** (STEP, IGES): tessellate at controlled resolution, then retopologise or decimate. CAD often has millions of triangles, internal faces and no UVs.
- **Cleanup:** apply transforms, set +Y up and metre units, merge by distance, remove hidden and internal faces, fix normals, name nodes meaningfully, and place pivots where things rotate.
- **UVs and bakes:** use non-overlapping UVs for AO and lightmap bakes, consistent texel density, and atlases to cut the number of materials and draw calls. Bake high-poly detail into normal maps on low-poly meshes.
- **Export:** glTF 2.0 binary (GLB). Principled BSDF maps cleanly to glTF PBR in Blender's exporter. Export only the needed objects and animations.
- **Optimise and compress** with gltf-transform (`npx @gltf-transform/cli` or a global install). Check `gltf-transform --help` for the current commands. Typical steps are `inspect` (always first), `dedup`, `prune`, `weld`, `simplify`, `resize`, then geometry compression (`meshopt` or `draco`) and texture compression (`etc1s` or `uastc` for KTX2, which needs KTX-Software installed, or `webp`). `optimize` bundles common steps. gltfpack (meshoptimizer) is an alternative.
  - **Draco:** strong geometry compression, but WASM decode cost and time on the main thread or in a worker.
  - **Meshopt:** very fast decode, compresses well together with gzip or brotli, and supports animation and morph data.
  - **KTX2/Basis:** textures stay compressed on the GPU. ETC1S is smaller and lower quality, suiting albedo. UASTC is higher quality, suiting normals and detail. It needs the Basis transcoder (WASM) at runtime.
- **Validate** with the Khronos glTF-Validator, or `gltf-transform validate`, plus a visual check in a reference viewer.
- **Loaders** (three.js): `GLTFLoader` plus `DRACOLoader.setDecoderPath()`, `setMeshoptDecoder(MeshoptDecoder)`, and `KTX2Loader.setTranscoderPath().detectSupport(renderer)`. Self-host the decoder and transcoder files, with long-lived caching.
- **Licensing:** marketplace models have licence tiers. Creative Commons models may need attribution or forbid commercial use. Record the status.

## Transfer, decode and GPU memory are different costs

Budget each separately:

| Asset | Transfer (network) | Decode (CPU) | GPU memory |
| --- | --- | --- | --- |
| 2048² PNG or JPEG texture | Varies with compression, often hundreds of KB to MB | Full image decode | 2048 × 2048 × 4 B ≈ 16 MiB, ≈ 21 MiB with mipmaps |
| 2048² KTX2 (transcoded to BC7, ASTC 4×4 or ETC2 RGBA) | Often comparable or smaller | Transcode (WASM) | ≈ 4 MiB, ≈ 5.3 MiB with mipmaps, about 4× less |
| Draco-compressed mesh | Smallest | Notable WASM decode | Same as uncompressed once decoded |
| Meshopt-compressed mesh | Small, especially with brotli | Very fast | Same as uncompressed (unless quantised) |
| Image sequence of 120 frames at 720p | Large | 120 decodes | Large if all are held in memory (about 442 MB at RGBA) |

Phones share memory between the CPU and GPU, and browsers may lose the context or kill the tab under memory pressure. Keep a running texture-memory estimate per tier.

## Rendering efficiency and quality tiers

- **Draw calls:** read `renderer.info.render.calls`. Aim for tens to low hundreds. Reduce with atlases, merged static geometry, `InstancedMesh` for repeats and `BatchedMesh` for many distinct static meshes sharing a material.
- **Reuse** geometries and materials. Never create them per frame. Never allocate vectors or matrices in the render loop.
- **LOD:** `THREE.LOD` or drei `<Detailed>`, with distances tuned to screen coverage.
- **Culling:** frustum culling is on by default. Make sure bounding volumes are correct for skinned, morphed or instanced meshes, otherwise objects pop.
- **Pixel ratio:** cap DPR (for example `Math.min(devicePixelRatio, 2)`) and adapt it downward under load. Pixel cost scales with DPR².
- **Shadows and post-processing:** gate them by tier. Reduce shadow-map size. Update static shadows once (`shadowMap.autoUpdate = false`, plus `needsUpdate` when something moves).

**Quality tiers.** Define tiers only when the project justifies them, and make each one a set of measurable knobs:

| Knob | High | Medium | Low | Fallback (no WebGL) |
| --- | --- | --- | --- | --- |
| DPR cap | 2 | 1.5 | 1 | n/a |
| Textures | 2K KTX2 | 1K KTX2 | 1K, baked lighting | Prerendered images |
| Shadows | Dynamic contact shadows | Baked | Baked | In the images |
| Post FX | Subtle bloom | None | None | n/a |
| Geometry | LOD0 | LOD1 | LOD2 | n/a |

Pick the starting tier from capability signals (WebGL2 availability, `MAX_TEXTURE_SIZE`, and as weak hints `navigator.hardwareConcurrency` and `navigator.deviceMemory`, which is Chromium-only), then **adjust from measured frame times** during the first seconds and continuously, with hysteresis so that it doesn't flip back and forth. Never assume all phones are weak or all desktops are strong. drei's `PerformanceMonitor` implements decline and incline detection for R3F. A minimal vanilla version is in [examples/technical/webgl-scene.html](../examples/technical/webgl-scene.html).

**Preserve the concept in every tier.** The low tier and the fallback still deliver the signature idea, such as the date-driven orrery positions drawn in SVG. They are not an apology screen.

## Lifecycle: load, warm up, run, pause, lose, restore, dispose

- **Load:** start the critical model only after the HTML content is visible. Don't compete with the LCP element. Lazy-load deeper scenes with dynamic `import()` and on-visibility triggers. Report progress honestly through `LoadingManager`.
- **Decode:** Draco, Meshopt and KTX2 transcoding use workers or WASM. Budget the time, and start decoding before the scene is needed.
- **Warm up:** call `await renderer.compileAsync(scene, camera)` (or `compile`) before the first reveal, so that shader compilation doesn't hitch the first interaction. Pre-render material variants you'll switch to later.
- **Run:** render on demand when the scene can rest. Re-render on input, an animation tick or a resize, and stop when idle. Use one loop (`renderer.setAnimationLoop`), and keep motion frame-rate independent with delta time.
- **Pause:** stop the loop when the canvas is offscreen (IntersectionObserver) or the tab is hidden (`visibilitychange`). Pause timers and audio too.
- **Cancel:** abort in-flight fetches (`AbortController`) on unmount or navigation, and ignore late results.
- **Context loss:** listen for `webglcontextlost` and call `event.preventDefault()` so that restoration is possible. Stop the loop and show the HTML fallback. On `webglcontextrestored`, three.js re-uploads geometry and textures from their CPU-side data on the next render. **Anything generated on the GPU is gone** and must be rebuilt: PMREM environment maps, render-target contents, baked GPU simulations and custom GL state. Without the rebuild, a restored scene renders, but with black reflections. Test with `renderer.forceContextLoss()` and `forceContextRestore()`, and compare a sampled pixel before and after.
- **Dispose by ownership:** dispose of geometries, materials, textures, render targets and PMREM targets *you created* when their owner unmounts, then `renderer.dispose()` if the renderer itself is going away. Do not dispose of cached or shared assets that other views still use. Track who owns what. When checking for leaks with `renderer.info.memory`, remember that the library holds resources of its own. three.js r186, for example, uploads a shared `DFG_LUT` texture for PBR shading. Compare against what you own, not against zero.
- **Repeated navigation:** in single-page apps, mount and unmount the scene 10 times and confirm that `renderer.info.memory.geometries` and `.textures` return to baseline.

## React Three Fiber patterns

Verify against [R3F pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls) and [scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) before use.

```tsx
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, PerformanceMonitor } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import type { Group } from "three";

function Mechanism({ speedRef }: { speedRef: React.MutableRefObject<number> }) {
  const group = useRef<Group>(null);
  const { scene } = useGLTF("/models/orrery.glb"); // cached, so reuse across mounts is cheap
  const invalidate = useThree((s) => s.invalidate);

  // With frameloop="demand", whatever changes speedRef (a drag handler, a button)
  // must call invalidate() once to wake the loop; this frame callback keeps it
  // running only while there is motion.
  useFrame((_, delta) => {
    if (!group.current || speedRef.current === 0) return;
    group.current.rotation.y += speedRef.current * delta; // frame-rate independent
    invalidate();
  });

  return <primitive ref={group} object={scene} />;
}
useGLTF.preload("/models/orrery.glb");

export function Scene({ speedRef }: { speedRef: React.MutableRefObject<number> }) {
  const [dpr, setDpr] = useState(1.5);
  return (
    <Canvas frameloop="demand" dpr={dpr} camera={{ fov: 30, position: [0, 1.2, 4] }}>
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(2)} flipflops={3} />
      <Suspense fallback={null}>
        <Mechanism speedRef={speedRef} />
      </Suspense>
    </Canvas>
  );
}
```

Rules:
- **No `setState` in `useFrame` or in fast events** such as `onPointerMove`. Mutate refs or read store state with `getState()` inside the loop.
- **Delta-based motion** (`useFrame((state, delta) => …)`), never fixed per-frame steps.
- `frameloop="demand"` plus `invalidate()` for scenes that can rest.
- **Reuse** with `useMemo` for geometries and materials, use `<Instances>` or `instancedMesh` for repeats, and cache loaders with `useLoader` or `useGLTF`.
- **Avoid mounting and unmounting** expensive objects. Toggle `visible` instead, to avoid recompiling.
- R3F disposes of objects it created when they unmount. Pass `dispose={null}` to keep shared resources alive, and clear loader caches deliberately (`useGLTF.clear(url)`).
- Use `startTransition` for expensive state changes that trigger scene rebuilds.
- Keep the HTML content outside the `<Canvas>`. Give `<Canvas>` an error boundary whose fallback is the HTML fallback.

## Accessibility and fallbacks for 3D

- Essential text, navigation and actions live in HTML, never only inside the canvas.
- Use a decorative canvas with `aria-hidden="true"`. For a meaningful canvas, use `role="img"` with an `aria-label`, plus nearby HTML that describes what the visitor can learn or do.
- Every pointer manipulation has buttons, keys or form inputs that achieve the same result (WCAG 2.5.7), with visible focus.
- Reduced motion: no autoplaying camera flights or spins. User-initiated movement is allowed, but offer stepped controls.
- Auto-rotation or ambient motion lasting more than 5 s needs a pause control (WCAG 2.2.2).
- Failure paths (no WebGL, missing asset, lost context, script error) show the designed fallback with the same information and actions. **Never a blank screen.**
- Check text contrast over the moving scene at its worst frame.

## WebGPU

Treat it as an optional, compatibility-checked choice, not an automatic upgrade:
- Feature-detect with `navigator.gpu` and `await navigator.gpu.requestAdapter()`, since an adapter can be null even when the API exists.
- three.js `WebGPURenderer` (`import * as THREE from "three/webgpu"`, then `await renderer.init()`) can fall back to a WebGL2 backend. Verify which backend actually ran, and test both.
- Consider ecosystem maturity: post-processing, loaders, community examples, shader compile times and debugging tools.
- Support has shipped in Chromium, Safari 26 and Firefox on some platforms, with gaps on Android and Linux at the 2026-10 check. Re-verify current status on MDN or caniuse.

## Testing 3D

- **Device matrix:** at least one high-end desktop GPU, one integrated-GPU laptop, one recent iPhone and one mid-range Android. Record their models.
- **Frame time:** log per-frame delta (p50 and p95) during idle, interaction and the heaviest sequence, and run it for several minutes on phones to see thermal throttling. Use the DevTools Performance panel with the GPU track. Note that `stats.js` FPS hides frame-time variance.
- **Resources:** record `renderer.info.render.calls` and `.triangles`, and `renderer.info.memory.geometries` and `.textures`, per tier, and compare them with the budget.
- **Failure paths:** WebGL disabled (Chromium flags such as `--disable-webgl` or `--disable-3d-apis`, or Firefox `webgl.disabled`), a blocked GLB or KTX2 request (DevTools request blocking or Playwright `route.abort()`), forced context loss and the reduced-motion preference.
- **Visual regression:** use a fixed camera, a fixed time value and deterministic noise seeds. Screenshots verify a frame, not motion quality.

## Production handoff when 3D tooling is unavailable

If you can't run Blender or optimisation tools, deliver a handoff spec for a 3D artist:
- Deliverable: GLB, Y-up, metres, named nodes, pivots at rotation axes, and a scene graph matching the choreography groups
- Budgets per tier: triangles, materials, texture sizes and formats, and the number of UV sets
- Material conventions: a PBR metallic-roughness list of maps, colour-space notes and which surfaces need special treatment
- LODs: the levels and target reductions
- Bakes: AO and lightmaps, and which objects get them
- Animation: clip names, frame rate, loopability
- Review steps: validator output, `gltf-transform inspect` report and turntable renders
- Licence and ownership terms for commissioned work
