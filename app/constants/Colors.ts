/**
 * Theme colors for light and dark modes
 * Following WCAG 2.1 AA contrast requirements
 */

export const Colors = {
  light: {
    // Primary brand color (BT Orange)
    primary: '#FF6600',
    primaryDark: '#CC5200',
    primaryLight: '#FF9933',
    
    // Backgrounds
    background: '#FFFFFF',
    surface: '#F5F5F5',
    card: '#FFFFFF',
    
    // Text
    text: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textInverse: '#FFFFFF',
    
    // Borders
    border: '#E0E0E0',
    borderFocus: '#FF6600',
    
    // Status colors
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
    
    // ETA status
    onTime: '#4CAF50',
    delayed: '#F44336',
    early: '#2196F3',
    scheduled: '#999999',
    
    // Map colors
    mapMarkerStop: '#FF6600',
    mapMarkerVehicle: '#2196F3',
    mapRouteOutline: '#1A1A1A',
    
    // Crowding levels
    crowdingLow: '#4CAF50',
    crowdingMedium: '#FFC107',
    crowdingHigh: '#F44336',
    
    // Shadow (iOS)
    shadow: {
      color: '#000000',
      opacity: 0.1,
      offset: { width: 0, height: 2 },
      radius: 4,
      elevation: 3,
    },
  },
  
  dark: {
    // Primary brand color (BT Orange - slightly adjusted for dark mode)
    primary: '#FF7722',
    primaryDark: '#CC5200',
    primaryLight: '#FFAA66',
    
    // Backgrounds
    background: '#121212',
    surface: '#1E1E1E',
    card: '#2C2C2C',
    
    // Text
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    textTertiary: '#808080',
    textInverse: '#1A1A1A',
    
    // Borders
    border: '#3A3A3A',
    borderFocus: '#FF7722',
    
    // Status colors (adjusted for dark mode contrast)
    success: '#66BB6A',
    warning: '#FFD54F',
    error: '#EF5350',
    info: '#42A5F5',
    
    // ETA status
    onTime: '#66BB6A',
    delayed: '#EF5350',
    early: '#42A5F5',
    scheduled: '#808080',
    
    // Map colors
    mapMarkerStop: '#FF7722',
    mapMarkerVehicle: '#42A5F5',
    mapRouteOutline: '#FFFFFF',
    
    // Crowding levels
    crowdingLow: '#66BB6A',
    crowdingMedium: '#FFD54F',
    crowdingHigh: '#EF5350',
    
    // Shadow (iOS)
    shadow: {
      color: '#000000',
      opacity: 0.3,
      offset: { width: 0, height: 2 },
      radius: 4,
      elevation: 3,
    },
  },
} as const;

// Route colors (from BT4U API, with fallback)
export const RouteColors = {
  CAS: '#302F2F', // Campus Shuttle
  MSN: '#FF6600', // Main Street North
  HWD: '#0000FF', // Hethwood
  BMR: '#FF69B4', // Beamer Way
  PRG: '#7156A5', // Progress Street
  // Add more as needed
  DEFAULT: '#FF6600',
} as const;

