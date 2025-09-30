import { useState, useEffect } from "react";
import api from "./../services/services";
import utils from "./../utils/utils";
import { setAllMinistryData } from "../store/allMinistryData";
import { setAllDepartmentData } from "../store/allDepartmentData";
import presidentDetails from "./../assets/personImages.json";
import { setAllPerson } from "../store/allPersonData";
import {
  setPresidentRelationDict,
  setPresidentDict,
  setSelectedPresident,
  setSelectedIndex,
} from "../store/presidencySlice";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/NavBar";
import { Box, Typography } from "@mui/material";
import { setGazetteDataClassic } from "../store/gazetteDate";
import LoadingComponent from "../components/common_components/loading_component";
import { useThemeContext } from "../themeContext";
import Dashboard from "./StatComparison";
import PersonProfile from "../components/PersonProfile";
import SplashPage from "./splash_page";
import Error500 from "../components/500Error";

export default function DataLoadingAnimatedComponent({ mode }) {
  const [loading, setLoading] = useState(false);
  const [showServerError, setShowServerError] = useState(false);
  const { presidentDict, selectedPresident } = useSelector(
    (state) => state.presidency
  );
  const [progress, setProgress] = useState(0);
  const dispatch = useDispatch();

  const updateProgress = (step, totalSteps) => {
    setProgress(Math.round((step / totalSteps) * 100));
  };

  useEffect(() => {
    const initialFetchData = async () => {
      if (Object.keys(presidentDict).length === 0) {
        setLoading(true);
        try {

          const totalSteps = 4;
          let completedSteps = 0;

          const beforeTime = new Date().getTime();

          await fetchPersonData();
          completedSteps++;
          updateProgress(completedSteps, totalSteps);
          await fetchAllMinistryData();
          completedSteps++;
          updateProgress(completedSteps, totalSteps);
          await fetchAllDepartmentData();
          completedSteps++;
          updateProgress(completedSteps, totalSteps);
          await fetchAllGazetteDate();
          completedSteps++;
          updateProgress(completedSteps, totalSteps);

          const afterTime = new Date().getTime();

          console.log(
            `execusion time for initial fetching of all:  ${
              afterTime - beforeTime
            } msec`
          );
          setLoading(false);
        } catch (e) {
          console.error("Error loading initial data:", e.message);
        }
      }
    };

    initialFetchData();
  }, [presidentDict]);

  const listToDict = (list) => {
    return list.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
  };

  const fetchPersonData = async () => {
    try {
      console.log("fetching person data");
      const startTime = new Date().getTime();
      const personResponse = await api.fetchAllPersons();
      const endTime = new Date().getTime();
      console.log(`Time taken to fetch person data: ${endTime - startTime} ms`);
      const personList = await personResponse.json();
      //dispatch(setAllPerson(personList.body));
      const personDict = listToDict(personList.body);
      dispatch(setAllPerson(personDict));

      const presidentResponseRaw = await api.fetchPresidentsData();

      // Sort by startTime
      const presidentResponse = presidentResponseRaw.sort(
        (a, b) => new Date(a.startTime) - new Date(b.startTime)
      );

      // Convert to dictionary keyed by id
      const presidentRelationDict = listToDict(
        presidentResponse.map((item) => ({
          ...item,
          id: item.relatedEntityId,
        }))
      );
      dispatch(setPresidentRelationDict(presidentRelationDict));

      // Map relatedEntityId → person using existing personDict
      const presidentDictInDetail = presidentResponse
        .map((p) => personDict[p.relatedEntityId])
        .filter(Boolean);

      // Enrich presidents
      const enrichedPresidents = presidentDictInDetail.map((president) => {
        const matchedDetail = presidentDetails.find((detail) =>
          detail.presidentName
            .toLowerCase()
            .includes(
              utils.extractNameFromProtobuf(president.name).toLowerCase()
            )
        );

        return {
          ...president,
          imageUrl: matchedDetail?.imageUrl || null,
          themeColorLight: matchedDetail?.themeColorLight || null,
        };
      });

      dispatch(setPresidentDict(enrichedPresidents));

      // Only select the last president if no president is currently selected
      if (!selectedPresident) {
        const selectedPre = enrichedPresidents[enrichedPresidents.length - 1];
        console.log("this is the selected president ", selectedPre);
        const lastIndex = enrichedPresidents.length - 1;
        dispatch(setSelectedIndex(lastIndex));
        dispatch(setSelectedPresident(selectedPre));
      }
    } catch (e) {
      setShowServerError(true);
      console.log(`Error fetching person data : ${e.message}`);
    }
  };

  const fetchAllDepartmentData = async () => {
    try {
      //console.log("fetching all department data");
      const startTime = new Date().getTime();
      const response = await api.fetchAllDepartments();
      const endTime = new Date().getTime();
      console.log(
        `Time taken to fetch department data: ${endTime - startTime} ms`
      );
      const departmentList = await response.json();
      // dispatch(setAllDepartmentData(departmentList.body));
      const departmentDict = listToDict(departmentList.body);
      dispatch(setAllDepartmentData(departmentDict));
    } catch (e) {
      setShowServerError(true);
      console.log(`Error fetching department data : ${e.message}`);
    }
  };

  const fetchAllMinistryData = async () => {
    try {
      //console.log("fetching all ministry data");
      const startTime = new Date().getTime();
      const response = await api.fetchAllMinistries();
      const endTime = new Date().getTime();
      console.log(
        `Time taken to fetch ministry data: ${endTime - startTime} ms`
      );
      const ministryList = await response.json();
      // dispatch(setAllMinistryData(ministryList.body));
      const ministryDict = listToDict(ministryList.body);
      dispatch(setAllMinistryData(ministryDict));
    } catch (e) {
      setShowServerError(true);
      console.log(`Error fetching ministry data : ${e.message}`);
    }
  };

  const fetchAllGazetteDate = async () => {
    try {
      // console.log("fetching all gazette data");
      const response = await api.fetchInitialGazetteData();
      dispatch(setGazetteDataClassic(response.dates));
    } catch (e) {
      setShowServerError(true);
      console.log(`Error fetching gazette dates : ${e.message}`);
    }
  };

  return (
    <>
      {loading ? (
        <SplashPage progress={progress}/>
      ) : showServerError ? (
        <Error500/>
      ) : (
        <>
          {Object.keys(presidentDict).length > 0 &&
          mode === "orgchart" &&
          selectedPresident ? (
            <Navbar />
          ) : (
            Object.keys(presidentDict).length > 0 &&
            mode === "person-profile" && (<PersonProfile/>)
          )}
        </>
      )}
    </>
  );
}
