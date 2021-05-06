import React, { useState } from "react";
// import { useFocusEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";

import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import db from "../firebase";
import uuidv4 from "uuid/v4";
import * as firebase from "firebase";

/**
 * This component displays a list of followers or those you are following
 * when a user clicks on followers or following from someone's profile.
 */
export default function Notifications({ navigation, route }) {
  const [users, setUsers] = useState([]);
  const [followerRequests, setFollowerRequests] = useState([]);
  const [likers, setLikers] = useState([]);
  const [followers, setFollowers] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      // let isMounted = true;
      async function fetchFollowUsersNames() {
        let uid = firebase.auth().currentUser.uid;
        const usersRef = firebase.firestore().collection("users");
        usersRef.doc(uid).onSnapshot((userDoc) => {
          setFollowerRequests(userDoc.data()["followerRequests"]);
        });
        console.log(followerRequests);

        if (followerRequests.length == 0) {
          setUsers([]);
          return;
        }
        const dbUsers = await db
          .collection("users")
          .where("uid", "in", followerRequests)
          .get();

        const userList = [];
        dbUsers.forEach((user) => {
          const userData = user.data();
          userList.push(userData);
        });
        console.log("here")
        setUsers(userList);
        console.log("userList", userList);
      }

      async function fetchLikeUsersNames() {
        let uid = firebase.auth().currentUser.uid;
        const likersList = [];
        const tripsFromDatabase = await db.collection("trips")
          .where("uid", "==", uid)
          .orderBy("time", "desc")
          .get();
        tripsFromDatabase.forEach((trip) => {
          const tripData = trip.data();
          likersList.concat(tripData.likes);
        });

        if (likersList.length == 0) {
          setLikers([]);
          return;
        }

        const dbUsers = await db
          .collection("users")
          .where("uid", "in", likersList)
          .get();

        const userList = [];
        dbUsers.forEach((user) => {
          const userData = user.data();
          userList.push(userData);
        });
        console.log("here")
        setLikers(userList);
        console.log("userList", userList);
      }
      fetchFollowUsersNames();
      // fetchLikeUsersNames();
      // return () => { isMounted = false }
    }, [])
  );

  const onPressUser = (item) => {
    if (item.uid == firebase.auth().currentUser.uid) {
      navigation.navigate("Profile");
    } else {
      navigation.navigate("Friend Profile", { item: item });
    }
  };

  const onPressAccept = (item) => {
    const myUid = firebase.auth().currentUser.uid;
    const theirUid = item.uid;
    const myRef = firebase.firestore().collection("users").doc(myUid);
    const theirRef = firebase.firestore().collection("users").doc(item.uid);
    const myRes = myRef.update({
      followers: firebase.firestore.FieldValue.arrayUnion(item.uid),
      followerRequests: firebase.firestore.FieldValue.arrayRemove(item.uid),
    });
    const theirRes = theirRef.update({
      following: firebase.firestore.FieldValue.arrayUnion(myUid),
      followingRequests: firebase.firestore.FieldValue.arrayRemove(myUid),
    });
  };

  const onPressDecline = (item) => {
    const myUid = firebase.auth().currentUser.uid;
    const theirUid = item.uid;
    const myRef = firebase.firestore().collection("users").doc(myUid);
    const theirRef = firebase.firestore().collection("users").doc(item.uid);
    const myRes = myRef.update({
      followerRequests: firebase.firestore.FieldValue.arrayRemove(item.uid),
    });
    const theirRes = theirRef.update({
      followingRequests: firebase.firestore.FieldValue.arrayRemove(myUid),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.peopleView}>
        <Text style={styles.titleText}>Follow Requests</Text>
        <FlatList
          style={{
            marginLeft: 10,
            marginRight: 10,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(216,213,214,1)",
          }}
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
        <Text style={styles.titleText}>Activity</Text>
        <FlatList
          style={{
            marginLeft: 10,
            marginRight: 10,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(216,213,214,1)",
          }}
          contentContainerStyle={{
            alignItems: "center",
          }}
          data={likers}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                style={styles.userCard}
                onPress={() => onPressUser(item)}
              >
                <View style={styles.userCardInfo}>
                  <View style={styles.userCardRow}>
                    <Text style={styles.userTitle}>{item.username}</Text>
                  </View>
                  <View style={styles.userCardRow}>
                    <Text style={styles.userText}>{item.displayName}</Text>
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
  },
  buttonAccept: {
      backgroundColor: 'rgba(118, 166, 239, 0.4)',
      shadowColor: 'gray',
      paddingLeft: 16,
      paddingRight: 16,
      marginRight: 5,
      marginTop: 5,
      height: 30,
      borderRadius: 5,
      alignItems: "center",
      justifyContent: 'center'
  },
  buttonDecline: {
      backgroundColor: '#F07F7C',
      shadowColor: 'gray',
      paddingLeft: 16,
      paddingRight: 16,
      marginRight: 5,
      marginTop: 5,
      height: 30,
      borderRadius: 5,
      alignItems: "center",
      justifyContent: 'center'
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
