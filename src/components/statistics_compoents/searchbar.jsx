import React, { useState } from "react";
import { TbWindowMaximize, TbWindowMinimize } from "react-icons/tb";

export default function StatisticsSearchBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Yearly");

  return (
    <div
      className={`w-full absolute mt-4 flex z-[100] justify-center
       transition-all duration-700 ease-in-out`}
    >
      {/* Expand/Minimize Button */}
      {!isExpanded ? (
        <button
          className="absolute flex right-0 items-center gap-2 cursor-pointer bg-white/90 px-6 py-4 rounded-full"
          onClick={() => setIsExpanded(true)}
        >
          <h1 className="tracking-tight text-gray-900 font-semibold text-lg">
            Xplore Statistics
          </h1>
          <TbWindowMaximize
            className="text-gray-500 hover:text-gray-800 transition duration-300"
            size={24}
          />
        </button>
      ) : (
        <div
          className={`relative bg-white/95 shadow-xl p-4 overflow-hidden flex 
    flex-col items-center w-11/12 md:w-2/3 lg:w-2/3 rounded-2xl
  `}
        >
          {/* Category Buttons */}
          {isExpanded && (
            <>
              <TbWindowMinimize
                className="absolute right-4 top-4 cursor-pointer text-gray-500 hover:text-gray-800 transition duration-300"
                size={28}
                onClick={() => setIsExpanded(false)}
              />

              <div className="text-center text-2xl md:text-4xl font-bold mt-2">
                <h1 className="tracking-tight text-gray-900">
                  Xplore Statistics
                </h1>
              </div>

              <div className="mt-6 flex space-x-3">
                {["Yearly", "Ministry", "Department"].map((item) => (
                  <button
                    key={item}
                    className={`${
                      selectedCategory === item
                        ? "bg-gray-900 border-gray-900 text-white"
                        : ""
                    } px-5 py-2 rounded-full cursor-pointer border font-medium hover:bg-gray-900 hover:text-white hover:border-gray-900 transition duration-500`}
                    onClick={() => setSelectedCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Dropdowns */}
              <div
                className={`mt-6 grid grid-cols-1 ${
                  selectedCategory === "Yearly"
                    ? "md:grid-cols-2"
                    : "md:grid-cols-3"
                } gap-4 w-full`}
              >
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1">
                    Year
                  </label>
                  <select className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-custom_yellow">
                    <option hidden>Select year</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>

                {selectedCategory === "Department" ? (
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-1">
                      Department
                    </label>
                    <select className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-custom_yellow">
                      <option hidden>Select Department</option>
                      <option>Option 1</option>
                      <option>Option 2</option>
                      <option>Option 3</option>
                    </select>
                  </div>
                ) : selectedCategory === "Ministry" ? (
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-1">
                      Minister
                    </label>
                    <select className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-custom_yellow">
                      <option hidden>Select Ministry</option>
                      <option>Option 1</option>
                      <option>Option 2</option>
                      <option>Option 3</option>
                    </select>
                  </div>
                ) : null}

                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1">
                    Statistic Type
                  </label>
                  <select className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-custom_yellow">
                    <option hidden>Select Statistic Type</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
