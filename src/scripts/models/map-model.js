export class GeoMapManager {
    constructor() {
      this._map = null;
    }
  
    ensureLeaflet() {
      if (typeof window === 'undefined' || !window.L) {
        throw new Error('Leaflet is not available in the current environment.');
      }
      return window.L;
    }
  
    create(containerId, opts = {}) {
      const L = this.ensureLeaflet();
      const defaults = {
        center: [-2.5, 118],
        zoom: 4.5,
        zoomControl: true,
        ...opts,
      };
  
      this._map = L.map(containerId, defaults);
      return this._map;
    }
  
    addTiles(urlTemplate, options = {}, autoAdd = true) {
      const L = this.ensureLeaflet();
      const defaults = {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
        ...options,
      };
      const layer = L.tileLayer(urlTemplate, defaults);
      if (autoAdd && this._map) layer.addTo(this._map);
      return layer;
    }
  
    placeMarker(latlng, popupHtml = null, options = {}) {
      const L = this.ensureLeaflet();
      if (!this._map) throw new Error('Map instance not created');
      const marker = L.marker(latlng, options).addTo(this._map);
      if (popupHtml) marker.bindPopup(popupHtml);
      return marker;
    }
  
    createLayerGroup(autoAdd = true) {
      const L = this.ensureLeaflet();
      const group = L.layerGroup();
      if (autoAdd && this._map) group.addTo(this._map);
      return group;
    }
  
    addLayerSwitcher(baseLayers = {}, overlays = {}, opts = {}) {
      const L = this.ensureLeaflet();
      if (!this._map) throw new Error('No map instance');
      const defaultOpts = { collapsed: false, ...opts };
      return L.control.layers(baseLayers, overlays, defaultOpts).addTo(this._map);
    }
  
    destroy() {
      if (this._map) {
        this._map.remove();
        this._map = null;
      }
    }
  
    getInstance() {
      return this._map;
    }
  }
  