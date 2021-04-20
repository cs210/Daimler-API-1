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
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import db from "../firebase";
import moment from "moment";
import { useFocusEffect } from "@react-navigation/native";

/**
 * This component shows a profile which includes the number of followers
 * and people you are following. It also contains a list of all past trips
 * when user presses the "Profile" button from the tab bar. Clicking on
 * a past trip will take you to the trip overview.
 */
export default function PastTrips({ navigation, route }) {
  const { item } = route.params;
  const [loading, setLoading] = useState(false);
  const [notFollowing, setNotFollowing] = useState(false);
  const [pastTrips, setPastTrips] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const parseTripsFromDatabase = (tripsFromDatabase) => {
    const parsedTrips = [];
    const user = firebase.auth().currentUser;
    if (currentUser.data().following.includes(item.uid)) {
      tripsFromDatabase.forEach((trip) => {
        const tripData = trip.data();
        if (tripData.uid == item.uid) {
          tripData["id"] = trip.id;
          tripData["tripTitle"] = tripData.tripTitleText;
          parsedTrips.push(tripData);
        }
      });
    }
    return parsedTrips;
  };

  const loadPastTrips = async () => {
    setLoading(true);
    setPastTrips([]);
    const collRef = db.collection("trips");
    const tripsFromDatabase = await collRef.orderBy("time", "desc").get();
    const parsedTrips = parseTripsFromDatabase(tripsFromDatabase);
    if (parsedTrips.length == 0) {
      setNotFollowing(true);
    } else {
      setPastTrips(parsedTrips);
    }
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadPastTrips();
    }, [])
  );

  const getCurrentUser = () => {
    // db.collection("users").find({"uid": })
    console.log("get current user called");
    let uid = firebase.auth().currentUser.uid;
    const usersRef = firebase.firestore().collection("users");
    usersRef.doc(uid).onSnapshot((userDoc) => {
      setFollowers(userDoc.data()["followers"]);
      setFollowing(userDoc.data()["following"]);
    });
  };

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
      <View style={styles.row}>
        <Text style={styles.name}>
          {firebase.auth().currentUser.displayName}
        </Text>
        <MaterialCommunityIcons
          style={styles.icon}
          name="account-cog"
          color={"#808080"}
          size={34}
          onPress={() => navigation.navigate("Settings")}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.follow}>{followers.length} Followers</Text>
        <Text style={styles.follow}>{following.length} Following</Text>
      </View>
      <Text style={styles.header}>My Past Trips</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        {notFollowing ? (
          <Text>Locked</Text>
        ) : (
          <FlatList data={pastTrips} renderItem={pastTripComponent} />
        )}
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  row: {
    flexDirection: "row",
  },
  icon: {
    marginLeft: 20,
    marginTop: 15,
  },
  name: {
    fontSize: 35,
    color: "#8275BD",
    fontWeight: "bold",
    margin: 15,
    width: 300,
  },
  follow: {
    fontSize: 15,
    fontWeight: "bold",
    margin: 15,
  },
  header: {
    fontSize: 24,
    margin: 15,
    fontWeight: "bold",
  },
  itemContainer: {
    elevation: 8,
    borderColor: "#00A398",
    borderWidth: 3,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginVertical: 10,
  },
  tripName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  tripCard: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.4,
    paddingLeft: 10,
    paddingTop: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    margin: 5,
  },
});
