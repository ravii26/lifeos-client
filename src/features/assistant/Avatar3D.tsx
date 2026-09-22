import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Avatar3DProps {
  size: number;
  talking: boolean;
  thinking: boolean;
  accent: string; // CSS color for the body, e.g. "#ff5a1f"
}

// A cel-shaded toon "blob" character, rendered in real-time WebGL — no
// external 3D asset. Body + two stub arms + big expressive eyes, built from
// primitives and a 3-band toon gradient (the standard MeshToonMaterial
// technique), so there's no rigged-model dependency to unblock this on.
const BAND_COUNT = 3;

function createToonGradientMap(): THREE.DataTexture {
  const data = new Uint8Array(BAND_COUNT);
  for (let i = 0; i < BAND_COUNT; i++) data[i] = Math.floor((i / (BAND_COUNT - 1)) * 255);
  const tex = new THREE.DataTexture(data, BAND_COUNT, 1, THREE.RedFormat);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

export function Avatar3D({ size, talking, thinking, accent }: Avatar3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ talking, thinking });
  stateRef.current = { talking, thinking };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
    camera.position.set(0, 0.15, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const gradientMap = createToonGradientMap();

    // Lighting — a key light + soft fill, the two-light setup that makes
    // toon shading read as "cute", not flat.
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(2, 3, 4);
    scene.add(key);

    const bodyGroup = new THREE.Group();
    scene.add(bodyGroup);

    const bodyMat = new THREE.MeshToonMaterial({ color: accent, gradientMap });
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.05, 24, 20), bodyMat);
    body.scale.set(1, 1.15, 1);
    bodyGroup.add(body);

    // Belly patch — a lighter front panel, classic friendly-mascot cue.
    const bellyMat = new THREE.MeshToonMaterial({ color: 0xfff3e8, gradientMap });
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.62, 20, 16), bellyMat);
    belly.position.set(0, -0.15, 0.85);
    belly.scale.set(1, 1.2, 0.4);
    bodyGroup.add(belly);

    // Eyes — oversized, the single biggest lever for "friendly" vs "creepy".
    const eyeWhiteMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x18140f });
    const eyes = new THREE.Group();
    const pupils: THREE.Mesh[] = [];
    [-0.42, 0.42].forEach((x) => {
      const white = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 16), eyeWhiteMat);
      white.position.set(x, 0.32, 0.92);
      eyes.add(white);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), pupilMat);
      pupil.position.set(x, 0.32, 1.2);
      eyes.add(pupil);
      pupils.push(pupil);
    });
    bodyGroup.add(eyes);

    // Stub arms — small capsules, mostly there for idle-wiggle charm.
    const armMat = new THREE.MeshToonMaterial({ color: accent, gradientMap });
    const arms: THREE.Mesh[] = [];
    [-1, 1].forEach((side) => {
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.5, 4, 8), armMat);
      arm.position.set(side * 1.05, -0.1, 0);
      arm.rotation.z = side * 0.5;
      bodyGroup.add(arm);
      arms.push(arm);
    });

    let raf = 0;
    let blinkAt = performance.now() + 2000 + Math.random() * 2500;
    const start = performance.now();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = (performance.now() - start) / 1000;
      const { talking: isTalking, thinking: isThinking } = stateRef.current;

      if (!reducedMotion) {
        // Idle bob/breathe.
        bodyGroup.position.y = Math.sin(t * 1.6) * 0.06;
        bodyGroup.rotation.z = Math.sin(t * 0.9) * 0.035;
        bodyGroup.scale.setScalar(1 + Math.sin(t * 1.6) * 0.015);

        // Arm wiggle.
        arms.forEach((arm, i) => {
          const dir = i === 0 ? -1 : 1;
          arm.rotation.z = dir * (0.5 + Math.sin(t * 1.4 + i) * 0.18);
        });

        // Blink.
        const now = performance.now();
        const sinceBlink = now - blinkAt;
        if (sinceBlink > 0 && sinceBlink < 140) {
          eyes.scale.y = 0.12;
        } else {
          eyes.scale.y = 1;
          if (sinceBlink >= 140 && sinceBlink < 160) {
            blinkAt = now + 2200 + Math.random() * 3000;
          }
        }

        // Thinking: eyes glance side to side and up.
        if (isThinking) {
          const look = Math.sin(t * 2.2) * 0.18;
          pupils.forEach((p) => (p.position.x = (p.position.x > 0 ? 0.42 : -0.42) + look));
          eyes.position.y = 0.06;
        } else {
          pupils.forEach((p) => (p.position.x = p.position.x > 0 ? 0.42 : -0.42));
          eyes.position.y = 0;
        }

        // Talking: quick vertical squash pulse, like a soft mouth-less "gulp" bounce.
        if (isTalking) {
          bodyGroup.scale.y = 1 + Math.abs(Math.sin(t * 9)) * 0.05;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      renderer.setSize(size, size);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      gradientMap.dispose();
      bodyMat.dispose();
      bellyMat.dispose();
      eyeWhiteMat.dispose();
      pupilMat.dispose();
      armMat.dispose();
      mount.removeChild(renderer.domElement);
    };
    // Re-create only if size/accent change — talking/thinking flow through the ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, accent]);

  return <div ref={mountRef} style={{ width: size, height: size, pointerEvents: "none" }} />;
}
