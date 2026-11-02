import Svg, { Path } from 'react-native-svg';

// The owner's own hand-drawn arrow, pixel-traced from her photo (contour
// extraction on the inked silhouette, not a hand-guessed bezier approximation)
// so it keeps her actual stroke shape and natural width variation. Filled,
// not stroked — the path is the ink's outline, with the loop's hole as an
// evenodd sub-path. Sized as width/height="100%" of its (flex-measured)
// wrapper rather than fixed pixels, so it scales to fit on any screen height
// instead of a fixed size overflowing into the text above it.
//
// It pointed at the dice on the pre-roll home screen until the three-step
// scaffold replaced that layout. Kept here rather than deleted: it is the one
// hand-made thing in the app and the trace is not cheap to redo.
export const SquiggleArrow = ({ color }: { color: string }) => (
  <Svg width="100%" height="100%" viewBox="0 0 473 727" preserveAspectRatio="xMidYMid meet">
    <Path
      fillRule="evenodd"
      fill={color}
      d="M250.0,718.5 L217.0,713.5 L186.0,702.5 L177.5,695.0 L177.5,687.0 L187.0,680.5 L228.5,695.0 L211.5,674.0 L196.5,645.0 L188.5,620.0 L183.5,583.0 L186.5,534.0 L205.5,404.0 L206.5,352.0 L204.5,334.0 L160.0,340.5 L127.0,339.5 L89.0,330.5 L60.0,315.5 L33.5,291.0 L14.5,260.0 L8.5,243.0 L4.5,220.0 L7.5,193.0 L16.5,175.0 L29.0,162.5 L42.0,154.5 L57.0,149.5 L93.0,149.5 L111.0,154.5 L130.0,163.5 L155.0,181.5 L177.5,206.0 L191.5,228.0 L204.5,257.0 L212.5,283.0 L217.5,313.0 L231.0,309.5 L260.0,295.5 L288.0,276.5 L323.5,243.0 L347.5,213.0 L379.5,163.0 L404.5,114.0 L423.5,68.0 L438.5,14.0 L444.0,8.5 L452.0,7.5 L460.5,14.0 L461.5,22.0 L442.5,71.0 L402.5,153.0 L356.5,226.0 L333.5,254.0 L297.0,288.5 L267.0,308.5 L219.5,329.0 L222.5,364.0 L221.5,401.0 L202.5,539.0 L200.5,583.0 L204.5,612.0 L212.5,637.0 L225.5,661.0 L245.0,682.5 L247.5,679.0 L252.5,635.0 L258.0,630.5 L265.0,629.5 L273.5,636.0 L272.5,702.0 L265.0,713.5 L250.0,718.5 Z M165.5,325.0 L200.0,319.5 L202.5,318.0 L202.5,312.0 L196.5,283.0 L187.5,256.0 L174.5,230.0 L158.5,208.0 L131.0,183.5 L115.0,174.5 L95.0,167.5 L83.0,165.5 L63.0,166.5 L53.0,169.5 L38.0,178.5 L28.5,190.0 L23.5,202.0 L22.5,228.0 L30.5,256.0 L47.5,283.0 L70.0,303.5 L95.0,316.5 L135.0,325.5 L165.5,325.0 Z"
    />
  </Svg>
);
