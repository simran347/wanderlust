
const mapContainer = document.getElementById("map");
const validCoordinates = Array.isArray(coordinates)
    && coordinates.length === 2
    && coordinates.every(Number.isFinite);

if (!mapToken || !validCoordinates) {
    const reason = !mapToken ? "Mapbox token is missing." : "Listing coordinates are missing or invalid.";
    console.error(reason);
    mapContainer.textContent = reason;
} else {
    mapboxgl.accessToken = mapToken;

    const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v12",
        center: coordinates,
        zoom: 9
    });

    const marker = new mapboxgl.Marker({ color: "red" })
        .setLngLat(coordinates)
        .setPopup(new mapboxgl.Popup({offset: 25} )).setHTML("<h1>Hello World!</h1>")
        .addTo(map);

    // const marker = new mapboxgl.Marker({ color:"red" })
    //     .setLngLat(coordinates)
    //     .setPopup(new)
    //     .setHTML("<h1>Hello World!</h1>")
    //     .setMaxWidth("300px")
    //     .addTo(map);
}
