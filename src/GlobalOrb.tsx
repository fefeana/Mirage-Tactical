import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { useSpring } from "motion/react";

export default function GlobalOrb({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef(null);
  const pointerInteractionMovement = useRef(0);
  
  const springConfig = { damping: 15, stiffness: 50, mass: 1 };
  const r = useSpring(0, springConfig);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 400 * 2,
      height: 400 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.1, 0.1, 0.2], // #1A1A33
      markerColor: [0.0, 1.0, 0.5], // #00FF80
      glowColor: [0.4, 0.0, 1.0], // #6600FF
      markers: [
        // UAE
        { location: [24.4539, 54.3773], size: 0.1 },
        // Berlin / Frankfurt
        { location: [50.1109, 8.6821], size: 0.05 },
        // US East
        { location: [38.9072, -77.0369], size: 0.08 },
      ],
      onRender: (state) => {
        // Called on every animation frame.
        // `state` will be an empty object, return updated params.
        if (!pointerInteracting.current) {
          // Called on every animation frame.
          phi += 0.005;
        }
        state.phi = phi + r.get();
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <div className={`relative isolate w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
          canvasRef.current.style.cursor = 'grabbing';
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          canvasRef.current.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          canvasRef.current.style.cursor = 'grab';
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta;
            r.set(delta / 200);
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const delta = e.touches[0].clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta;
            r.set(delta / 100);
          }
        }}
        style={{
          width: 400,
          height: 400,
          cursor: 'grab',
          contain: 'layout paint size',
          opacity: 1,
          transition: 'opacity 1s ease',
        }}
      />
    </div>
  );
}
