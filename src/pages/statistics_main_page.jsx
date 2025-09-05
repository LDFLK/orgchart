import React, { useEffect, useState, useCallback, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
import api from "./../services/services";
import StatisticsSearchBar from "../components/statistics_compoents/searchbar";
import SpriteText from "https://esm.sh/three-spritetext";
import utils from "../utils/utils";
import { ClipLoader } from "react-spinners";
import { useDispatch, useSelector } from "react-redux";
import { UnrealBloomPass } from "https://esm.sh/three/examples/jsm/postprocessing/UnrealBloomPass.js";
import {
  setSelectedIndex,
  setSelectedPresident,
  setSelectedDate,
} from "../store/presidencySlice";

export default function StatisticMainPage() {
  const [loading, setLoading] = useState(true);
  const [ministryDictionary, setMinistryDictionary] = useState({});
  const [departmentDictionary, setDepartmentDictionary] = useState({});
  const [allNodes, setAllNodes] = useState([]);
  const [relations, setRelations] = useState([]);
  const [ministryRelationToGov, setMinistryRelationToGov] = useState([]);

  const distance = 1400;

  const focusRef = useRef();

  const presidents = useSelector((state) => state.presidency.presidentList);
  const selectedDate = useSelector((state) => state.presidency.selectedDate);
  const { selectedPresident } = useSelector((state) => state.presidency);
  const { gazetteDataClassic } = useSelector((state) => state.gazettes);
  const { allMinistryData } = useSelector((state) => state.allMinistryData);
  const { allDepartmentData } = useSelector((state) => state.allDepartmentData);

  const dispatch = useDispatch();

  useEffect(() => {
    setLoading(true);
    if (selectedPresident) {
      console.log("president is here. no need to select again");
    } else {
      console.log("need to select again");
      if (presidents.length > 0) {
        const lastIndex = presidents.length - 1;
        dispatch(setSelectedIndex(lastIndex));
        dispatch(setSelectedPresident(presidents[lastIndex]));
      }
    }

    if (gazetteDataClassic) {
      const date = { date: gazetteDataClassic[gazetteDataClassic.length - 1] };
      dispatch(setSelectedDate(date));
    }
  }, [presidents, gazetteDataClassic]);

  useEffect(() => {
    const fetchActiveMinistries = async () => {
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

      const ministryRelationToGov = Object.keys(ministryDic).map(
        (ministryId) => {
          return { source: "gov_01", target: ministryId, value: 1, type: 'level1' };
        }
      );

      // setRelations((prev) => [...prev, ...ministryRelationToGov]);
      setMinistryRelationToGov(ministryRelationToGov);

      console.log("ministry list :  ", ministryDic);
      setMinistryDictionary(ministryDic);
    };
    if (selectedDate) {
      fetchActiveMinistries();
    }
  }, [selectedDate]);

  useEffect(() => {
    const fetchRelationshipData = async () => {
      await fetchRelations();
    };
    fetchRelationshipData();
  }, [ministryDictionary]);

  useEffect(() => {
    const ministryReady = Object.keys(ministryDictionary).length > 0;
    const departmentReady = Object.keys(departmentDictionary).length > 0;
    const hasDepartmentData = Object.keys(allDepartmentData || {}).length > 0;

    if ((ministryReady || departmentReady) && hasDepartmentData) {
      setAllNodes([
        { id: "gov_01", name: "Government", group: 1, color: "#00ff00" },
        ...Object.values(ministryDictionary).map((node) => ({ ...node })),
        // ...Object.values(departmentDictionary).map((node) => ({ ...node })),
      ]);
    }
    setLoading(false);
  }, [departmentDictionary]);

  const fetchRelations = async () => {
    try {
      const allRelationPromises = Object.keys(ministryDictionary).map(
        async (ministryId) => {
          const response = await api.fetchAllRelationsForMinistry({
            ministryId: ministryId,
            name: "AS_DEPARTMENT",
            activeAt: selectedDate.date,
          });

          return response.map((department) => ({
            source: ministryId,
            target: department.relatedEntityId,
            value: 2,
            type: 'level2'
          }));
        }
      );

      const allRelations = await Promise.all(allRelationPromises);
      const flattenedRelations = allRelations.flat();

      const departments = flattenedRelations
        .map((relation) => {
          return allDepartmentData[relation.target];
        })
        .filter(Boolean);

      const departmentDic = departments.reduce((acc, department) => {
        acc[department.id] = {
          id: department.id,
          name: utils.extractNameFromProtobuf(department.name),
          created: department.created,
          kind: department.kind,
          terminated: department.terminated,
          color: "#808080",
        };
        return acc;
      }, {});

      console.log("department objects : ", departmentDic);
      setDepartmentDictionary(departmentDic);
      setRelations((prev) => [...prev, ...ministryRelationToGov]);
      // setRelations((prev) => [...prev, ...flattenedRelations]);
    } catch (e) {
      console.log(`Error fetching relations fetching : ${e.message}`);
    } finally {
    }
  };

  const graphData = {
    nodes: allNodes,
    links: loading ? [] : relations,
  };
  // const graphData = {
  //   nodes: [],
  //   links: [],
  // };

  const handleNodeClick = useCallback(
    (node) => {
      // Aim at node from outside it
      const distance = 200;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

      focusRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        node, // lookAt ({ x, y, z })
        3000 // ms transition duration
      );
    },
    [focusRef]
  );

  useEffect(() => {
    if (focusRef.current) {
      focusRef.current.d3Force("link").distance(link => {
      switch (link.type) {
        case "level1":
          return 180;
        case "level2":
          return 120;
        default:
          return 120;
      }
    });
      focusRef.current.d3Force("charge").theta(0.5).strength(-300);
    }
  }, [graphData]);

  // uncomment this for glow the graph
  // useEffect(() => {
  //   if (!focusRef.current || loading) return;

  //   const composer = focusRef.current.postProcessingComposer?.();
  //   if (!composer) return;

  //   const bloomPass = new UnrealBloomPass();
  //   bloomPass.strength = 1;
  //   bloomPass.radius = 2;
  //   bloomPass.threshold = 1;

  //   composer.addPass(bloomPass);

  //   // Optional: clean up on unmount or re-render
  //   return () => {
  //     composer.passes = composer.passes.filter((pass) => pass !== bloomPass);
  //   };
  // }, [loading]);

  // uncomment this to rotate the graph
  //   useEffect(() => {
  //   if (!focusRef.current) return;

  //   focusRef.current.cameraPosition({ z: distance });

  //   let angle = 0;
  //   const interval = setInterval(() => {
  //     if (!focusRef.current) return;
  //     focusRef.current.cameraPosition({
  //       x: distance * Math.sin(angle),
  //       z: distance * Math.cos(angle),
  //     });
  //     angle += Math.PI / 300;
  //   }, 10);

  //   return () => clearInterval(interval); // Clean up on unmount
  // }, [loading]);

  return (
    <div className="relative">
      <StatisticsSearchBar />
      <div className="flex justify-center items-center">
        {!loading ? (
          <ForceGraph3D
            graphData={graphData}
            backgroundColor="#111111"
            // linkDirectionalArrowColor="fff"
            // linkDirectionalArrowLength={5}
            // linkDirectionalArrowRelPos={10}
            // linkCurvature={5}
            linkWidth={2}
            nodeRelSize={10}
            // dagMode="lr"
            // dagLevelDistance={60}
            nodeResolution={50}
            ref={focusRef}
            nodeAutoColorBy="group"
            nodeThreeObjectExtend={true}
            nodeThreeObject={(node) => {
              const sprite = new SpriteText(utils.makeMultilineText(node.name));
              sprite.color = "#fff";
              sprite.backgroundColor = "#000";
              sprite.padding = 2;
              sprite.borderRadius = 3;
              sprite.textHeight = 6;
              sprite.center.y = -0.50; 
              return sprite;
            }}
            onNodeClick={handleNodeClick}
            cooldownTicks={100}
            // onEngineStop={() => focusRef.current.zoomToFit(400)}
            onNodeDragEnd={(node) => {
              node.fx = node.x;
              node.fy = node.y;
              node.fz = node.z;
            }}
          />
        ) : (
          <ClipLoader
            color="text-white"
            loading={loading}
            size={25}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        )}
      </div>
    </div>
  );
}
