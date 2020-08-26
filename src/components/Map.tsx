import {CircleMarker, Map, Marker, Popup, TileLayer, Tooltip, Viewport} from "react-leaflet";
import Fab from "@material-ui/core/Fab";
import MyLocationIcon from "@material-ui/icons/MyLocation";
import L from 'leaflet';
import React, {useState} from "react";

const readableDistance = (dM : number) => {
    if(navigator.language === 'en-US') {
        const dF = dM * 3.28084;
        if(dF < 1000) {
            return dF + 'feet';
        } else {
            return new Intl.NumberFormat(navigator.language, { maximumSignificantDigits: 3 })
                .format(dF / 5280) + "mi";
        }
    } else {
        if(dM < 1000) {
            return dM + 'm';
        } else {
            return new Intl.NumberFormat(navigator.language, { maximumSignificantDigits: 3 })
                .format(dM / 1000) + "km";
        }
    }
}

export const MAX_ZOOM = 18;
export default ({currentPosition, locations}: {
    currentPosition: [number, number] | undefined,
    locations: any[]
}) => {
    const [viewport, setViewport] = useState<Viewport|undefined>();
    const myLocationViewport : Viewport|undefined = currentPosition && {center: currentPosition, zoom: MAX_ZOOM};
    const vp = viewport || myLocationViewport

    const me = currentPosition &&
      <CircleMarker center={{lat: currentPosition[0], lng: currentPosition[1]}} radius={5}/>

    const showMeButton = currentPosition &&
      <Fab color="primary"
           aria-label="go to my location"
           style={{position: 'absolute', top: 0, right: 15, zIndex: 999999999999}}
           onClick={() => setViewport(myLocationViewport)}>
        <MyLocationIcon/>
    </Fab>;
    return <Map viewport={vp} onViewportChanged={setViewport}>
        <TileLayer
            url={"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
        />
        {showMeButton}

        {me}
    </Map>;
};
