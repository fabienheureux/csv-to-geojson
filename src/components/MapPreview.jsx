import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Box } from '@radix-ui/themes';

export function MapPreview({ geojson }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!geojson || !mapContainer.current) return;

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [0, 0],
      zoom: 1
    });

    map.current.on('load', () => {
      // Add GeoJSON source
      map.current.addSource('points', {
        type: 'geojson',
        data: geojson
      });

      // Add circle layer for points
      map.current.addLayer({
        id: 'points-circle',
        type: 'circle',
        source: 'points',
        paint: {
          'circle-radius': 8,
          'circle-color': '#8b5cf6',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Add hover effect
      map.current.on('mouseenter', 'points-circle', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'points-circle', () => {
        map.current.getCanvas().style.cursor = '';
      });

      // Add popup on click
      map.current.on('click', 'points-circle', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const properties = e.features[0].properties;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Create popup content
        let popupContent = '<div style="font-family: sans-serif; font-size: 12px;">';
        for (const [key, value] of Object.entries(properties)) {
          popupContent += `<div style="margin: 4px 0;"><strong>${key}:</strong> ${value}</div>`;
        }
        popupContent += '</div>';

        new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(popupContent)
          .addTo(map.current);
      });

      // Fit bounds to show all points
      if (geojson.features.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        geojson.features.forEach((feature) => {
          bounds.extend(feature.geometry.coordinates);
        });
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
      }
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [geojson]);

  return (
    <Box
      ref={mapContainer}
      style={{
        width: '100%',
        height: '500px',
        borderRadius: 'var(--radius-3)',
        overflow: 'hidden'
      }}
    />
  );
}
