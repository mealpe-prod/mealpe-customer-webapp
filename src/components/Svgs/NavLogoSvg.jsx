const NavLogoSvg = ({ width = 109, height = 110 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 109 110" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15))' }}>
      <circle cx="54.44" cy="49.44" r="49.44" fill="white"/>
      <g filter="url(#filter0_d_56_963)">
        <circle cx="54.44" cy="49.44" r="38.4533" fill="url(#paint0_linear_56_963)"/>
      </g>
      <path fillRule="evenodd" clipRule="evenodd" d="M28.9654 47.5342C27.6782 48.8213 27.6782 50.9083 28.9654 52.1954L43.4063 66.6363C44.6934 67.9235 46.7803 67.9235 48.0675 66.6363L54.4436 60.2602L60.8197 66.6363C62.1069 67.9235 64.1938 67.9235 65.4809 66.6363L79.9218 52.1954C81.209 50.9083 81.209 48.8213 79.9218 47.5342L65.4809 33.0933C64.1938 31.8061 62.1069 31.8061 60.8197 33.0933L54.4436 39.4694L48.0675 33.0933C46.7803 31.8061 44.6934 31.8061 43.4063 33.0933L28.9654 47.5342Z" fill="white"/>
      <defs>
        <filter id="filter0_d_56_963" x="0.605361" y="2.19736" width="107.669" height="107.669" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="6.592"/>
          <feGaussianBlur stdDeviation="7.69067"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.345098 0 0 0 0 0.227451 0 0 0 0.2 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_56_963"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_56_963" result="shape"/>
        </filter>
        <linearGradient id="paint0_linear_56_963" x1="54.44" y1="10.9867" x2="54.44" y2="87.8934" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF583A"/>
          <stop offset="1" stopColor="#FF583A"/>
        </linearGradient>
      </defs>
    </svg>
  );
};

export default NavLogoSvg;
