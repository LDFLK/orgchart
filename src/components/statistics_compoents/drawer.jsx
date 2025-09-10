import React from "react";
import { IoClose } from "react-icons/io5";

export default function Drawer({
  expandDrawer,
  setExpandDrawer,
  ministerDictionary,
  onMinistryClick,
}) {
  return (
    <div
      className={`fixed right-0 shadow-xl bg-white/95 z-[100] m-4 p-4 pb-14 rounded-2xl overflow-hidden ${
        expandDrawer ? "w-1/3 h-[calc(100vh-32px)]" : ""
      }`}
    >
      <div className="relative flex items-center w-full cursor-pointer">
        {!expandDrawer && "Show more "}{" "}
        <IoClose 
          className={`px-2 ${expandDrawer ? "absolute right-0" : ""}`}
          size={48}
          onClick={() => setExpandDrawer(!expandDrawer)}
        />
      </div>

      {expandDrawer && (
        <>
          <h2 className="text-xl font-semibold mb-2 mt-4">
            {Object.keys(ministerDictionary).length} Active Ministries
          </h2>
          <div className="overflow-y-auto max-h-full pr-2">
            {ministerDictionary &&
              Object.entries(ministerDictionary).map(
                ([key, minister], index) => (
                  <div
                    key={key}
                    className="bg-gray-200 my-2 p-2 rounded-md cursor-pointer hover:bg-gray-300 transition"
                    onClick={() => onMinistryClick(minister)}
                  >
                    <span className="font-semibold mr-2">{index + 1}.</span>
                    {minister.name}
                  </div>
                )
              )}
          </div>
        </>
      )}
    </div>
  );
}
