import React from "react";
import { ClipLoader } from "react-spinners";
import { useThemeContext } from "../../themeContext";

export default function LoadingComponent({ message = "Data Loading", size = 25, OsColorMode = true }) {

  const {colors} = useThemeContext()

  return (
    <div className={`flex justify-center items-center w-full h-screen ${OsColorMode && "bg-[#EBF2F5] dark:bg-[#181818] text-[#181818] dark:text-[#EBF2F5]"}`} style={{color: OsColorMode ? "" : colors.textPrimary}}>
      <ClipLoader size={size} color={`${OsColorMode && "text-[#181818] dark:text-[#EBF2F5]"}`}/>
      <span className={`ml-2 ${OsColorMode && "text-[#181818] dark:text-[#EBF2F5]"}`} style={{color: OsColorMode ? "" : colors.textPrimary}}>{message}</span>
    </div>
  );
}
