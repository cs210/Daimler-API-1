import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  Image,
  KeyboardAvoidingView
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
  console.log("route params", route.params);
  const [comment, setComment] = useState("");

  return (
    <KeyboardAvoidingView style={styles.container} behavior={"padding"}    keyboardVerticalOffset={40}>
      <Text style={styles.header}>{route.params.tripTitle}</Text>
              <Text style={styles.userName}> {route.params.usersName}</Text>
              <Text style={styles.time}>
                {moment(route.params.time, moment.ISO_8601).format("LLL")}
              </Text>
              <ScrollView>

              </ScrollView>
    
        {/* <ScrollView>

        </ScrollView> */}
        <View style={styles.textInputView}>
        <TextInput
        style={styles.textInput}
        placeholder="Enter trip title"
        onChangeText={(text) => setComment({ text })}

      />
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
    // position: 'absolute', 
    // bottom: 0,
    // flex: 1,
    // justifyContent: 'flex-end',
    // paddingBottom: 100,
    paddingBottom: 100,
    alignItems: "stretch",
    height: 30,
    flexDirection: "row",


  },
  textInput: {
    borderWidth: 1,
    flex: 2,
    borderColor: "#00A398",
    // padding: 20,
    height: 20,
  },
});
