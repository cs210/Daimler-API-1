import * as firebase from "firebase";

import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";

import { ScrollView } from "react-native-gesture-handler";
import db from "../firebase";

/**
 * This component shows an overview of the trip such as a list of pins and a map
 * of the trip. The user can also enter a trip title and save the trip.
 */
export default function TripOverview({ navigation, route }) {
  const [tripTitle, setTripTitle] = useState("");

  const pastTripComponent = ({ item }) => {
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
                key={photo.key}
                source={{ uri: photo.uri }}
                style={{ width: 200, height: 200, margin: 5, padding: 5 }}
              />
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const onSaveTrip = async () => {
    const pins = route.params["pins"];
    pins.map((pin) => {
      pin.photos.map((photo) => {
        onPress(photo.uri);
      });
    });
    var tripTitleText = tripTitle["text"];
    if (tripTitleText == null) {
      // Currently using a default name of road trip if user doesn't enter name
      tripTitleText = "Road Trip";
    }
    const tripData = { tripTitleText, pins };
    const collRef = db.collection("trips");
    const newTripRef = await collRef.add(tripData);
    console.log(`Added trip to Firebase reference: ${newTripRef.id}`);
    navigation.navigate("Home");
  };

  const getImageUrl = (url) => {
    storage
      .refFromURL(url)
      .getDownloadURL()
      .then((imageUrl) => {
        // const newlength = allPosts.length + 1;
        // const newId = "post" + newlength;

        const post = {
          //   campaign:
          //     campaignOwner.first_name + "'s " + campaign.name + " Campaign",
          //   campaign_picture: campaign.picture,
          //   comment_count: 0,
          //   comments: [],
          content_picture: imageUrl,
          //   current_status: campaign.progress + 1,
          //   goal: campaign.goal,
          //   likes: 0,
          //   post_id: newId,
          time: new Date(),
          //   user: db.collection("users").doc(contributor.user_id),
        };

        db.collection("trips")
          //   .doc(newId)
          .set(post)
          .then(() => {
            console.log("Posts successfully written!");
          })
          .catch((error) => {
            console.error("Error writing document: ", error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const storage = firebase.storage();

  let onPress = (uri) => {
    const splitURI = uri.split("/");
    const filename = splitURI[8];
    const path = "/trip_assets/";
    var storageRef = firebase.storage().ref(path);
    const ref = storageRef.child(`${filename}`);
    const url = "gs://cs-210-project.appspot.com/trip_assets/" + filename;

    fetch(uri)
      .then((response) => response.blob())
      .then((blob) => {
        ref.put(blob).then((snapshot) => {
          getImageUrl(url);
        });
      })
      .catch((error) => {
        console.log("Error My Guy!", error);
      });
  };

  const onViewOnMap = () => {
    const { pins, tripTitle } = route.params;
    navigation.navigate("Trip Viewer", { pins: pins, tripTitle: tripTitle });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Trip Overview</Text>
      <View style={styles.tripTitleView}>
        <Text style={styles.tripTitleText}> Trip title </Text>
        <TextInput
          style={styles.titleInput}
          placeholder="Enter trip title"
          onChangeText={(text) => setTripTitle({ text })}
          defaultValue={route.params["tripTitleText"]}
        />
      </View>
      <Text style={styles.title}>Stops along the way:</Text>
      {route.params["pins"].length > 0 && (
        <FlatList
          data={route.params["pins"]}
          renderItem={pastTripComponent}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
      <View style={styles.rowContainer}>
        <TouchableOpacity
          onPress={onSaveTrip}
          style={styles.appButtonContainer}
        >
          <Text style={styles.appButtonText}>Save Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onViewOnMap}
          style={styles.appButtonContainer}
        >
          <Text style={styles.appButtonText}>View on Map</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-around",
    margin: 15,
  },
  header: {
    fontSize: 30,
    color: "#8275BD",
    fontWeight: "bold",
  },
  title: {
    fontSize: 20,
    color: "#8275BD",
    margin: 10,
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
    borderRadius: 10,
    borderColor: "#00A398",
    borderWidth: 5,
  },
  tripTitleView: {
    margin: 10,
    alignItems: "stretch",
    height: 40,
    flexDirection: "row",
  },
  tripTitleText: {
    marginTop: 10,
    marginRight: 10,
    fontWeight: "bold",
  },
  titleInput: {
    borderWidth: 1,
    flex: 2,
    borderColor: "#00A398",
    padding: 5,
  },
  appButtonContainer: {
    elevation: 8,
    backgroundColor: "#00A398",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 15,
    marginHorizontal: 4,
  },
  appButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
