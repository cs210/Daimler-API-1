import * as firebase from "firebase";

import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import React, { useEffect, useState } from "react";
import { findRegion, tripViewComponent } from "./TripViewer";

import CachedImage from "react-native-expo-cached-image";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ScrollView } from "react-native-gesture-handler";
import db from "../firebase";
import moment from "moment";

/**
 * This component shows an overview of the trip such as a list of pins and a map
 * of the trip. It allows you to delete the trip.
 */
export default function PastTripOverview({ navigation, route }) {
  const { pins, tripTitle, tripPhotos, time, coordinates, id, uid } =
    route.params;
  const [isFriendTrip, setIsFriendTrip] = useState(true);
  const [tripUser, setTripUser] = useState("");
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const myUid = firebase.auth().currentUser.uid;
    setIsFriendTrip(myUid != uid);
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data();
    setTripUser(userData);
  };

  const onDeleteTrip = () => {
    db.collection("trips")
      .doc(id)
      .delete()
      .then(() => {
        navigation.goBack(null);
      })
      .catch((error) => {
        console.error("Error removing document: ", error);
      });
  };

  const onEditTrip = () => {
    const data = {
      tripTitleText: tripTitle,
      pins: pins,
      tripPhotos: tripPhotos,
      coordinates: coordinates,
      time: time,
      id: id,
      isNewTrip: false,
    };
    navigation.navigate("Trip Overview", data);
  };

  const pinImages = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        {item.title ? (
          <Text style={styles.pinTitle}>{item.title}</Text>
        ) : (
          <Text style={styles.pinTitle}>Pinned Stop</Text>
        )}
        {item.description != "" && item.description && (
          <Text style={styles.pinDescrip}>{item.description}</Text>
        )}
        {item.photos && (
          <ScrollView horizontal={true}>
            {item.photos.map((photo, i) => (
              <Image
                key={i}
                source={{ uri: photo.uri ?? photo }}
                style={{
                  width: Dimensions.get("window").height * 0.23,
                  height: Dimensions.get("window").height * 0.23,
                  margin: 5,
                  padding: 5,
                }}
              />
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <FlatList
      style={styles.container}
      ListHeaderComponent={
        <>
          <View style={styles.row}>
            {tripUser["profilePicture"] ? (
              <CachedImage
                style={styles.profilePic}
                source={{ uri: tripUser["profilePicture"] }}
              />
            ) : (
              <MaterialCommunityIcons
                name="account-circle"
                color={"#808080"}
                size={50}
              />
            )}
            <Text style={styles.name}>{tripUser["displayName"]} </Text>
            {!isFriendTrip && (
              <Menu>
                <MenuTrigger>
                  <Text>
                    <MaterialCommunityIcons
                      style={styles.icon}
                      name="dots-horizontal"
                      color={"#808080"}
                      size={26}
                    />
                  </Text>
                </MenuTrigger>
                <MenuOptions>
                  <MenuOption onSelect={onDeleteTrip} text="Delete trip" />
                  <MenuOption onSelect={onEditTrip} text="Edit trip" />
                </MenuOptions>
              </Menu>
            )}
          </View>
          <Text style={styles.header}> {tripTitle} </Text>
          <Text style={styles.date}>
            {moment(time, moment.ISO_8601).format("LLL")}
          </Text>
        </>
      }
      data={
        tripPhotos && tripPhotos.length > 0
          ? [
              {
                description: "",
                title: "Trip Summary",
                photos: tripPhotos,
              },
            ].concat(pins)
          : pins
      }
      renderItem={pinImages}
      keyExtractor={(item, index) => index.toString()}
      ListFooterComponent={
        <>
          <View style={styles.map}>
            {tripViewComponent(
              pins,
              findRegion(pins, coordinates),
              coordinates
            )}
          </View>
        </>
      }
    ></FlatList>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    padding: 10,
    paddingBottom: 0,
    textAlign: "center",
  },
  name: {
    fontSize: 16,
    padding: 10,
    paddingLeft: 2,
    paddingBottom: 0,
    width: Dimensions.get("window").width * 0.75,
  },
  icon: {
    marginLeft: 50,
    marginTop: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 10,
    padding: 10,
    paddingLeft: 15,
  },
  pinTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  pinDescrip: {
    fontSize: 13,
  },
  pinText: {
    fontSize: 11,
  },
  itemContainer: {
    elevation: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 6,
    elevation: 3,
    backgroundColor: "#fff",
    shadowOffset: { width: 1, height: 1 },
    shadowColor: "#333",
    shadowOpacity: 0.3,
    alignItems: "center",
    justifyContent: "space-around",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.6,
    marginLeft: 22,
    paddingTop: 20,
  },
  profilePic: {
    width: Dimensions.get("window").height * 0.058,
    height: Dimensions.get("window").height * 0.058,
    borderRadius: 1000,
    margin: 5,
    marginLeft: 10,
    marginTop: 10,
  },
});
