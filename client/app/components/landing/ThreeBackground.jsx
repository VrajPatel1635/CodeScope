"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // WebGL Canvas Setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(1); // Locked to 1x to improve performance on high-res displays
    
    // Prevent Tailwind from squishing the canvas with max-width: 100%, height: auto
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    containerRef.current.appendChild(renderer.domElement);

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2() },
      uVelocity: { value: 0 }
    };

    const updateSize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(width, height);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(containerRef.current);

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform vec2 uResolution;
      uniform float uVelocity;
      varying vec2 vUv;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution.xy;
        uv.x *= uResolution.x / uResolution.y;

        vec3 charcoal = vec3(0.07, 0.08, 0.09);
        
        float timeScale = uTime * 0.2 + uVelocity * 0.05;
        float noiseVal = snoise(uv * 3.0 + vec2(timeScale * 0.5, timeScale));
        
        float brush = snoise(vec2(uv.x * 50.0, uv.y * 2.0));
        brush = smoothstep(0.0, 1.0, brush) * 0.03;

        vec3 copper = vec3(0.8, 0.5, 0.3);
        float accentIntensity = smoothstep(0.4, 0.8, noiseVal + uVelocity * 0.1) * 0.15;
        
        vec3 finalColor = charcoal + brush + (copper * accentIntensity);
        
        float dist = distance(vUv, vec2(0.5));
        finalColor -= dist * 0.15;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Scroll mechanics
    let currentScroll = window.scrollY;
    let targetVelocity = 0;
    let currentVelocity = 0;

    const handleScroll = () => {
      const newScroll = window.scrollY;
      const delta = newScroll - currentScroll;
      targetVelocity = Math.abs(delta) * 0.05;
      currentScroll = newScroll;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    let clock = new THREE.Clock();
    let animationFrameId;
    let isVisible = true;

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0 }
    );
    
    if (containerRef.current) {
      intersectionObserver.observe(containerRef.current);
    }

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      currentVelocity += (targetVelocity - currentVelocity) * 0.1;
      targetVelocity *= 0.9; 
      
      if (!isVisible) return;
      
      uniforms.uTime.value = clock.getElapsedTime();
      uniforms.uVelocity.value = currentVelocity;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none" />;
}
