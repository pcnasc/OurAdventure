"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { TripWithStats } from "@/lib/supabase/types";

// Dynamically import react-globe.gl with no SSR
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

interface GlobeViewProps {
  trips: TripWithStats[];
  onAddTrip: (countryName: string, countryCode: string) => void;
}

export function GlobeView({ trips, onAddTrip }: GlobeViewProps) {
  const globeRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });
  const [countries, setCountries] = useState<any[]>([]);
  const [hoverD, setHoverD] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    
    // Fetch country polygons for interaction
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => {
        setCountries(data.features);
      });

    // Setup resize listener
    const handleResize = () => {
      const container = document.getElementById('globe-container');
      if (container) {
        setWindowSize({
          width: container.clientWidth,
          height: Math.min(600, window.innerHeight * 0.6)
        });
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
      globeRef.current.pointOfView({ lat: -15, lng: -55, altitude: 2.5 }, 1000);
    }
  }, [mounted]);
  
  const tripCoordinates: Record<string, { lat: number; lng: number }> = {
    "t-sp": { lat: -23.5505, lng: -46.6333 },
    "t-cj": { lat: -22.7392, lng: -45.5914 },
    "t-cab": { lat: -23.3075, lng: -47.0333 },
    "t-bp": { lat: -22.9519, lng: -46.5419 },
    "t-bc": { lat: -26.8000, lng: -48.6167 },
    "t-ar": { lat: -50.3380, lng: -72.2648 },
    "t-cl": { lat: -33.4489, lng: -70.6693 },
    "t-fr": { lat: 48.8566, lng: 2.3522 },
    "t-it": { lat: 46.5560, lng: 11.7167 },
    "t-sd": { lat: 32.7157, lng: -117.1611 },
    "t-ny": { lat: 40.7128, lng: -74.0060 },
    "t-tr": { lat: 41.0082, lng: 28.9784 },
  };

  const markersData = trips.map((trip) => {
    const coords = tripCoordinates[trip.id] || { lat: 0, lng: 0 };
    return {
      id: trip.id,
      name: trip.name,
      lat: coords.lat,
      lng: coords.lng,
      status: trip.status,
    };
  }).filter(m => m.lat !== 0 && m.lng !== 0);

  if (!mounted) {
    return (
      <div 
        className="w-full h-[500px] rounded-3xl flex items-center justify-center border border-border-subtle"
        style={{ background: "radial-gradient(circle, hsl(220 16% 12%) 0%, hsl(220 20% 6%) 100%)" }}
      >
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div 
      id="globe-container" 
      className="relative w-full rounded-3xl overflow-hidden border border-border-subtle"
      style={{ background: "radial-gradient(circle, hsl(220 16% 12%) 0%, hsl(220 20% 6%) 100%)" }}
    >
      <Globe
        ref={globeRef}
        width={windowSize.width}
        height={windowSize.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        
        atmosphereColor="hsl(32 60% 40%)"
        atmosphereAltitude={0.15}

        // Country Polygons
        polygonsData={countries}
        polygonAltitude={d => d === hoverD ? 0.04 : 0.01}
        polygonCapColor={d => d === hoverD ? 'rgba(217, 119, 6, 0.4)' : 'rgba(255, 255, 255, 0.02)'}
        polygonSideColor={() => 'rgba(0, 0, 0, 0.1)'}
        polygonStrokeColor={() => 'rgba(255,255,255, 0.1)'}
        onPolygonHover={setHoverD}
        onPolygonClick={(d: any) => onAddTrip(d.properties.NAME, d.properties.ISO_A2)}
        
        // Tooltip for Country Name on hover
        polygonLabel={(d: any) => `
          <div class="glass-subtle px-3 py-1.5 rounded-lg text-xs font-semibold text-text shadow-lg transform -translate-y-4">
            ${d.properties.NAME}
          </div>
        `}

        // Existing HTML Markers for Trips
        htmlElementsData={markersData}
        htmlElement={(d: any) => {
          const el = document.createElement('div');
          el.innerHTML = `
            <div class="relative flex items-center justify-center group pointer-events-none">
              <div class="absolute w-4 h-4 bg-accent rounded-full animate-ping opacity-75"></div>
              <div class="relative w-2 h-2 bg-amber-200 rounded-full shadow-[0_0_10px_hsl(32_90%_55%)]"></div>
              
              <div class="absolute bottom-full mb-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                <div class="glass-subtle px-2 py-1 rounded text-[10px] font-semibold text-text shadow-lg">
                  ${d.name}
                </div>
              </div>
            </div>
          `;
          return el;
        }}
      />
      
      {/* Overlay Instructions */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
        <div className="glass-card px-4 py-2 text-xs text-text-muted flex items-center gap-2 shadow-lg border border-white/5">
          <span>Gire o globo 🌍</span>
          <span className="w-1 h-1 rounded-full bg-text-subtle" />
          <span>Clique em um país para planejar ✈️</span>
        </div>
      </div>
    </div>
  );
}
