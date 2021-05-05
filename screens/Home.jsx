import * as firebase from "firebase";

import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";

import { NativeFormsModal } from "native-forms";
import db from "../firebase";
import { netPromoterUrl } from "../keys";
import { useFocusEffect } from "@react-navigation/native";
import PastTripCard from "./PastTripCard";

export default function Home({ navigation }) {
  const [feedItems, setFeedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNPSForm, setShowNPSForm] = useState(false);
  const [friendsPic, setFriendsPic] = useState({});
  const myUid = firebase.auth().currentUser.uid;

  useEffect(() => {
    logOpenAppEvent();
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    await loadFeedTrips();
    await loadNPSForm();
    setIsLoading(false);
  };

  const loadFeedTrips = async () => {
    setFeedItems([]);
    const feedTrips = await parseTripsForFeed();
    setFeedItems(feedTrips);
  };

  const parseTripsForFeed = async () => {
    const parsedTrips = [];
    const followedUserIds = await fetchMyFollowing();
    const tripsFromDatabase = await fetchUsersTrips(followedUserIds);
    const userIdToNameMap = await fetchUsersNames(followedUserIds);
    for (let tripBatch of tripsFromDatabase) {
      tripBatch.forEach((trip) => {
        const tripData = trip.data();
        const usersId = tripData["uid"];
        tripData["usersName"] = userIdToNameMap[usersId];
        tripData["id"] = trip.id;
        tripData["tripTitle"] = tripData.tripTitleText;
        parsedTrips.push(tripData);
      });
    }
    return parsedTrips;
  };

  const fetchMyFollowing = async () => {
    const userDoc = await db.collection("users").doc(myUid).get();
    const followedUserIds = userDoc.data()["following"];
    followedUserIds.push(myUid);
    return followedUserIds;
  };

  const fetchUsersTrips = async (userIds) => {
    const trips = [];
    for (let i = 0; i < userIds.length; i += 10) {
      // Firestore limits "in" queries to 10 elements
      // so we must batch these queries
      const batchIds = userIds.slice(i, i + 10);
      const batchTrips = await db
        .collection("trips")
        .where("uid", "in", batchIds)
        .orderBy("time", "desc")
        .get();
      trips.push(batchTrips);
    }
    return trips;
  };

  const fetchUsersNames = async (userIds) => {
    const userIdToName = {};
    const users = [];
    for (let i = 0; i < userIds.length; i += 10) {
      // Firestore limits "in" queries to 10 elements
      // so we must batch these queries
      const batchIds = userIds.slice(i, i + 10);
      const batchUsers = await db
        .collection("users")
        .where("uid", "in", batchIds)
        .get();
      users.push(batchUsers);
    }
    for (let userBatch of users) {
      userBatch.forEach((user) => {
        const userData = user.data();
        const uid = userData["uid"];
        const name = userData["displayName"];
        userIdToName[uid] = name;
      });
    }
    return userIdToName;
  };

  const loadNPSForm = async () => {
    const userDoc = await db.collection("users").doc(myUid).get();
    const userData = userDoc.data();
    const hasOpenedAppManyTimes = userData["openAppTimestamps"].length > 4;
    const shouldSeeNPS = hasOpenedAppManyTimes && !userData["hasDoneNPS"];
    setShowNPSForm(shouldSeeNPS);
  };

  const logOpenAppEvent = () => {
    const timestamp = new Date().toISOString();
    const userRef = db.collection("users").doc(myUid);
    userRef.update({
      openAppTimestamps: firebase.firestore.FieldValue.arrayUnion(timestamp),
    });
  };

  const onSendNPSForm = () => {
    const userRef = db.collection("users").doc(myUid);
    userRef.update({ hasDoneNPS: true });
    setTimeout(() => setShowNPSForm(false), 1500);
  };

  useFocusEffect(
    React.useCallback(() => {
      async function fetchUsersPics() {
        const dbUsers = await db.collection("users").get();
        userPicDict = {};
        dbUsers.forEach((user) => {
          const userData = user.data();
          userPicDict[userData.uid] = userData.profilePicture;
        });
        setFriendsPic(userPicDict);
      }
      fetchUsersPics();
    }, [])
  );
  
  const noTripsComponent = () => {
    return (
      <Text style={styles.noTripText}>
        <Text>Your feed is currently empty!{"\n"}</Text>
        <Text>Follow more friends to see their trips here</Text>
      </Text>
    );
  };

  const refreshFeedTrips = async () => {
    setIsLoading(true);
    await loadFeedTrips();
    setIsLoading(false);
  };

  const getUpdatedItem = (newItem) => {
    const newFeedItems = feedItems.map((item) => {
      if (item.id === newItem.id) {
        return newItem;
      }
      return item;
    });
    setFeedItems(newFeedItems);
  }

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <ActivityIndicator style={styles.activityIndicator} size={"large"} />
      ) : (
        <View>
          <NativeFormsModal
            visible={showNPSForm}
            form={netPromoterUrl}
            onClose={() => setShowNPSForm(false)}
            onSend={onSendNPSForm}
            extraData={{ UserID: myUid }}
          />
          <FlatList
            data={feedItems}
            renderItem={({ item }) => (
              <PastTripCard
                item={item}
                friendsPic={friendsPic}
                uid={myUid}
                displayName={item.usersName}
                getUpdatedItem={getUpdatedItem}
              >
                {" "}
              </PastTripCard>
            )}
            ListEmptyComponent={noTripsComponent}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refreshFeedTrips}
              />
            }
          />
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
  header: {
    fontSize: 30,
    color: "#8275BD",
    fontWeight: "bold",
    alignSelf: "center",
    marginVertical: 5,
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
  cardHeader: {
    margin: 5,
  },
  time: {
    color: "#A9A9A9",
    paddingLeft: 4,
    fontSize: 12,
  },
  userName: {
    paddingLeft: 2,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
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
    paddingTop: 15,
  },
  noTripText: {
    paddingTop: Dimensions.get("window").height * 0.3,
    fontSize: 16,
    alignSelf: "center",
    textAlign: "center",
  },
  icon: {
    alignSelf: "center",
    marginVertical: 10,
    // paddingRight: 30,
  },
  activityIndicator: {
    margin: 50,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 5,
  },
});
