import { Dimensions, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from 'expo-location';
import React, { useState, useEffect } from 'react';
import * as TaskManager from 'expo-task-manager';

export default function TripMap() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const initialRegion = {latitude: 37.42773007993738,
  longitude: -122.16972973155477,
  latitudeDelta: 0.922,
  longitudeDelta: 0.922};
  const [region, setRegion] = useState(null);
  const [coordinates, setCoordinates] = useState([]);

 useEffect(() => {
    (async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let watchLocation = await Location.watchPositionAsync({
        accuracy:Location.Accuracy.High,
        timeInterval: 60000,
        distanceInterval: 10 // meters
      }, location => {
          setLocation(location);
          setRegion({latitude: location.coords.latitude,
             longitude: location.coords.longitude,
             latitudeDelta: 0.5,
             longitudeDelta: 0.5});
          let keys = {
             latitude : location.coords.latitude,
             longitude : location.coords.longitude
          }
          const newcoordinates = [...coordinates, keys]; //fix key
          setCoordinates(newcoordinates);
        }
      )
      setLocation(location);
      setRegion({latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5});
    })();
  }, []);

  const pins = [
    {
      latlng: { latitude: 37.42773007993738, longitude: -122.16972973155477 },
      title: "Stanford",
      description: "Started our road trip 🎉",
    },
    {
      latlng: { latitude: 37.872226652833305, longitude: -122.2585604834523 },
      title: "Berkeley",
      description: "Stopped here to visit friends ☺️",
    },
  ];
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Map of Trip</Text>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        region={region}
        showsUserLocation={true}
      >
        {pins.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.latlng}
            title={marker.title}
            description={marker.description}
          />
        ))}
        <Polyline
          coordinates={[
            { latitude: 37.42773007993738, longitude: -122.16972973155477 },
            { latitude: 37.3688, longitude: -122.0363 },
            { latitude: 37.4323, longitude: -121.8996 },
            { latitude: 37.5485, longitude: -121.9886 },
            { latitude: 37.6688, longitude: -122.0810 },
            { latitude: 37.8044, longitude: -122.2712 },
            { latitude: 37.872226652833305, longitude: -122.2585604834523 }
  		    ]}
          strokeColor="#FF0000"
		      strokeWidth={2}
        />
        <Polyline
          coordinates={coordinates}
          strokeColor="#FF0000"
		      strokeWidth={2}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-around",
    margin: 15,
  },
  header: {
    fontSize: 30,
    color: "#8275BD",
    fontWeight: "bold",
  },
  map: {
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.8,
  },
});
