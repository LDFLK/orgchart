import React from "react";
import { ClipLoader } from "react-spinners";

export default function LoadingComponent({ message = "Data Loading", size = 25 }) {
  return (
    <div className="flex justify-center items-center w-full h-screen">
      <ClipLoader size={size} />
      <span className="ml-2">{message}</span>
    </div>
  );
}
