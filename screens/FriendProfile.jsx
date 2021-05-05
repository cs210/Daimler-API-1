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
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingRequested, setIsFollowingRequested] = useState(false);
  const [pastTrips, setPastTrips] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
  const [buttonText, setButtonText] = useState("Follow");
  const [likesUsers, setLikesUsers] = useState({});
  const myUid = firebase.auth().currentUser.uid;

  const parseTripsFromDatabase = (tripsFromDatabase) => {
    const parsedTrips = [];
    const uid = firebase.auth().currentUser.uid;
    const usersRef = firebase.firestore().collection("users");
    usersRef.doc(uid).onSnapshot((userDoc) => {
      if (userDoc.data()["following"].includes(item.uid)) {
        setIsFollowing(true);
        tripsFromDatabase.forEach((trip) => {
          const tripData = trip.data();
          if (tripData.uid == item.uid) {
            tripData["id"] = trip.id;
            tripData["tripTitle"] = tripData.tripTitleText;
            parsedTrips.push(tripData);
          }
        });
      } else if (userDoc.data()["followingRequests"].includes(item.uid)) {
        setIsFollowingRequested(true);
      }
      if (parsedTrips.length != pastTrips.length) {
        // Could potentially add more rigorous check than length
        setPastTrips(parsedTrips);
      }
    });
  };

  const loadPastTrips = async () => {
    setLoading(true);
    const collRef = db.collection("trips");
    const tripsFromDatabase = await collRef.orderBy("time", "desc").get();
    parseTripsFromDatabase(tripsFromDatabase);
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;
      const uid = firebase.auth().currentUser.uid;
      const usersRef = firebase.firestore().collection("users");
      usersRef.doc(uid).onSnapshot((userDoc) => {
        if (userDoc.data()["followingRequests"].includes(item.uid)) {
          setIsFollowingRequested(true);
          setButtonText("Requested");
        }
      });
      loadPastTrips();
      getFriendUser();
    }, [pastTrips])
  );

  const getFriendUser = () => {
    const usersRef = firebase.firestore().collection("users");
    usersRef.doc(item.uid).onSnapshot((userDoc) => {
      setFollowers(userDoc.data()["followers"]);
      setFollowing(userDoc.data()["following"]);
      setProfilePic(userDoc.data()["profilePicture"]);
    });
  };

  const onUnfollowUser = async () => {
    const myRef = firebase.firestore().collection("users").doc(myUid);
    const theirRef = firebase.firestore().collection("users").doc(item.uid);
    const myRes = myRef.update({
      following: firebase.firestore.FieldValue.arrayRemove(item.uid),
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
    const theirRef = firebase.firestore().collection("users").doc(item.uid);
    if (buttonText == "Requested") {
      const myRes = myRef.update({
        followingRequests: firebase.firestore.FieldValue.arrayRemove(item.uid),
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
        followingRequests: firebase.firestore.FieldValue.arrayUnion(item.uid),
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

  const onUserLike = async (item) => {
    if (item.likes != null && item.uid != myUid) {
      // Check to make sure it's not your own post
      const tripRef = await db.collection("trips").doc(item.id);
      if (item.likes.includes(myUid)) {
        tripRef.update({
          likes: firebase.firestore.FieldValue.arrayRemove(myUid),
        });
        const index = item.likes.indexOf(myUid);
        if (index > -1) {
          item.likes.splice(index, 1);
        }
      } else {
        item.likes.push(myUid);
        tripRef.update({
          likes: firebase.firestore.FieldValue.arrayUnion(myUid),
        });
      }
      const newLikesUsers = { ...likesUsers, [item.id]: item.likes };
      setLikesUsers(newLikesUsers);
      // There is probably a way around likesUsers - used this to get rereneder to occur
    }
  };

  const pastTripComponent = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("Past Trip", item)}
        style={styles.itemContainer}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.tripName}>{item.tripTitle}</Text>
          <Text>{moment(item.time, moment.ISO_8601).format("LLL")}</Text>
        </View>
        <View style={styles.tripCard}>
          {tripViewComponent(
            item.pins,
            findRegion(item.pins, item.coordinates),
            item.coordinates
          )}
        </View>
        <View>
          {item.likes == null && <Text> {item.likes} 0 likes </Text>}
          {item.likes != null && item.likes.length != 1 && (
            <Text> {item.likes.length} likes </Text>
          )}
          {item.likes != null && item.likes.length == 1 && (
            <Text> {item.likes.length} like </Text>
          )}
        </View>
        <View
          style={{
            paddingTop: 10,
            borderBottomColor: "lightgray",
            borderBottomWidth: 1,
          }}
        />
        {item.likes != null && item.likes.includes(myUid) && (
          <TouchableOpacity onPress={() => onUserLike(item)}>
            <View>
              <MaterialCommunityIcons
                style={styles.icon}
                name="thumb-up-outline"
                color={"#00A398"}
                size={25}
              />
            </View>
          </TouchableOpacity>
        )}
        {item.likes != null && !item.likes.includes(myUid) && (
          <TouchableOpacity onPress={() => onUserLike(item)}>
            <View>
              <MaterialCommunityIcons
                style={styles.icon}
                name="thumb-up-outline"
                color={"#808080"}
                size={25}
              />
            </View>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
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
          renderItem={pastTripComponent}
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
  itemContainer: {
    borderRadius: 6,
    elevation: 3,
    backgroundColor: "#fff",
    shadowOffset: { width: 1, height: 1 },
    shadowColor: "#333",
    shadowOpacity: 0.3,
    paddingHorizontal: 12,
    marginVertical: 10,
  },
  spaceBetweenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    width: Dimensions.get("window").width * 0.22,
    height: Dimensions.get("window").height * 0.1,
    margin: 10,
    borderRadius: 50,
  },
});
