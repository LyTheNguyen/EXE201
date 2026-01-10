import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    L: any;
  }
}

export function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLeafletReady, setIsLeafletReady] = useState(false);

  useEffect(() => {
    // Check if Leaflet is loaded
    const checkLeaflet = () => {
      if (window.L) {
        console.log('Leaflet detected, setting ready state');
        setIsLeafletReady(true);
        return;
      }
      setTimeout(checkLeaflet, 100);
    };
    checkLeaflet();
  }, []);

  useEffect(() => {
    if (!mapRef.current || !window.L || !isLeafletReady) return;

    console.log('Initializing map...');
    try {
      // Check if map already exists and remove it
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Clear container content
      const container = mapRef.current;
      container.innerHTML = '';

      const map = window.L.map(container).setView([10.0, 105.0], 13);
      mapInstanceRef.current = map;
      
      // Try a simple tile layer first
      const tileLayer = window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: ''
      });
      
      tileLayer.on('tileload', () => console.log('Tile loaded'));
      tileLayer.on('tileerror', (e: any) => console.error('Tile error:', e));
      
      tileLayer.addTo(map);

      // Add search control
      const searchControl = window.L.control({ position: 'topright' });
      searchControl.onAdd = function(map) {
        const div = window.L.DomUtil.create('div', 'leaflet-control-search');
        div.innerHTML = `
          <div class="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-2xl border-2 border-white/30 backdrop-blur-sm">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Tìm kiếm vị trí..." 
                class="px-2 py-1 sm:px-3 sm:py-2 bg-white/90 backdrop-blur-sm border border-white/50 rounded-lg text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all w-[150px] sm:w-[180px] md:w-[220px]"
              />
            </div>
          </div>
        `;
        
        // Add search functionality
        const input = div.querySelector('input');
        
        const performSearch = () => {
          const query = input?.value;
          if (query) {
            // Simple geocoding using Nominatim
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
              .then(response => response.json())
              .then(data => {
                if (data && data.length > 0) {
                  const result = data[0];
                  const lat = parseFloat(result.lat);
                  const lon = parseFloat(result.lon);
                  map.setView([lat, lon], 15);
                  
                  // Add marker for searched location
                  window.L.marker([lat, lon]).addTo(map)
                    .bindPopup(result.display_name)
                    .openPopup();
                }
              })
              .catch(error => console.error('Search error:', error));
          }
        };
        
        // Add Enter key listener
        input?.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            performSearch();
          }
        });
        
        return div;
      };
      searchControl.addTo(map);

      // Add fullscreen control
      const fullscreenControl = window.L.control({ position: 'bottomright' });
      fullscreenControl.onAdd = function(map) {
        const div = window.L.DomUtil.create('div', 'leaflet-control-fullscreen');
        div.innerHTML = `
          <div class="p-4 bg-black rounded-xl shadow-2xl border-2 border-white/50 backdrop-blur-sm cursor-pointer hover:scale-110 transition-all duration-300">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: block; width: 24px; height: 24px;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4h4M4 16v4h4m12-16h4v4m0 12v4h4" />
            </svg>
          </div>
        `;
        
        // Add click event to navigate to fullscreen map page
        div.addEventListener('click', () => {
          window.open('/fullscreen-map', '_blank');
        });
        
        return div;
      };
      fullscreenControl.addTo(map);

      // Add some demo markers (without GPS server)
      const demoLocations = [
        { lat: 10.0452, lng: 105.7883, name: "Cần Thơ, Việt Nam" },
        { lat: 10.7626, lng: 106.6602, name: "Thành phố Hồ Chí Minh" },
        { lat: 21.0285, lng: 105.8542, name: "Hà Nội" },
        { lat: 16.0544, lng: 108.2022, name: "Đà Nẵng" }
      ];

      demoLocations.forEach((loc, index) => {
        const marker = window.L.marker([loc.lat, loc.lng]).addTo(map);
        marker.bindPopup(`<b>${loc.name}</b><br>Vĩ độ: ${loc.lat}<br>Kinh độ: ${loc.lng}`);
      });

      console.log('Map initialized successfully');

      // Force resize after a delay
      setTimeout(() => {
        map.invalidateSize();
        console.log('Map size invalidated');
      }, 500);

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLeafletReady]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full"
      style={{ height: '100%' }}
    />
  );
}
