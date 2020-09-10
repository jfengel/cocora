import React, {useEffect, useState} from 'react';
import Geosuggest, {Suggest} from 'react-geosuggest';
import 'react-geosuggest/module/geosuggest.css'
import {useAuth0} from "@auth0/auth0-react";
import './App.css';
import Map, {MAX_ZOOM} from './components/Map'
import {Viewport} from "react-leaflet";
import getDistance from "geolib/es/getDistance";
import {getAverageRating, saveRating} from "./services/server"
import LoginButton from './components/LoginButton.';
import LocationBar from "./components/LocationBar";

const GEOLOCATION_UPDATE_FREQUENCY_MSEC = 1000;
const SEARCH_RADIUS_METERS = 500;
// Maps to the 3 ratings values in FaceSelect
export const RATING_INDEX = [0, 3, 5];

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

export function closestLocation(places: google.maps.places.PlaceResult[], currentPosition: google.maps.LatLng) {
    return places.reduce((nearest, current) => {
        if (!nearest.geometry) {
            return current;
        }
        if (!current.geometry) {
            return nearest;
        }
        return getDistance(googleToLeafletPair(currentPosition), googleToLeafletPair(nearest.geometry.location))
        > getDistance(googleToLeafletPair(currentPosition), googleToLeafletPair(current.geometry.location))
            ? current
            : nearest
    })
}

function App() {
    const [location, setLocationDirect] = useState<google.maps.places.PlaceResult>();
    const [currentPosition, setCurrentPosition] = useState<google.maps.LatLng>();
    const [nearbyPlaces, setNearbyPlaces] = useState<google.maps.places.PlaceResult[]>([]);
    const [viewport, setViewport] = useState<Viewport | undefined>();
    const [avgRating, setAvgRatingDirect] = useState<number>();
    const [myRating, setMyRating] = useState<number>();

    const setAvgRating = (rating: Rating) => {
        setAvgRatingDirect(rating.rating);
    }

    const auth0 = useAuth0();
    const saveUserRating = async (location: string, rating: number) => {
        setMyRating(rating)
        try {
            await saveRating(location, rating, auth0);
            getAverageRating(location).then(setAvgRating)
        } catch(error) {
            console.error(error);
            alert(JSON.stringify(error));
        }
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

    const setLocation = (loc: google.maps.places.PlaceResult, doNotUpdate = false) => {
        if(location && loc.place_id === location.place_id) {
            return;
        }
        if (loc.geometry?.location) {
            const vp = {center: googleToLeafletPair(loc.geometry?.location), zoom: MAX_ZOOM};
            moveViewport(vp)
        }
        if (!doNotUpdate && !nearbyPlaces.find(place => place.place_id === loc.place_id)) {
            setNearbyPlaces([...nearbyPlaces, loc])
        }
        setLocationDirect(loc);
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
                            if(!currentPosition ) {
                                findNearbyPlaces(here);
                            }
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
    useEffect(() => {
        if(!location && currentPosition && nearbyPlaces && nearbyPlaces.length > 0) {
            const closest = closestLocation(nearbyPlaces, currentPosition);
            setLocationDirect(closest);
        }
    }, [nearbyPlaces, currentPosition, location])

    useEffect(() => {
        if(location && location.place_id) {
            getAverageRating(location.place_id).then(setAvgRating)
        }
    }, [location])

    return <div className="App">
        <div className="Header">
            <Geosuggest
                onSuggestSelect={(e) => setLocation(suggestionToPlace(e))}
                location={currentPosition}
                radius={currentPosition && 100}
            />
            <LoginButton/>
        </div>
        <LocationBar
            location={location}
            avgRating={avgRating}
            myRating={myRating}
            saveUserRating={saveUserRating}
        />
        <div className="mapContainer">
            <Map
                currentPosition={currentPosition && [currentPosition.lat(), currentPosition.lng()]}
                locations={nearbyPlaces}
                setLocation={setLocation}
                viewport={viewport}
                setViewport={moveViewport}
            />
        </div>
        <div style={{margin: "auto"}}>
            <a href="about.html">About Cocora</a>
        </div>

    </div>
}

export default App;
