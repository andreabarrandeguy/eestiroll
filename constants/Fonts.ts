// Monomakh only ships one weight (regular) — used for titles/headings.
// Manrope ships multiple static weights — pick the matching family instead
// of pairing a numeric fontWeight with it.
export const Fonts = {
  heading: 'Monomakh_400Regular',
  bodyRegular: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  bodySemiBold: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
  bodyExtraBold: 'Manrope_800ExtraBold',
} as const;
