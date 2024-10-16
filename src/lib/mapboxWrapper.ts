// src/app/lib/mapboxWrapper.ts

import mapboxgl from 'mapbox-gl';

class MapboxWrapper {
  private map: mapboxgl.Map | null = null;
  private container: HTMLElement | null = null;
  private initializedPromise: Promise<void>;
  private resolveInitialized: (() => void) | null = null;

  constructor() {
    this.initializedPromise = new Promise((resolve) => {
      this.resolveInitialized = resolve;
    });
  }

  async initialize(container: HTMLElement, options: Omit<mapboxgl.MapOptions, 'container'>) {
    if (this.map) return;

    this.container = container;
    this.map = new mapboxgl.Map({
      container: this.container,
      ...options
    });

    await new Promise<void>((resolve) => {
      this.map!.on('load', () => resolve());
    });

    if (this.resolveInitialized) {
      this.resolveInitialized();
    }
  }

  async getMap(): Promise<mapboxgl.Map> {
    await this.initializedPromise;
    return this.map!;
  }

  async remove() {
    await this.initializedPromise;
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}

export const mapboxWrapper = new MapboxWrapper();