import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState } from "react";
import { findRegion, tripViewComponent } from "./TripViewer";
import moment from "moment";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import db from "../firebase";
import * as firebase from "firebase";
import { ScrollView, TextInput } from "react-native-gesture-handler";

export default function Comment({ navigation, route }) {
  // console.log("route params", route.params);
  const item = route.params;
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(route.params.comments);
  // console.log("comments", route.params.comments);


  const onAddComment = async () => {
    // fill in thi smethod
    // if (item.comments != null) {
    //   const tripRef = await db.collection("trips").doc(item.id);
    //   tripRef.update({
    //     comments: 
    //   })
    // }
    console.log("comment", comment);
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
  
  //delete later
  const onUserComment = async (item) => {
    if (item.likes != null) {
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
      props.getUpdatedItem({
        item,
      });
    }
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
      <ScrollView>

      </ScrollView>
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
});
