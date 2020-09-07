import React, {useEffect, useState} from 'react';
import Geosuggest, {Suggest} from 'react-geosuggest';
import 'react-geosuggest/module/geosuggest.css'
import {Auth0Provider} from "@auth0/auth0-react";
import './App.css';
import Map, {MAX_ZOOM} from './components/Map'
import {Viewport} from "react-leaflet";
import FaceSelect from "./components/FaceSelect";
import getDistance from "geolib/es/getDistance";
import {getAverageRating, saveRating} from "./services/server"
import LoginButton from './components/LoginButton.';

const GEOLOCATION_UPDATE_FREQUENCY_MSEC = 1000;
const SEARCH_RADIUS_METERS = 500;
// Maps to the 3 ratings values in FaceSelect
const RATING_INDEX = [0, 3, 5];

const googleToLeafletPair = (g: google.maps.LatLng): [number, number] => {
    return [g.lat(), g.lng()];
}
const leafletPairToGoogle = (pair: [number, number]): google.maps.LatLng => {
    return new google.maps.LatLng(pair[0], pair[1])
}


function suggestionToPlace(e: Suggest): google.maps.places.PlaceResult {
    // @ts-ignore
    return e.gmaps; // Despite the TS definition, it seems compatible with PlaceResult
}

type Rating = {
    rating: number;
}

function App() {
    const [location, setLoc] = useState<google.maps.places.PlaceResult>();
    const [currentPosition, setCurrentPosition] = useState<google.maps.LatLng>();
    const [nearbyPlaces, setNearbyPlaces] = useState<google.maps.places.PlaceResult[]>([]);
    const [viewport, setViewport] = useState<Viewport | undefined>();
    const [avgRating, setAvgRatingDirect] = useState<number>();
    const [myRating, setMyRating] = useState<number>();

    const setAvgRating = (rating: Rating) => {
        setAvgRatingDirect(rating.rating);
    }

    const saveUserRating = (location: string, rating: number) => {
        setMyRating(rating);
        saveRating(location, rating);
        getAverageRating(location).then(setAvgRating)
    }

    const moveViewport = (vp: Viewport) => {
        if (vp.center) {
            const delta = viewport?.center
                ? getDistance(viewport?.center, vp.center)
                : Number.POSITIVE_INFINITY;
            // Reload if the distance is greater than 250 meters
            if (delta > 250) {
                findNearbyPlaces(leafletPairToGoogle(vp.center));
            }
        }
        setViewport(vp);
    }

    const setLocation = (loc: google.maps.places.PlaceResult) => {
        if (loc.place_id) {
            getAverageRating(loc.place_id).then(setAvgRating);
        }
        if (loc.geometry?.location) {
            const vp = {center: googleToLeafletPair(loc.geometry?.location), zoom: MAX_ZOOM};
            moveViewport(vp)
        }
        if (!nearbyPlaces.find(place => place.place_id === loc.place_id)) {
            setNearbyPlaces([...nearbyPlaces, loc])
        }
        setLoc(loc);
    }

    const findNearbyPlaces = (location: google.maps.LatLng) => {
        if (location) {
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
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                setNearbyPlaces(result)
            } else {
                console.error('Could not find nearby places', status)
            }
        }

    return (
        <Auth0Provider
            domain="cocora.us.auth0.com"
            clientId="bF7uqtoRKckWUBcn8kSFxqqCAYsZW92g"
            redirectUri={window.location.origin}
        >
            <div className="App">
                <div className="Header">
                    <Geosuggest
                        onSuggestSelect={(e) => setLocation(suggestionToPlace(e))}
                        location={currentPosition}
                        radius={currentPosition && 100}
                    />
                    <LoginButton/>
                </div>
                {location?.place_id && <div className="locationBar">
                    {location.icon && <img src={location.icon} alt={""} height="30"/>}
                    <span>{location.name}</span>
                    {typeof avgRating === 'number' ? <span>Average rating: {avgRating}</span> : null}
                    <span>Your rating:</span>
                    <FaceSelect
                        current={myRating && RATING_INDEX.indexOf(myRating) < 0 ? undefined : RATING_INDEX.indexOf(myRating!)}
                        onSelect={(rating) => saveUserRating(location.place_id!, RATING_INDEX[rating])}/>
                </div>}
                <div className="mapContainer">
                    <Map
                        currentPosition={currentPosition && [currentPosition.lat(), currentPosition.lng()]}
                        locations={nearbyPlaces}
                        setLocation={setLocation}
                        viewport={viewport}
                        setViewport={moveViewport}
                    />
                </div>

            </div>
        </Auth0Provider>);
}

export default App;
