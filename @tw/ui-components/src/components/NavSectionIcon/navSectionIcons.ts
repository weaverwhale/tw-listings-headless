import creativeCockpitImage from '../../assets/nav-images/creative-cockpit-icon.png';
import summaryImage from '../../assets/nav-images/summary-icon.png';
import insightsImage from '../../assets/nav-images/insights-icon.png';
import pixelImage from '../../assets/nav-images/pixel-icon.png';
import willyImage from '../../assets/nav-images/willy-icon.png';
import opsImage from '../../assets/nav-images/ops-icon.png';

export const images = {
  summary: summaryImage,
  pixel: pixelImage,
  'creative-cockpit': creativeCockpitImage,
  insights: insightsImage, // also retention
  willy: willyImage,
  ops: opsImage,
} as const;
