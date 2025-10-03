import { useEffect, useState } from "react";
import { CiCircleChevLeft } from "react-icons/ci";
import { useThemeContext } from "../../themeContext";
import LoadingComponent from "../common_components/loading_component";
import { useSelector } from "react-redux";
import { Building, History, UserRound } from "lucide-react";

export default function Drawer({
  expandDrawer,
  setExpandDrawer,
  contentDictionary,
  onMinistryClick,
  selectedNode,
  parentNode,
  personDic
}) {
  const { colors, isDark } = useThemeContext();
  const [drawerContentList, setDrawerContentList] = useState({});
  // Lazy loading state
  const BATCH_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [selectedTab, setSelectedTab] = useState("departments");

  //redux access
  const { selectedPresident } = useSelector((state) => state.presidency);

  //clear data
  useEffect(() => {
    setDrawerContentList({});
    setVisibleCount(BATCH_SIZE);
  }, [selectedPresident]);

  //set new data
  useEffect(() => {
    setDrawerContentList(contentDictionary);
    setVisibleCount(BATCH_SIZE);
  }, [contentDictionary]);

  useEffect(() => {
    console.log("Selected Node in Drawer:", selectedNode);
  }, [selectedNode]);

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
              ? "rounded-l-full bg-[#305cde] text-gray-300 text-5xl p-1 absolute right-0 top-12 cursor-pointer shadow-xl"
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
          <p className="text-xl">Xplore more...</p>
        </div>
      )}

      {expandDrawer && (
        <div className="flex flex-col h-[97%] p-2">
          {drawerContentList ? (
            <>
              {selectedNode && (
                <div className="w-full mb-2 p-4  bg-white border border-gray-200 rounded-sm shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <a href="#">
                    <p className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-300">
                      {selectedNode ? selectedNode.name : ""}
                    </p>
                  </a>
                  <p className="mb-4 text-sm font-normal text-gray-700 dark:text-gray-400">
                    {selectedNode && selectedNode.created
                      ? `'Created Date : '${selectedNode.created.split("T")[0]}`
                      : ""}
                  </p>
                  {selectedNode && selectedNode.type != "government" && (
                    <a
                      href="#"
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-gray-300 bg-blue-700 rounded-sm hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      <History className="w-5 h-5 mr-2" />
                      View History
                    </a>
                  )}
                </div>
              )}

              {parentNode && parentNode.type === "minister" && (
                <div className="flex justify-center mt-4 border border-white/20 p-1 rounded-sm bg-[#0F172A]">
                  <button
                    className={`hover:cursor-pointer w-1/2 py-3 font-normal text-lg transition-colors duration-300 transform rounded-l-sm inline-flex items-center justify-center space-x-2
      ${
        selectedTab === "departments"
          ? "text-cyan-300 bg-[#1E2A38]"
          : "text-white bg-transparent hover:text-cyan-400"
      }`}
                    onClick={() => setSelectedTab("departments")}
                  >
                    <Building className="w-5 h-5" />
                    <span className="text-sm">Departments</span>
                  </button>

                  <button
                    className={`hover:cursor-pointer w-1/2 py-3 font-normal text-lg transition-colors duration-300 transform rounded-r-sm inline-flex items-center justify-center space-x-2 border-l border-white/20
      ${
        selectedTab === "persons"
          ? "text-cyan-300 bg-[#1E2A38]"
          : "text-white bg-transparent hover:text-cyan-400"
      }`}
                    onClick={() => setSelectedTab("persons")}
                  >
                    <UserRound className="w-5 h-5" />
                    <span className="text-sm">Person</span>
                  </button>
                </div>
              )}

              {/* Header (stays visible) */}
              <h2 className="text-md font-semibold mt-4 mb-2 shrink-0">
                {Object.keys(drawerContentList).length} Active{" "}
                {`${
                  parentNode && parentNode.type === "minister"
                    ? "Departments"
                    : parentNode && parentNode.type === "department"
                    ? "Persons"
                    : "Ministries"
                }`}
              </h2>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {drawerContentList &&
                  Object.entries(drawerContentList)
                    .slice(0, visibleCount)
                    .map(([key, item], index) => (
                      <div
                        key={key}
                        className={`my-2 p-2 rounded-sm cursor-pointer font-normal text-sm transition-colors duration-200 text-gray-300 ${
                          isDark
                            ? "bg-[#1E2A38]/50 hover:bg-[#1E2A38]"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                        onClick={() => {
                          onMinistryClick(item);
                          setSelectedTab("departments");
                        }}
                      >
                        <div className="flex">
                          <span className="mr-2 text-gray-300">
                            {index + 1}.
                          </span>
                          <p>{item.name}</p>
                        </div>
                      </div>
                    ))}
                {personDic && selectedTab == "persons" &&
                  Object.entries(personDic)
                    .slice(0, visibleCount)
                    .map(([key, item], index) => (
                      <div
                        key={key}
                        className={`my-2 p-2 rounded-sm cursor-pointer font-normal text-sm transition-colors duration-200 text-gray-300 ${
                          isDark
                            ? "bg-[#1E2A38]/50 hover:bg-[#1E2A38]"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                        onClick={() => {
                          onMinistryClick(item);
                        }}
                      >
                        <div className="flex">
                          <span className="mr-2 text-gray-300">
                            {index + 1}.
                          </span>
                          <p>{item.name}</p>
                        </div>
                      </div>
                    ))}
                <div className="w-full flex flex-col items-center">
                  {/* Lazy load button */}
                  {drawerContentList &&
                    Object.keys(drawerContentList).length > visibleCount && (
                      <button
                        className="mt-2 px-4 text-sm py-2 bg-blue-500 text-gray-300 rounded hover:bg-blue-600 hover:cursor-pointer"
                        onClick={() =>
                          setVisibleCount((prev) => prev + BATCH_SIZE)
                        }
                      >
                        Load More
                      </button>
                    )}
                </div>
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
