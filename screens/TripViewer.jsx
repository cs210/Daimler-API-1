import React from "react";
import {Dimensions, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

export default function TripView({ navigation, route }) {

  const { pins, tripTitle } = route.params;

  const findRegion = (pins) => {
    let minLatitude = 90;
    let maxLatitude = -90;
    let minLongitude = 180;
    let maxLongitude = -180;
    for (let pin of pins) {
      let { latitude, longitude } = pin.coordinate;
      minLatitude = Math.min(minLatitude, latitude);
      maxLatitude = Math.max(maxLatitude, latitude);
      minLongitude = Math.min(minLongitude, longitude);
      maxLongitude = Math.max(maxLongitude, longitude);
    }
    return { 
      latitude: (minLatitude + maxLatitude) / 2, 
      longitude: (minLongitude + maxLongitude) / 2,
      latitudeDelta: (maxLatitude - minLatitude) * 1.2,
      longitudeDelta: (maxLongitude - minLongitude)* 1.2,
    }
  }

  const region = findRegion(pins);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Map of Trip</Text>
      <Text style={styles.title}>Viewing trip: {tripTitle}</Text>
      <MapView 
        style={styles.map} 
        initialRegion={region}
      >
        {pins.map((pin, idx) => 
          <Marker
            key={idx}
            coordinate={pin.coordinate}
          />
        )}
        <Polyline 
          strokeColor="#FF0000"
          strokeWidth={2}
          coordinates={pins.map((pin) => ({
            latitude: pin.coordinate.latitude,
            longitude: pin.coordinate.longitude,
          }))}
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
    justifyContent: "flex-start",
    margin: 15,
  },
  header: {
    fontSize: 30,
    color: "#8275BD",
    fontWeight: "bold",
  },
  title: {
    fontSize: 20,
    color: "#8275BD",
    margin: 10,
  },
  map: {
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.7,
  },

});