import axios from 'axios'
import {
    $
} from './bling'
const mapOptions = {
    center: {
        lat: 48.597376,
        lng: 38.004726,
    },
    zoom: 14

}

function loadPlaces(map, lat = 48.597376, lng = 38.004726) {
    axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
        .then(resp => {
            const places = resp.data
            if (!places.length) {
                alert('no places found!')
                return
            }
            // create bounds
            const bounds = new google.maps.LatLngBounds()
            const infoWindow = new google.maps.InfoWindow()
            const markers = places.map(place => {
                const [placeLng, placeLat] = place.location.coordinates
                const position = {
                    lat: placeLat,
                    lng: placeLng
                }
                bounds.extend(position)
                const marker = new google.maps.Marker({
                    map,
                    position
                })
                marker.place = place
                return marker
            })
            // when someone click on a marker, show the detail of the place
            markers.forEach(marker => {
                marker.addListener('click', function () {
                    const html = `
                    <div class="popup">
                        <a href="/stores/${this.place.slug || 'store.png'}">
                            <img src="/uploads/${this.place.photo}" alt="${this.place.name}"
                            <p>
                          ${this.place.name}
                            </p>
                            <p>
                            ${this.place.location.address}
                            </p>
                        </a>
                    </div>
                    `
                    infoWindow.setContent(html)
                    infoWindow.open(map, this)
                })
            });

            // the zoom map to fit all the markers perfectly
            map.setCenter(bounds.getCenter())
            map.fitBounds(bounds)

        })
}

function makeMap(mapDiv) {
    if (!mapDiv) return
    // make our Map
    const map = new google.maps.Map(mapDiv, mapOptions)
    loadPlaces(map)
    const input = $('[name="geolocation"]')
    const autocomplete = new google.maps.places.Autocomplete(input)
    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        console.log(place);
        loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng());
    })
}
export default makeMap