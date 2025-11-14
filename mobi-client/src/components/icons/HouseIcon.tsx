import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface HouseIconProps {
  size?: number;
  color?: string;
}

const HouseIcon: React.FC<HouseIconProps> = ({ size = 24, color = '#FFFFFF' }) => {
  console.log('🏠 HouseIcon render:', { size, color }); // Debug
  
  return (
    <Svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
      style={{ backgroundColor: 'transparent' }}>
      {/* Icon ngôi nhà solid */}
      <Path
        d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
        fill={color}
        fillOpacity={1}
      />
    </Svg>
  );
};

export default HouseIcon;
