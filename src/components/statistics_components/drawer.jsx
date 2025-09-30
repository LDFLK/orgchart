import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { CiCircleChevLeft } from "react-icons/ci";
import { useThemeContext } from "../../themeContext";
import Dashboard from "../../pages/StatComparison";
import LoadingComponent from "../common_components/loading_component";
import { useSelector } from "react-redux";
import { IoChevronBack } from "react-icons/io5";
import {
  Box,
  Alert,
  AlertTitle,
} from "@mui/material";

export default function Drawer({
  expandDrawer,
  setExpandDrawer,
  ministerDictionary,
  selectedNode,
  ministerToDepartments,
  onMinistryClick,
  filterGraphBy,
  filteredGraphData,
}) {
  const { colors, isDark } = useThemeContext();
  const [drawerMinisterDictionary, setDrawerMinisterDictionary] = useState({});
  const [showDepartment, setShowDepartment] = useState(false);
  const [selectedMinistry, setSelectedMinistry] = useState("");
  const [departmentListtoShow, setDepartmentListtoShow] = useState([]);
  const [targetOnlyNodes, setTargetOnlyNodes] = useState([]);

  //redux access
  const { selectedPresident } = useSelector((state) => state.presidency);

  //clear data
  useEffect(() => {
    setDrawerMinisterDictionary({});
  }, [selectedPresident]);

  //set new data
  useEffect(() => {
    setDrawerMinisterDictionary(ministerDictionary);
  }, [ministerDictionary]);

  // derive target-only nodes for current filtered graph
  useEffect(() => {
    try {
      if (!filterGraphBy || !filteredGraphData || !filteredGraphData.links) {
        setTargetOnlyNodes([]);
        return;
      }

      const targetIdSet = new Set(
        filteredGraphData.links
          .map((link) => {
            const t = link?.target;
            return typeof t === "object" ? t?.id : t;
          })
          .filter((id) => id !== undefined && id !== null)
      );

      const nodes = (filteredGraphData.nodes || []).filter(
        (node) => node?.type === filterGraphBy && targetIdSet.has(node?.id)
      );

      setTargetOnlyNodes(nodes);
    } catch (e) {
      console.log("failed deriving target-only nodes:", e);
      setTargetOnlyNodes([]);
    }
  }, [filterGraphBy, filteredGraphData]);

  return (
    <div
      className={`${
        expandDrawer ? "w-1/3" : "w-0"
      } z-[1000] transition-all duration-300 ease-in-out h-full shadow-xl p-4 flex-shrink-0`}
      style={{
        backgroundColor: colors.backgroundPrimary,
        color: colors.textPrimary,
        overflow: expandDrawer ? "visible" : "hidden",
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
          {!showDepartment && filterGraphBy == null ? (
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
          ) : filterGraphBy == null &&
            departmentListtoShow &&
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
          ) : filterGraphBy == "minister" && targetOnlyNodes.length > 0 ? (
            <>
              {/* Header (stays visible) */}
              <h2 className="text-xl font-semibold mb-2 mt-4 shrink-0">
                {targetOnlyNodes.length} Active Ministries
              </h2>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto pr-2">
                {targetOnlyNodes &&
                  targetOnlyNodes.map((minister, index) => (
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
                  ))}
              </div>
            </>
          ) : filterGraphBy == "department" && targetOnlyNodes.length > 0 ? (
            <>
              {/* Header (stays visible) */}
              <h2 className="text-xl font-semibold mb-2 mt-4 shrink-0">
                {targetOnlyNodes.length} Active Departments
              </h2>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto pr-2">
                {targetOnlyNodes &&
                  targetOnlyNodes.map((minister, index) => (
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
                  ))}
              </div>
            </>
          ) : filterGraphBy == "person" && targetOnlyNodes.length > 0 ? (
            <>
              {/* Header (stays visible) */}
              <h2 className="text-xl font-semibold mb-2 mt-4 shrink-0">
                {targetOnlyNodes.length} Persons
              </h2>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto pr-2">
                {targetOnlyNodes &&
                  targetOnlyNodes.map((minister, index) => (
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
                  ))}
              </div>
            </>
          ) : filterGraphBy != null && targetOnlyNodes.length === 0 ? (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                marginTop: "15px",
              }}
            >
              <Alert severity="info" sx={{ backgroundColor: "transparent" }}>
                <AlertTitle
                  sx={{
                    fontFamily: "poppins",
                    color: colors.textPrimary,
                  }}
                >
                  No Search Result
                </AlertTitle>
              </Alert>
            </Box>
          ) : (
            <LoadingComponent message="Data Loading" OsColorMode={false} />
          )}
        </div>
      )}
    </div>
  );
}
