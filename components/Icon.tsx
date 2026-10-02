import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';

type IconName = keyof typeof Ionicons.glyphMap;

interface IconProps {
  name: IconName;
  size: number;
  color: string;
  style?: ViewStyle;
}

// SVG Components for Web
const SVGIcons: Record<string, React.FC<{ size: number; color: string; strokeWidth?: number }>> = {
  // Settings (helm wheel — a cross between a gear and a ship's wheel, for
  // the tab bar's own identity rather than a generic Ionicons gear)
  'settings-outline': ({ size, color, strokeWidth = 1.3 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={7.5} stroke={color} strokeWidth={strokeWidth}/>
      <Circle cx={12} cy={12} r={2} stroke={color} strokeWidth={strokeWidth}/>
      <Line x1={12} y1={4.5} x2={12} y2={10} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1={12} y1={14} x2={12} y2={19.5} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1={4.5} y1={12} x2={10} y2={12} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1={14} y1={12} x2={19.5} y2={12} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1={6.6} y1={6.6} x2={10.6} y2={10.6} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1={13.4} y1={13.4} x2={17.4} y2={17.4} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1={17.4} y1={6.6} x2={13.4} y2={10.6} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1={10.6} y1={13.4} x2={6.6} y2={17.4} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Circle cx={12} cy={3.3} r={1.1} fill={color}/>
      <Circle cx={12} cy={20.7} r={1.1} fill={color}/>
      <Circle cx={3.3} cy={12} r={1.1} fill={color}/>
      <Circle cx={20.7} cy={12} r={1.1} fill={color}/>
      <Circle cx={5.9} cy={5.9} r={1.1} fill={color}/>
      <Circle cx={18.1} cy={18.1} r={1.1} fill={color}/>
      <Circle cx={18.1} cy={5.9} r={1.1} fill={color}/>
      <Circle cx={5.9} cy={18.1} r={1.1} fill={color}/>
    </Svg>
  ),

  // Time/History (pocket watch — loop + stem + bold face, matching the
  // reference image rather than a generic Ionicons clock)
  'time-outline': ({ size, color, strokeWidth = 1.3 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Ellipse cx={12} cy={2.3} rx={1.6} ry={2} stroke={color} strokeWidth={strokeWidth}/>
      <Rect x={10.7} y={3.7} width={2.6} height={2.4} rx={0.6} stroke={color} strokeWidth={strokeWidth}/>
      <Circle cx={12} cy={13} r={8} stroke={color} strokeWidth={strokeWidth}/>
      <Line x1={12} y1={5} x2={12} y2={6.8} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1={20} y1={13} x2={18.2} y2={13} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1={12} y1={21} x2={12} y2={19.2} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1={4} y1={13} x2={5.8} y2={13} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1={12} y1={13} x2={7.3} y2={8.3} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Line x1={12} y1={13} x2={9.2} y2={17.7} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
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

  // Chevron forward (right arrow)
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

  // Checkbox (checked)
  'checkbox': ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={18} height={18} rx={3} fill={color}/>
      <Path d="M9 12l2 2 4-4" stroke="#000" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),

  // Square outline (empty checkbox)
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

  // Paper plane (send) - FILLED, matches Ionicons
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

  // Close circle (X in circle - filled)
  'close-circle': ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} fill={color}/>
      <Line x1={15} y1={9} x2={9} y2={15} stroke="#fff" strokeWidth={2} strokeLinecap="round"/>
      <Line x1={9} y1={9} x2={15} y2={15} stroke="#fff" strokeWidth={2} strokeLinecap="round"/>
    </Svg>
  ),

  // Checkmark circle (tick in circle - filled)
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

  // Share (arrow out of tray)
  'share-outline': ({ size, color, strokeWidth = 1.5 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 15V3M8 7l4-4 4 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),

  // Information circle outline
  'information-circle-outline': ({ size, color, strokeWidth = 1.5 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={strokeWidth}/>
      <Line x1={12} y1={11} x2={12} y2={16} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Circle cx={12} cy={7.8} r={1.1} fill={color}/>
    </Svg>
  ),

  // Help circle outline (how it works / tutorial)
  'help-circle-outline': ({ size, color, strokeWidth = 1.5 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={strokeWidth}/>
      <Path d="M9.5 9a2.5 2.5 0 014.9.8c0 1.7-2.4 2.2-2.4 3.7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Circle cx={12} cy={16.5} r={1.1} fill={color}/>
    </Svg>
  ),

  // Star outline (bookmark — used in the "Add to Home Screen" tutorial step
  // for the desktop case, where bookmarking is the realistic equivalent)
  'star-outline': ({ size, color, strokeWidth = 1.5 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6-4.4-4.2 6-.8z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),

  // Ellipsis vertical (Android/Chrome overflow menu — used in the "Add to
  // Home Screen" tutorial step)
  'ellipsis-vertical': ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={5} r={1.6} fill={color}/>
      <Circle cx={12} cy={12} r={1.6} fill={color}/>
      <Circle cx={12} cy={19} r={1.6} fill={color}/>
    </Svg>
  ),

  // Flag outline (report feedback)
  'flag-outline': ({ size, color, strokeWidth = 1.5 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 21V4a1 1 0 011-1h11.5a.5.5 0 01.4.8l-3.15 4.2a1 1 0 000 1.2l3.15 4.2a.5.5 0 01-.4.8H6a1 1 0 00-1 1z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),

  // Alert circle outline (error state)
  'alert-circle-outline': ({ size, color, strokeWidth = 1.5 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={strokeWidth}/>
      <Line x1={12} y1={7.5} x2={12} y2={13} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <Circle cx={12} cy={16.3} r={1.1} fill={color}/>
    </Svg>
  ),

  // Create/pencil outline (edit)
  'create-outline': ({ size, color, strokeWidth = 1.5 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 3a2.85 2.85 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),

  // Refresh outline (retry)
  'refresh-outline': ({ size, color, strokeWidth = 1.5 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12a8 8 0 0114.5-4.5M20 12a8 8 0 01-14.5 4.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M18.5 3v5h-5M5.5 21v-5h5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
};

// Custom-drawn icons with no real Ionicons equivalent (the tab bar's helm
// wheel and pocket watch) — rendered from our own SVG on every platform,
// not just web, since react-native-svg works natively too.
const CUSTOM_ICON_NAMES = new Set(['settings-outline', 'time-outline']);

export function Icon({ name, size, color, style }: IconProps) {
  if (Platform.OS === 'web' || CUSTOM_ICON_NAMES.has(name)) {
    const SVGIcon = SVGIcons[name];
    if (SVGIcon) {
      return <SVGIcon size={size} color={color} />;
    }
    // Fallback: return null or a placeholder
    console.warn(`Icon "${name}" not found for web`);
    return null;
  }

  return <Ionicons name={name} size={size} color={color} style={style} />;
}