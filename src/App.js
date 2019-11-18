import React, { useEffect, useState } from 'react';
import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import styled from 'styled-components';
import L from 'leaflet';
import axios from 'axios';
import './App.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapContainer = styled(Map)`
    width: 100%;
    height: 100vh;
    position:absolute;
    top:0px;
    left:0px;
`;

const App = () => {
  const [trains, setTrains] = useState([]);

  const getDateString = () => {
    const date = new Date();

    const year = date.getFullYear();

    let month = date.getMonth() + 1;
    if (month < 10) month = "0"+ month;

    let day = date.getDate();
    if (day < 10) day = "0" + day;

    return `${year}-${month}-${day}`;
  }

  const fetchTrains = async () => {
    const date = getDateString();

    const trains = await axios.get('https://rata.digitraffic.fi/api/v1/train-locations/latest/');
    const trainInfo = await axios.get(`https://rata.digitraffic.fi/api/v1/trains/${date}/`);

    const trainsWithType = trains.data.map(t => {
      const train = trainInfo.data.find(tr => tr.trainNumber === t.trainNumber);

      const category = train ? train.trainCategory : 'Unknown';
      const commuter = train ? train.commuterLineID : null;
      const type = commuter === '' && train ? train.trainType : null;

      return {...t, category, commuter, type};
    })

    setTrains(trainsWithType);
  }

  const hook = () => {
    fetchTrains();
    setInterval(fetchTrains, 10000);
  }

  useEffect(hook, []);

  return(
    <div className='App'>
      <MapContainer center={[65, 26]} zoom={6}>
        <TileLayer
          url='https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a> Train data from Traffic Management Finland / digitraffic.fi, licence CC 4.0 BY'
          subdomains='abcd'
          maxZoom={19}    
        />
        {trains.filter(t => t.category).map(t => 
          <Marker key={t.trainNumber} position={t.location.coordinates.reverse()}>
            <Popup>
              {t.commuter || t.type} {t.trainNumber} {t.category}
              <br/>
              speed: {t.speed} km/h
            </Popup>
          </Marker>)}
      </MapContainer>
    </div>
  )  
}

export default App;