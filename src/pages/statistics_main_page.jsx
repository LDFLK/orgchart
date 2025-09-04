import React, { useEffect, useState, useCallback } from "react";
import ForceGraph3D from "react-force-graph-3d";
import api from "./../services/services";
import StatisticsSearchBar from "../components/statistics_compoents/searchbar";
import SpriteText from "https://esm.sh/three-spritetext";
import utils from "../utils/utils";
import { ClipLoader } from "react-spinners";
import { useDispatch, useSelector } from "react-redux";
import { setGazetteDataClassic } from "../store/gazetteDate";
import {
  setSelectedIndex,
  setSelectedPresident,
  setSelectedDate,
} from "../store/presidencySlice";

export default function StatisticMainPage() {
  const [loading, setLoading] = useState(false);
  const [ministryList, setMinistryList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [allNodes, setAllNodes] = useState([]);
  const [relations, setRelations] = useState([]);
  const [isDepartmentFetching, setIsDepartmentFetching] = useState(null)


  const presidents = useSelector((state) => state.presidency.presidentList);
  const selectedDate = useSelector((state) => state.presidency.selectedDate);
  const { selectedPresident } = useSelector((state) => state.presidency);
  const { gazetteDataClassic } = useSelector((state) => state.gazettes);
  const { allMinistryData } = useSelector((state) => state.allMinistryData);
  const { allDepartmentData} = useSelector((state) => state.allDepartmentData);

  const dispatch = useDispatch();

  // useEffect(() => {
  //   const initialFetchData = async () => {
  //     setLoading(true);
  //     try {
  //       await fetchAllGazetteDate();
  //       await fetchAllMinistryData();
  //       await fetchAllDepartmentData();
  //     } catch (e) {
  //       console.error("Error loading initial data:", e.message);
  //     }
  //   };

  //   initialFetchData();
  // }, []);

  useEffect(() => {
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

    if(gazetteDataClassic){
      const date = {date:gazetteDataClassic[gazetteDataClassic.length-1]}
      console.log('this is the date going to be setSelectedDate',date)
      dispatch(setSelectedDate(date))
    }
  }, [presidents, gazetteDataClassic]);

  // const fetchAllGazetteDate = async () => {
  //   try {
  //     console.log("fetching all gazette data");
  //     const response = await api.fetchInitialGazetteData();
  //     dispatch(setGazetteDataClassic(response.dates));
  //     console.log("gazette data from statistics");
  //     const dates = response.dates;
  //     const selectedDate = dates[dates.length - 1];
  //     setSelectedDate({date:selectedDate});
  //   } catch (e) {
  //     setShowServerError(true);
  //     console.log(`Error fetching gazette dates : ${e.message}`);
  //   }
  // };

  useEffect(() => {
    
    console.log('this is the selected date for statistics',selectedDate)
    const fetchActiveMinistries = async () => {
      const activeMinistry = await api.fetchActiveMinistries(
            selectedDate,
            allMinistryData,
            selectedPresident
          );
          console.log('active ministry calling')
          console.log(activeMinistry)
          setMinistryList(activeMinistry.children)
    }
    if(selectedDate){
    fetchActiveMinistries();}
  }, [selectedDate]);

  const fetchAllDepartmentData = async () => {
    try {
      console.log("fetching all department data");
      const response = await api.fetchAllDepartments();
      const responseDecoded = await response.json();
      setDepartmentList(responseDecoded.body);
    } catch (e) {
      setShowServerError(true);
      console.log(`Error fetching department data : ${e.message}`);
    }
  };

  useEffect(() => {
    const fetchRelationshipData = async () => {
      await fetchRelations();
    };
    if (ministryList.length > 0 || (departmentList.length > 0 && !isDepartmentFetching)) {
      setAllNodes([...ministryList, ...departmentList]);
      fetchRelationshipData();
      setLoading(false);
    }
  }, [ministryList, departmentList]);

  const fetchAllMinistryData = async () => {
    try {
      console.log("fetching all ministry data");
      const response = await api.fetchAllMinistries();
      const responseDecoded = await response.json();
      console.log("these are the ministries :", responseDecoded.body);
      setMinistryList(responseDecoded.body);
      setAllNodes(responseDecoded.body);
      // const map = responseDecoded.body.map((ministry)=>{
      //   return {
      //     id: ministry.id,
      //     name :ministry.name
      //   }
      // })

      // console.log('map',map)
    } catch (e) {
      console.log(`Error fetching ministry data : ${e.message}`);
    }
  };

  const fetchRelations = async () => {
    try {
      console.log("fetching all relation data");
      setIsDepartmentFetching(true);
      const allRelationPromises = ministryList.map(async (ministry) => {
        const response = await api.fetchAllRelationsForMinistry({
          ministryId: ministry.id,
          name: "AS_DEPARTMENT",
          activeAt: selectedDate.date
        });
        console.log('running for : ',ministry.id)
        console.log(response)
        return response.map((department) => ({
          source: ministry.id,
          target: department.relatedEntityId,
        }));
      });

      const allRelations = await Promise.all(allRelationPromises);
      const flattenedRelations = allRelations.flat();

      console.log("this is the flattened array ", flattenedRelations);
      setIsDepartmentFetching(false);
      setRelations(flattenedRelations);
    } catch (e) {
      console.log(`Error fetching relations fetching : ${e.message}`);
    }
  };

  const graphData = {
    nodes: allNodes,
    links: relations,
  };

  // const ExpandableGraph = ({ graphData }) => {
  //   const rootId = 0;

  //   const nodesById = useMemo(() => {
  //     const nodesById = Object.fromEntries(graphData.nodes.map(node => [node.id, node]));

  //     // link parent/children
  //     graphData.nodes.forEach(node => {
  //       node.collapsed = node.id !== rootId;
  //       node.childLinks = [];
  //     });
  //     graphData.links.forEach(link => nodesById[link.source].childLinks.push(link));

  //     return nodesById;
  //   }, [graphData]);

  //   const getPrunedTree = useCallback(() => {
  //     const visibleNodes = [];
  //     const visibleLinks = [];
  //     (function traverseTree(node = nodesById[rootId]) {
  //       visibleNodes.push(node);
  //       if (node.collapsed) return;
  //       visibleLinks.push(...node.childLinks);
  //       node.childLinks
  //         .map(link => ((typeof link.target) === 'object') ? link.target : nodesById[link.target]) // get child node
  //         .forEach(traverseTree);
  //     })();

  //     return { nodes: visibleNodes, links: visibleLinks };
  //   }, [nodesById]);

  //   const [prunedTree, setPrunedTree] = useState(getPrunedTree());

  const handleNodeClick = useCallback((node) => {
    console.log("clicked node : ", node);
  }, []);

  return (
    <div className="relative">
      {/* <StatisticsSearchBar /> */}
      <div className="flex justify-center items-center">
        {!loading ? (
          <ForceGraph3D
            graphData={graphData}
            // linkDirectionalArrowColor="fff"
            // linkDirectionalArrowLength={5}
            // backgroundColor="#000"
            // linkDirectionalArrowRelPos={10}
            // linkCurvature={5}
            // linkWidth={1}
            // nodeRelSize={15}
            // nodeAutoColorBy="group"
            nodeThreeObjectExtend={true}
            nodeThreeObject={(node) => {
              const sprite = new SpriteText(node.name);
              // sprite.color = node.color;
              sprite.textHeight = 10;
              sprite.center.y = -0.6; // shift above node
              return sprite;
            }}
            // onNodeClick={handleNodeClick}
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
