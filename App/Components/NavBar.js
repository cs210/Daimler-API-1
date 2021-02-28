import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Images, Metrics } from '../Themes';

export default function NavBar() {
  return (
    <View style={styles.navbar}>
      <TouchableOpacity>
        <Image style={styles.button} source={Images.settings} />
      </TouchableOpacity>
      <Image style={styles.logo} source={Images.logo} />
      <TouchableOpacity>
        <Image style={styles.button} source={Images.chat} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    height: Metrics.navBarHeight,
    width: Metrics.screenWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: Metrics.darkGray,
    borderBottomWidth: Metrics.borderWidth,
  },
  logo: {
    height: Metrics.navBarHeight * 0.75,
    width: Metrics.navBarHeight * 0.75 * Metrics.logoAspectRatio,
    alignSelf: 'center',
  },
  button: {
    height: Metrics.navBarHeight,
    width: Metrics.navBarHeight,
    tintColor: Metrics.darkGray,
    marginHorizontal: 12,
  },
});