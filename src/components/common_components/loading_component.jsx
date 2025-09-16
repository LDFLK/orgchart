import React from "react";
import { ClipLoader } from "react-spinners";
import { useThemeContext } from "../../themeContext";

export default function LoadingComponent({ message = "Data Loading", size = 25 }) {

  const {colors} = useThemeContext();

  return (
    <div className="flex justify-center items-center w-full h-screen" style={{color:`${colors.textPrimary}`,backgroundColor: colors.backgroundPrimary}}>
      <ClipLoader size={size} color={colors.textPrimary}/>
      <span className="ml-2" style={{color: colors.textPrimary}}>{message}</span>
    </div>
  );
}
