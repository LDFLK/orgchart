import React, { useState, useEffect } from "react";
import api from "./../services/services";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import utils from "./../utils/utils";
import { setAllMinistryData } from "../store/allMinistryData";
import {
  setAllDepartmentData,
  setDepartmentHistory,
} from "../store/allDepartmentData";
import presidentDetails from "./../assets/personImages.json";
import { setAllPerson } from "../store/allPersonList";
import {
  setPresidentRelationList,
  setPresidentList,
  setSelectedPresident
} from "../store/presidencySlice";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/NavBar";
import {
  Box,
  Typography
} from "@mui/material";

export default function DataLoadingAnimatedComponent() {
  const [loading, setLoading] = useState(false);
  const [showServerError, setShowServerError] = useState(false);
  const {presidentList, selectedDate, selectedPresident } = useSelector((state) => state.presidency);
  const dispatch = useDispatch();

  useEffect(() => {
    const initialFetchData = async () => {
      setLoading(true);
      try {
        await fetchPersonData();
        await fetchAllMinistryData();
        await fetchAllDepartmentData();
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
      const presidentResponse = await api.fetchPresidentsData();
      console.log('this is the president response ')
      console.log(presidentResponse)
      dispatch(setPresidentRelationList(presidentResponse));

      const presidentSet = new Set(
        presidentResponse.map((p) => p.relatedEntityId)
      );

      console.log('president set in detail')
      console.log(presidentSet.length)

      const presidentListInDetail = personList.body.filter((person) =>
        presidentSet.has(person.id)
      );

      const enrichedPresidents = presidentListInDetail.map((president) => {
        const matchedDetail = presidentDetails.find((detail) =>
          detail.presidentName
            .toLowerCase()
            .includes(
              utils
                .extractNameFromProtobuf(president.name)
                .toLowerCase()
            )
        );

        return {
          ...president,
          imageUrl: matchedDetail?.imageUrl || null, 
          themeColorLight: matchedDetail?.themeColorLight || null
        };
      });

      dispatch(setPresidentList(enrichedPresidents));
      dispatch(setSelectedPresident(enrichedPresidents[enrichedPresidents.length - 1]));
      console.log(`count of president ${enrichedPresidents.length}`)
    } catch (e) {
      setShowServerError(true);
      console.log(`Error fetching person data : ${e.message}`);
    }
  };

  const fetchAllDepartmentData = async () => {
    try {
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
      const response = await api.fetchAllMinistries();
      const ministryList = await response.json();
      dispatch(setAllMinistryData(ministryList.body));
      // const dictionary = await api.createDepartmentHistoryDictionary(
      //   ministryList.body
      // );
      // dispatch(setDepartmentHistory(dictionary));
    } catch (e) {
      setShowServerError(true);
      console.log(`Error fetching ministry data : ${e.message}`);
    }
  };

  return (
    <>
      {loading ? (
        <>
        <Box sx={{width: "100%", height: "100vh", color: "red", display: "flex", justifyContent: "center", alignItems: "center"}}>
          <Box sx={{width: "25%"}}>
            <DotLottieReact
            src="public\initialDataLoadingAnimation.json"
            loop
            autoplay
          />
          </Box>
        </Box>
        </>
      ) : showServerError ? (
        <>
          <Box sx={{
            width: "100%",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
            <Typography color={colors.textPrimary} sx={{
              fontFamily: "poppins",
              fontSize: 24,
            }}>Oops.. Something Went Wrong... Refresh Please</Typography>
          </Box>

        </>
      ) : presidentList.length > 0 && (
        <Navbar />
      ) }
    </>
  );
}
