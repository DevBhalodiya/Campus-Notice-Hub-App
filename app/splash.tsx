import { Nunito_400Regular, Nunito_600SemiBold, useFonts as useNunito } from '@expo-google-fonts/nunito';
import { PlayfairDisplay_700Bold, useFonts as usePlayfair } from '@expo-google-fonts/playfair-display';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as SplashScreenExpo from 'expo-splash-screen';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Circle, Path, Svg } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const COLORS = {
  background: '#FFFFFF',
  deepBlue: '#1E3A8A',
  mediumBlue: '#1D4ED8',
  lightBlue: '#3B82F6',
  paleBlue: '#DBEAFE',
  ghostBlue: '#EFF6FF',
  accentYellow: '#FBBF24',
  green: '#22C55E',
  darkBlue: '#1E3A8A',
};

const pills = [
  { color: COLORS.lightBlue, label: 'Real-time Notices' },
  { color: COLORS.green, label: 'All Departments' },
  { color: COLORS.accentYellow, label: 'Instant Alerts' },
];

export default function Splash() {
  const router = useRouter();
  const [playfairLoaded] = usePlayfair({ PlayfairDisplay_700Bold });
  const [nunitoLoaded] = useNunito({ Nunito_400Regular, Nunito_600SemiBold });

  // Animated values
  const fadeWave = useRef(new Animated.Value(0)).current;
  const fadeIcon = useRef(new Animated.Value(0)).current;
  const scaleIcon = useRef(new Animated.Value(0.8)).current;
  const fadeTitle = useRef(new Animated.Value(0)).current;
  const fadeDivider = useRef(new Animated.Value(0)).current;
  const dividerWidth = useRef(new Animated.Value(0)).current;
  const fadePills = useRef(new Animated.Value(0)).current;
  const fadeBar = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(0)).current;
  const fadeBottom = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    SplashScreenExpo.preventAutoHideAsync();
    Animated.sequence([
      Animated.timing(fadeWave, { toValue: 1, duration: 1, useNativeDriver: true }),
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(scaleIcon, { toValue: 1, friction: 5, useNativeDriver: true }),
        Animated.timing(fadeIcon, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
      Animated.delay(200),
      Animated.timing(fadeTitle, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(fadeDivider, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(dividerWidth, { toValue: 60, duration: 350, useNativeDriver: false }),
        Animated.timing(fadePills, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(fadeBar, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(barWidth, { toValue: width * 0.7, duration: 2200, useNativeDriver: false }),
      ]),
      Animated.delay(200),
      Animated.timing(fadeBottom, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();

    const timeout = setTimeout(() => {
      router.replace('/login');
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (playfairLoaded && nunitoLoaded) {
      SplashScreenExpo.hideAsync();
    }
  }, [playfairLoaded, nunitoLoaded]);

  if (!playfairLoaded || !nunitoLoaded) return null;

  return (
    <View style={styles.container}>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />
      {/* Top Wave */}
      <Animated.View style={{ opacity: fadeWave }}>
        <Svg
          width={width}
          height={height * 0.22}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <Path
            d={`
              M0,0
              H${width}
              V${height * 0.16}
              Q${width * 0.5},${height * 0.28} 0,${height * 0.16}
              Z
            `}
            fill={COLORS.deepBlue}
          />
          {/* Decorative circles */}
          <Circle cx={width * 0.2} cy={height * 0.08} r={18} fill="#fff" opacity="0.13" />
          <Circle cx={width * 0.7} cy={height * 0.06} r={10} fill="#fff" opacity="0.10" />
          <Circle cx={width * 0.5} cy={height * 0.13} r={12} fill="#fff" opacity="0.09" />
        </Svg>
      </Animated.View>

      {/* App Icon Card */}
      <Animated.View
        style={[
          styles.iconCardWrapper,
          {
            opacity: fadeIcon,
            transform: [{ scale: scaleIcon }],
            shadowColor: COLORS.deepBlue,
          },
        ]}
      >
        <LinearGradient
          colors={[COLORS.deepBlue, COLORS.mediumBlue]}
          style={styles.iconCard}
          start={[0, 0]}
          end={[1, 1]}
        >
          {/* App Icon SVG/PNG */}
          <Image
            source={require('../assets/images/app-icon.png')} // <-- Place your provided image here
            style={{ width: 90, height: 90, alignSelf: 'center', marginTop: 10 }}
            resizeMode="contain"
          />
          {/* Bell badge */}
          <View style={styles.bellBadge}>
            <View style={styles.bellCircle}>
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Path
                  d="M12 2C10.343 2 9 3.343 9 5v1.07C6.165 6.555 4 9.03 4 12v5l-1 1v1h18v-1l-1-1v-5c0-2.97-2.165-5.445-5-5.93V5c0-1.657-1.343-3-3-3zm0 18c-1.104 0-2-.896-2-2h4c0 1.104-.896 2-2 2z"
                  fill="#fff"
                />
              </Svg>
            </View>
            <View style={styles.bellDot} />
          </View>
        </LinearGradient>
        <View style={styles.iconCardRing} />
      </Animated.View>

      {/* App Name */}
      <Animated.Text
        style={[
          styles.appName,
          { opacity: fadeTitle, fontFamily: 'PlayfairDisplay_700Bold' },
        ]}
      >
        <Text style={{ color: COLORS.deepBlue }}>Campus </Text>
        <Text style={{ color: COLORS.lightBlue }}>Notice</Text>
        <Text style={{ color: COLORS.deepBlue }}> Hub</Text>
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text
        style={[
          styles.tagline,
          { opacity: fadeTitle, fontFamily: 'Nunito_600SemiBold' },
        ]}
      >
        YOUR CAMPUS. YOUR NOTICES.
      </Animated.Text>

      {/* Gradient Divider */}
      <Animated.View
        style={[
          styles.divider,
          {
            opacity: fadeDivider,
            width: dividerWidth,
          },
        ]}
      >
        <LinearGradient
          colors={[COLORS.lightBlue, COLORS.accentYellow]}
          start={[0, 0]}
          end={[1, 0]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Feature Pills */}
      <Animated.View style={[styles.pillsRow, { opacity: fadePills }]}>
        {pills.map((pill, i) => (
          <View key={pill.label} style={styles.pill}>
            <View style={[styles.pillDot, { backgroundColor: pill.color }]} />
            <Text style={[styles.pillText, { fontFamily: 'Nunito_600SemiBold' }]}>{pill.label}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Loading Bar */}
      <Animated.View style={[styles.loadingBarWrapper, { opacity: fadeBar }]}>
        <Text style={styles.loadingLabel}>LOADING YOUR CAMPUS…</Text>
        <View style={styles.loadingTrack}>
          <Animated.View style={{ width: barWidth, height: 5, borderRadius: 10, overflow: 'hidden' }}>
            <LinearGradient
              colors={[COLORS.mediumBlue, COLORS.lightBlue, COLORS.accentYellow]}
              start={[0, 0]}
              end={[1, 0]}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
      </Animated.View>

      {/* Bottom Tagline */}
      <Animated.Text style={[styles.bottomTagline, { opacity: fadeBottom, fontFamily: 'Nunito_400Regular' }]}>
        Stay informed. Stay ahead. 🎓
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  iconCardWrapper: {
    marginTop: height * 0.13,
    alignSelf: 'center',
    zIndex: 2,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCard: {
    width: 130,
    height: 130,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 0,
    zIndex: 2,
  },
  iconCardRing: {
    position: 'absolute',
    top: -7,
    left: -7,
    width: 144,
    height: 144,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: COLORS.paleBlue,
    zIndex: 1,
  },
  bellBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accentYellow,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.deepBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 2,
  },
  bellDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 4,
  },
  appName: {
    marginTop: 32,
    fontSize: 32,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  tagline: {
    marginTop: 8,
    fontSize: 12,
    color: '#2563EB',
    opacity: 0.75,
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  divider: {
    height: 3,
    borderRadius: 2,
    marginTop: 18,
    marginBottom: 18,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ghostBlue,
    borderColor: COLORS.paleBlue,
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginHorizontal: 6,
  },
  pillDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 7,
  },
  pillText: {
    color: COLORS.darkBlue,
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  loadingBarWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 18,
  },
  loadingLabel: {
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.lightBlue,
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 7,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  loadingTrack: {
    width: width * 0.7,
    height: 5,
    backgroundColor: COLORS.paleBlue,
    borderRadius: 10,
    overflow: 'hidden',
  },
  bottomTagline: {
    position: 'absolute',
    bottom: 24,
    width: '100%',
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 13,
    letterSpacing: 0.1,
  },
});
