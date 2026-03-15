import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StatusBar, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Splash() {
  const router = useRouter();
  
  // Simple animation values
  const scaleIcon = useRef(new Animated.Value(0.5)).current;
  const fadeIcon = useRef(new Animated.Value(0)).current;
  const fadeText = useRef(new Animated.Value(0)).current;
  const spinnerRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Icon scale and fade animation
    Animated.parallel([
      Animated.spring(scaleIcon, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(fadeIcon, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Text fade in
    setTimeout(() => {
      Animated.timing(fadeText, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 300);

    // Spinner continuous rotation
    Animated.loop(
      Animated.timing(spinnerRotation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Navigate to login after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const spin = spinnerRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />

      {/* Background gradient effect using simple view */}
      <View style={styles.background}>
        <View style={styles.gradientTop} />
      </View>

      {/* App Icon with animation */}
      <Animated.View
        style={[
          styles.iconWrapper,
          {
            opacity: fadeIcon,
            transform: [{ scale: scaleIcon }],
          },
        ]}
      >
        <Image
          source={require('../assets/images/app-icon.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </Animated.View>

      {/* App Name */}
      <Animated.Text style={[styles.appName, { opacity: fadeText }]}>
        Campus Notice Hub
      </Animated.Text>

      {/* Subtitle */}
      <Animated.Text style={[styles.subtitle, { opacity: fadeText }]}>
        Your Campus. Your Notices.
      </Animated.Text>

      {/* Loading spinner */}
      <Animated.View
        style={[
          styles.spinnerContainer,
          {
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <View style={styles.spinner} />
      </Animated.View>

      {/* Loading text */}
      <Animated.Text style={[styles.loadingText, { opacity: fadeText }]}>
        Loading...
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradientTop: {
    width: '100%',
    height: '35%',
    backgroundColor: '#1E3A8A',
  },
  iconWrapper: {
    marginBottom: 40,
  },
  icon: {
    width: 100,
    height: 100,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 50,
    textAlign: 'center',
    fontWeight: '500',
  },
  spinnerContainer: {
    marginBottom: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: 50,
    height: 50,
    borderWidth: 4,
    borderColor: '#E2E8F0',
    borderTopColor: '#3B82F6',
    borderRadius: 25,
  },
  loadingText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 1,
  },
});
