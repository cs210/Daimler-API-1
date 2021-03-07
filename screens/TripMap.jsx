import { Dimensions, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from 'expo-location';
import React, { useState, useEffect } from 'react';

export default function TripMap() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const initialRegion = {latitude: 37.42773007993738,
  longitude: -122.16972973155477,
  latitudeDelta: 0.922,
  longitudeDelta: 0.922};
  const [region, setRegion] = useState(null);
  const [pins, setPins] = useState([]); 

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setRegion({latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5});
    })();
  }, []);

  const onMapPress = (e) => {
    const newpins = [...pins, {
      key: pins.length, 
      coordinate: e.nativeEvent.coordinate}]; //fix key
    setPins(newpins);
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Map of Trip</Text>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        region={region}
        showsUserLocation={true}
        onLongPress={onMapPress}
      >
        {pins.map(marker => (
          <Marker
            key={marker.key}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
          />
        ))}
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
