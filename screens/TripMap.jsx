import { Dimensions, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

import React from "react";

export default function TripMap() {
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
        initialRegion={{
          latitude: 37.42773007993738,
          longitude: -122.16972973155477,
          latitudeDelta: 0.922,
          longitudeDelta: 0.922,
        }}
      >
        {pins.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.latlng}
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
