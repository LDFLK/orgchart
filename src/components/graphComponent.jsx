import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import ForceGraph3D from "react-force-graph-3d";
import api from "../services/services";
import modeEnum from "../enums/mode";
import utils from "../utils/utils";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedIndex,
  setSelectedPresident,
  setSelectedDate,
} from "../store/presidencySlice";

import Drawer from "./statistics_components/drawer";
import SpriteText from "three-spritetext";
import WebGLChecker, {
  isWebGLAvailable,
} from "./common_components/webgl_checker";
import LoadingComponent from "./common_components/loading_component";
import { useThemeContext } from "../themeContext";
import { useNavigate } from "react-router-dom";

export default function GraphComponent({ activeMinistries }) {
  const [loading, setLoading] = useState(true);
  const [webgl, setWebgl] = useState(true);
  const [expandDrawer, setExpandDrawer] = useState(true);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterGraphBy, setFilterGraphBy] = useState(null);

  const [mode, setMode] = useState("Structure");

  const [allNodes, setAllNodes] = useState([]);
  const [relations, setRelations] = useState([]);
  const [ministryDictionary, setMinistryDictionary] = useState({});
  const [departmentDictionary, setDepartmentDictionary] = useState({});
  const [personDictionary, setPersonDictionary] = useState({});
  const [ministerToDepartments, setMinisterToDepartment] = useState({});
  const [filteredGraphData, setFilteredGraphData] = useState({
    nodes: [],
    links: [],
  });

  const [isDateTaken, setIsDateTake] = useState(false);

  const { colors, isDark } = useThemeContext();

  const focusRef = useRef();
  const cameraAnimTimeoutRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const presidents = useSelector((state) => state.presidency.presidentList);
  const selectedDate = useSelector((state) => state.presidency.selectedDate);
  const selectedPresident = useSelector(
    (state) => state.presidency.selectedPresident
  );
  const gazetteDataClassic = useSelector((state) => state.gazettes.gazetteData);
  const allMinistryData = useSelector(
    (state) => state.allMinistryData.allMinistryData
  );
  const allDepartmentData = useSelector(
    (state) => state.allDepartmentData.allDepartmentData
  );
  const allPersonData = useSelector((state) => state.allPerson.allPerson);

  useEffect(() => {
    const checkWebGL = () => {
      const webglAvailable = isWebGLAvailable();
      console.log("WebGL detection result:", webglAvailable);
      console.log("Browser info:", {
        userAgent: navigator.userAgent,
        webgl: !!window.WebGLRenderingContext,
        webgl2: !!window.WebGL2RenderingContext,
      });

      setWebgl(webglAvailable);

      if (!webglAvailable) {
        console.warn("WebGL not available. This may be due to:");
        console.warn("1. Hardware acceleration disabled in browser");
        console.warn("2. Outdated graphics drivers");
        console.warn("3. Browser security settings");
        console.warn("4. Corporate firewall blocking WebGL");
        console.warn("5. WebGL context lost or not ready yet");
      }
    };

    // Check immediately
    checkWebGL();

    // Check again after a short delay (in case of timing issues)
    const timeoutId = setTimeout(checkWebGL, 1000);

    // Check again when page becomes visible (handles tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(checkWebGL, 500);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Initial selection of president & date
  useEffect(() => {
    if (gazetteDataClassic?.length > 0) {
      setIsDateTake(true);
    }
  }, [presidents, gazetteDataClassic]);

  useEffect(() => {
    const buildGraph = async () => {
      handleClosePopup();
      setLoading(true);

      try {
        //create a dictionary
        const ministryDic = activeMinistries.reduce((acc, ministry) => {
          acc[ministry.id] = {
            id: ministry.id,
            name: ministry.name,
            group: 2,
            color: "#D3AF37",
            type: "minister",
          };
          return acc;
        }, {});

        // Fetch relations: ministries → departments
        const relationPromises = Object.keys(ministryDic).map(
          async (ministryId) => {
            const response = await api.fetchAllRelationsForMinistry({
              ministryId,
              name: "AS_DEPARTMENT",
              activeAt: selectedDate.date,
            });

            return response.map((department) => ({
              source: ministryId,
              target: department.relatedEntityId,
              value: 2,
              type: "level2",
            }));
          }
        );

        const allRelations = (await Promise.all(relationPromises)).flat();

        // Build department dictionary
        const departmentDic = allRelations
          .map((rel) => allDepartmentData[rel.target])
          .filter(Boolean)
          .reduce((acc, department) => {
            acc[department.id] = {
              id: department.id,
              name: utils.extractNameFromProtobuf(department.name),
              created: department.created,
              kind: department.kind,
              terminated: department.terminated,
              group: 3,
              // color: "#D3AF37",
              type: "department",
            };
            return acc;
          }, {});

        // Minister to departments map
        const ministerToDepartments = {};
        allRelations.forEach((rel) => {
          if (!ministerToDepartments[rel.source]) {
            ministerToDepartments[rel.source] = [];
          }
          ministerToDepartments[rel.source].push(rel);
        });

        // Fetch relations: ministries → person
        const relationPromisesPerson = Object.keys(ministryDic).map(
          async (ministryId) => {
            const response = await api.fetchAllRelationsForMinistry({
              ministryId,
              name: "AS_APPOINTED",
              activeAt: selectedDate.date,
            });

            return response.map((person) => ({
              source: ministryId,
              target: person.relatedEntityId,
              value: 3,
              type: "level3",
            }));
          }
        );

        const allRelationsPerson = (
          await Promise.all(relationPromisesPerson)
        ).flat();

        // Build person dictionary
        const personDic = allRelationsPerson
          .map((rel) => allPersonData[rel.target])
          .filter(Boolean)
          .reduce((acc, person) => {
            acc[person.id] = {
              id: person.id,
              name: utils.extractNameFromProtobuf(person.name),
              created: person.created,
              kind: person.kind,
              terminated: person.terminated,
              type: "person",
            };
            return acc;
          }, {});

        // Minister to departments map
        const ministerToPerson = {};
        allRelationsPerson.forEach((rel) => {
          if (!ministerToPerson[rel.source]) {
            ministerToPerson[rel.source] = [];
          }
          ministerToPerson[rel.source].push(rel.target);
        });

        // Fetch relations: ministries → departments
        // const relationDepartmentPersonPromises = Object.keys(departmentDic).map(
        //   async (departmentId) => {
        //     const response = await api.fetchAllRelationsForMinistry({
        //       departmentId,
        //       name: "AS_APPOINTED",
        //       activeAt: selectedDate.date,
        //     });

        //     return response.map((person) => ({
        //       source: departmentId,
        //       target: person.relatedEntityId,
        //       value: 4,
        //       type: "level4",
        //     }));
        //   }
        // );

        // const allRelationsDepartmentPerson = (await Promise.all(relationDepartmentPersonPromises)).flat();

        // // Build person dictionary
        // const personDepartmentDic = allRelationsDepartmentPerson
        //   .map((rel) => allPersonData[rel.target])
        //   .filter(Boolean)
        //   .reduce((acc, person) => {
        //     acc[person.id] = {
        //       id: person.id,
        //       name: utils.extractNameFromProtobuf(person.name),
        //       created: person.created,
        //       kind: person.kind,
        //       terminated: person.terminated,
        //     };
        //     return acc;
        //   }, {});

        // console.log(Object.assign(personDic, personDepartmentDic))

        // // Department to person map
        // const departmentToPerson = {};
        // allRelationsDepartmentPerson.forEach((rel) => {
        //   if (!departmentToPerson[rel.source]) {
        //     departmentToPerson[rel.source] = [];
        //   }
        //   departmentToPerson[rel.source].push(rel.target);
        // });

        // Build nodes & links
        const govNode = {
          id: "gov_01",
          name: "Government",
          group: 1,
          color: "#00ff00",
        };

        const ministryToGovLinks = Object.keys(ministryDic).map((id) => ({
          source: "gov_01",
          target: id,
          value: 1,
          type: "level1",
        }));

        const allGraphNodes = [
          govNode,
          ...Object.values(ministryDic),
          ...Object.values(departmentDic),
          ...Object.values(personDic),
        ];

        const allGraphLinks = [
          ...ministryToGovLinks,
          ...allRelations,
          ...allRelationsPerson,
        ];

        if (focusRef.current) {
          focusRef.current.stopAnimation?.(); // important: prevent ticking
        }

        // Set all states in batch
        setMinistryDictionary(ministryDic);
        setDepartmentDictionary(departmentDic);
        setPersonDictionary(personDic);
        setMinisterToDepartment(ministerToDepartments);
        setAllNodes(allGraphNodes);
        setRelations(allGraphLinks);
      } catch (e) {
        console.error("Error building graph:", e.message);
      } finally {
        setLoading(false);
      }
    };

    if (isDateTaken && selectedDate && selectedPresident) {
      buildGraph();
    }
  }, [selectedDate, selectedPresident, isDateTaken, activeMinistries]);

  // Handle WebGL context loss and restoration
  useEffect(() => {
    const canvas = focusRef.current?.renderer()?.domElement;

    if (canvas) {
      const handleContextLost = (event) => {
        console.warn(
          "WebGL context lost - this is normal and can happen due to:"
        );
        console.warn("- GPU memory pressure");
        console.warn("- Browser tab switching");
        console.warn("- System resource constraints");
        event.preventDefault();
        setWebgl(false);
      };

      const handleContextRestored = () => {
        console.log("WebGL context restored - checking availability again");
        // Re-check WebGL availability
        const webglAvailable = isWebGLAvailable();
        setWebgl(webglAvailable);

        if (webglAvailable) {
          console.log("WebGL is now available again");
        } else {
          console.warn("WebGL context restored but still not available");
        }
      };

      canvas.addEventListener("webglcontextlost", handleContextLost);
      canvas.addEventListener("webglcontextrestored", handleContextRestored);

      return () => {
        if (canvas) {
          canvas.removeEventListener("webglcontextlost", handleContextLost);
          canvas.removeEventListener(
            "webglcontextrestored",
            handleContextRestored
          );
        }
      };
    }
  }, [focusRef.current]);

  useEffect(() => {
    try {
      setLoading(true);
      setTimeout(() => {
        var newGraph = { nodes: [], links: [] };

        const nodes = graphData.nodes.filter((node) => {
          return node.type === filterGraphBy;
        });

        const relatedLinks = graphData.links.filter((link) => {
          return nodes.some((node) => node.id === link.target.id);
        });

        relatedLinks.forEach((link) => {
          if (!newGraph.nodes.some((node) => node.id === link.source.id)) {
            const sourceNode = graphData.nodes.find(
              (node) => node.id === link.source.id
            );
            if (sourceNode) {
              newGraph.nodes.push(sourceNode);
            }
          }

          if (!newGraph.nodes.some((node) => node.id === link.target.id)) {
            const targetNode = graphData.nodes.find(
              (node) => node.id === link.target.id
            );
            if (targetNode) {
              newGraph.nodes.push(targetNode);
            }
          }

          newGraph.links.push(link);
        });

        setFilteredGraphData(newGraph);
        setLoading(false);
      }, 5000);
    } catch (e) {
      console.log("filtering graph failed : ", e);
    }
  }, [filterGraphBy]);

  // Memoized graph data
  const graphData = useMemo(() => {
    if (loading || allNodes.length === 0 || relations.length === 0) {
      return { nodes: [], links: [] };
    }

    const validNodes = allNodes.filter(
      (node) =>
        node &&
        typeof node.id !== "undefined" &&
        typeof node.name !== "undefined"
    );

    const validLinks = relations.filter(
      (link) =>
        link &&
        typeof link.source !== "undefined" &&
        typeof link.target !== "undefined"
    );

    return {
      nodes: validNodes,
      links: validLinks,
    };
  }, [allNodes, relations, loading, filteredGraphData]);

  const getNodeObject = useCallback(
    (node) => {
      const sprite = new SpriteText(utils.makeMultilineText(node.name));
      sprite.textHeight = 10;
      sprite.fontWeight = 400;
      sprite.fontFace = "poppins";
      sprite.center.y = -0.5;
      sprite.color = colors.textPrimary;
      sprite.padding = 4;
      sprite.borderRadius = 3;
      return sprite;
    },
    [colors.textPrimary]
  );

  const handleNodeClick = useCallback((node) => {
    console.log("Node clicked:", node); // Debug log

    // Set popup data first
    setSelectedNode(node);
    setPopupVisible(true);

    // Use mouse position for popup positioning (more reliable)
    const canvas = focusRef.current?.renderer()?.domElement;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      // Use center of canvas as fallback position
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      setPopupPosition({ x: centerX, y: centerY });
    }

    // Still do camera movement for better UX
    const distance = 600;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
    const transitionMs = 3000;

    focusRef.current.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
      node,
      transitionMs
    );

    if (cameraAnimTimeoutRef.current) {
      clearTimeout(cameraAnimTimeoutRef.current);
    }
    cameraAnimTimeoutRef.current = setTimeout(() => {
      // setSelectedNodeId(node.id);
    }, transitionMs + 2);
  }, []);

  // Configure forces
  useEffect(() => {
    if (
      focusRef.current &&
      graphData.nodes.length > 0 &&
      graphData.links.length > 0 &&
      !loading &&
      focusRef.current.d3Force
    ) {
      requestAnimationFrame(() => {
        try {
          // Ensure the graph is properly initialized before configuring forces
          if (focusRef.current.d3Force) {
            focusRef.current.d3Force("link").distance((link) => {
              switch (link.type) {
                case "level1":
                  return 800;
                case "level2":
                  return 250;
                case "level3":
                  return 1000;
                default:
                  return 120;
              }
            });
            focusRef.current.d3Force("charge").theta(0.5).strength(-300);
            setTimeout(() => {
              focusRef.current?.d3ReheatSimulation?.();
            }, 50);
          }
        } catch (e) {
          console.warn("ForceGraph not ready:", e.message);
        }
      });
    }
  }, [graphData.nodes.length, graphData.links.length, loading]);

  useEffect(() => {
    return () => {
      if (focusRef.current) {
        // Stop the animation loop
        focusRef.current.pauseAnimation();

        const renderer = focusRef.current.renderer();

        if (renderer) {
          renderer.dispose();
          renderer.forceContextLoss();
        }

        const scene = focusRef.current.scene();
        if (scene) {
          scene.traverse((object) => {
            if (object.geometry) {
              object.geometry.dispose();
            }
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach((material) => material.dispose());
              } else {
                object.material.dispose();
              }
            }
          });
        }
      }
      if (cameraAnimTimeoutRef.current) {
        clearTimeout(cameraAnimTimeoutRef.current);
      }
    };
  }, []);

  // Handle popup close
  const handleClosePopup = useCallback(() => {
    setPopupVisible(false);
    setSelectedNode(null);
  }, []);

  // Handle navigation to another page
  const handleNavigateToPage = useCallback(() => {
    if (selectedNode) {
      // Navigate with only serializable data
      const serializableNode = {
        id: selectedNode.id,
        name: selectedNode.name,
        group: selectedNode.group,
        color: selectedNode.color,
      };
      if(selectedNode.type === "person"){
        navigate(`/person-profile/${selectedNode.id}`, {state: {mode: 'back'} });
      }
      
      handleClosePopup();
    }
  }, [selectedNode, navigate, handleClosePopup]);

  // Popup component
  const NodePopup = () => {
    if (!selectedNode || !popupVisible) return null;

    return (
      <div
        className="fixed z-[1000] p-4 rounded-lg shadow-lg"
        style={{
          left: popupPosition.x + 20,
          top: popupPosition.y - 10,
          backgroundColor: colors.backgroundPrimary,
          color: isDark ? "#fff" : "#000",
        }}
      >
        <div className="text-lg font-semibold mb-2">{selectedNode.name}</div>
        <div className="flex gap-2">
          {selectedNode.type == "department" ? (
            <>
              <button
                onClick={handleNavigateToPage}
                className="text-white text-sm px-3 py-1 rounded transition-opacity hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: colors.primary || "#1976d2" }}
              >
                View Details
              </button>
              <button
                onClick={handleNavigateToPage}
                className="text-white text-sm px-3 py-1 rounded transition-opacity hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: colors.primary || "#1976d2" }}
              >
                Xplore Statistics
              </button>
            </>
          ) : selectedNode.type == "person" ? ((
            <button
              onClick={handleNavigateToPage}
              className="text-white text-sm px-3 py-1 rounded transition-opacity hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: colors.primary || "#1976d2" }}
            >
              Go to Profile
            </button>
          )) : selectedNode.type == "minister" && (
            <button
              onClick={handleNavigateToPage}
              className="text-white text-sm px-3 py-1 rounded transition-opacity hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: colors.primary || "#1976d2" }}
            >
              View Details
            </button>
          )}
          <button
            onClick={handleClosePopup}
            className="text-sm px-3 py-1 rounded border cursor-pointer"
            style={{
              borderColor: isDark ? "#666" : "#ccc",
              color: isDark ? "#fff" : "#000",
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  const typeMap = {
    Ministers: "minister",
    Departments: "department",
    Persons: "person",
  };
  const ColorMap = {
    Ministers: "blue",
    Departments: "green",
    Persons: "red",
  };

  return (
    <>
      <div>
        <Drawer
          expandDrawer={expandDrawer}
          setExpandDrawer={setExpandDrawer}
          ministerDictionary={ministryDictionary}
          departmentDictionary={departmentDictionary}
          ministerToDepartments={ministerToDepartments}
          onMinistryClick={handleNodeClick}
          mode={mode}
          setMode={setMode}
          selectedNode={selectedNode}
        />
        <div
          className="relative"
          style={{
            marginRight: expandDrawer ? window.innerWidth / 2 : 0,
            transition: "margin-right 0.3s ease",
            height: "100vh",
            overflow: "hidden",
            left: 0,
          }}
        >
          <div className="flex justify-start items-start h-full">
            {!loading ? (
              <div
                className="w-full"
                style={{
                  backgroundColor: colors.backgroundPrimary,
                  overflow: "hidden",
                }}
              >
                {webgl ? (
                  graphData.nodes.length > 0 && graphData.links.length > 0 ? (
                    <div className="relative">
                      <div
                        className={`w-full flex justify-start items-center gap-2 absolute top-5 ${
                          expandDrawer ? "left-25" : "left-5"
                        } transition-all duration-300 ease-in-out z-100 shadow-2xl`}
                      >
                        <p className="text-white mr-2">Filter by :</p>
                        {["Ministers", "Departments", "Persons"].map(
                          (item, index) => {
                            return (
                              <button
                                key={index}
                                className="rounded-full text-black px-3 py-2 flex items-center space-x-3  hover:cursor-pointer"
                                onClick={() => setFilterGraphBy(typeMap[item])}
                                style={{ backgroundColor: colors.textMuted }}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full animate-pulse`}
                                  style={{ backgroundColor: ColorMap[item] }}
                                ></div>
                                <p>{item}</p>
                              </button>
                            );
                          }
                        )}
                      </div>
                      {/* <div
                        className={`w-full flex justify-end items-center gap-2 absolute top-5 ${
                          expandDrawer ? "right-25" : "right-5"
                        } transition-all duration-300 ease-in-out z-100 shadow-2xl`}
                      >
                        <button
                          className="rounded-full text-black px-3 py-2 flex items-center space-x-3  hover:cursor-pointer"
                          onClick={() => setFilterGraphBy(null)}
                          style={{ backgroundColor: colors.textMuted }}
                        >
                          <p>Clear</p>
                        </button>
                      </div> */}
                      <ForceGraph3D
                        height={window.innerHeight}
                        width={
                          expandDrawer
                            ? window.innerWidth / 2
                            : window.innerWidth - 205
                        }
                        graphData={
                          filteredGraphData.nodes.length > 0 ||
                          filteredGraphData.links.length > 0
                            ? filteredGraphData
                            : graphData
                        }
                        backgroundColor={isDark ? "#222" : "#fff"}
                        // backgroundColor={colors.backgroundPrimary}
                        linkWidth={3}
                        // linkColor={() => "rgba(0,0,0,1.0)"}
                        linkColor={colors.timelineLineActive}
                        nodeRelSize={15}
                        nodeResolution={8}
                        ref={focusRef}
                        rendererConfig={{
                          alpha: true,
                          antialias: false,
                          powerPreference: "low-power",
                          precision: "lowp",
                          failIfMajorPerformanceCaveat: false,
                          preserveDrawingBuffer: false,
                          stencil: false,
                          depth: true,
                          logarithmicDepthBuffer: false,
                        }}
                        nodeAutoColorBy="group"
                        nodeThreeObjectExtend={true}
                        nodeThreeObject={getNodeObject}
                        onNodeClick={handleNodeClick}
                        cooldownTicks={100}
                        onNodeDragEnd={(node) => {
                          node.fx = node.x;
                          node.fy = node.y;
                          node.fz = node.z;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center items-center w-full h-full">
                      <LoadingComponent message="Preparing Graph Data" />
                    </div>
                  )
                ) : (
                  <div className="flex flex-col justify-center items-center w-full h-full p-8">
                    <div className="text-center max-w-2xl">
                      <h2 className="text-2xl font-bold mb-4 text-red-600">
                        WebGL Not Available
                      </h2>
                      <p className="text-lg mb-6 text-gray-700">
                        Your browser doesn't support WebGL or it's currently
                        disabled. The 3D visualization requires WebGL to
                        function properly.
                      </p>

                      <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
                        <h3 className="font-semibold mb-2">To enable WebGL:</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>
                            <strong>Chrome:</strong> Settings → Advanced →
                            System → Enable "Use hardware acceleration"
                          </li>
                          <li>
                            <strong>Firefox:</strong> about:config →
                            webgl.force-enabled → true
                          </li>
                          <li>
                            <strong>Edge:</strong> Settings → System → Enable
                            "Use hardware acceleration"
                          </li>
                          <li>Update your graphics drivers</li>
                          <li>
                            Disable browser extensions that might block WebGL
                          </li>
                        </ul>
                      </div>

                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={() => window.location.reload()}
                          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                        >
                          Reload Page
                        </button>
                        <button
                          onClick={() => {
                            const webglAvailable = isWebGLAvailable();
                            console.log("Manual WebGL check:", webglAvailable);
                            setWebgl(webglAvailable);
                          }}
                          className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                        >
                          Retry WebGL
                        </button>
                        <button
                          onClick={() => {
                            // Force retry with multiple attempts
                            let attempts = 0;
                            const retryInterval = setInterval(() => {
                              attempts++;
                              const webglAvailable = isWebGLAvailable();
                              console.log(
                                `WebGL retry attempt ${attempts}:`,
                                webglAvailable
                              );
                              setWebgl(webglAvailable);

                              if (webglAvailable || attempts >= 3) {
                                clearInterval(retryInterval);
                              }
                            }, 500);
                          }}
                          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                        >
                          Force Retry
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <LoadingComponent message="Graph Loading" OsColorMode={false} />
            )}
          </div>
        </div>
        <NodePopup />
        <WebGLChecker />
      </div>
    </>
  );
}
