import { StyleSheet, Text, View } from "react-native";

import React from "react";

export default function TripMap() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Map of Trip</Text>
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
});
