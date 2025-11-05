/**
 * Index redirect - redirects to Map tab
 * This file must exist for Expo Router to work correctly
 */

import { useEffect } from 'react';
import { Redirect } from 'expo-router';

export default function IndexRedirect() {
  return <Redirect href="/(tabs)/map" />;
}

