import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import {closestLocation} from "./App";

test('renders the app', () => {
  render(<App />);
});

const LatLng = (lat : number, lng : number) => ({
  equals: () => false,
  lat: () => (lat),
  lng: () => (lng),
  toString: () => JSON.stringify({lat, lng}),
  toUrlValue: () => "",
  toJSON: () => ({lat, lng}),
})

test('locates closest place', () => {
const currentLocation = LatLng(55.1071655, -55.87991812500002)
const places = [{"lat":55.0992752,"lng":-55.8483061},{"lat":55.108713,"lng":-55.878328},{"lat":55.1080593,"lng":-55.88349860000001},{"lat":55.105527,"lng":-55.88113799999999},{"lat":55.10381080000001,"lng":-55.87918309999999},{"lat":55.10869699999999,"lng":-55.87621299999999},{"lat":55.104311,"lng":-55.88472399999999},{"lat":55.1067295,"lng":-55.8805627},{"lat":55.1106319,"lng":-55.8812262},{"lat":55.105009,"lng":-55.882358},{"lat":55.1046796,"lng":-55.88261539999999},{"lat":55.108713,"lng":-55.878328},{"lat":55.10419269999999,"lng":-55.8816238},{"lat":55.10636460000001,"lng":-55.8770862},{"lat":55.104511,"lng":-55.88429699999999},{"lat":55.10480039999999,"lng":-55.8833784},{"lat":55.1036823,"lng":-55.8808926},{"lat":55.10388349999999,"lng":-55.88270279999999},{"lat":55.10436869999999,"lng":-55.8836261},{"lat":55.1012195,"lng":-55.8996964}]
    .map(p => ({name : p.toString(), geometry : {location: LatLng(p.lat, p.lng), viewport : {}}}))
  // @ts-ignore
  const closest = closestLocation(places, currentLocation)
  expect(closest.geometry?.location.lat()).toBeCloseTo(55.1067295, 7);
  expect(closest.geometry?.location.lng()).toBeCloseTo(-55.8805627, 7);


})
