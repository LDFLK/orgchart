import { useState, useEffect } from "react";
import api from "./../services/services";
import utils from "./../utils/utils";
import { setAllMinistryData } from "../store/allMinistryData";
import { setAllDepartmentData } from "../store/allDepartmentData";
import presidentDetails from "./../assets/personImages.json";
import { setAllPerson } from "../store/allPersonList";
import {
  setPresidentRelationList,
  setPresidentList,
  setSelectedPresident,
} from "../store/presidencySlice";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/NavBar";
import { Box, Typography } from "@mui/material";
import { ClipLoader } from "react-spinners";
import { setGazetteDataClassic } from "../store/gazetteDate";

export default function DataLoadingAnimatedComponent() {
  const [loading, setLoading] = useState(false);
  const [showServerError, setShowServerError] = useState(false);
  const { presidentList } = useSelector((state) => state.presidency);
  const dispatch = useDispatch();

  useEffect(() => {
    const initialFetchData = async () => {
      setLoading(true);
      try {
        const beforeTime = new Date().getTime();
        console.log(`before time : ${beforeTime}`);
        await fetchPersonData();
        await fetchAllMinistryData();
        await fetchAllDepartmentData();
        await fetchAllGazetteDate();
        const afterTime = new Date().getTime();
        console.log(`before time : ${afterTime}`);
        console.log(
          `execusion time for initial fetching :  ${
            afterTime - beforeTime
          } msec`
        );
        setLoading(false);
      } catch (e) {
        console.error("Error loading initial data:", e.message);
      }
    };

    initialFetchData();
  }, []);

  const fetchPersonData = async () => {
    try {
      console.log("fetching person data");
      const personResponse = await api.fetchAllPersons();
      const personList = await personResponse.json();
      dispatch(setAllPerson(personList.body));

      //this is for president data
      const presidentResponseRaw = await api.fetchPresidentsData();

      console.log(`non sorted list`);
      console.log(presidentResponseRaw);

      const presidentResponse = presidentResponseRaw.sort(
        (a, b) => new Date(a.startTime) - new Date(b.startTime)
      );

      console.log(`sorted list`);
      console.log(presidentResponse);

      dispatch(setPresidentRelationList(presidentResponse));

      const sortedPresidentIds = presidentResponse.map(
        (p) => p.relatedEntityId
      );

      const personMap = new Map(personList.body.map((p) => [p.id, p]));

      const presidentListInDetail = sortedPresidentIds
        .map((id) => personMap.get(id))
        .filter(Boolean);

      console.log("president list in detail");
      console.log(presidentListInDetail);

      const enrichedPresidents = presidentListInDetail.map((president) => {
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

      console.log("Enriched president list");
      console.log(enrichedPresidents);

      const selectedPre = enrichedPresidents[enrichedPresidents.length - 1];
      console.log(`selected pre : ${selectedPre.id}`);

      dispatch(setPresidentList(enrichedPresidents));
      dispatch(setSelectedPresident(selectedPre));
    } catch (e) {
      setShowServerError(true);
      console.log(`Error fetching person data : ${e.message}`);
    }
  };

  const fetchAllDepartmentData = async () => {
    try {
      console.log("fetching all department data");
      const response = await api.fetchAllDepartments();
      const departmentList = await response.json();
      dispatch(setAllDepartmentData(departmentList.body));
    } catch (e) {
      setShowServerError(true);
      console.log(`Error fetching department data : ${e.message}`);
    }
  };

  const fetchAllMinistryData = async () => {
    try {
      console.log("fetching all ministry data");
      const response = await api.fetchAllMinistries();
      const ministryList = await response.json();
      dispatch(setAllMinistryData(ministryList.body));
    } catch (e) {
      setShowServerError(true);
      console.log(`Error fetching ministry data : ${e.message}`);
    }
  };

  const fetchAllGazetteDate = async () => {
    try {
      console.log("fetching all gazette data");
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
        <>
          <Box
            sx={{
              width: "100%",
              height: "100vh",
              color: "blue",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ClipLoader
              color="text-white"
              loading={loading}
              size={45}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
            <Typography
              color="black"
              sx={{
                fontFamily: "poppins",
                fontSize: 24,
                marginTop: 1,
                fontWeight: "semibold",
              }}
            >
              Loading...
            </Typography>
          </Box>
        </>
      ) : showServerError ? (
        <>
          <Box
            sx={{
              width: "100%",
              height: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography
              color="black"
              sx={{
                fontFamily: "poppins",
                fontSize: 24,
              }}
            >
              Oops.. Something Went Wrong... Refresh Please
            </Typography>
          </Box>
        </>
      ) : (
        presidentList.length > 0 && <Navbar />
      )}
    </>
  );
}
