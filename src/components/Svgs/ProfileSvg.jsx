const ProfileSvg = ({ color = "#898989", isActive = false, width = 22, height = 22 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 11C13.53 11 15.58 8.95 15.58 6.42C15.58 3.89 13.53 1.83 11 1.83C8.47 1.83 6.42 3.89 6.42 6.42C6.42 8.95 8.47 11 11 11Z" stroke={isActive ? "#FF583A" : color} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.87 20.17C18.87 16.62 15.35 13.75 11 13.75C6.65 13.75 3.13 16.62 3.13 20.17" stroke={isActive ? "#FF583A" : color} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

export default ProfileSvg; 