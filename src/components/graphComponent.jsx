import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import ForceGraph3D from "react-force-graph-3d";
import api from "../services/services";
import utils from "../utils/utils";
import { useDispatch, useSelector } from "react-redux";

import Drawer from "./statistics_components/drawer";
import InfoTabDialog from "./InfoTabDialog";
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
  const [infoTabOpen, setInfoTabOpen] = useState(false);
  const [infoTabNode, setInfoTabNode] = useState(null);
  const [infoTabDepartment, setInfoTabDepartment] = useState(null);
  const [filterGraphBy, setFilterGraphBy] = useState(null);
  const [graphWidth, setGraphWidth] = useState(window.innerWidth);
  const [graphHeight, setGraphHeight] = useState(window.innerHeight);

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
  const [graphParent, setGraphParent] = useState(null);
  const [graphDataSaving, setGraphDataSaving] = useState({
    nodes: {},
    links: {},
  });

  const [isDateTaken, setIsDateTake] = useState(false);

  const { colors, isDark } = useThemeContext();

  // Calculate graph width based on drawer state
  useEffect(() => {
    const calculateGraphWidth = () => {
      if (expandDrawer) {
        setGraphWidth(Math.floor((window.innerWidth * 2) / 3));
      } else {
        setGraphWidth(window.innerWidth);
      }
    };

    calculateGraphWidth();

    const handleResize = () => {
      calculateGraphWidth();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [expandDrawer]);

  // Track graph height responsively (numeric, avoids remount/reset)
  useEffect(() => {
    const calculateGraphHeight = () => {
      setGraphHeight(window.innerHeight);
    };

    calculateGraphHeight();
    window.addEventListener("resize", calculateGraphHeight);
    return () => window.removeEventListener("resize", calculateGraphHeight);
  }, []);

  const focusRef = useRef();
  const cameraAnimTimeoutRef = useRef();
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

  // Build graph function
  const buildGraph = async (parentNode = null) => {
    setGraphParent(parentNode);
    try {
      if (!parentNode) {
        setLoading(true);
        console.log(activeMinistries)
        const ministryDic = activeMinistries.reduce((acc, ministry) => {

          acc[ministry.id] = {
            id: ministry.id,
            name: ministry.name,
            created: ministry.startTime,
            group: 2,
            color: "#D3AF37",
            type: "minister",
          };
          return acc;
        }, {});

        const govNode = {
          id: "gov_01",
          name: "Government",
          group: 1,
          color: "#00ff00",
          type: "government",
        };

        const ministryToGovLinks = Object.keys(ministryDic).map((id) => ({
          source: "gov_01",
          target: id,
          value: 1,
          type: "level1",
        }));

        if (focusRef.current) {
          focusRef.current.stopAnimation?.();
        }

        setMinistryDictionary(ministryDic);
        setDepartmentDictionary({});
        setPersonDictionary({});
        setMinisterToDepartment({});
        setAllNodes([govNode, ...Object.values(ministryDic)]);
        setRelations([...ministryToGovLinks]);
      } else if (parentNode.type === "minister") {
        const response = await api.fetchAllRelationsForMinistry({
          ministryId: parentNode.id,
          name: "AS_DEPARTMENT",
          activeAt: selectedDate.date,
        });
        const responsePerson = await api.fetchAllRelationsForMinistry({
          ministryId: parentNode.id,
          name: "AS_APPOINTED",
          activeAt: selectedDate.date,
        });

        const departmentLinks = response.map((department) => ({
          source: parentNode.id,
          target: department.relatedEntityId,
          value: 2,
          type: "level2",
        }));

        const personLinks = responsePerson.map((person) => ({
          source: parentNode.id,
          target: person.relatedEntityId,
          value: 3,
          type: "level3",
        }));

        const departmentDic = departmentLinks
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
              type: "department",
            };
            return acc;
          }, {});

        const personDic = personLinks
          .map((rel) => allPersonData[rel.target])
          .filter(Boolean)
          .reduce((acc, person) => {
            acc[person.id] = {
              id: person.id,
              name: utils.extractNameFromProtobuf(person.name),
              created: person.created,
              kind: person.kind,
              terminated: person.terminated,
              group: 4,
              type: "person",
            };
            return acc;
          }, {});

        const ministerToDepartments = {};
        departmentLinks.forEach((rel) => {
          if (!ministerToDepartments[rel.source]) {
            ministerToDepartments[rel.source] = [];
          }
          ministerToDepartments[rel.source].push(rel);
        });

        const ministerToPerson = {};
        personLinks.forEach((rel) => {
          if (!ministerToPerson[rel.source]) {
            ministerToPerson[rel.source] = [];
          }
          ministerToPerson[rel.source].push(rel);
        });

        if (focusRef.current) {
          focusRef.current.stopAnimation?.();
        }

        setDepartmentDictionary(departmentDic);
        setPersonDictionary(personDic);
        setMinisterToDepartment(ministerToDepartments);

        setAllNodes([
          parentNode,
          ...Object.values(departmentDic),
          ...Object.values(personDic),
        ]);
        setRelations([...departmentLinks, ...personLinks]);
      }
    } catch (e) {
      console.error("Error building graph:", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      setExpandDrawer(false);
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

        console.log("these are the nodes to pass ", nodes);
        setFilteredGraphData(newGraph);
        setLoading(false);
        setExpandDrawer(true);
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

  const previousClickedNodeRef = useRef(null);

  // Refactored handleNodeClick to use buildGraph for expansion
  const handleNodeClick = useCallback(
    async (node) => {
      setInfoTabOpen(false);
      setSelectedNode(node);

      if(node.type === "government" ||node.type === "department" || node.type === "person") {
        return;
      }

      if (previousClickedNodeRef.current === node) {
        // Clicking the same node again resets to root
        await buildGraph();
        previousClickedNodeRef.current = null;
        setSelectedNode(null);
        return;
      }

      previousClickedNodeRef.current = node;
      await buildGraph(node);

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

      if (
        focusRef.current &&
        typeof focusRef.current.cameraPosition === "function"
      ) {
        focusRef.current.cameraPosition(
          {
            x: node.x * distRatio,
            y: node.y * distRatio,
            z: node.z * distRatio,
          },
          node,
          transitionMs
        );
      }

      if (cameraAnimTimeoutRef.current) {
        clearTimeout(cameraAnimTimeoutRef.current);
      }
      cameraAnimTimeoutRef.current = setTimeout(() => {}, transitionMs + 2);
    },
    [buildGraph]
  );

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
                  return 500;
                case "level2":
                  return 300;
                case "level3":
                  return 500;
                default:
                  return 300;
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

  // Handle InfoTabDialog close
  const handleCloseInfoTab = useCallback(() => {
    setInfoTabOpen(false);
    setInfoTabNode(null);
    setInfoTabDepartment(null);
  }, []);

  // Handle navigation to another page or open InfoTabDialog
  const handleNavigateToPage = useCallback(() => {
    if (!selectedNode) return;

    if (selectedNode.type === "person") {
      navigate(`/person-profile/${selectedNode.id}`, {
        state: { mode: "back" },
      });
      handleClosePopup();
      return;
    }

    if (selectedNode.type === "minister") {
      setInfoTabNode(selectedNode);
      setInfoTabDepartment(null);
      setInfoTabOpen(true);
      // Only close popup after InfoTabDialog is open
      setTimeout(() => handleClosePopup(), 0);
      return;
    }

    if (selectedNode.type === "department") {
      // Find the source ministry for this department
      let ministryId = null;
      for (const [minId, rels] of Object.entries(ministerToDepartments)) {
        if (rels && rels.some((rel) => rel.target === selectedNode.id)) {
          ministryId = minId;
          break;
        }
      }
      let ministry = null;
      if (ministryId) {
        ministry = ministryDictionary[ministryId];
        if (!ministry) {
          // Try to find the ministry node from allNodes (if available)
          const ministryFromNodes = allNodes?.find(
            (n) => n.id === ministryId && n.type === "minister"
          );
          if (ministryFromNodes) {
            ministry = ministryFromNodes;
          } else {
            // fallback: minimal object with id only
            ministry = { id: ministryId, name: ministryId };
          }
        }
      }
      if (!ministry) {
        // fallback: show something instead of blocking InfoTab
        ministry = { id: "unknown", name: "No Ministry Found" };
      }
      setInfoTabNode(ministry);
      setInfoTabDepartment(selectedNode);
      setInfoTabOpen(true);
      setTimeout(() => handleClosePopup(), 0);
      return;
    }
  }, [
    selectedNode,
    navigate,
    handleClosePopup,
    ministryDictionary,
    ministerToDepartments,
  ]);

  // Popup component
  const NodePopup = () => {
    // Don't show popup if InfoTabDialog is open
    if (infoTabOpen) return null;
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
          {selectedNode.type === "person" && (
            <button
              onClick={handleNavigateToPage}
              className="text-white text-sm px-3 py-1 rounded transition-opacity hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: colors.primary || "#1976d2" }}
            >
              Go to Profile
            </button>
          )}
          {(selectedNode.type === "minister" ||
            selectedNode.type === "department") && (
            <button
              onClick={handleNavigateToPage}
              className="text-white text-sm px-3 py-1 rounded transition-opacity hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: colors.primary || "#1976d2" }}
            >
              View Details
            </button>
          )}
        </div>
      </div>
    );
  };

  const typeMap = {
    All: null,
    Ministers: "minister",
    Departments: "department",
    Persons: "person",
  };

  const ColorMap = {
    All: "#fff",
    Ministers: "#ffee8c",
    Departments: "#3e8ede",
    Persons: "#004f98",
  };

  return (
    <>
      <div className="flex h-screen w-full">
        {/* Graph container - takes 2/3 width when drawer is open, full width when closed */}
        <div
          className={`${
            expandDrawer ? "w-2/3" : "w-full"
          } transition-all duration-300 ease-in-out`}
          style={{
            backgroundColor: colors.backgroundPrimary,
          }}
        >
          {!loading ? (
            <div
              className="w-full h-full"
              style={{
                backgroundColor: colors.backgroundPrimary,
              }}
            >
              {webgl &&
                (graphData.nodes.length > 0 && graphData.links.length > 0 ? (
                  <div className="relative">
                    <div className="w-full flex justify-start items-center gap-2 absolute top-5 left-5 transition-all duration-300 ease-in-out z-100 shadow-2xl">
                      <p className="text-white mr-2">Filter by :</p>
                      {["All", "Ministers", "Departments", "Persons"].map(
                        (item, index) => {
                          return (
                            <button
                              key={index}
                              className="rounded-full px-3 py-2 flex items-center space-x-3  hover:cursor-pointer"
                              onClick={() => setFilterGraphBy(typeMap[item])}
                              style={{
                                backgroundColor:
                                  filterGraphBy === typeMap[item]
                                    ? colors.backgroundPrimary
                                    : colors.textMuted,
                                color:
                                  filterGraphBy === typeMap[item]
                                    ? colors.textMuted
                                    : colors.backgroundPrimary,
                              }}
                              disabled={filterGraphBy === typeMap[item]}
                            >
                              <div
                                className={`w-2 h-2 rounded-full`}
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
                      height={graphHeight}
                      width={graphWidth}
                      graphData={
                        filteredGraphData.nodes.length > 0 ||
                        filteredGraphData.links.length > 0
                          ? filteredGraphData
                          : graphData
                      }
                      backgroundColor={isDark ? "#222" : "#fff"}
                      // backgroundColor={colors.backgroundPrimary}
                      linkWidth={3}
                      linkColor={colors.timelineLineActive}
                      nodeRelSize={15}
                      nodeResolution={12}
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
                      onEngineStop={() => focusRef.current.zoomToFit(400, 5)}
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
                ))}
            </div>
          ) : (
            <LoadingComponent message="Graph Loading" OsColorMode={false} />
          )}
        </div>

        {/* Drawer component - takes 1/3 width when open, 0 width when closed */}
        <Drawer
          expandDrawer={expandDrawer}
          setExpandDrawer={setExpandDrawer}
          selectedNode={selectedNode}
          contentDictionary={
            !graphParent
              ? ministryDictionary
              : graphParent.type === "minister"
              && departmentDictionary
          }
          onMinistryClick={handleNodeClick}
          parentNode={graphParent}
          personDic={personDictionary}
        />
      </div>
      <InfoTabDialog
        open={infoTabOpen}
        onClose={handleCloseInfoTab}
        node={infoTabNode}
        selectedDate={selectedDate}
        selectedPresident={selectedPresident}
        selectedDepartment={infoTabDepartment}
      />
      <NodePopup />
      <WebGLChecker />
    </>
  );
}
