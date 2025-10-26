import { EquirectangularReflectionMapping, Mesh, PerspectiveCamera, Raycaster, Scene, ShaderMaterial, TextureLoader, Vector2, Vector3, WebGLRenderer } from 'three'
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js'
import vertex from './assets/shaders/illuminate.vertex.glsl?raw'
import baseFragment from './assets/shaders/base.fragment.glsl?raw'
import maskFragment from './assets/shaders/mask.fragment.glsl?raw'
import illuminateFragment from './assets/shaders/illuminate.fragment.glsl?raw'
import hideFragment from './assets/shaders/hide.fragment.glsl?raw'
import { isMesh } from './utils'
import { GUI } from 'lil-gui'
import './style.css'

const SCALE_FACTOR = 15 as const
const VECTOR3_ZERO = new Vector3(0, 0, 0)
const ChosenFragment = {
  Mask: maskFragment,
  Illuminate: illuminateFragment,
  Hide: hideFragment,
  Base: baseFragment
} as const

type TChosenFragmentKey = keyof typeof ChosenFragment

type TChosenFragment = {
  value: TChosenFragmentKey
}

const chosen: TChosenFragment = {
  value: 'Mask'
}

const setupGUI = (mesh: Mesh) => {
  const gui = new GUI()
  gui
    .add(chosen, 'value', Object.keys(ChosenFragment) as TChosenFragmentKey[])
    .onChange((value: TChosenFragmentKey) => {
      (mesh.material as ShaderMaterial).fragmentShader = ChosenFragment[value];
      (mesh.material as ShaderMaterial).needsUpdate = true
    })
  return gui
}

const main = () => {
  const canvas = document.querySelector('canvas')
  
  if (!canvas) return

  const scene = new Scene()
  const camera = new PerspectiveCamera(75, 16/9, 0.01, 1000)

  const renderer = new WebGLRenderer({
    canvas: canvas,
    alpha: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  const controls = new OrbitControls(camera, renderer.domElement)

  camera.position.z = 5
  controls.update()

  const loader = new GLTFLoader()
  const textureLoader = new TextureLoader()
  const texture = textureLoader.load('/src/assets/textures/food-pack.png')

  const pointer = new Vector2()
  const raycaster = new Raycaster()

  let model: Mesh
  const shaderMaterial = new ShaderMaterial({
    fragmentShader: ChosenFragment[chosen.value],
    vertexShader: vertex,
    transparent: true,
    uniforms: {
      uTime: { value: 1.0 },
      uTex: { value: texture },
      uMouse: { value: new Vector2(0, 0) },
      uRes: { value: new Vector2(window.innerWidth, window.innerHeight * 9 / 16) },
      uHitWorldPos: { value: new Vector3(0, 0, 0) }
    }
  })

  loader.load('/src/assets/models/uramakiDragonRoll.glb', (data) => {
    model = data.scene.children[0] as Mesh
    model.material = shaderMaterial
    model.scale.setScalar(SCALE_FACTOR)
    scene.add(data.scene)
    setupGUI(model)
  })

  textureLoader.load('/src/assets/textures/mountain.jpg', (texture) => {
    texture.mapping = EquirectangularReflectionMapping
    scene.background = texture
  })

  function loop(time: number) {
    rayCast()
    animate(time)
    render()
  }

  function rayCast() {
    raycaster.setFromCamera(pointer, camera)

    const intersects = raycaster.intersectObjects(scene.children)
    for (const intersection of intersects) {
      if (!isMesh(intersection.object)) continue
      (intersection.object.material as ShaderMaterial).uniforms.uHitWorldPos.value.copy(intersection.point)
    }
    if (!intersects.length) {
      shaderMaterial.uniforms.uHitWorldPos.value.copy(VECTOR3_ZERO)
    }
  }

  function render() {
    const height = window.innerWidth * 9 / 16

    renderer.setSize(window.innerWidth, height)
    renderer.render(scene, camera)
  }

  function animate(_time: number) {
    controls.update()
    
    if (!model) return
    model.position.y = Math.sin(_time * 0.00009) * 0.5
  }

  const handleMouseMove = (e: MouseEvent) => {
    shaderMaterial.uniforms.uMouse.value = new Vector2(e.clientX, e.clientY)
  }

  const handlePointerMove = (e: PointerEvent) => {
    const xOffset = (window.innerWidth - canvas.clientWidth) / 2
    const yOffset = (window.innerHeight - canvas.clientHeight) / 2
    const clientX = e.clientX - xOffset
    const clientY = e.clientY - yOffset

    pointer.x = (clientX / canvas.clientWidth) * 2 - 1
    pointer.y = - (clientY / canvas.clientHeight) * 2 + 1
  }

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('pointermove', handlePointerMove)
  renderer.setAnimationLoop(loop)
}

main()