import { Material, Mesh, PerspectiveCamera, Raycaster, Scene, ShaderMaterial, TextureLoader, Vector2, Vector3, WebGLRenderer } from 'three'
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js'
import fragment from './assets/shaders/illuminate.fragment.glsl?raw'
import vertex from './assets/shaders/illuminate.vertex.glsl?raw'
import './style.css'
import { isMesh } from './utils'

const SCALE_FACTOR = 15 as const

const main = () => {
  const canvas = document.querySelector('canvas')
  if (!canvas) return

  const scene = new Scene()
  const camera = new PerspectiveCamera(75, 16/9, 0.01, 1000)

  const renderer = new WebGLRenderer({
    canvas: canvas
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
    fragmentShader: fragment,
    vertexShader: vertex,
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

    // model.material = new MeshBasicMaterial({ map: texture, color: new Color()})
    model.material = shaderMaterial
    console.log(model.material)
    model.scale.setScalar(SCALE_FACTOR)
    scene.add(data.scene)
    const uv = model.geometry.getAttribute('uv')
    console.log('hasUv', uv)
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
      (intersection.object.material as ShaderMaterial).uniforms.uHitWorldPos.value = intersection.point
      console.log(intersection.object.material, intersection.point);
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
    model.position.y = Math.sin(_time * 0.002) * 0.5
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