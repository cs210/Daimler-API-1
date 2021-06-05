import * as firebase from "firebase";

import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { findRegion, tripViewComponent } from "./TripViewer";

import CachedImage from "react-native-expo-cached-image";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import React from "react";
import db from "../firebase";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";

/**
 * This component displays a past trip. It shows the user's name, profile photo, trip
 * description, images of the trip or route of the trip, and number of likes and comments.
 */
export default function PastTripCard(props) {
  const item = props.item;
  const friendsPic = props.friendsPic;
  const myUid = props.uid;
  const navigation = useNavigation();

  let profilePicture = null;
  if (friendsPic != null) {
    profilePicture = friendsPic[item.uid];
  } else {
    profilePicture = props.profilePic;
  }

  const userName = props.displayName;

  const onUserLike = async (item) => {
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

  const onPressUser = (item) => {
    if (item.uid == firebase.auth().currentUser.uid) {
      navigation.navigate("Profile");
    } else {
      item.displayName = userName;
      navigation.navigate("Friend Profile", { item: item });
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => navigation.navigate("Past Trip", item)}
        style={styles.itemContainer}
      >
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => onPressUser(item)}>
              {profilePicture ? (
                <CachedImage
                  style={styles.profilePic}
                  source={{ uri: profilePicture }}
                />
              ) : (
                <MaterialCommunityIcons
                  name="account-circle"
                  color={"#808080"}
                  size={50}
                />
              )}
            </TouchableOpacity>
            <View>
              <Text style={styles.userName}> {userName}</Text>
              <Text style={styles.time}>
                {moment(item.time, moment.ISO_8601).format("LLL")}
              </Text>
            </View>
          </View>

          <Text style={styles.tripName}>{item.tripTitle}</Text>
        </View>
      </TouchableOpacity>
      <ScrollView horizontal={true}>
        {item?.tripPhotos?.map((photo, i) => (
          <Image key={i} source={{ uri: photo }} style={styles.image} />
        ))}
        <View style={styles.tripCard}>
          {tripViewComponent(
            item.pins,
            findRegion(item.pins, item.coordinates),
            item.coordinates
          )}
        </View>
      </ScrollView>
      <View style={styles.row}>
        <View>
          {item.likes.length != 1 && (
            <Text onPress={() => navigation.navigate("Likes", item.likes)}>
              {item.likes.length} likes
            </Text>
          )}
          {item.likes.length == 1 && (
            <Text onPress={() => navigation.navigate("Likes", item.likes)}>
              {item.likes.length} like
            </Text>
          )}
        </View>
        <View>
          {item.comments.length != 1 && (
            <Text onPress={() => navigation.navigate("Comment", item)}>
              {item.comments.length} comments
            </Text>
          )}
          {item.comments.length == 1 && (
            <Text onPress={() => navigation.navigate("Comment", item)}>
              {item.comments.length} comment
            </Text>
          )}
        </View>
      </View>
      <View
        style={{
          paddingTop: 10,
          borderBottomColor: "lightgray",
          borderBottomWidth: 1,
        }}
      />
      <View style={styles.reactionBar}>
        <TouchableOpacity onPress={() => onUserLike(item)}>
          <View style={styles.iconView}>
            <MaterialCommunityIcons
              style={styles.icon}
              name="thumb-up-outline"
              color={item.likes.includes(myUid) ? "#00A398" : "#808080"}
              size={25}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Comment", item)}>
          <View style={styles.iconView}>
            <MaterialCommunityIcons
              style={styles.icon}
              name="comment-text-outline"
              color={"#808080"}
              size={25}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
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
  reactionBar: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    paddingLeft: 2,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    padding: 10,
  },
  tripName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  tripCard: {
    width: Dimensions.get("window").width * 1.02,
    height: Dimensions.get("window").height * 0.4,
    paddingLeft: 30,
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
  },
  iconView: {
    width: Dimensions.get("window").width * 0.5,
  },
  activityIndicator: {
    margin: 50,
  },
  profilePic: {
    width: Dimensions.get("window").height * 0.058,
    height: Dimensions.get("window").height * 0.058,
    borderRadius: 50,
    margin: 5,
    marginLeft: 0,
  },
  image: {
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.4,
    margin: 10,
    marginLeft: 20,
  },
});
