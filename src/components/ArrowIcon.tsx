import React from "react";

interface ArrowIconProps {
  className?: string;
  color?: string;
}

const ArrowIcon: React.FC<ArrowIconProps> = ({ 
  className = "", 
  color = "currentColor" 
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      className={className}
    >
      <path 
        stroke={color} 
        strokeLinecap="butt" 
        strokeLinejoin="miter" 
        strokeMiterlimit="10"
        d="M23 12H1" 
        strokeWidth="1"
      />
      <path 
        stroke={color} 
        strokeLinecap="butt" 
        strokeLinejoin="miter" 
        strokeMiterlimit="10"
        d="m11.2729 22.7622 11.3914 -10.0274c0.1041 -0.0919 0.1875 -0.2048 0.2446 -0.3313 0.0571 -0.1265 0.0866 -0.2637 0.0866 -0.4025 0 -0.1388 -0.0295 -0.2761 -0.0866 -0.4026s-0.1405 -0.2394 -0.2446 -0.3312L11.2729 1.23773" 
        strokeWidth="1"
      />
    </svg>
  );
};

export default ArrowIcon;
