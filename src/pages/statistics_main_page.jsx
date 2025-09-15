import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import ForceGraph3D from "react-force-graph-3d";
import api from "./../services/services";
import modeEnum from "../../src/enums/mode";
import utils from "../utils/utils";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedIndex,
  setSelectedPresident,
  setSelectedDate,
} from "../store/presidencySlice";
import { Box, Avatar, Typography, IconButton } from "@mui/material";
import Drawer from "../components/statistics_components/drawer";
import BottomPresidentLine from "../components/statistics_components/bottom_president_line";
import PresidencyTimeline from "../components/PresidencyTimeline";
import SpriteText from "three-spritetext";
import AlertToOrgchart from "../components/statistics_components/alertToOrgchart";
import WebGLChecker, {
  isWebGLAvailable,
} from "../components/common_components/webgl_checker";
import LoadingComponent from "../components/common_components/loading_component";

export default function StatisticMainPage() {
  const [loading, setLoading] = useState(true);
  const [webgl, setWebgl] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [expandDrawer, setExpandDrawer] = useState(true);

  const [allNodes, setAllNodes] = useState([]);
  const [relations, setRelations] = useState([]);
  const [ministryDictionary, setMinistryDictionary] = useState({});
  const [departmentDictionary, setDepartmentDictionary] = useState({});
  const [ministerToDepartments, setMinisterToDepartment] = useState({});

  const focusRef = useRef();
  const cameraAnimTimeoutRef = useRef();
  const dispatch = useDispatch();

  const presidents = useSelector((state) => state.presidency.presidentList);
  const selectedDate = useSelector((state) => state.presidency.selectedDate);
  const selectedPresident = useSelector(
    (state) => state.presidency.selectedPresident
  );
  const gazetteDataClassic = useSelector(
    (state) => state.gazettes.gazetteDataClassic
  );
  const allMinistryData = useSelector(
    (state) => state.allMinistryData.allMinistryData
  );
  const allDepartmentData = useSelector(
    (state) => state.allDepartmentData.allDepartmentData
  );

  useEffect(() => {
    setWebgl(isWebGLAvailable());
  }, []);

  // Initial selection of president & date
  useEffect(() => {
    if (!selectedPresident && presidents.length > 0) {
      const lastIndex = presidents.length - 1;
      dispatch(setSelectedIndex(lastIndex));
      dispatch(setSelectedPresident(presidents[lastIndex]));
    }

    if (gazetteDataClassic?.length > 0) {
      dispatch(
        setSelectedDate({
          date: gazetteDataClassic[gazetteDataClassic.length - 1],
        })
      );
    }
  }, [presidents, gazetteDataClassic]);

  // Master loader: fetch ministries, departments, and build graph
  useEffect(() => {
    const buildGraph = async () => {
      setLoading(true);
      try {
        // Fetch ministries
        const activeMinistry = await api.fetchActiveMinistries(
          selectedDate,
          allMinistryData,
          selectedPresident
        );

        const ministryDic = activeMinistry.children.reduce((acc, ministry) => {
          acc[ministry.id] = {
            id: ministry.id,
            name: ministry.name,
            group: 2,
            color: "#D3AF37",
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
            };
            return acc;
          }, {});

        // Minister to departments map
        const ministerToDepartments = {};
        allRelations.forEach((rel) => {
          if (!ministerToDepartments[rel.source]) {
            ministerToDepartments[rel.source] = [];
          }
          ministerToDepartments[rel.source].push(rel.target);
        });

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
        ];

        const allGraphLinks = [...ministryToGovLinks, ...allRelations];

        // Set all states in batch
        setMinistryDictionary(ministryDic);
        setDepartmentDictionary(departmentDic);
        setMinisterToDepartment(ministerToDepartments);
        setAllNodes(allGraphNodes);
        setRelations(allGraphLinks);
      } catch (e) {
        console.error("Error building graph:", e.message);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate && selectedPresident) {
      buildGraph();
    }
  }, [selectedDate, selectedPresident]);

  // Add this to your component
  useEffect(() => {
    const canvas = focusRef.current?.renderer()?.domElement;

    if (canvas) {
      const handleContextLost = (event) => {
        console.warn("WebGL context lost");
        event.preventDefault();
        setWebgl(false);
      };

      const handleContextRestored = () => {
        console.log("WebGL context restored");
        setWebgl(true);
        // Optionally rebuild the graph
        // buildGraph();
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

  // Memoized graph data
  const graphData = useMemo(() => {
    // Only return valid graph data when not loading and we have both nodes and relations
    if (loading || allNodes.length === 0 || relations.length === 0) {
      return { nodes: [], links: [] };
    }

    // Validate that all nodes have required properties
    const validNodes = allNodes.filter(
      (node) =>
        node &&
        typeof node.id !== "undefined" &&
        typeof node.name !== "undefined"
    );

    // Validate that all links have required properties
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
  }, [allNodes, relations, loading]);

  // Memoized node rendering function
  const getNodeObject = useCallback(
    (node) => {
      const sprite = new SpriteText(utils.makeMultilineText(node.name));
      sprite.textHeight = 10;
      sprite.fontWeight = 700;
      sprite.fontFace = "poppins";
      sprite.center.y = -0.5;
      const isSelected = selectedNodeId === node.id;
      sprite.backgroundColor = isSelected ? "#000" : "#fff";
      sprite.color = isSelected ? "#fff" : "#000";
      sprite.padding = 4;
      sprite.borderRadius = 3;
      return sprite;
    },
    [selectedNodeId]
  );

  const handleNodeClick = useCallback((node) => {
    const distance = 400;
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

  // Handle clicking a node
  // const handleNodeClickk = useCallback(
  //   (targetNode) => {
  //     setClickedNode(targetNode);

  //     let node = targetNode;

  //     // Ensure node position is ready
  //     if (
  //       typeof node.x !== "number" ||
  //       typeof node.y !== "number" ||
  //       typeof node.z !== "number"
  //     ) {
  //       node = graphData.nodes.find((n) => n.id === targetNode.id);

  //       if (!node || typeof node.x !== "number") {
  //         console.warn("Node position not ready, skipping camera move.");
  //         return;
  //       }
  //     }

  //     const distance = 200;
  //     const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

  //     focusRef.current.cameraPosition(
  //       {
  //         x: node.x * distRatio,
  //         y: node.y * distRatio,
  //         z: node.z * distRatio,
  //       },
  //       node,
  //       1000 // <- 1s for a snappy transition
  //     );
  //   },
  //   [graphData]
  // );

  // Configure forces
  useEffect(() => {
    if (
      focusRef.current &&
      graphData.nodes.length > 0 &&
      graphData.links.length > 0 &&
      !loading
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
                default:
                  return 120;
              }
            });
            focusRef.current.d3Force("charge").theta(0.5).strength(-300);
            focusRef.current.d3ReheatSimulation();
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

        // Clear graph data
        focusRef.current.graphData({ nodes: [], links: [] });

        // Get the renderer and dispose of resources
        const renderer = focusRef.current.renderer();
        if (renderer) {
          renderer.dispose();
          renderer.forceContextLoss();
        }

        // Clear the scene
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

  // Cleanup on unmount
  // useEffect(() => {
  //   return () => {
  //     if (focusRef.current?.graphData) {
  //       focusRef.current.graphData({ nodes: [], links: [] });
  //     }
  //   };
  // }, [selectedPresident]);

  //   useEffect(() => {
  //   return () => {
  //     // Force garbage collection of old graph
  //     if (focusRef.current) {
  //       focusRef.current.graphData({ nodes: [], links: [] });
  //     }
  //   };
  // }, [selectedPresident]);

  return (
    <>
      <Drawer
        expandDrawer={expandDrawer}
        setExpandDrawer={setExpandDrawer}
        ministerDictionary={ministryDictionary}
        departmentDictionary={departmentDictionary}
        ministerToDepartments={ministerToDepartments}
        onMinistryClick={handleNodeClick}
      />

      <div
        className="relative"
        style={{
          marginRight: expandDrawer ? window.innerWidth / 2 : 0,
          transition: "margin-right 0.3s ease",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <div className="flex justify-start items-start h-full">
          <PresidencyTimeline mode={modeEnum.STATISTICS} />
          {!loading ? (
            <div>
              <AlertToOrgchart selectedPresident={selectedPresident} />
              {webgl ? (
                graphData.nodes.length > 0 && graphData.links.length > 0 ? (
                  <ForceGraph3D
                    height={window.innerHeight}
                    width={
                      expandDrawer ? window.innerWidth / 2 : window.innerWidth
                    }
                    graphData={graphData}
                    backgroundColor="#fff"
                    linkWidth={3}
                    linkColor={() => "rgba(0,0,0,1.0)"}
                    nodeRelSize={10}
                    nodeResolution={8}
                    ref={focusRef}
                    rendererConfig={{
                      alpha: true,
                      antialias: false,
                      powerPreference: "low-power",
                      precision: "mediump",
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
                ) : (
                  <div className="flex justify-center items-center w-full h-full">
                    <LoadingComponent message="Preparing Graph Data" />
                  </div>
                )
              ) : (
                <div className="flex justify-center items-center w-full h-full">
                  <span className="ml-2">
                    WebGL is unavailable on this device. Showing fallback.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <LoadingComponent message="Graph Loading" />
          )}
        </div>
      </div>
      <WebGLChecker />
    </>
  );
}
