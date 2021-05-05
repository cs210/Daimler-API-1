import * as ImagePicker from "expo-image-picker";
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

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import db from "../firebase";
import { getImageUrl } from "./TripOverview";
import { useFocusEffect } from "@react-navigation/native";
import PastTripCard from "./PastTripCard";

/**
 * This component shows a profile which includes the number of followers
 * and people you are following. It also contains a list of all past trips
 * when user presses the "Profile" button from the tab bar. Clicking on
 * a past trip will take you to the trip overview.
 */
export default function Profile({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [pastTrips, setPastTrips] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const currentUser = firebase.auth().currentUser;

  const parseTripsFromDatabase = (tripsFromDatabase) => {
    const parsedTrips = [];
    tripsFromDatabase.forEach((trip) => {
      const tripData = trip.data();
      if (tripData.uid == currentUser.uid) {
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
      const unsubscribe = getCurrentUser();
      return () => unsubscribe();
    }, [])
  );

  const getCurrentUser = () => {
    const usersRef = firebase.firestore().collection("users");
    const unsubscribe = usersRef.doc(currentUser.uid).onSnapshot((userDoc) => {
      setFollowers(userDoc.data()["followers"]);
      setFollowing(userDoc.data()["following"]);
      if ("profilePicture" in userDoc.data()) {
        setProfilePicture(userDoc.data()["profilePicture"]);
      }
    });
    return unsubscribe;
  };

  const onPressFollowers = () => {
    const data = {
      email: currentUser.email,
      follow: followers,
      isFollowers: true,
    };
    navigation.navigate("Follow", data);
  };

  const onPressFollowing = () => {
    const data = {
      email: currentUser.email,
      follow: following,
      isFollowers: false,
    };
    navigation.navigate("Follow", data);
  };

  const addProfilePicture = async () => {
    const userRef = await db
      .collection("users")
      .doc(currentUser.uid);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      base64: true,
      quality: 0,
    });
    if (!result.cancelled) {
      getImageUrl(result.uri).then((url) => {
        userRef.update({
          profilePicture: url,
        });
      });
    }
  };
  const noTripsComponent = () => {
    return <Text style={styles.noTripText}>No trips to display!</Text>;
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.spaceBetweenRow}>
        {profilePicture ? (
          <TouchableOpacity onPress={addProfilePicture}>
            <Image style={styles.profilePic} source={{ uri: profilePicture }} />
          </TouchableOpacity>
        ) : (
          <MaterialCommunityIcons
            style={styles.profileIcon}
            name="account-circle"
            color={"#808080"}
            size={100}
            onPress={addProfilePicture}
          />
        )}

        <Text style={styles.name}>
          {currentUser.displayName}
        </Text>
        <MaterialCommunityIcons
          style={styles.settingsIcon}
          name="account-cog"
          size={28}
          onPress={() => navigation.navigate("Settings")}
        />
      </View>
      <View style={styles.row}>
        <TouchableOpacity onPress={onPressFollowers}>
          <Text style={styles.follow}>{followers.length} Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressFollowing}>
          <Text style={styles.follow}>{following.length} Following</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.header}>My Past Trips</Text>
      {loading ? (
        <ActivityIndicator style={styles.activityIndicator} size={"large"} />
      ) : (
        <FlatList
          data={pastTrips}
        renderItem={({ item }) => (
            <PastTripCard
            item={item}
            profilePic={profilePicture}
            displayName={currentUser.displayName}
            uid={currentUser.uid}
            getUpdatedItem={getUpdatedItem}
          >
            {" "}
          </PastTripCard>
                )}
          ListEmptyComponent={noTripsComponent}
        />
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
  spaceBetweenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
  },
  settingsIcon: {
    // marginRight: 20,
    paddingRight: 10,
    marginTop: 15,
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
  name: {
    fontSize: 28,
    // color: "#00A398",
    fontWeight: "bold",
    marginTop: 45,
    width: Dimensions.get("window").height * 0.3,
  },
  time: {
    color: "#A9A9A9",
    paddingLeft: 4,
  },
  follow: {
    fontSize: 15,
    fontWeight: "bold",
    // color: "#00A398",
    margin: 15,
  },
  header: {
    color: "#00A398",
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
  noTripText: {
    fontSize: 16,
    alignSelf: "center",
  },
  likes: {
    paddingBottom: 13,
  },
  activityIndicator: {
    margin: 50,
  },
});
