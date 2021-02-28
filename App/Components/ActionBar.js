import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Metrics } from '../Themes';

export default function ActionBar( {onPressNext, onPressPrev, onPressBoost} ) {
  return (
    <View style={styles.actionBar}>
      <Text> yote </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: Metrics.navBarHeight * 1.5,
    width: Metrics.screenWidth * 0.8,
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
    height: Metrics.navBarHeight,
    width: Metrics.navBarHeight,
    borderRadius: Metrics.navBarHeight * 0.5,
    backgroundColor: 'white',
  },
  bigCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    height: Metrics.navBarHeight * 1.25,
    width: Metrics.navBarHeight * 1.25,
    borderRadius: Metrics.navBarHeight * 0.625,
    backgroundColor: 'white',
  },
  rewindIcon: {
    height: Metrics.navBarHeight * 0.65,
    aspectRatio: Metrics.rewindIconAspectRatio,
  },
  nopeIcon: {
    height: Metrics.navBarHeight * 0.65,
    aspectRatio: Metrics.nopeIconAspectRatio,
  },
  boostIcon: {
    height: Metrics.navBarHeight * 0.65,
    aspectRatio: Metrics.boostIconAspectRatio,
  },
  likeIcon: {
    height: Metrics.navBarHeight * 0.65,
    aspectRatio: Metrics.likeIconAspectRatio,
  },
  superLikeIcon: {
    height: Metrics.navBarHeight * 0.65,
    aspectRatio: Metrics.superLikeIconAspectRatio,
  },
});