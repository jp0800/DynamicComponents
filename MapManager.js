import L from 'leaflet';
import 'leaflet-routing-machine';

export class LeafletMap {
  constructor(mapId, options = {}) {
    this.mapId = mapId;
    this.options = {
      center: [14.5995, 120.9842], // Default to Manila
      zoom: 13,
      tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ...options,
    };

    this.map = null;
    this.markers = [];
    this.routingControl = null;
    this.userMarker = null;
    this.lastUserLocation = null;
  }

  // Initialize and render the map
  init() {
    this.map = L.map(this.mapId).setView(this.options.center, this.options.zoom);

    L.tileLayer(this.options.tileUrl, {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    return this;
  }

  // Add a marker with optional custom icon and popup
  addMarker({ lat, lng, icon = null, popup = '' }) {
    const marker = L.marker([lat, lng], icon ? { icon } : undefined).addTo(this.map);
    if (popup) marker.bindPopup(popup);
    this.markers.push(marker);
    return marker;
  }

  clearMarkers() {
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];
  }

  // Show route between multiple waypoints
  drawRoute(waypoints = []) {
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
    }

    if (waypoints.length < 2) return;

    this.routingControl = L.Routing.control({
      waypoints: waypoints.map(p => L.latLng(p.lat, p.lng)),
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
    }).addTo(this.map);
  }

  // Locate the user once, then track without re-centering
  enableUserLocation(callback, { centerOnce = true } = {}) {
    let hasCentered = false;

    this.map.locate({ watch: true, enableHighAccuracy: true });

    this.map.on('locationfound', e => {
      const latlng = e.latlng;
      this.lastUserLocation = latlng;

      // Add or update user marker
      if (!this.userMarker) {
        this.userMarker = L.marker(latlng).addTo(this.map);
      } else {
        this.userMarker.setLatLng(latlng);
      }

      // Center map only once
      if (centerOnce && !hasCentered) {
        this.map.setView(latlng, this.map.getZoom());
        hasCentered = true;
      }

      callback?.(latlng, this.userMarker);
    });

    this.map.on('locationerror', e => {
      console.error('Location error:', e.message);
    });
  }

  // Expose a manual recenter method
  centerToUser() {
    if (this.lastUserLocation) {
      this.map.setView(this.lastUserLocation, this.map.getZoom());
    }
  }

  // Clean up all map data
  destroy() {
    this.clearMarkers();
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
      this.routingControl = null;
    }
    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = null;
    }
    this.userMarker = null;
    this.lastUserLocation = null;
  }
}
