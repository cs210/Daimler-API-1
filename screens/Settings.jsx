import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Alert,
  Dimensions,
} from "react-native";
import React from "react";
import * as firebase from "firebase";
import db from "../firebase";

/**
 * This component is the settings page where the user can logout of the app.
 */
export default function Settings({ navigation }) {
  const uid = firebase.auth().currentUser.uid;

  const renderSeparator = () => {
    return <View style={styles.seperator} />;
  };

  const getListViewItem = async (item) => {
    if (item.key == "Logout") {
      try {
        await firebase.auth().signOut();
        navigation.navigate("Login");
      } catch (e) {
        console.log(e);
      }
    } else if (item.key == "Delete Account") {
      Alert.alert(
        "Delete your account?",
        "All information pertaining to this account will be deleted and cannot be recovered.",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          { text: "OK", onPress: () => deleteAccount() },
        ]
      );
    }
  };

  const deleteAccount = async () => {
    const userDoc = await db.collection("users").doc(uid).get();
    const followedUserIds = userDoc.data()["following"];
    const followersUserIds = userDoc.data()["followers"];

    firebase
      .auth()
      .currentUser.delete()
      .then(
        db
          .collection("users")
          .doc(uid)
          .delete()
          .then(() => {
            console.log("Document successfully deleted!");
            updateFollow(followedUserIds, followersUserIds);
          })
          .catch((error) => {
            console.error("Error removing document: ", error);
          })
      )
      .catch(function (error) {
        Alert.alert(
          "Log in again before retrying this request.",
          "This operation is sensitive and requires recent authentication.",
          [{ text: "OK", onPress: () => console.error({ error }) }]
        );
      });
  };

  const updateFollow = async (followedUserIds, followersUserIds) => {
    followedUserIds.forEach((id) => {
      const userFollowingRef = db.collection("users").doc(id);
      // Remove deleted user from their followers list
      userFollowingRef.update({
        followers: firebase.firestore.FieldValue.arrayRemove(uid),
      });
    });

    followersUserIds.forEach((id) => {
      const userFollowerRef = db.collection("users").doc(id);
      // Remove deleted user from their following list
      userFollowerRef.update({
        following: firebase.firestore.FieldValue.arrayRemove(uid),
      });
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={[{ key: "Logout" }, { key: "Delete Account" }]}
        renderItem={({ item }) => (
          <Text style={styles.item} onPress={() => getListViewItem(item)}>
            {item.key}
          </Text>
        )}
        ItemSeparatorComponent={renderSeparator}
        ListFooterComponent={renderSeparator}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: Dimensions.get("window").height * 0.045,
    color: "#00A398",
    margin: 5,
  },
  seperator: {
    height: 1,
    width: "100%",
    backgroundColor: "lightgray",
  },
});
