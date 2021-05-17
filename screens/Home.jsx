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
import { useFocusEffect, useIsFocused } from "@react-navigation/native";

import { NativeFormsModal } from "native-forms";
import PastTripCard from "./PastTripCard";
import db from "../firebase";
import { netPromoterUrl } from "../keys";

export default function Home({ navigation }) {
  const [feedItems, setFeedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNPSForm, setShowNPSForm] = useState(false);
  const [friendsPic, setFriendsPic] = useState({});
  const myUid = firebase.auth().currentUser.uid;
  const isFocused = useIsFocused();

  useEffect(() => {
    loadFeedTrips();
  }, [isFocused]);

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
    const feedTrips = await parseTripsForFeed();
    setFeedItems(feedTrips);
  };

  const parseTripsForFeed = async () => {
    const parsedTrips = [];
    const followedUserIds = await fetchMyFollowing();
    const tripsFromDatabase = await fetchUsersTrips(followedUserIds);
    const userIdToNameMap = await fetchUsersNames(followedUserIds);
    for (let tripBatch of tripsFromDatabase) {
      for (const trip of tripBatch.docs) {
        const tripData = trip.data();
        const usersId = tripData["uid"];
        tripData["usersName"] = userIdToNameMap[usersId];
        tripData["id"] = trip.id;
        tripData["tripTitle"] = tripData.tripTitleText;
        const commentsArray = [];
        await db
          .collection("comments")
          .where("tripId", "==", trip.id)
          .orderBy("time", "asc")
          .get()
          .then((comments) => {
            comments.forEach((comment) => {
              commentsArray.push(comment.data());
            });
          });
        tripData["comments"] = commentsArray;
        parsedTrips.push(tripData);
      }
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
    const isFamiliarWithApp = userData["openAppTimestamps"].length > 4;
    const hasntDoneNPS = !userData["hasDoneNPS"];
    const randomChance = Math.random() < 0.25;
    const shouldSeeNPS = isFamiliarWithApp && hasntDoneNPS && randomChance;
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
  };

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
  time: {
    color: "#A9A9A9",
    paddingLeft: 4,
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  noTripText: {
    paddingTop: Dimensions.get("window").height * 0.3,
    fontSize: 16,
    alignSelf: "center",
    textAlign: "center",
  },
  activityIndicator: {
    margin: 50,
  },
});
