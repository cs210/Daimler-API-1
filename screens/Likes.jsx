import React, { useState } from "react";
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
export default function Likers({ navigation, route }) {
  const [users, setUsers] = useState([]);
  const likes = route.params;

  useFocusEffect(
    React.useCallback(() => {
      if (likes.length == 0) {
        setUsers([]);
        return;
      }
      async function fetchUsersNames() {
        const dbUsers = await db
          .collection("users")
          .where("uid", "in", likes)
          .get();
        const userList = [];
        dbUsers.forEach((user) => {
          const userData = user.data();
          userList.push(userData);
        });
        setUsers(userList);
      }
      fetchUsersNames();
    }, [likes])
  );

  const onPressUser = (item) => {
    if (item.uid == firebase.auth().currentUser.uid) {
      navigation.navigate("Profile");
    } else {
      navigation.navigate("Friend Profile", { item: item });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.peopleView}>
        <Text style={styles.titleText}>Likers</Text>
        {users.length != 0 && <FlatList
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
                  </View>
                  <Text style={styles.userText}>{item.displayName}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          keyExtractor={() => uuidv4()}
        ></FlatList> }
        {users.length == 0 &&  <Text style={styles.noFollowText}> This post has no likes. </Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  peopleView: {
    flex: 10,
  },
  titleText: {
    padding: 15,
    fontSize: 20,
    fontWeight: "bold",
  },
  noFollowText: {
    padding: 15,
    fontSize: 14,
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
