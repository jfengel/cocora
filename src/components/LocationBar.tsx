import React from 'react';
import FaceSelect from "./FaceSelect";
import {RATING_INDEX} from '../App'
import {useAuth0} from "@auth0/auth0-react";
export default ({location, avgRating, myRating, saveUserRating} :
    {location? : google.maps.places.PlaceResult,
    avgRating? : number,
    myRating? : number,
    saveUserRating : (location : string, rating : number) => void}) => {
    if(!location) {
        return <div className="locationBar"/>
    }

    const auth0 = useAuth0();
    return <div className="locationBar">
        {location.icon && <img src={location.icon} alt={""} height="30"/>}
        <span>{location.name}</span>
        {typeof avgRating === 'number' ? <span>Average rating: {avgRating}/5</span> : null}
        <span>Your rating:</span>
            {auth0.isAuthenticated
                ? <FaceSelect
                    current={myRating && RATING_INDEX.indexOf(myRating) < 0 ? undefined : RATING_INDEX.indexOf(myRating!)}
                onSelect={(rating) => saveUserRating(location.place_id!, RATING_INDEX[rating])}/>
            : <span>Log in to rate this place</span>

            }
            </div>
}
