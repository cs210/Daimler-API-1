import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import PastTrips from "./PastTrips";
import React from "react";
import TripMap from "./TripMap";

export const Home = ({ navigation }) => {
  const onPressStart = () => {
    console.log("pressed start trip");
    navigation.navigate("Trip Map");
  };
  const onPressView = () => {
    console.log("pressed view past trips");
    navigation.navigate("Past Trips");
  };
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Road Trip Buddy</Text>
      <TouchableOpacity
        onPress={onPressStart}
        style={styles.appButtonContainer}
      >
        <Text style={styles.appButtonText}>Start Trip</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPressView} style={styles.appButtonContainer}>
        <Text style={styles.appButtonText}>View Past Trips</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", //"#aeb8c1"
    alignItems: "center",
    justifyContent: "space-around",
    margin: 15,
  },
  header: {
    fontSize: 30,
    color: "#8275BD",
    fontWeight: "bold",
  },
  appButtonContainer: {
    elevation: 8,
    backgroundColor: "#00A398",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  appButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase",
  },
});
