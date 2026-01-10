import { useEffect } from 'react';

export function LeafletLoader() {
  useEffect(() => {
    // Load CSS with multiple fallbacks
    const loadCSS = () => {
      const cdns = [
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
        'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css',
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css'
      ];

      const tryLoadCSS = (index: number) => {
        if (index >= cdns.length) {
          console.error('Failed to load Leaflet CSS from all CDNs');
          return;
        }

        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = cdns[index];
        cssLink.onload = () => console.log(`Leaflet CSS loaded from: ${cdns[index]}`);
        cssLink.onerror = () => tryLoadCSS(index + 1);
        document.head.appendChild(cssLink);
      };

      tryLoadCSS(0);
    };

    // Load JS with multiple fallbacks
    const loadJS = () => {
      const cdns = [
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
        'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js',
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js'
      ];

      const tryLoadJS = (index: number) => {
        if (index >= cdns.length) {
          console.error('Failed to load Leaflet JS from all CDNs');
          return;
        }

        const script = document.createElement('script');
        script.src = cdns[index];
        script.onload = () => {
          console.log(`Leaflet JS loaded from: ${cdns[index]}`);
          // Add window.L check
          if ((window as any).L) {
            console.log('Leaflet is available on window.L');
          }
        };
        script.onerror = () => tryLoadJS(index + 1);
        document.head.appendChild(script);
      };

      tryLoadJS(0);
    };

    loadCSS();
    loadJS();

    return () => {
      // Cleanup is optional for CDN resources
    };
  }, []);

  return null;
}
