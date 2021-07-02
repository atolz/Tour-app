/*eslint-disable*/

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYXRvbHoiLCJhIjoiY2txMndtNDFoMG1scTJ3cGZvOWdyeXowaiJ9.gYs04xt1NPxJADT0Syc8Fg';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/atolz/ckq2xdbpg3vfz17n6prx69l5h',
    scrollZoom: false,
    //   center: [-118.113491, 34.111745],
    //   zoom: 4,
    //   interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // 1) Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // 2) Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // 3) Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setHTML(`<p>Day ${loc.day}: ${loc.description}<p>`)
      .addTo(map)
      .setLngLat(loc.coordinates);

    // 3) Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
