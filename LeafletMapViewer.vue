import { onMounted, onUnmounted } from 'vue';
import { LeafletMap } from '@/leaflet/LeafletMap.js';

export default {
  props: ['pins', 'waypoints'],
  setup(props) {
    let mapInstance;

    onMounted(() => {
      mapInstance = new LeafletMap('map').init();

      props.pins?.forEach(pin => {
        mapInstance.addMarker(pin);
      });

      if (props.waypoints?.length > 1) {
        mapInstance.drawRoute(props.waypoints);
      }

      mapInstance.enableUserLocation((latlng, marker) => {
        console.log('User at:', latlng);
      }, { centerOnce: true });
    });

    onUnmounted(() => {
      mapInstance?.destroy();
    });

    return {
      centerToUser: () => mapInstance?.centerToUser()
    };
  }
};
