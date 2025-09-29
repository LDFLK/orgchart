import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { CiCircleChevLeft } from "react-icons/ci";
import * as d3 from "d3";
import { useThemeContext } from "../../themeContext";
import Dashboard from "../../pages/StatComparison";
import LoadingComponent from "../common_components/loading_component";
import { useSelector } from "react-redux";
import { color } from "highcharts";
import { IoChevronBack } from "react-icons/io5";

export default function Drawer({
  expandDrawer,
  setExpandDrawer,
  ministerDictionary,
  selectedNode,
  ministerToDepartments,
  onMinistryClick,
}) {
  const { colors, isDark } = useThemeContext();
  const [drawerMinisterDictionary, setDrawerMinisterDictionary] = useState({});
  const [showDepartment, setShowDepartment] = useState(false);
  const [selectedMinistry, setSelectedMinistry] = useState("");
  const [departmentListtoShow, setDepartmentListtoShow] = useState([]);

  //redux access
  const { selectedPresident } = useSelector((state) => state.presidency);

  //clear data
  useEffect(() => {
    setDrawerMinisterDictionary({});
  }, [selectedPresident]);

  useEffect(() => {
    console.log("this is from the selected name from drawer", selectedNode);
  }, [selectedNode]);

  //set new data
  useEffect(() => {
    setDrawerMinisterDictionary(ministerDictionary);
  }, [ministerDictionary]);

  return (
    <div
      className={`absolute right-0 z-[100] transition-all duration-300  ease-in-out ${
        expandDrawer ? `w-1/2 h-screen shadow-xl p-4` : "w-0"
      }`}
      style={{
        backgroundColor: colors.backgroundPrimary,
        color: colors.textPrimary,
      }}
    >
      {!expandDrawer && (
        <button
          className={`${
            !expandDrawer
              ? "rounded-l-full bg-[#305cde] text-white text-5xl p-1 absolute right-0 top-12 cursor-pointer shadow-xl"
              : ""
          }`}
          onClick={() => setExpandDrawer(true)}
        >
          <CiCircleChevLeft />
        </button>
      )}
      {expandDrawer && (
        <div className="flex item-center font-semibold">
          <button
            className={`mr-2 text-3xl rotate-180 cursor-pointer mb-2`}
            onClick={() => setExpandDrawer(false)}
          >
            <CiCircleChevLeft />
          </button>
          <p className="text-2xl">Explore more...</p>
        </div>
      )}

      {expandDrawer && (
        <div className="flex flex-col h-[97%] p-2">
          {!showDepartment ? (
            <>
              {/* Header (stays visible) */}
              <h2 className="text-xl font-semibold mb-2 mt-4 shrink-0">
                {Object.keys(drawerMinisterDictionary).length} Active Ministries
              </h2>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto pr-2">
                {drawerMinisterDictionary &&
                  Object.entries(drawerMinisterDictionary).map(
                    ([key, minister], index) => (
                      <div
                        key={key}
                        className={`my-2 p-2 rounded-md cursor-pointer ${
                          isDark
                            ? colors.backgroundWhite
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                        style={{
                          backgroundColor: isDark
                            ? colors.backgroundWhite
                            : "bg-gray-200",
                        }}
                        onClick={() => {
                          onMinistryClick(minister);
                          setSelectedMinistry(minister);
                          setShowDepartment(true);
                          setDepartmentListtoShow(
                            ministerToDepartments[minister.id]
                          );
                        }}
                      >
                        <span className="font-semibold mr-2">{index + 1}.</span>
                        {minister.name}
                      </div>
                    )
                  )}
              </div>
            </>
          ) : departmentListtoShow &&
            departmentListtoShow.length > 0 &&
            showDepartment ? (
            <>
              {/* Header */}
              <div className="shrink-0">
                <button
                  onClick={() => setShowDepartment(false)}
                  className="mt-4 mb-2 cursor-pointer"
                  style={{ color: colors.textMuted }}
                >
                  <div className="flex justify-center items-center">
                    <IoChevronBack className="mr-1" /> <p>Back to previous</p>
                  </div>
                </button>
                <p className="text-xl font-semibold">{selectedMinistry.name}</p>
                <p style={{ color: colors.textPrimary }}>
                  {departmentListtoShow.length} departments
                </p>
              </div>

              {/* Scrollable department list */}
              <div className="flex-1 overflow-y-auto mt-2">
                {departmentListtoShow.map((department, index) => (
                  <div
                    key={index}
                    className={`my-2 p-2 rounded-md cursor-pointer ${
                      isDark
                        ? colors.backgroundWhite
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                    style={{
                      backgroundColor: isDark
                        ? colors.backgroundWhite
                        : "bg-gray-200 hover:bg-gray-300",
                    }}
                    onClick={() => onMinistryClick(department.target)}
                  >
                    <span className="font-semibold mr-2">{index + 1}.</span>
                    {department.target.name}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <LoadingComponent message="Data Loading" OsColorMode={false} />
          )}
        </div>
      )}
    </div>
  );
}
