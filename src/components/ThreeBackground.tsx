import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.innerWidth < 768

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.z = 12

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    // --- Partikel dua lapis: layer jauh (kecil, redup) + layer dekat (besar, terang) ---
    const makeStars = (count: number, spread: number, size: number, color: number, opacity: number) => {
      const positions = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * spread
        positions[i * 3 + 1] = (Math.random() - 0.5) * (spread * 0.6)
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 4
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const mat = new THREE.PointsMaterial({
        color, size, transparent: true, opacity,
        sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
      })
      return new THREE.Points(geo, mat)
    }

    const farCount = isMobile ? 120 : 220
    const nearCount = isMobile ? 40 : 80
    const starsFar = makeStars(farCount, 34, 0.03, 0xffc145, 0.35)
    const starsNear = makeStars(nearCount, 26, 0.055, 0x7c5cfc, 0.55)
    scene.add(starsFar, starsNear)

    const shapesGroup = new THREE.Group()
    const geoDefs = [
      new THREE.IcosahedronGeometry(1, 0),   // tenis meja
      new THREE.OctahedronGeometry(1, 0),    // badminton
      new THREE.TetrahedronGeometry(1.1, 0), // PES
    ]
    const colors = [0x31d0aa, 0x7c5cfc, 0xffc145]
    const shapes: THREE.Group[] = []
    geoDefs.forEach((geo, i) => {
      const g = new THREE.Group()
      const wireMat = new THREE.MeshBasicMaterial({ color: colors[i], wireframe: true, transparent: true, opacity: 0.4 })
      const glowMat = new THREE.MeshBasicMaterial({ color: colors[i], transparent: true, opacity: 0.05 })
      g.add(new THREE.Mesh(geo, wireMat))
      g.add(new THREE.Mesh(geo, glowMat))
      g.position.set((i - 1) * 5.4, Math.sin(i) * 1.6, -5 - i * 1.2)
      shapesGroup.add(g)
      shapes.push(g)
    })
    scene.add(shapesGroup)

    // --- Parallax mouse halus ---
    const mouse = { x: 0, y: 0 }
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    if (!reduceMotion && !isMobile) window.addEventListener('mousemove', onMouseMove)

    let frameId: number
    let visible = true
    const clock = new THREE.Clock()

    const animate = () => {
      if (visible) {
        const t = clock.getElapsedTime()
        if (!reduceMotion) {
          starsFar.rotation.y += 0.0003
          starsNear.rotation.y += 0.0006
          shapes.forEach((g, i) => {
            g.rotation.x += 0.0014 + i * 0.0004
            g.rotation.y += 0.0018
            g.position.y += Math.sin(t * 0.6 + i) * 0.0009
          })
          // parallax camera halus, kembali ke tengah dengan easing
          camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.03
          camera.position.y += (-mouse.y * 0.4 - camera.position.y) * 0.03
          camera.lookAt(0, 0, 0)
        }
        renderer.render(scene, camera)
      }
      frameId = requestAnimationFrame(animate)
    }
    animate()

    // Pause render loop saat tab tidak aktif — hemat CPU/GPU/baterai
    const onVisibilityChange = () => { visible = !document.hidden }
    document.addEventListener('visibilitychange', onVisibilityChange)

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      mount.removeChild(renderer.domElement)
      starsFar.geometry.dispose(); (starsFar.material as THREE.Material).dispose()
      starsNear.geometry.dispose(); (starsNear.material as THREE.Material).dispose()
      geoDefs.forEach(g => g.dispose())
      shapes.forEach(g => g.children.forEach(m => ((m as THREE.Mesh).material as THREE.Material).dispose()))
      renderer.dispose()
    }
  }, [])

  return <div ref={mountRef} className="absolute inset-0 -z-0" />
}