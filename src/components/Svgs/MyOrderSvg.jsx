const MyOrderSvg = ({ color = "#FF583A", isActive = false, width = 22, height = 22 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.33 2.2V4.95" stroke={isActive ? "#FF583A" : "#000000"} fill="none" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14.67 2.2V4.95" stroke={isActive ? "#FF583A" : "#000000"} fill="none" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.42 10.08H13.75" stroke={isActive ? "#FF583A" : "#000000"} fill="none" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.42 13.75H11" stroke={isActive ? "#FF583A" : "#000000"} fill="none" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.75 19.8H8.25C3.67 19.8 2.75 17.97 2.75 14.3V8.98C2.75 4.77 4.28 3.67 7.33 3.49H14.67C17.72 3.66 19.25 4.77 19.25 8.98V14.67" stroke={isActive ? "#FF583A" : "#000000"} fill="none" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19.25 14.67L13.75 19.8V17.05C13.75 15.31 14.67 14.48 16.5 14.48H19.25Z" stroke={isActive ? "#FF583A" : "#000000"} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

export default MyOrderSvg;
