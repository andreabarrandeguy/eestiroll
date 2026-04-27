import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, ViewStyle } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

type IconName = keyof typeof Ionicons.glyphMap;

interface IconProps {
  name: IconName;
  size: number;
  color: string;
  style?: ViewStyle;
}

// SVG Components para Web
const SVGIcons: Record<string, React.FC<{ size: number; color: string; strokeWidth?: number }>> = {
  // Settings (tuerca)
  'settings-outline': ({ size, color, strokeWidth = 1.5 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),

  // Time/History (reloj)
  'time-outline': ({ size, color, strokeWidth = 1.5 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={strokeWidth}/>
      <Path d="M12 6v6l4 2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),

  // Grid (categories)
  'grid-outline': ({ size, color, strokeWidth = 1.5 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={7} height={7} rx={1} stroke={color} strokeWidth={strokeWidth}/>
      <Rect x={14} y={3} width={7} height={7} rx={1} stroke={color} strokeWidth={strokeWidth}/>
      <Rect x={3} y={14} width={7} height={7} rx={1} stroke={color} strokeWidth={strokeWidth}/>
      <Rect x={14} y={14} width={7} height={7} rx={1} stroke={color} strokeWidth={strokeWidth}/>
    </Svg>
  ),

  // Chevron forward (flecha derecha)
  'chevron-forward': ({ size, color, strokeWidth = 2 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),

  // Moon (dark mode)
  'moon-outline': ({ size, color, strokeWidth = 1.5 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),

  // Language
  'language-outline': ({ size, color, strokeWidth = 1.5 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={strokeWidth}/>
      <Path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),

  // Checkbox (marcado)
  'checkbox': ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={18} height={18} rx={3} fill={color}/>
      <Path d="M9 12l2 2 4-4" stroke="#000" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),

  // Square outline (checkbox vacío)
  'square-outline': ({ size, color, strokeWidth = 1.5 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={18} height={18} rx={3} stroke={color} strokeWidth={strokeWidth}/>
    </Svg>
  ),

  // Checkmark circle outline (select)
  'checkmark-circle-outline': ({ size, color, strokeWidth = 1.5 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={strokeWidth}/>
      <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),

  // Copy outline
  'copy-outline': ({ size, color, strokeWidth = 1.5 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={9} y={9} width={13} height={13} rx={2} stroke={color} strokeWidth={strokeWidth}/>
      <Path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),

  // Trash outline
  'trash-outline': ({ size, color, strokeWidth = 1.5 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),

  // Trash (filled)
  'trash': ({ size, color, strokeWidth = 1.5 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Line x1={10} y1={11} x2={10} y2={17} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1={14} y1={11} x2={14} y2={17} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    </Svg>
  ),

  // Add circle outline
  'add-circle-outline': ({ size, color, strokeWidth = 1.5 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={strokeWidth}/>
      <Line x1={12} y1={8} x2={12} y2={16} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1={8} y1={12} x2={16} y2={12} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    </Svg>
  ),

  // Close (X)
  'close': ({ size, color, strokeWidth = 2 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={18} y1={6} x2={6} y2={18} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1={6} y1={6} x2={18} y2={18} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    </Svg>
  ),

  // Checkmark
  'checkmark': ({ size, color, strokeWidth = 2 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12l5 5L20 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),

  // Paper plane (send) - FILLED, igual que Ionicons
  'paper-plane': ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Path d="M473 39.05a24 24 0 00-25.5-5.46L47.47 185h-.08a24 24 0 001 45.16l.41.13 137.3 58.63a16 16 0 0015.54-3.59L422 80a7.07 7.07 0 0110 10L226.66 310.26a16 16 0 00-3.59 15.54l58.65 137.38c.06.2.12.38.19.57 3.2 9.27 11.3 15.81 21.09 16.25h1a24.63 24.63 0 0023-15.46L478.39 64.62A24 24 0 00473 39.05z" fill={color}/>
    </Svg>
  ),

  // Arrow back
  'arrow-back': ({ size, color, strokeWidth = 2 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),

  // Remove (minus)
  'remove': ({ size, color, strokeWidth = 2 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={5} y1={12} x2={19} y2={12} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    </Svg>
  ),

  // Add (plus)
  'add': ({ size, color, strokeWidth = 2 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={12} y1={5} x2={12} y2={19} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1={5} y1={12} x2={19} y2={12} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    </Svg>
  ),

  // Close circle (X en círculo - filled)
  'close-circle': ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} fill={color}/>
      <Line x1={15} y1={9} x2={9} y2={15} stroke="#fff" strokeWidth={2} strokeLinecap="round"/>
      <Line x1={9} y1={9} x2={15} y2={15} stroke="#fff" strokeWidth={2} strokeLinecap="round"/>
    </Svg>
  ),

  // Checkmark circle (tick en círculo - filled)
  'checkmark-circle': ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} fill={color}/>
      <Path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),

  // Chevron down
  'chevron-down': ({ size, color, strokeWidth = 2 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),

  // Chevron up
  'chevron-up': ({ size, color, strokeWidth = 2 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 15l-6-6-6 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),

  // Sparkles outline
  'sparkles-outline': ({ size, color, strokeWidth = 1.5 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
};

export function Icon({ name, size, color, style }: IconProps) {
  if (Platform.OS === 'web') {
    const SVGIcon = SVGIcons[name];
    if (SVGIcon) {
      return <SVGIcon size={size} color={color} />;
    }
    // Fallback: devolver null o un placeholder
    console.warn(`Icon "${name}" not found for web`);
    return null;
  }
  
  return <Ionicons name={name} size={size} color={color} style={style} />;
}