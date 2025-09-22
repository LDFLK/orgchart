import React, { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { useThemeContext } from "../../themeContext";

const sentences = [
  "Fetching important data...",
  "Polishing the charts...",
  "Almost there, hang tight!",
  "Loading awesomeness...",
  "This won’t take long!",
];

export default function LoadingComponent({ size = 40, OsColorMode = true }) {
  const { colors } = useThemeContext();
  const [index, setIndex] = useState(0);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlip(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % sentences.length);
        setFlip(false);
      }, 600); 
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`flex flex-col justify-center items-center w-full h-screen ${
        OsColorMode &&
        "bg-[#EBF2F5] dark:bg-[#181818] text-[#181818] dark:text-[#EBF2F5]"
      }`}
      style={{ color: OsColorMode ? "" : colors.textPrimary }}
    >
      <ClipLoader size={size} color={colors.textPrimary} />

      {/* Flipping sentence */}
      <div
        style={{
          perspective: "1000px",
          height: "40px",
          marginTop: "16px",
          overflow: "hidden",
        }}
      >
        <span
          className={`block text-lg font-medium ${
            OsColorMode && "text-[#181818] dark:text-[#EBF2F5]"
          }`}
          style={{
            color: OsColorMode ? "" : colors.textPrimary,
            transform: flip ? "rotateX(90deg)" : "rotateX(0deg)",
            transformOrigin: "bottom",
            transition: "transform 0.6s ease",
          }}
        >
          {sentences[index]}
        </span>
      </div>
    </div>
  );
}
