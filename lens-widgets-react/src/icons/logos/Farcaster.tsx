export function FarcasterLogo({ isDarkTheme }: { isDarkTheme: boolean }) {
  const fill = isDarkTheme ? "black" : "white";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      style={iconStyle}
    >
      <path
        style={{ fill: fill }}
        d="M59.27,76.97c6.27-7.55,4.89-15.53,4.71-23.24-.19-8.24-6.16-13.92-14.01-13.9-7.78.03-13.8,5.83-13.96,13.99-.15,7.7-1.53,15.67,4.81,23.24h-20c5.46-15.62,4.74-30.87-.01-46.46,1.66-.19,2.94-.53,4.2-.45,3.37.21,5.3-.68,5.41-4.62.03-1.15,2.35-3.18,3.67-3.21,10.66-.26,21.33-.23,31.99-.04,1.23.02,3.53,1.61,3.48,2.35-.4,5.62,3.07,5.77,7.06,5.53.63-.04,1.28.19,2.5.39-4.49,15.34-5.48,30.57.09,46.41h-19.93Z"
      />
    </svg>
  );
}

const iconStyle = {
  height: 42,
};
