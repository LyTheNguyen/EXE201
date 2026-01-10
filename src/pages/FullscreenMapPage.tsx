import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    L: any;
  }
}

export function FullscreenMapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLeafletReady, setIsLeafletReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load Leaflet CSS and JS directly
    console.log('Starting to load Leaflet...');
    
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    cssLink.onload = () => console.log('Leaflet CSS loaded');
    cssLink.onerror = () => console.error('Failed to load Leaflet CSS');
    document.head.appendChild(cssLink);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      console.log('Leaflet JS loaded, window.L =', !!window.L);
      setIsLeafletReady(true);
    };
    script.onerror = () => console.error('Failed to load Leaflet JS');
    document.head.appendChild(script);

    return () => {
      try {
        document.head.removeChild(cssLink);
        document.head.removeChild(script);
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !window.L || !isLeafletReady) {
      console.log('Fullscreen map conditions not met:', {
        mapRef: !!mapRef.current,
        windowL: !!window.L,
        isLeafletReady
      });
      return;
    }

    // Add a small delay to ensure container is rendered
    const timer = setTimeout(() => {
      console.log('Initializing fullscreen map...');
      try {
        // Check if map already exists and remove it
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Clear container content
        const container = mapRef.current;
        container.innerHTML = '';

        console.log('Creating map instance...');
        const map = window.L.map(container).setView([10.0, 105.0], 13);
        mapInstanceRef.current = map;
        
        console.log('Adding tile layer...');
        // Try a simple tile layer first
        const tileLayer = window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: ''
        });
        
        tileLayer.on('tileload', () => console.log('Fullscreen tile loaded'));
        tileLayer.on('tileerror', (e: any) => console.error('Fullscreen tile error:', e));
        
        tileLayer.addTo(map);
        console.log('Tile layer added to map');

        // Add search control
        const searchControl = window.L.control({ position: 'topright' });
        searchControl.onAdd = function(map) {
          const div = window.L.DomUtil.create('div', 'leaflet-control-search');
          div.innerHTML = `
            <div class="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-2xl border-2 border-white/30 backdrop-blur-sm">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Tìm kiếm vị trí..." 
                  class="px-3 py-2 bg-white/90 backdrop-blur-sm border border-white/50 rounded-lg text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                  style="width: 220px;"
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

        // Add back control
        const backControl = window.L.control({ position: 'topleft' });
        backControl.onAdd = function(map) {
          const div = window.L.DomUtil.create('div', 'leaflet-control-back');
          div.innerHTML = `
            <div class="p-3 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-xl shadow-2xl border-2 border-white/50 backdrop-blur-sm cursor-pointer hover:scale-110 transition-all duration-300">
              <svg class="w-7 h-7 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
          `;
          
          // Add click event to go back
          div.addEventListener('click', () => {
            navigate('/');
          });
          
          return div;
        };
        backControl.addTo(map);

        // Add some demo markers (without GPS server)
        const demoLocations = [
          { lat: 10.0452, lng: 105.7883, name: "Cần Thơ, Việt Nam" },
          { lat: 10.7626, lng: 106.6602, name: "Thành phố Hồ Chí Minh" },
          { lat: 21.0285, lng: 105.8542, name: "Hà Nội" },
          { lat: 16.0544, lng: 108.2022, name: "Đà Nẵng" },
          { lat: 13.7563, lng: 100.5018, name: "Bangkok, Thailand" },
          { lat: 1.3521, lng: 103.8198, name: "Singapore" }
        ];

        demoLocations.forEach((loc, index) => {
          const marker = window.L.marker([loc.lat, loc.lng]).addTo(map);
          marker.bindPopup(`<b>${loc.name}</b><br>Vĩ độ: ${loc.lat}<br>Kinh độ: ${loc.lng}`);
        });

        console.log('Fullscreen map initialized successfully');
        console.log('Map container dimensions:', {
          width: container.offsetWidth,
          height: container.offsetHeight,
          clientWidth: container.clientWidth,
          clientHeight: container.clientHeight
        });

        // Force resize after a delay
        setTimeout(() => {
          if (map && map.invalidateSize) {
            map.invalidateSize();
            console.log('Fullscreen map size invalidated');
          } else {
            console.error('Map or invalidateSize not available');
          }
        }, 1000);

      } catch (error) {
        console.error('Error initializing fullscreen map:', error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLeafletReady, navigate]);

  return (
    <div className="w-full h-screen bg-slate-900 relative">
      <div 
        ref={mapRef} 
        className="w-full h-full absolute inset-0"
        style={{ height: '100vh' }}
      />
    </div>
  );
}
