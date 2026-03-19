/**
 * GlobeView.jsx
 * Phase 1 + 2: Renders the interactive 3D Earth globe using globe.gl.
 * - Phase 1: Rotation, zoom, click to log coordinates
 * - Phase 2: Heatmap layer + event markers with popup on click
 */
import { useEffect, useRef, useState, useCallback } from 'react';

// Category → color mapping for markers
const CATEGORY_COLORS = {
  energy: '#f97316',      // orange
  geopolitics: '#ef4444', // red
  economy: '#3b82f6',     // blue
  tech: '#a855f7',        // purple
  crypto: '#eab308',      // yellow
  climate: '#22c55e',     // green
  general: '#94a3b8',     // slate
};

export default function GlobeView({ events, onEventClick, selectedEventId, breakingEventId }) {
  const mountRef = useRef(null);       // DOM element for globe
  const globeInstanceRef = useRef(null); // globe.gl instance
  const [tooltip, setTooltip] = useState(null); // hover tooltip state

  // Load globe.gl dynamically (it's a browser-only ESM library)
  useEffect(() => {
    let globe;

    import('globe.gl').then(({ default: Globe }) => {
      // ── Phase 1: Create globe with Earth texture ──────────────────────
      globe = Globe({
        animateIn: true,
      })(mountRef.current)
        .globeImageUrl(
          'https://unpkg.com/three-globe/example/img/earth-night.jpg'
        )
        .backgroundImageUrl(
          'https://unpkg.com/three-globe/example/img/night-sky.png'
        )
        .width(mountRef.current.clientWidth)
        .height(mountRef.current.clientHeight)
        // Phase 1: Log lat/lng on globe click
        .onGlobeClick(({ lat, lng }) => {
          console.log(`[Globe Click] lat: ${lat.toFixed(4)}, lng: ${lng.toFixed(4)}`);
        });

      // Enable auto-rotation for visual polish
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.4;
      globe.controls().enableDamping = true;

      globeInstanceRef.current = globe;
    });

    // Cleanup on unmount
    return () => {
      if (globe) {
        globe._destructor?.();
      }
    };
  }, []);

  // ── Phase 2: Update heatmap + markers when events change ─────────────
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe || events.length === 0) return;

    // Live Tension Rings
    try {
      globe
        .ringsData(events)
        .ringLat('lat')
        .ringLng('lng')
        .ringColor(() => '#ef4444') // Solid red glow fallback
        .ringMaxRadius(d => (d.intensity || 0.5) * 8)
        .ringPropagationSpeed(d => (d.intensity || 0.5) * 2.5)
        .ringRepeatPeriod(d => Math.max(800, 2000 - ((d.intensity || 0.5) * 1500)));
    } catch (e) {
      console.warn("Globe rings rendering disabled/failed:", e);
    }

    // Point markers layer
    try {
      globe
        .pointsData(events)
        .pointLat('lat')
        .pointLng('lng')
        .pointAltitude(0.02)
        .pointRadius(0.5)
        .pointColor(d => CATEGORY_COLORS[d.category] ?? '#94a3b8')
        .onPointClick((point) => {
          onEventClick(point);
        })
        .onPointHover((point) => {
          setTooltip(point ? { title: point.title, category: point.category } : null);
          mountRef.current.style.cursor = point ? 'pointer' : 'default';
        });
    } catch (e) {
      console.warn("Globe points rendering failed:", e);
    }

  }, [events, onEventClick]);

  // Phase 3: Sync camera with selected event
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe) return;
    
    if (!selectedEventId) {
      // Zoom out to global view when modal closes
      globe.pointOfView({ altitude: 2.5 }, 1000);
      globe.controls().autoRotate = true;
    } else {
      const event = events.find(e => e.id === selectedEventId);
      if (event) {
        globe.controls().autoRotate = false;
        globe.pointOfView({ lat: event.lat, lng: event.lng, altitude: 1.2 }, 800);
      }
    }
  }, [selectedEventId, events]);

  // Breaking News: pan to country + fire 2x red ring flash, no popup
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe || !breakingEventId) return;

    const ev = events.find(e => e.id === breakingEventId);
    if (!ev) return;

    // Stop autorotate and fly to the event country
    globe.controls().autoRotate = false;
    globe.pointOfView({ lat: ev.lat, lng: ev.lng, altitude: 1.4 }, 1000);

    // Phase 1 flash immediately
    const flashRings = [{ ...ev, _flash: 1 }];
    globe
      .ringsData(flashRings)
      .ringLat('lat')
      .ringLng('lng')
      .ringColor(() => '#ff0000')
      .ringMaxRadius(12)
      .ringPropagationSpeed(3)
      .ringRepeatPeriod(600);

    // Phase 2 flash after 1.4s, then restore normal rings after 4s
    const t1 = setTimeout(() => {
      const flashRings2 = [{ ...ev, _flash: 2 }];
      globe
        .ringsData(flashRings2)
        .ringColor(() => '#ff0000')
        .ringMaxRadius(12)
        .ringPropagationSpeed(3)
        .ringRepeatPeriod(600);
    }, 1400);

    const t2 = setTimeout(() => {
      // Restore normal rings from all events
      globe
        .ringsData(events)
        .ringLat('lat')
        .ringLng('lng')
        .ringColor(() => '#ef4444')
        .ringMaxRadius(d => (d.intensity || 0.5) * 8)
        .ringPropagationSpeed(d => (d.intensity || 0.5) * 2.5)
        .ringRepeatPeriod(d => Math.max(800, 2000 - ((d.intensity || 0.5) * 1500)));
      globe.controls().autoRotate = true;
    }, 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [breakingEventId, events]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const globe = globeInstanceRef.current;
      if (!globe || !mountRef.current) return;
      globe.width(mountRef.current.clientWidth).height(mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Globe mount point */}
      <div ref={mountRef} className="globe-canvas w-full h-full" />

      {/* Hover tooltip */}
      {tooltip && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800/90 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white pointer-events-none shadow-xl backdrop-blur-sm z-10">
          <span className="font-semibold">{tooltip.title}</span>
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 capitalize">{tooltip.category}</span>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-36 left-4 bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-xs backdrop-blur-sm shadow-xl z-20">
        <p className="text-slate-400 mb-2 font-semibold uppercase tracking-wider">Categories</p>
        {Object.entries(CATEGORY_COLORS)
          .filter(([k]) => k !== 'general')
          .map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-slate-300 capitalize">{cat}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
