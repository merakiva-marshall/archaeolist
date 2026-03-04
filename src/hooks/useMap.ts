// src/hooks/useMap.ts

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { Site } from '../types/site'
import {
  siteSourceConfig,
  layerOrder,
  getLayerConfig
} from '../lib/mapLayers'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

export const useMap = (container: React.RefObject<HTMLDivElement>, sites: Site[]) => {
  const map = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!container.current) return

    // Cleanup existing map if it exists
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    const newMap = new mapboxgl.Map({
      container: container.current,
      style: 'mapbox://styles/mschurtz/cm2dn5d2w001e01pfedqpddfu',
      center: [20, 40],
      zoom: 5,
      cooperativeGestures: true
    })

    map.current = newMap

    return () => {
      newMap.remove()
      map.current = null
    }
  }, [container])

  useEffect(() => {
    if (!map.current || sites.length === 0) return

    const addSourceAndLayers = () => {
      if (!map.current) return;

      // Remove existing layers and source if they exist
      layerOrder.forEach(layerId => {
        if (map.current!.getLayer(layerId)) {
          map.current!.removeLayer(layerId);
        }
      });

      if (map.current.getSource('sites')) {
        map.current.removeSource('sites');
      }

      const addData = () => {
        if (!map.current) return;

        // Add source with clustering enabled
        map.current.addSource('sites', {
          ...siteSourceConfig,
          data: {
            type: 'FeatureCollection',
            features: sites.map(site => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: site.location
              },
              properties: {
                id: site.id,
                name: site.name,
                description: site.description,
                short_description: site.short_description,
                location: JSON.stringify(site.location),
                country: site.country,
                country_slug: site.country_slug,
                slug: site.slug,
                address: site.address,
                images: JSON.stringify(site.images),
                wikipedia_url: site.wikipedia_url,
                is_unesco: site.is_unesco
              }
            }))
          }
        });

        // Add layers in correct order
        layerOrder.forEach(layerId => {
          map.current!.addLayer(getLayerConfig(layerId));
        });
      };

      // Load the custom marker image first, then add source + layers so the
      // symbol layer always finds the image ready (fixes race condition).
      if (map.current.hasImage('archaeological-site')) {
        addData();
      } else {
        map.current.loadImage(
          'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
          (error, image) => {
            if (error) throw error;
            if (image && map.current && !map.current.hasImage('archaeological-site')) {
              map.current.addImage('archaeological-site', image);
            }
            addData();
          }
        );
      }
    }

    if (map.current.loaded()) {
      addSourceAndLayers();
    } else {
      map.current.on('load', addSourceAndLayers);
    }
  }, [sites])

  return map
}

export const useMapEventHandlers = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  onSiteClick: (site: Site) => void
) => {
  useEffect(() => {
    if (!map.current) return

    const currentMap = map.current;

    const handleClusterClick = (e: mapboxgl.MapMouseEvent) => {
      const features = currentMap.queryRenderedFeatures(e.point, {
        layers: [layerOrder[0]] // clustered-points
      });
      const clusterId = features[0].properties?.cluster_id;
      const source = currentMap.getSource('sites') as mapboxgl.GeoJSONSource;

      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        currentMap.easeTo({
          center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
          zoom: zoom ?? Math.min(currentMap.getZoom() + 2, 22)
        });
      });
    }

    const handlePointClick = (e: mapboxgl.MapMouseEvent) => {
      const features = currentMap.queryRenderedFeatures(e.point, {
        layers: [layerOrder[1]] // unclustered-points
      });
      if (features.length > 0) {
        const properties = features[0].properties;
        if (!properties) return;

        const site: Site = {
          id: properties.id,
          name: properties.name,
          description: properties.description,
          short_description: properties.short_description,
          location: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
          country: properties.country,
          country_slug: properties.country_slug,
          slug: properties.slug,
          address: properties.address,
          images: typeof properties.images === 'string' ? JSON.parse(properties.images) : properties.images,
          wikipedia_url: properties.wikipedia_url,
          is_unesco: properties.is_unesco
        };

        onSiteClick(site);

        currentMap.flyTo({
          center: site.location,
          zoom: Math.min(Math.max(currentMap.getZoom() + 2, 10), 15),
          essential: true
        });
      }
    }

    const handleMouseEnter = () => {
      currentMap.getCanvas().style.cursor = 'pointer'
    }

    const handleMouseLeave = () => {
      currentMap.getCanvas().style.cursor = ''
    }

    currentMap.on('click', layerOrder[0], handleClusterClick);
    currentMap.on('click', layerOrder[1], handlePointClick);
    currentMap.on('mouseenter', layerOrder[0], handleMouseEnter);
    currentMap.on('mouseenter', layerOrder[1], handleMouseEnter);
    currentMap.on('mouseleave', layerOrder[0], handleMouseLeave);
    currentMap.on('mouseleave', layerOrder[1], handleMouseLeave);

    return () => {
      currentMap.off('click', layerOrder[0], handleClusterClick);
      currentMap.off('click', layerOrder[1], handlePointClick);
      currentMap.off('mouseenter', layerOrder[0], handleMouseEnter);
      currentMap.off('mouseenter', layerOrder[1], handleMouseEnter);
      currentMap.off('mouseleave', layerOrder[0], handleMouseLeave);
      currentMap.off('mouseleave', layerOrder[1], handleMouseLeave);
    }
  }, [map, onSiteClick])
}