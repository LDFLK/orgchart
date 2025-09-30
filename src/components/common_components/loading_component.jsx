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
      {/* Loading Spinner */}
      <div className="flex justify-center mt-8">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 border-r-purple-500 animate-spin"></div>
        </div>
      </div>

      {/* Please Wait Message */}
      <div className="text-center mt-8">
        <p className="text-gray-500 text-sm animate-pulse">
          Please wait while we prepare everything for you...
        </p>
      </div>
    </div>
  );
}
