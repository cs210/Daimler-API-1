import * as firebase from "firebase";

import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import CachedImage from 'react-native-expo-cached-image';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import db from "../firebase";
import uuidv4 from "uuid/v4";

/**
 * This component displays a list of followers or those you are following
 * when a user clicks on followers or following from someone's profile.
 */
export default function Followers({ navigation, route }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const parsedUsers = []
    const userIds = route.params["follow"];
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
        {route.params["isFollowers"] && (
          <Text style={styles.titleText}>Followers</Text>
        )}
        {!route.params["isFollowers"] && (
          <Text style={styles.titleText}>Following</Text>
        )}
        {users.length != 0 && (
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
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row" }}>
                      {item.profilePicture ? (
                        <CachedImage
                          style={styles.profilePic}
                          source={{ uri: item.profilePicture }}
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name="account-circle"
                          color={"#808080"}
                          size={Dimensions.get("window").height * 0.065}
                          style={styles.profileIcon}
                        />
                      )}
                      <View style={styles.userCardInfo}>
                        <View style={styles.userCardRow}>
                          <Text style={styles.userTitle}>{item.username}</Text>
                        </View>
                        <Text style={styles.userText}>{item.displayName}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            keyExtractor={() => uuidv4()}
          ></FlatList>
        )}
        {route.params["isFollowers"] && users.length == 0 && (
          <Text style={styles.noFollowText}> You have no followers. </Text>
        )}
        {!route.params["isFollowers"] && users.length == 0 && (
          <Text style={styles.noFollowText}>
            {" "}
            You are not following anyone.{" "}
          </Text>
        )}
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
  profilePic: {
    width: Dimensions.get("window").height * 0.058,
    height: Dimensions.get("window").height * 0.058,
    borderRadius: 1000,
    margin: 4,
  },
});
