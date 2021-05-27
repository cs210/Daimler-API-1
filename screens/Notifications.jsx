import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";

import db from "../firebase";
import uuidv4 from "uuid/v4";
import * as firebase from "firebase";

/**
 * This component displays the notifications - currently the follow requests
 * that someone has.
 */
export default function Notifications({ navigation, route }) {
  const [users, setUsers] = useState([]);
  const [likers, setLikers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [likedTrips, setLikedTrips] = useState({});
  const [comments, setComments] = useState([]);
  const [commentedTrips, setCommentedTrips] = useState({});
  const [commentUserMap, setCommentUserMap] = useState({});
  const myUid = firebase.auth().currentUser.uid;

  useFocusEffect(
    React.useCallback(() => {
      loadFollowerRequests();
      loadTrips();
      loadLikes();
      loadComments();
    }, [])
  );

  const loadFollowerRequests = async () => {
    const userDoc = await db.collection("users").doc(myUid).get();
    const userData = userDoc.data();
    const followerRequests = userData["followerRequests"];
    await loadUsers(followerRequests);
  };

  const loadUsers = async (userIds) => {
    const parsedUsers = []
    for (let i = 0; i < userIds.length; i += 10) {
      // Firestore limits "in" queries to 10 elements
      // so we must batch these queries
      const batchIds = userIds.slice(i, i + 10);
      const batchUsers = await db
        .collection("users")
        .where("uid", "in", batchIds)
        .get();
      batchUsers.forEach((user) => {
        const userData = user.data();
        parsedUsers.push(userData);
      });
    }
    setUsers(parsedUsers);
  };

  const loadTrips = async () => {
    const pastTrips = [];
    var sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const tripsFromDatabase = await db.collection("trips")
      .where("uid", "==", firebase.auth().currentUser.uid)
      // .where("time", ">=", sevenDaysAgo)
      .orderBy("time", "desc")
      .get();
    setTrips(tripsFromDatabase);
  };

  const loadComments = async () => {
    const commentsMap = {};
    const tripMap = {};
    trips.forEach(async function(trip) {
      const tripData = trip.data();
      const tripComments = [];
      await db.collection("comments")
        .where("tripId", "==", trip.id)
        .orderBy("time", "desc")
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            tripComments.push(doc.data().uid);
          });
        })
      if (tripComments.length != 0) {
        commentsMap[trip.id] = tripComments;
        tripMap[trip.id] = tripData;
        setCommentedTrips(tripMap);
        setCommentUserMap(commentsMap);
        console.log(commentsMap)
      }
    });
    setUserCommentsFunc(commentUserMap);
  }

  const loadLikes = async () => {
    const likersMap = {};
    const tripMap = {};
    trips.forEach((trip) => {
      // by making key tripData.uid, you are resplacing the entry constantly - should use a trip unique ID instead?
      const tripData = trip.data();
      likersMap[trip.id] = tripData.likes;
      tripMap[trip.id] = tripData;
    });
    setLikedTrips(tripMap);
    setUserLikesFunc(likersMap);
  };

  const setUserCommentsFunc = async (commentsMap) => {
    if (commentsMap.size == 0) {
      setComments([]);
      return;
    }
    const userCommentsList = [];
    console.log("comments map")
    console.log(Object.keys(commentsMap))
    Object.keys(commentsMap).forEach(async function(key) {
      console.log("map key")
      console.log(commentsMap[key])

      for (let i = 0; i < commentsMap[key].length; i += 10) {
        // Firestore limits "in" queries to 10 elements
        // so we must batch these queries
        const batchDbIds = commentsMap[key].slice(i, i + 10);
        const batchDbCommentsUsers = await db
          .collection("users")
          .where("uid", "in", batchDbIds)
          .get();
        batchDbCommentsUsers.forEach((user) => {
          const userTripCommentsList = [];
          batchDbCommentsUsers.forEach((user) => {
            const userData = user.data();
            const individualTripInfo = [];
            individualTripInfo.push(userData);
            individualTripInfo.push(key);
            userTripCommentsList.push(individualTripInfo);
          });
          userCommentsList.push(...userTripCommentsList);
          // console.log(userLikesList.length)
          setComments(userCommentsList);
          console.log("length")
          console.log(userCommentsList.length)
        });
      }
    });
  }

  const setUserLikesFunc = async (likersMap) => {
    if (likersMap.size == 0) {
      setLikers([]);
      return;
    }
    const userLikesList = [];
    Object.keys(likersMap).forEach(async function(key) {
      for (let i = 0; i < likersMap[key].length; i += 10) {
        // Firestore limits "in" queries to 10 elements
        // so we must batch these queries
        const batchDbIds = likersMap[key].slice(i, i + 10);
        const batchDbLikesUsers = await db
          .collection("users")
          .where("uid", "in", batchDbIds)
          .get();
        batchDbLikesUsers.forEach((user) => {
          const userTripLikesList = [];
          batchDbLikesUsers.forEach((user) => {
            const userData = user.data();
            const individualTripInfo = [];
            individualTripInfo.push(userData);
            individualTripInfo.push(key);
            userTripLikesList.push(individualTripInfo);
          });
          userLikesList.push(...userTripLikesList);
          // console.log(userLikesList.length)
          setLikers(userLikesList);
        });
      }
    });
  }

  const onPressTrip = (item) => {
    const likedTrip = likedTrips[item];
    navigation.navigate("Past Trip", likedTrip );
  };

  const onPressUser = (item) => {
    if (item.uid == firebase.auth().currentUser.uid) {
      navigation.navigate("Profile");
    } else {
      navigation.navigate("Friend Profile", { item: item });
    }
  };

  const onPressAccept = (item) => {
    const myUid = firebase.auth().currentUser.uid;
    const myRef = firebase.firestore().collection("users").doc(myUid);
    const theirRef = firebase.firestore().collection("users").doc(item.uid);
    myRef.update({
      followers: firebase.firestore.FieldValue.arrayUnion(item.uid),
      followerRequests: firebase.firestore.FieldValue.arrayRemove(item.uid),
    });
    theirRef.update({
      following: firebase.firestore.FieldValue.arrayUnion(myUid),
      followingRequests: firebase.firestore.FieldValue.arrayRemove(myUid),
    });
    const index = users.indexOf(item);
    if (index > -1) {
      users.splice(index, 1);
    }
    setUsers([...users]);
  };

  const onPressDecline = (item) => {
    const myUid = firebase.auth().currentUser.uid;
    const myRef = firebase.firestore().collection("users").doc(myUid);
    const theirRef = firebase.firestore().collection("users").doc(item.uid);
    myRef.update({
      followerRequests: firebase.firestore.FieldValue.arrayRemove(item.uid),
    });
    theirRef.update({
      followingRequests: firebase.firestore.FieldValue.arrayRemove(myUid),
    });
    const index = users.indexOf(item);
    if (index > -1) {
      users.splice(index, 1);
    }
    setUsers([...users]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.peopleView}>
        <Text style={styles.titleText}>Follow Requests</Text>
        <FlatList
          style={styles.list}
          contentContainerStyle={{
            alignItems: "center",
          }}
          data={users}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                style={styles.userCard}
                onPress={() => onPressUser(item)}
              >
                <View style={styles.userCardInfo}>
                  <View style={styles.userCardRow}>
                    <Text style={styles.userTitle}>{item.username}</Text>
                    <TouchableOpacity
                      style={styles.buttonAccept}
                      onPress={() => onPressAccept(item)}
                    >
                      <Text>Accept</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.userCardRow}>
                    <Text style={styles.userText}>{item.displayName}</Text>
                    <TouchableOpacity
                      style={styles.buttonDecline}
                      onPress={() => onPressDecline(item)}
                    >
                      <Text>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          keyExtractor={() => uuidv4()}
        ></FlatList>
      </View>
      <View style={styles.peopleView}>
        <Text style={styles.titleText}>Likes</Text>
        <FlatList
          style={styles.list}
          contentContainerStyle={{
            alignItems: "center",
          }}
          data={likers}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                style={styles.userCard}
                onPress={() => onPressUser(item[0])}
              >
                <View style={styles.userCardInfo}>
                  <View style={styles.userCardRow}>
                    <Text style={styles.userTitle}>{item[0].username}</Text>
                    <TouchableOpacity
                      style={styles.buttonAccept}
                      onPress={() => onPressTrip(item[1])}
                    >
                      <Text>See post</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.userCardRow}>
                    <Text style={styles.userText}>liked your post</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          keyExtractor={() => uuidv4()}
        ></FlatList>
      </View>
      <View style={styles.peopleView}>
        <Text style={styles.titleText}>Comments</Text>
        <FlatList
          style={styles.list}
          contentContainerStyle={{
            alignItems: "center",
          }}
          data={comments}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                style={styles.userCard}
                onPress={() => onPressUser(item[0])}
              >
                <View style={styles.userCardInfo}>
                  <View style={styles.userCardRow}>
                    <Text style={styles.userTitle}>{item[0].username}</Text>
                    <TouchableOpacity
                      style={styles.buttonAccept}
                      onPress={() => onPressTrip(item[1])}
                    >
                      <Text>See post</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.userCardRow}>
                    <Text style={styles.userText}>commented on your post</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          keyExtractor={() => uuidv4()}
        ></FlatList>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  list: {
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(216,213,214,1)",
  },
  buttonAccept: {
    backgroundColor: "rgba(118, 166, 239, 0.4)",
    shadowColor: "gray",
    paddingLeft: 16,
    paddingRight: 16,
    marginRight: 5,
    marginTop: 5,
    height: Dimensions.get("window").height * 0.033,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    width: "27%",
  },
  buttonDecline: {
    backgroundColor: "#F07F7C",
    shadowColor: "gray",
    paddingLeft: 16,
    paddingRight: 16,
    marginRight: 5,
    marginTop: 5,
    height: Dimensions.get("window").height * 0.033,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    width: "27%",
  },
  peopleView: {
    flex: 10,
  },
  titleText: {
    padding: 15,
    fontSize: 20,
    fontWeight: "bold",
  },
  userCard: {
    width: "95%",
    marginTop: 10,
    backgroundColor: "#AEB8C1",
    padding: 5,
    borderRadius: 10,
    flexDirection: "row",
  },
  userTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  userText: {
    fontSize: 12,
  },
  userCardInfo: {
    flex: 1,
    paddingLeft: 10,
  },
  userCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
