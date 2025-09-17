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
  setSelectedIndex
} from "../store/presidencySlice";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/NavBar";
import { Box, colors, Typography } from "@mui/material";
import { setGazetteDataClassic } from "../store/gazetteDate";
import StatisticMainPage from "./statistics_main_page";
import LoadingComponent from "../components/common_components/loading_component";
import { useThemeContext } from "../themeContext";
import Dashboard from "./StatComparison";

export default function DataLoadingAnimatedComponent({ mode }) {
  const [loading, setLoading] = useState(false);
  const [showServerError, setShowServerError] = useState(false);
  const { presidentDict, selectedPresident } = useSelector(
    (state) => state.presidency
  );
  const dispatch = useDispatch();

  const { colors, isDark } = useThemeContext();

  useEffect(() => {
    console.log('is this dark : ', isDark)
  }, [])

  useEffect(() => {
    const initialFetchData = async () => {
      // Only fetch data if presidentDict is empty (first time loading)
      if (Object.keys(presidentDict).length === 0) {
        setLoading(true);
        try {
          const beforeTime = new Date().getTime();
          await fetchPersonData();
          await fetchAllMinistryData();
          await fetchAllDepartmentData();
          await fetchAllGazetteDate();
          const afterTime = new Date().getTime();
          console.log(
            `execusion time for initial fetching of all:  ${afterTime - beforeTime
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
        <LoadingComponent />
      ) : showServerError ? (
        <Box
          sx={{
            backgroundColor: colors.backgroundPrimary,
            width: "100%",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            color="black"
            sx={{ fontFamily: "poppins", fontSize: 24 }}
          >
            Oops.. Something Went Wrong... Refresh Please
          </Typography>
        </Box>
      ) : (
        <>

          {Object.keys(presidentDict).length > 0 &&
            mode === "orgchart" &&
            selectedPresident && <Navbar />}

          {Object.keys(presidentDict).length > 0 &&
            mode === "statistics" &&
            selectedPresident && <StatisticMainPage />}

          {mode === "comparison" &&
            Object.keys(presidentDict).length > 0 && <Dashboard />}
        </>
      )}
    </>
  );

}
