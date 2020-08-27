import React, {useEffect, useRef, useState} from 'react';
import Geosuggest, {Suggest} from 'react-geosuggest';
import 'react-geosuggest/module/geosuggest.css'
import './App.css';
import Map, {MAX_ZOOM} from './components/Map'
import {Viewport} from "react-leaflet";
import FaceSelect from "./components/FaceSelect";

const GEOLOCATION_UPDATE_FREQUENCY_MSEC = 1000;
const SEARCH_RADIUS_METERS = 500;

const googleToLeafletPair = (g: google.maps.LatLng) : [number, number] => {
    return [g.lat(), g.lng()];
}


function suggestionToPlace(e: Suggest) : google.maps.places.PlaceResult {
    // @ts-ignore
    return e.gmaps; // Despite the TS definition, it seems compatible with PlaceResult
}

function App() {
    const [location, setLoc] = useState<google.maps.places.PlaceResult>();
    const [currentPosition, setCurrentPosition] = useState<google.maps.LatLng>();
    const [nearbyPlaces, setNearbyPlaces] = useState<google.maps.places.PlaceResult[]>([]);
    const [viewport, setViewport] = useState<Viewport | undefined>();
    const [rating, setRating] = useState<number | undefined>();

    const positionRef = useRef(currentPosition);

    const setLocation = (loc : google.maps.places.PlaceResult) => {
        if(loc.geometry?.location) {
            const vp = {center: googleToLeafletPair(loc.geometry?.location), zoom: MAX_ZOOM};
            setViewport(vp)
        }
        if(!nearbyPlaces.find(place => place.place_id === loc.place_id)) {
            setNearbyPlaces([...nearbyPlaces, loc])
        }
        setLoc(loc);
    }

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

    return <div className="App">
        <Geosuggest
            onSuggestSelect={(e) => setLocation(suggestionToPlace(e))}
            location={currentPosition}
            radius={currentPosition && 100}
        />
        <p>
            {location && location.icon && <img src={location.icon} alt={""}/>}
            {location && location.name}
            <FaceSelect
                current={rating}
                onSelect={setRating}/>
        </p>
        <div className="mapContainer">
            <Map
                currentPosition={currentPosition && [currentPosition.lat(), currentPosition.lng()]}
                locations={nearbyPlaces}
                setLocation={setLocation}
                viewport={viewport}
                setViewport={setViewport}
            />
        </div>

    </div>;
}

export default App;
