import * as firebase from "firebase";

import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState, useEffect } from "react";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import db from "../firebase";
import PastTripCard from "./PastTripCard";

/**
 * This component shows a profile which includes the number of followers
 * and people you are following. It also contains a list of all past trips
 * when user presses the "Profile" button from the tab bar. Clicking on
 * a past trip will take you to the trip overview.
 */
export default function PastTrips({ navigation, route }) {
  const { item } = route.params;
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingRequested, setIsFollowingRequested] = useState(false);
  const [pastTrips, setPastTrips] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
  const [buttonText, setButtonText] = useState("Follow");
  const displayName = item.displayName;
  const myUid = firebase.auth().currentUser.uid;
  const theirUid = item.uid;

  useEffect(() => {
    loadPastTrips();
    loadUserData();
  }, []);

  const loadPastTrips = async () => {
    setLoading(true);
    const tripsFromDatabase = await db.collection("trips")
      .where("uid", "==", theirUid)
      .orderBy("time", "desc")
      .get();
    const parsedTrips = parseTripsFromDatabase(tripsFromDatabase);
    setPastTrips(parsedTrips);
    setLoading(false);
  };

  const parseTripsFromDatabase = (tripsFromDatabase) => {
    const parsedTrips = [];
    tripsFromDatabase.forEach((trip) => {
      const tripData = trip.data();
      tripData["id"] = trip.id;
      tripData["tripTitle"] = tripData.tripTitleText;
      parsedTrips.push(tripData);
    });
    return parsedTrips;
  };

  const loadUserData = async () => {
    const userDoc = await db.collection("users").doc(theirUid).get();
    const userData = userDoc.data();
    setFollowers(userData["followers"]);
    setFollowing(userData["following"]);
    setProfilePic(userData["profilePicture"]);
    setIsFollowing(userData["followers"].includes(myUid));
    if (userData["followerRequests"].includes(myUid)) {
      setIsFollowingRequested(true);
      setButtonText("Requested");
    }
  };

  const onUnfollowUser = async () => {
    const myRef = firebase.firestore().collection("users").doc(myUid);
    const theirRef = firebase.firestore().collection("users").doc(theirUid);
    const myRes = myRef.update({
      following: firebase.firestore.FieldValue.arrayRemove(theirUid),
    });
    const theirRes = theirRef.update({
      followers: firebase.firestore.FieldValue.arrayRemove(myUid),
    });
    Promise.all([myRes, theirRes])
      .then(() => setIsFollowing(false))
      .catch((error) => alert(error));
  };

  const onRequestUser = async () => {
    const myRef = firebase.firestore().collection("users").doc(myUid);
    const theirRef = firebase.firestore().collection("users").doc(theirUid);
    if (buttonText == "Requested") {
      const myRes = myRef.update({
        followingRequests: firebase.firestore.FieldValue.arrayRemove(theirUid),
      });
      const theirRes = theirRef.update({
        followerRequests: firebase.firestore.FieldValue.arrayRemove(myUid),
      });
      Promise.all([myRes, theirRes])
        .then(() => setIsFollowingRequested(false))
        .catch((error) => alert(error));
      setButtonText("Follow");
    } else {
      const myRes = myRef.update({
        followingRequests: firebase.firestore.FieldValue.arrayUnion(theirUid),
      });
      const theirRes = theirRef.update({
        followerRequests: firebase.firestore.FieldValue.arrayUnion(myUid),
      });
      Promise.all([myRes, theirRes])
        .then(() => setIsFollowingRequested(true))
        .catch((error) => alert(error));
      setButtonText("Requested");
    }
  };

  const getUpdatedItem = (newItem) => {
    const newPastTrips = pastTrips.map((item) => {
      if (item.id === newItem.id) {
        return newItem;
      }
      return item;
    });
    setPastTrips(newPastTrips);
  };

  const noTripsComponent = () => {
    return <Text style={styles.noTripText}>No trips to display!</Text>;
  };

  const onPressFollowers = () => {
    if (followers.includes(myUid)) {
      const data = { follow: followers, isFollowers: true };
      navigation.navigate("Follow", data);
    }
  };

  const onPressFollowing = () => {
    if (followers.includes(myUid)) {
      const data = { follow: following, isFollowers: false };
      navigation.navigate("Follow", data);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.spaceBetweenRow}>
        {profilePic ? (
          <Image style={styles.profilePic} source={{ uri: profilePic }} />
        ) : (
          <MaterialCommunityIcons
            style={styles.profileIcon}
            name="account-circle"
            color={"#808080"}
            size={100}
          />
        )}
        <Text style={styles.name}>{item.displayName}</Text>
      </View>
      <View style={styles.row}>
        <TouchableOpacity onPress={onPressFollowers}>
          <Text style={styles.follow}>{followers.length} Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressFollowing}>
          <Text style={styles.follow}>{following.length} Following</Text>
        </TouchableOpacity>
        {isFollowing ? (
          <TouchableOpacity
            onPress={onUnfollowUser}
            style={[styles.button, { backgroundColor: "#AEB8C1" }]}
          >
            <Text style={styles.buttonText}>Following</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onRequestUser}
            style={[styles.button, { backgroundColor: "#00A398" }]}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.header}>Past Trips</Text>
      {loading ? (
        <ActivityIndicator style={styles.activityIndicator} size={"large"} />
      ) : isFollowing ? (
        <FlatList
          data={pastTrips}
          renderItem={({ item }) => (
            <PastTripCard
              item={item}
              profilePic={profilePic}
              displayName={displayName}
              uid={myUid}
              getUpdatedItem={getUpdatedItem}
            >
              {" "}
            </PastTripCard>
          )}
          ListEmptyComponent={noTripsComponent}
        />
      ) : (
        <View style={styles.private}>
          <Text style={styles.privateLargeText}>This Account is Private</Text>
          <Text style={styles.privateText}>
            Follow this account to see their trips.
          </Text>
        </View>
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
    alignItems: "center",
    justifyContent: "space-around",
  },
  private: {
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
    marginTop: 15,
  },
  name: {
    fontSize: 28,
    // color: "#00A398",
    fontWeight: "bold",
    marginTop: 45,
    width: Dimensions.get("window").height * 0.4,
  },
  follow: {
    fontSize: 15,
    fontWeight: "bold",
    margin: 15,
  },
  privateText: {
    fontSize: 15,
    margin: 15,
  },
  privateLargeText: {
    fontSize: 15,
    margin: 15,
    fontWeight: "bold",
  },
  header: {
    fontSize: 24,
    margin: 15,
    fontWeight: "bold",
  },
  spaceBetweenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "white",
  },
  noTripText: {
    fontSize: 16,
    alignSelf: "center",
  },
  icon: {
    alignSelf: "center",
    marginVertical: 10,
  },
  activityIndicator: {
    margin: 50,
  },
  profileIcon: {
    margin: 10,
  },
  profilePic: {
    width: Dimensions.get("window").height * 0.1,
    height: Dimensions.get("window").height * 0.1,
    margin: 10,
    borderRadius: 50,
  },
});
