import React, {useEffect, useState} from 'react';
import Geosuggest from 'react-geosuggest';
import 'react-geosuggest/module/geosuggest.css'
import './App.css';
import Map from './components/Map'

const GEOLOCATION_UPDATE_FREQUENCY_MSEC = 1000;

function App() {
    const [location, setLocation] = useState();
    const [position, setPosition] = useState<google.maps.LatLng>();

    useEffect(() => {
        if (navigator.geolocation) {
            let lastUpdate = 0;
            navigator.geolocation.watchPosition((position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    if (!isNaN(longitude) && !isNaN(latitude)) {
                        const now = new Date().valueOf()
                        if (now - lastUpdate > GEOLOCATION_UPDATE_FREQUENCY_MSEC) {
                            setPosition(new google.maps.LatLng(latitude, longitude));
                            lastUpdate = now;
                        }
                    }
                },
                function error(msg) {
                    console.error('Geolocation error', msg.message);
                },
                {enableHighAccuracy: true});
        } else {
            // alert("Geolocation API is not supported in your browser.");
        }
    }, [])

    const currentPosition : [number, number] | undefined = position && [position.lat(), position.lng()]
    return <div className="App">
        <Geosuggest
            onSuggestSelect={(e) => setLocation(e)}
            location={position}
            radius={position && 100}
        />
        <p>
            {location && location.gmaps.icon && <img src={location.gmaps.icon} alt={""}/>}
            {location && location.gmaps.name}
        </p>
        <div className="mapContainer">
            <Map
                currentPosition={currentPosition}
                locations={[]}
            />
        </div>

    </div>;
}

export default App;
