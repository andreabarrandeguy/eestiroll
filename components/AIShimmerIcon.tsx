import { Icon } from '@/components/Icon';
import { useEffect, useState } from 'react';

const SHIMMER_COLORS = [
  '#B566FF', '#3468DC', '#6D91FF', '#8EC7A3',
  '#3C8D5F', '#EFC320', '#E95A35', '#EB579C',
];

export const AIShimmerIcon = ({ size = 20, loading = false, inactiveColor = '#888' }) => {
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => setColorIndex(i => (i + 1) % SHIMMER_COLORS.length), 1500);
    return () => clearInterval(interval);
  }, [loading]);

  const color = loading ? inactiveColor : SHIMMER_COLORS[colorIndex];

  return <Icon name="paper-plane" size={size} color={color} />;
};
