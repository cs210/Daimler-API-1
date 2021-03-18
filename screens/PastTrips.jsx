import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";

import db from "../firebase";

/**
 * This component shows a list of all past trips when user presses the "Past Trip"
 * button from the home screen. Clicking on a past trip will take you to the trip
 * overview.
 */
export default function PastTrips({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [pastTrips, setPastTrips] = useState([]);

  const parseTripsFromDatabase = (tripsFromDatabase) => {
    const parsedTrips = [];
    tripsFromDatabase.forEach((trip) => {
      const tripData = trip.data();
      console.log("tripData", tripData);
      tripData["id"] = trip.id;
      tripData["tripTitle"] = tripData.tripTitleText;
      parsedTrips.push(tripData);
    });
    return parsedTrips;
  };

  const loadPastTrips = async () => {
    setLoading(true);
    setPastTrips([]);
    const collRef = db.collection("trips");
    const tripsFromDatabase = await collRef.get();
    const parsedTrips = parseTripsFromDatabase(tripsFromDatabase);
    setPastTrips(parsedTrips);
    setLoading(false);
  };

  useEffect(() => {
    loadPastTrips();
  }, []);

  const pastTripComponent = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("Trip Overview", item)}
        style={styles.itemContainer}
      >
        <Text>Trip Name: {item.tripTitle}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Past Trips</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList data={pastTrips} renderItem={pastTripComponent} />
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
  itemContainer: {
    elevation: 8,
    backgroundColor: "#00A398",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 4,
  },
});
