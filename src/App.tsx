import React, {useEffect, useRef, useState} from 'react';
import Geosuggest from 'react-geosuggest';
import 'react-geosuggest/module/geosuggest.css'
import './App.css';
import Map from './components/Map'

const GEOLOCATION_UPDATE_FREQUENCY_MSEC = 1000;
const SEARCH_RADIUS_METERS = 500;

function App() {
    const [location, setLocation] = useState();
    const [currentPosition, setCurrentPosition] = useState<google.maps.LatLng>();
    const [nearbyPlaces, setNearbyPlaces] = useState<google.maps.places.PlaceResult[]>([]);
    const positionRef = useRef(currentPosition);

    const findNearbyPlaces = (current : google.maps.LatLng) => {
        const location = current || positionRef.current;
        if (location) {
            console.info("Looking for nearby things at", location);
            const placesService = new google.maps.places.PlacesService(document.createElement('div'));
            placesService.nearbySearch({
                location,
                radius: SEARCH_RADIUS_METERS,
                // rankBy: google.maps.places.RankBy.DISTANCE
            }, callback);
        }
    }

    useEffect(() => {
        if (navigator.geolocation) {
            let lastUpdate = 0;
            navigator.geolocation.watchPosition((position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    if (!isNaN(longitude) && !isNaN(latitude)) {
                        const now = new Date().valueOf()
                        if (now - lastUpdate > GEOLOCATION_UPDATE_FREQUENCY_MSEC) {
                            // TODO also set a minimum update distance
                            const here = new google.maps.LatLng(latitude, longitude);
                            setCurrentPosition(here);
                            lastUpdate = now;
                            if(!positionRef.current) {
                                findNearbyPlaces(here);
                            }
                            positionRef.current = here;
                        }
                    }
                },
                function error(msg) {
                    console.error('Geolocation error', msg.message);
                },
                {enableHighAccuracy: false});
        } else {
            // alert("Geolocation API is not supported in your browser.");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const callback: (results: google.maps.places.PlaceResult[],
                     status: google.maps.places.PlacesServiceStatus) => void =
        (result, status) => {
            if(status === google.maps.places.PlacesServiceStatus.OK) {
                setNearbyPlaces(result)
            } else {
                console.error('Could not find nearby places', status)
            }
        }

    useEffect(() => {
        setInterval(findNearbyPlaces, 30000)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return <div className="App">
        <Geosuggest
            onSuggestSelect={(e) => setLocation(e)}
            location={currentPosition}
            radius={currentPosition && 100}
        />
        <p>
            {location && location.gmaps.icon && <img src={location.gmaps.icon} alt={""}/>}
            {location && location.gmaps.name}
        </p>
        <ul>
            {nearbyPlaces
                .filter((_, i) => i < 4)
                .map((place, i) => <li key={i}>{place.name}</li>)}
        </ul>
        <div className="mapContainer">
            <Map
                currentPosition={currentPosition && [currentPosition.lat(), currentPosition.lng()]}
                locations={[]}
            />
        </div>

    </div>;
}

export default App;
