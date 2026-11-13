import {
  Monitor,
  Projector,
  Cpu,
  Network,
  Microscope,
  Code2,
  Wrench
} from 'lucide-react';
import { CATEGORY_DETAILS } from '../utils/categories';

const ICON_MAP = {
  'Computer Systems': Monitor,
  Projectors: Projector,
  'Electronic Equipment': Cpu,
  'Networking Devices': Network,
  'Laboratory Instruments': Microscope,
  'Software Resources': Code2,
  'Other Equipment': Wrench
};

const CategoryIcon = ({ category, size = 22, withBox = true }) => {
  const Icon = ICON_MAP[category] || Wrench;
  const styleInfo = CATEGORY_DETAILS[category] || CATEGORY_DETAILS['Other Equipment'];

  if (!withBox) {
    return <Icon size={size} color={styleInfo.color} />;
  }

  return (
    <div
      className="equipment-icon-box"
      style={{ backgroundColor: styleInfo.bg, color: styleInfo.color }}
      title={category}
    >
      <Icon size={size} />
    </div>
  );
};

export default CategoryIcon;

