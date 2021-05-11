import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState, useEffect } from "react";
import moment from "moment";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import db from "../firebase";
import * as firebase from "firebase";
import { FlatList, TextInput } from "react-native-gesture-handler";
import uuidv4 from "uuid/v4";

export default function Comment({ navigation, route }) {
  const item = route.params;
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(route.params.comments);
  console.log("comments", route.params.comments);

  useEffect(() => {
    console.log("useEffect called");
    // return () => console.log('unmounting...');
    addUsersToComments();
  }, []);

  const addUsersToComments = async () => {
    console.log("addUsersToComments called");
    const commentsWithUsers = [];
    for (const comment of route.params.comments) {
      await db
        .collection("users")
        .where("uid", "==", comment.uid)
        .get()
        .then((users) => {
          users.forEach((user) => {
            comment.user = user.data();
            commentsWithUsers.push(comment);
          });
        });
    }
    setComments(commentsWithUsers);
  };

  const onAddComment = async () => {
    const post = {
      comment: comment,
      time: new Date().toISOString(),
      uid: firebase.auth().currentUser.uid,
      tripId: item.id,
    };

    db.collection("comments")
      .add(post)
      .then(() => {
        console.log("Comment successfully written!");
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
      });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={"padding"}
      keyboardVerticalOffset={50}
    >
      <Text style={styles.header}>{route.params.tripTitle}</Text>
      <Text style={styles.userName}> {route.params.usersName}</Text>
      <Text style={styles.time}>
        {moment(route.params.time, moment.ISO_8601).format("LLL")}
      </Text>
      <FlatList
        data={comments}
        renderItem={({ item }) => (
          <View>
            {item.user.profilePicture ? (
              <Image
                style={styles.profilePic}
                source={{ uri: item.user.profilePicture }}
              />
            ) : (
              <MaterialCommunityIcons
                name="account-circle"
                color={"#808080"}
                size={50}
              />
            )}
            <Text>
              {item.comment}
              {item.user.displayName}
            </Text>
          </View>
        )}
        keyExtractor={() => uuidv4()}
      ></FlatList>
      <View style={styles.textInputView}>
        <TextInput
          style={styles.textInput}
          placeholder="Add a comment"
          onChangeText={setComment}
        />
        <TouchableOpacity
          onPress={onAddComment}
          style={styles.appButtonContainer}
        >
          <Text style={styles.appButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    alignSelf: "center",
    marginVertical: 5,
  },
  userName: {
    paddingLeft: 2,
    fontSize: 16,
  },
  time: {
    color: "#A9A9A9",
    paddingLeft: 4,
    fontSize: 12,
  },
  textInputView: {
    paddingBottom: 50,
    alignItems: "stretch",
    flexDirection: "row",
  },
  textInput: {
    borderWidth: 1,
    flex: 2,
    borderColor: "gray",
    paddingLeft: 10,
    height: 30,
    borderRadius: 18,
  },
  appButtonContainer: {
    elevation: 8,
    backgroundColor: "gray",
    borderRadius: 18,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  appButtonText: {
    fontSize: 18,
    color: "white",
    // fontWeight: "bold",
    alignSelf: "center",
  },
  profilePic: {
    width: Dimensions.get("window").height * 0.058,
    height: Dimensions.get("window").height * 0.058,
    borderRadius: 50,
    margin: 5,
    marginLeft: 0,
  },
});
