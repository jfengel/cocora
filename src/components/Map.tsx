import {CircleMarker, Map, Marker, Popup, TileLayer, Tooltip, Viewport} from "react-leaflet";
// @ts-ignore
import Fab from '@material-ui/core/Fab';
import MyLocationIcon from '@material-ui/icons/MyLocation';
import L, {LatLng} from 'leaflet';
import React from "react";

const googleToLeaflet = (g: google.maps.LatLng) => {
    return new LatLng(g.lat(), g.lng());
}

export const MAX_ZOOM = 18;
export default ({currentPosition, locations, setLocation, viewport, setViewport}: {
    currentPosition: [number, number] | undefined,
    locations: google.maps.places.PlaceResult[] | undefined,
    setLocation: (place : google.maps.places.PlaceResult) => void,
    viewport?: Viewport,
    setViewport: (v : Viewport) => void,
}) => {
    const myLocationViewport: Viewport | undefined = currentPosition && {center: currentPosition, zoom: MAX_ZOOM};
    const vp = viewport || myLocationViewport

    const me = currentPosition &&
        <CircleMarker center={{lat: currentPosition[0], lng: currentPosition[1]}} radius={5}/>

    const showMeButton = currentPosition &&
        <Fab color="primary"
             aria-label="go to my location"
             style={{position: 'absolute', top: 0, right: 15, zIndex: 999999999999}}
             onClick={() => setViewport(myLocationViewport!)}>
            <MyLocationIcon/>
        </Fab>;

    const siteMarkers = locations && locations
        .filter(feature => feature.geometry)
        .map((feature, i) =>
            <Marker key={i}
                    onclick={() => setLocation(feature)}
                    position={googleToLeaflet(feature.geometry!.location)}
                    icon={!feature.icon ? undefined
                        : new L.Icon({
                            iconUrl: feature.icon,
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                        })
                    }>
                <Tooltip permanent>
                    {feature.name}
                </Tooltip>
                <Popup
                    autoPan={false /* https://github.com/PaulLeCam/react-leaflet/issues/647 */}
                >
                    <b>{feature.name}</b>
                </Popup>
            </Marker>
        )


    return <Map viewport={vp} onViewportChanged={setViewport}>
        <TileLayer
            url={"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
        />
        {showMeButton}
        {siteMarkers}
        {me}
    </Map>;
};
