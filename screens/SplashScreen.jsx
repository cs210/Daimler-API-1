import { Image, StyleSheet, View } from "react-native";

import React from "react";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/app-logo.png")}
        style={styles.logo}
      ></Image>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: 200,
    height: 200,
  },
});
