import {Dimensions, Platform} from 'react-native'

const { width, height } = Dimensions.get('window')

const metrics = {
	// dimensions
	navBarHeight: (Platform.OS === 'ios') ? 44 : 56,
	screenWidth: width,
	screenHeight: height,
	// aesthetics
	lightBackground: '#f2f2f2',
	darkGray: '#bfbfbf',
	borderWidth: 1,
	// image aspect ratios
	logoAspectRatio: 2.66,
	rewindIconAspectRatio: 0.857,
	nopeIconAspectRatio: 1,
	boostIconAspectRatio: 0.545,
	likeIconAspectRatio: 1.2, 
	superLikeIconAspectRatio: 1.05,
	// profile card
	profileCardRadius: 10,
	profileDetailsBigFontSize: 24, 
	profileDetailsSmallFontSize: 16,
}

export default metrics
