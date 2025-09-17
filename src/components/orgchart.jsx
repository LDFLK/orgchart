import { useEffect, useState, useCallback } from "react";
import TidyTree from "./TidyTree";
import EventSlider from "./EventSlider";
import { ErrorBoundary } from "react-error-boundary";
import "./../index.css";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedDate } from "../store/presidencySlice";
import { setGazetteData } from "../store/gazetteDate";
import { colors } from "@mui/material";
import { useThemeContext } from "../themeContext";
import { ClipLoader } from "react-spinners";



// const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "/"
const apiUrl = ""

// Decode minister name from hex format
const decodeHexString = (hex) =>
  decodeURIComponent(hex.replace(/(..)/g, "%$1"));

// Helper function to decode hex string to readable text
const hexToString = (hex) => {
  try {
    let str = "";
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  } catch (error) {
    console.error("Error decoding hex string:", error);
    return hex; // Return original if decoding fails
  }
};

// Helper function to extract name from protobuf format
const extractNameFromProtobuf = (nameObj) => {
  try {
    if (typeof nameObj === "string") {
      const parsed = JSON.parse(nameObj);
      if (parsed.value) {
        return hexToString(parsed.value);
      }
    }
    return nameObj; // Return as-is if not in expected format
  } catch (error) {
    console.error("Error parsing protobuf name:", error);
    return nameObj;
  }
};

// // Convert raw ministerial data into tree format
// const transformRawDataToTree = (rawData) => {
//   const children = rawData.map((item) => {
//     let name = item.name
//     const ministryId = item.id

//     try {
//       const parsed = JSON.parse(item.name)
//       if (parsed?.value) {
//         name = decodeHexString(parsed.value)
//       }
//     } catch (e) {
//       name = item.name
//     }

//     return {
//       name,
//       children: [],
//       id: ministryId,
//       type: "ministry",
//     }
//   })

//   return {
//     name: "Government",
//     children,
//     type: "root",
//   }
// }

// Fetch active departments for a specific ministry with date filtering
const fetchDepartments = async (ministryId, selectedDate) => {
  try {
    // Fetch active department relations for the ministry at the selected date
    const response = await fetch(`${apiUrl}/v1/entities/${ministryId}/relations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        relatedEntityId: "",
        startTime: `${selectedDate.date}T00:00:00Z`,
        endTime: "",
        id: "",
        name: "AS_DEPARTMENT",
      }),
    });

    // Fetch all department protobuf data
    const response2 = await fetch(`${apiUrl}/v1/entities/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kind: {
          major: "Organisation",
          minor: "department",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    if (!response2.ok) {
      throw new Error(`API error: ${response2.statusText}`);
    }

    const activeDepartmentRelations = await response.json();
    const departmentsWithName = await response2.json();

    // console.log("Active department relations:", activeDepartmentRelations);
    // console.log("Departments with name:", departmentsWithName);

    // Extract the relatedEntityIds from the active department relations
    const activeDepartmentIds = activeDepartmentRelations
      .filter(
        (relation) =>
          relation.relatedEntityId && relation.name === "AS_DEPARTMENT"
      )
      .map((relation) => relation.relatedEntityId);

    // console.log("Active department IDs:", activeDepartmentIds);

    // Create a lookup map for department names
    const departmentNameMap = {};
    if (departmentsWithName.body && Array.isArray(departmentsWithName.body)) {
      departmentsWithName.body.forEach((dept) => {
        if (dept && dept.id) {
          const decodedName = extractNameFromProtobuf(dept.name);
          departmentNameMap[dept.id] = decodedName || dept.id;
        }
      });
    }

    // console.log("Department name map:", departmentNameMap);

    // Map active department IDs with the protobuf data to get department names
    const filteredDepartments = activeDepartmentIds
      .filter((deptId) =>
        Object.prototype.hasOwnProperty.call(departmentNameMap, deptId)
      )
      .map((deptId) => {
        const deptName = departmentNameMap[deptId];
        return {
          name: deptName,
          id: deptId,
          type: "department",
        };
      })
      .filter((dept) => dept && dept.id && dept.name);

    // console.log("Filtered active departments:", filteredDepartments);
    return filteredDepartments;
  } catch (error) {
    console.error(
      `Error fetching departments for ministry ${ministryId}:`,
      error
    );
    return [];
  }
};

// Fetch initial gazette dates and all ministry protobuf data
const fetchInitialGazetteData = async () => {
  try {
    // const response = await fetch("/v1/entities/search", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     kind: {
    //       major: "Organisation",
    //       minor: "minister",
    //     },
    //   }),
    // });

    const responseForGazetteDates = await fetch(`${apiUrl}/v1/entities/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kind: {
          major: "Document",
          minor: "extgztorg",
        },
      }),
    });

    // if (!response.ok) {
    //   throw new Error(`API error: ${response.statusText}`);
    // }
    if (!responseForGazetteDates.ok) {
      throw new Error(`API error: ${responseForGazetteDates.statusText}`);
    }

    // const resultForAllMinistry = await response.json();
    const resultForGazetteDates = await responseForGazetteDates.json();
    const dates = resultForGazetteDates.body
      .map((item) => item.created?.split("T")[0])
      .filter((date) => !!date)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();


    return { dates };
  } catch (error) {
    console.error("Error fetching initial gazette data from API:", error);
    return {
      dates: [],
      allMinistryData: [],
    };
  }
};

// Fetch active ministries for a specific date and map with protobuf data
const fetchActiveMinistries = async (
  selectedDate,
  allMinistryData,
  governmentNodeId = "gov_01"
) => {
  try {
    const response = await fetch(`${apiUrl}/v1/entities/${governmentNodeId}/relations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        relatedEntityId: "",
        startTime: `${selectedDate}T00:00:00Z`,
        endTime: "",
        id: "",
        name: "AS_MINISTER",
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const activeMinistryRelations = await response.json();
    // console.log("Active ministry relations:", activeMinistryRelations);

    // Extract the relatedEntityIds from the response
    const activeMinistryIds = activeMinistryRelations
      .filter((relation) => relation.relatedEntityId)
      .map((relation) => relation.relatedEntityId);

    // console.log("Active ministry IDs:", activeMinistryIds);

    // Map active ministry IDs with the protobuf data to get ministry names
    const activeMinistries = allMinistryData
      .filter((ministry) => activeMinistryIds.includes(ministry.id))
      .map((ministry) => {
        let name = ministry.name;

        try {
          const parsed = JSON.parse(ministry.name);
          if (parsed?.value) {
            name = decodeHexString(parsed.value);
          }
        } catch (e) {
          // Use extractNameFromProtobuf as fallback
          name = extractNameFromProtobuf(ministry.name) || ministry.name;
          console.log(e.message);
        }

        return {
          name,
          id: ministry.id,
          type: "ministry",
          children: [],
        };
      });

    // console.log("Active ministries with names:", activeMinistries);

    return {
      name: "Government",
      children: activeMinistries,
      type: "root",
    };
  } catch (error) {
    console.error("Error fetching active ministries:", error);
    // Return empty tree structure on error
    return {
      name: "Government",
      children: [],
      type: "root",
    };
  }
};

// Add this function before the App component
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: colors.backgroundColor,
        color: colors.textPrimary,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h2>Something went wrong:</h2>
      <pre style={{ color: "#ff6b6b", marginBottom: "20px" }}>
        {error.message}
      </pre>
      <button
        onClick={resetErrorBoundary}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}

export default function OrgChart() {
  const [treeData, setTreeData] = useState(null);
  const [isTreeDataLoading, setIsTreeDataLoading] = useState(true);
  // const [gazetteData, setGazetteData] = useState([]);
  // const [allMinistryData, setAllMinistryData] = useState([]);
  const [allData, setAllData] = useState({});
  // const [selectedDate, setSelectedDate] = useState(null);
  const [departmentData, setDepartmentData] = useState({});
  const [loadingDepartments, setLoadingDepartments] = useState(new Set());
  const [expandedMinistries, setExpandedMinistries] = useState(new Set());
  const { gazetteData } = useSelector((state) => state.gazettes);
  const { selectedPresident, selectedDate, presidentRelationDict } =
    useSelector((state) => state.presidency);
  const { allMinistryData } = useSelector((state) => state.allMinistryData);
  const [loading, setLoading] = useState(false);

  const { colors } = useThemeContext();

  const dispatch = useDispatch();

  useEffect(() => {
    const initializeApp = async () => {
      if (!selectedPresident?.created) return;
      console.log(loading)
      setLoading(true);
      const matchedPresidentRelation = presidentRelationDict[selectedPresident.id];

      const startTime = matchedPresidentRelation.startTime.split("T")[0];
      const endTime = matchedPresidentRelation.endTime.split("T")[0];
      const { dates } = await fetchInitialGazetteData();
      
      var filteredDates = [];
      if (endTime == "") {
        filteredDates = dates.filter((date) => date >= startTime);
      } else {
        filteredDates = dates.filter(
          (date) => date >= startTime && date < endTime
        );
      }
      const transform = filteredDates.map((date) => ({ date: date }));
      dispatch(setGazetteData(transform));
      setGazetteData(dates);

      if (filteredDates.length > 0) {
        const latestDate = filteredDates[filteredDates.length - 1];
        const activeMinistryTree = await fetchActiveMinistries(
          latestDate,
          allMinistryData
        );
        setTreeData(activeMinistryTree);
        dispatch(setSelectedDate({ date: latestDate }));
        setAllData({ [latestDate]: activeMinistryTree });
      }
      setIsTreeDataLoading(false);
    };

    initializeApp();
  }, [selectedPresident]);

  const handleDateChange = async (date) => {
    setIsTreeDataLoading(true);

    // Clear department data and expanded state when changing dates
    setDepartmentData({});
    setExpandedMinistries(new Set());
    console.log("all data : ", allData);
    if (!allData[date.date]) {
      const activeMinistryTree = await fetchActiveMinistries(
        date.date,
        allMinistryData
      );
      console.log('gazzet data : ', gazetteData)
      setAllData((prev) => ({ ...prev, [date.date]: activeMinistryTree }));
      setTreeData(activeMinistryTree);
    } else {
      setTreeData(allData[date.date]);
    }
    setIsTreeDataLoading(false);
  };

  useEffect(() => {
    if (selectedDate) {
      console.log('selected date : ', selectedDate)
      handleDateChange(selectedDate);
    }
  }, [selectedDate]);

  // Fixed ministry click handler with proper toggle logic
  const handleMinistryClick = useCallback(
    async (ministryId) => {
      // Check if this ministry is already expanded
      const isCurrentlyExpanded = expandedMinistries.has(ministryId);

      if (isCurrentlyExpanded) {
        // If expanded, collapse it by removing from the set
        setExpandedMinistries((prev) => {
          const newSet = new Set(prev);
          newSet.delete(ministryId);
          return newSet;
        });
      } else {
        // If collapsed, expand it by adding to the set
        setExpandedMinistries((prev) => {
          const newSet = new Set(prev);
          newSet.add(ministryId);
          return newSet;
        });

        // Then fetch departments if not already loaded
        if (!departmentData[ministryId]) {
          setLoadingDepartments((prev) => new Set([...prev, ministryId]));

          try {
            const departments = await fetchDepartments(
              ministryId,
              selectedDate
            );

            setDepartmentData((prev) => ({
              ...prev,
              [ministryId]: departments,
            }));
          } catch (error) {
            console.error(
              `Failed to fetch departments for ministry ${ministryId}:`,
              error
            );
          } finally {
            setLoadingDepartments((prev) => {
              const newSet = new Set(prev);
              newSet.delete(ministryId);
              return newSet;
            });
          }
        }
      }
    },
    [expandedMinistries, departmentData, selectedDate]
  );

  const timelineData = gazetteData.map((date) => ({
    date,
    event: `OrgChart at ${date}`,
  }));

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div>
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backgroundColor: colors.backgroundPrimary,
          }}
        >
          {/* Header */}
          {/* <div
          style={{
            height: "50px",
            padding: "10px 20px",
            backgroundColor: "#1e1e1e",
            borderBottom: "1px solid #333",
            flexShrink: 0,
          }}
        >
          <h2 style={{ margin: 0, color: "#fff" }}>Organization Chart</h2>
        </div> */}

          {/* Slider */}
          <div
            style={{
              // height: "120px",
              // backgroundColor: "#1e1e1e",
              // borderBottom: "1px solid #333",
              // padding: "20px",
              // flexShrink: 0,
              paddingTop: "138px",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: colors.backgroundPrimary,
            }}
          >
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              {gazetteData.length > 0 && (
                <EventSlider
                  data={timelineData}
                  onSelectDate={handleDateChange}
                />
              )}
            </ErrorBoundary>
          </div>
          {/* Tree */}
          <div
            style={{
              flex: 1,
              backgroundColor: colors.backgroundPrimary,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              {isTreeDataLoading && selectedDate ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    color: colors.textPrimary,
                    backgroundColor: colors.backgroundColor,
                  }}
                >
                  <ClipLoader
                    color={colors.timelineLineActive}
                    loading={isTreeDataLoading}
                    size={25}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                </div>
              ) : (
                <TidyTree
                  data={treeData}
                  onMinistryClick={handleMinistryClick}
                  loadingDepartments={loadingDepartments}
                  departmentData={departmentData}
                  expandedMinistries={expandedMinistries}
                />
              )}
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
