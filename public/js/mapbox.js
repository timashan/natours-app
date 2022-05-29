export const createMap = locations => {
  const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
  mapboxgl.accessToken =
    'pk.eyJ1IjoidGltYXNoYW4iLCJhIjoiY2wzMnUwbnQ3MGVreDNjcWp0MzhoZ3ZzeSJ9.9NBHElcEBsIXA0vwNcGwgQ';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/timashan/cl32xy5hx004d14nukc30iu3y',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day: ${loc.day} ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: { top: 200, bottom: 150, left: 100, right: 100 },
  });
};
