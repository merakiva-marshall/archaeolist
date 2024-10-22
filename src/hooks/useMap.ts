// src/hooks/useMap.ts

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { Site } from '../types/site'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

export const useMap = (container: React.RefObject<HTMLDivElement>, sites: Site[]) => {
  const map = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!container.current) return

    const newMap = new mapboxgl.Map({
      container: container.current,
      style: 'mapbox://styles/mschurtz/cm2dn5d2w001e01pfedqpddfu',
      center: [15, 40],
      zoom: 4
    })

    map.current = newMap

    return () => {
      newMap.remove()
    }
  }, [container])

  useEffect(() => {
    if (!map.current || sites.length === 0) return

    const addSourceAndLayers = () => {
      if (!map.current) return;
      
      // Remove existing layers and source if they exist
      ['clustered-points', 'unclustered-points'].forEach(layer => {
        if (map.current!.getLayer(layer)) map.current!.removeLayer(layer);
      });
      if (map.current.getSource('sites')) map.current.removeSource('sites');

      // Add new source with clustering enabled
      map.current.addSource('sites', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: sites.map(site => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: site.location
            },
            properties: { ...site }
          }))
        },
        cluster: true,
        clusterMaxZoom: 11,
        clusterRadius: 6
      });

      // Add a layer for clustered points (heatmap)
      map.current.addLayer({
        id: 'clustered-points',
        type: 'heatmap',
        source: 'sites',
        filter: ['has', 'point_count'],
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'point_count'],
            0, 0,
            10, 1
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2,
            12, 1
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(65,182,196,0)',
            0.1, 'rgba(65,182,196,0.5)',
            0.3, 'rgb(44,127,184)',
            0.5, 'rgb(33,102,172)',
            0.7, 'rgb(52,103,186)',
            1, 'rgb(31,76,148)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 15,
            9, 20
          ],
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7, 1,
            16, 0
          ],
        }
      });

      // Add a layer for unclustered points
      map.current.addLayer({
        id: 'unclustered-points',
        type: 'symbol',
        source: 'sites',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': 'archaeological-site',
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 0.3,
            22, 1
          ],
          'icon-allow-overlap': true
        }
      });
    }

    if (map.current.loaded()) {
      addSourceAndLayers();
    } else {
      map.current.on('load', addSourceAndLayers);
    }

    // Add custom icon
    map.current.loadImage(
      'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
      (error, image) => {
        if (error) throw error;
        if (image && map.current) {
          map.current.addImage('archaeological-site', image);
        }
      }
    );
  }, [sites])

  return map
}

export const useMapEventHandlers = (map: React.MutableRefObject<mapboxgl.Map | null>, onSiteClick: (site: Site) => void) => {
  useEffect(() => {
    if (!map.current) return

    const currentMap = map.current;

    const handleClusterClick = (e: mapboxgl.MapMouseEvent) => {
      const features = currentMap.queryRenderedFeatures(e.point, { layers: ['clustered-points'] });
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
      const features = currentMap.queryRenderedFeatures(e.point, { layers: ['unclustered-points'] });
      if (features.length > 0) {
        const properties = features[0].properties;
        const site: Site = {
          id: properties!.id,
          name: properties!.name,
          description: properties!.description,
          location: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
          address: properties!.address,
          period: properties!.period,
          features: properties!.features,
          country: properties!.country,
          country_slug: properties!.country_slug,
          slug: properties!.slug
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

    currentMap.on('click', 'clustered-points', handleClusterClick);
    currentMap.on('click', 'unclustered-points', handlePointClick);
    currentMap.on('mouseenter', 'clustered-points', handleMouseEnter);
    currentMap.on('mouseenter', 'unclustered-points', handleMouseEnter);
    currentMap.on('mouseleave', 'clustered-points', handleMouseLeave);
    currentMap.on('mouseleave', 'unclustered-points', handleMouseLeave);

    return () => {
      currentMap.off('click', 'clustered-points', handleClusterClick);
      currentMap.off('click', 'unclustered-points', handlePointClick);
      currentMap.off('mouseenter', 'clustered-points', handleMouseEnter);
      currentMap.off('mouseenter', 'unclustered-points', handleMouseEnter);
      currentMap.off('mouseleave', 'clustered-points', handleMouseLeave);
      currentMap.off('mouseleave', 'unclustered-points', handleMouseLeave);
    }
  }, [map, onSiteClick])
}