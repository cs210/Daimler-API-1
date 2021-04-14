import * as firebase from "firebase";

import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { findRegion, tripViewComponent } from "./TripViewer";

import db from "../firebase";
import moment from "moment";
import { useFocusEffect } from "@react-navigation/native";

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
    const user = firebase.auth().currentUser;
    tripsFromDatabase.forEach((trip) => {
      const tripData = trip.data();
      if (tripData.uid == user.uid) {
        tripData["id"] = trip.id;
        tripData["tripTitle"] = tripData.tripTitleText;
        parsedTrips.push(tripData);
      }
    });
    return parsedTrips;
  };

  const loadPastTrips = async () => {
    setLoading(true);
    setPastTrips([]);
    const collRef = db.collection("trips");
    const tripsFromDatabase = await collRef.orderBy("time", "desc").get();
    const parsedTrips = parseTripsFromDatabase(tripsFromDatabase);

    setPastTrips(parsedTrips);
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadPastTrips();
    }, [])
  );

  const pastTripComponent = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("Trip Overview", item)}
        style={styles.itemContainer}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.tripName}>{item.tripTitle}</Text>
          <Text>{moment(item.time).format("LLL")}</Text>
        </View>
        <View style={styles.tripCard}>
          {tripViewComponent(item.pins, findRegion(item.pins))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>
        {firebase.auth().currentUser.displayName ?? "My"} Past Trips
      </Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList data={pastTrips} renderItem={pastTripComponent} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 15,
    padding: 10,
  },
  header: {
    fontSize: 30,
    color: "#8275BD",
    fontWeight: "bold",
    margin: 10,
  },
  itemContainer: {
    elevation: 8,
    borderColor: "#00A398",
    borderWidth: 3,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 10,
  },
  tripName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  tripCard: {
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    margin: 5,
  },
});
