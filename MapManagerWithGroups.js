import L from 'leaflet';
import 'leaflet-routing-machine';

export class LeafletMap {
  constructor(mapId, options = {}) {
    this.mapId = mapId;
    this.options = {
      center: [14.5995, 120.9842],
      zoom: 13,
      tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ...options,
    };

    this.map = null;
    this.markerGroups = {}; // Now storing by type
    this.routingControl = null;
    this.userMarker = null;
    this.lastUserLocation = null;
  }

  init() {
    this.map = L.map(this.mapId).setView(this.options.center, this.options.zoom);

    L.tileLayer(this.options.tileUrl, {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    return this;
  }

  // Add a marker into a specific group (e.g., 'shuttle', 'stop', etc.)
  addMarker({ lat, lng, icon = null, popup = '', group = 'default' }) {
    const marker = L.marker([lat, lng], icon ? { icon } : undefined).addTo(this.map);
    if (popup) marker.bindPopup(popup);

    if (!this.markerGroups[group]) {
      this.markerGroups[group] = [];
    }

    this.markerGroups[group].push(marker);
    return marker;
  }

  // Remove markers from a specific group or all groups
  clearMarkers(group = null) {
    if (group) {
      this.markerGroups[group]?.forEach(marker => this.map.removeLayer(marker));
      this.markerGroups[group] = [];
    } else {
      for (const key in this.markerGroups) {
        this.markerGroups[key].forEach(marker => this.map.removeLayer(marker));
        this.markerGroups[key] = [];
      }
    }
  }

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

  enableUserLocation(callback, { centerOnce = true } = {}) {
    let hasCentered = false;

    this.map.locate({ watch: true, enableHighAccuracy: true });

    this.map.on('locationfound', e => {
      const latlng = e.latlng;
      this.lastUserLocation = latlng;

      if (!this.userMarker) {
        this.userMarker = L.marker(latlng).addTo(this.map);
      } else {
        this.userMarker.setLatLng(latlng);
      }

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

  centerToUser() {
    if (this.lastUserLocation) {
      this.map.setView(this.lastUserLocation, this.map.getZoom());
    }
  }

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
    this.markerGroups = {};
  }
}
