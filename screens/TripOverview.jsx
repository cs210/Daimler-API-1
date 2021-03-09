import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";

export default function TripOverview({ navigation, route }) {
  const pastTripComponent = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => console.log(item)}
        style={styles.itemContainer}
      >
        {item.title ? (
          <Text style={styles.pinHeader}>{item.title}</Text>
        ) : (
          <Text style={styles.pinHeader}>Pinned Stop</Text>
        )}

        <Text style={styles.pinText}>Latitude: {item.coordinate.latitude}</Text>
        <Text style={styles.pinText}>
          Longitude: {item.coordinate.longitude}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Trip Overview</Text>
      <Text style={styles.title}>Stops along the way:</Text>
      {route.params["trip0"].length > 0 && (
        <FlatList data={route.params["trip0"]} renderItem={pastTripComponent} />
      )}
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
  title: {
    fontSize: 20,
    color: "#8275BD",
    margin: 10,
  },
  pinHeader: {
    fontSize: 15,
    fontWeight: "bold",
  },
  pinText: {
    fontSize: 15,
  },
  itemContainer: {
    elevation: 8,
    // backgroundColor: "#00A398",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 10,
    borderColor: "#00A398",
    borderWidth: 5,
  },
});
