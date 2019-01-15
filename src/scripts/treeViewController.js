/* global THREE:true */
/* exported ThreeViewController */
class ThreeViewController {

  startRenderLoop() {
    this.isRendering = true
    requestAnimationFrame(() => {
      this.renderLoop()
    })
  }

  stopRenderLoop() {
    this.isRendering = false
  }

  addCube(x = 0, y = 0, z = 0, radius = 1) {
    let geometry = new THREE.BoxGeometry(radius, radius, radius)
    let material = new THREE.MeshLambertMaterial({
      color: 0x00ff00
    })
    let mesh = new THREE.Mesh(geometry, material)
    this.scene.add(mesh)
    mesh.position.set(x, y, z)
  }

  addSkybox() {
    // const earthURL = "https://cdn-images-1.medium.com/max/800/1*UlLoXKAJcg7pqhjucMaksQ.png"
    const path = "images/textures/skybox/"
    const format = ".png"
    const createUrl = (name) => path + name + format
    const urls = [
      createUrl("right"),
      createUrl("left"),
      createUrl("top"),
      createUrl("bottom"),
      createUrl("back"),
      createUrl("front")
    ]

    let reflectionCubeTexture
    this.waitTexture(urls)
      .then((texture) => {
        reflectionCubeTexture = texture
        reflectionCubeTexture.format = THREE.RGBFormat

        let shader = THREE.ShaderLib["cube"]
        shader.uniforms["tCube"].value = reflectionCubeTexture

        let material = new THREE.ShaderMaterial({
          fragmentShader: shader.fragmentShader,
          vertexShader: shader.vertexShader,
          uniforms: shader.uniforms,
          depthWrite: false,
          side: THREE.BackSide
        })

        const s = 500
        let mesh = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), material)
        mesh.name = "Skybox"
        this.scene.add(mesh)

      })
      .catch((err) => {
        console.error(err)
      })

  }

  waitTexture(path) {
    return new Promise((resolve, reject) => {
      if (Array.isArray(path))
        this.cubeLoader.load(
          path,
          (texture) => {
            resolve(texture)
          },
          undefined,
          (err) => {
            console.error(err)
            reject(err)
          })
      else
        this.textureLoader.load(
          path,
          (texture) => {
            resolve(texture)
          },
          undefined,
          (err) => {
            console.error(err)
            reject(err)
          })
    })
  }

  /* ================== Private methods ================== */

  // method called on every frame
  renderLoop() {
    if (this.isRendering)
      requestAnimationFrame(() => {
        this.renderLoop()
      })
    // print image
    this.render()
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }

  // updates renderer parameters if the view changes.
  updateViewport() {
    let width = this.parent.clientWidth
    let height = this.parent.clientHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  constructor(canvasId) {
    // get viewport parent node
    this.parent = document.getElementById(canvasId)

    // boolean state enabling the render loop to be called every frame
    this.isRendering = false

    // initialize perspective camera
    // params: Field of view, Aspect ratio (overwritten late), near field and far field.
    this.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1000)
    this.camera.position.z = 5

    // initialize 3D scene
    this.scene = new THREE.Scene()

    // initialize renderer
    this.renderer = new THREE.WebGLRenderer()

    // initialize texture Loader
    this.textureLoader = new THREE.TextureLoader()
      .setCrossOrigin(true)

    this.cubeLoader = new THREE.CubeTextureLoader()
      .setCrossOrigin(true)

    // Add two lights
    var ambiant = new THREE.AmbientLight(0xffffff)
    this.scene.add(ambiant)

    var point = new THREE.PointLight(0xffffff, 2)
    this.scene.add(point)

    this.addSkybox()

    // use the device's pixel ratio (number of actual / physical screen pixels in one 'virtual' pixel: can be more than one on high res screens)
    this.renderer.setPixelRatio(window.devicePixelRatio || 1)

    // inserts the WebGl canvas in the document
    this.parent.appendChild(this.renderer.domElement)
    this.updateViewport()

    // listen for viewport size changes
    window.addEventListener("resize", () => {
      this.updateViewport()
    })

    // create camera orbit controls
    this.orbitControls = new THREE.OrbitControls(this.camera, this.renderer.domElement)

  }
}