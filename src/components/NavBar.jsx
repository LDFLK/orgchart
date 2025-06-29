import { useState, useEffect } from "react";
import { Box, Button, Stack, Typography, IconButton } from "@mui/material";
import ModernView from "./modernView";
import OrgChart from "./orgchart";
import api from "./../services/services";
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
  setSelectedPresident,
  setSelectedIndex,
  setSelectedDate,
} from "../store/presidencySlice";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useDispatch } from "react-redux";
import { useThemeContext } from "../themeContext";
import { ClipLoader } from "react-spinners";

function Navbar() {
  const [view, setView] = useState("modern");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [showServerError, setShowServerError] = useState(false);

  //handle modern/classic view
  const handleViewChange = (type) => {
    dispatch(setSelectedPresident(null));
    dispatch(setSelectedIndex(null));
    dispatch(setSelectedDate(null));
    setView(type);
  };

  const { isDark, toggleTheme, colors } = useThemeContext();

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
      const personResponse = await api.fetchAllPersons();
      const personList = await personResponse.json();
      dispatch(setAllPerson(personList.body));

      //this is for president data
      const presidentResponse = await api.fetchPresidentsData();
      dispatch(setPresidentRelationList(presidentResponse));

      const presidentSet = new Set(
        presidentResponse.map((p) => p.relatedEntityId)
      );

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
                .split(":")[0]
                .toLowerCase()
            )
        );

        return {
          ...president,
          imageUrl: matchedDetail?.imageUrl || null, // fallback if no match
        };
      });

      dispatch(setPresidentList(enrichedPresidents));
      dispatch(
        setSelectedPresident(enrichedPresidents[enrichedPresidents.length - 1])
      );
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
      const dictionary = await api.createDepartmentHistoryDictionary(
        ministryList.body
      );
      dispatch(setDepartmentHistory(dictionary));
    } catch (e) {
      setShowServerError(true);
      console.log(`Error fetching ministry data : ${e.message}`);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: colors.backgroundPrimary,
      }}
    >
      {/* View Buttons */}
      <Box
        sx={{
          width: "100%",
          backgroundColor: colors.backgroundPrimary,
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            border: `2px solid ${colors.textPrimary}25`,
            px: 5,
            py: 2,
            borderRadius: "50px",
            backgroundColor: `${colors.backgroundPrimary}99`,
            justifyItems: "center",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            width: "98%",
            display: "flex",
            zIndex: 1000,
          }}
        >
          <Typography
            fontSize={25}
            fontWeight={"bold"}
            sx={{ color: colors.textPrimary, flex: 1, textAlign: "left" }}
          >
            ORGCHART 2.0
          </Typography>
          <Box>
            {["modern", "classic"].map((type) => (
              <Button
                key={type}
                variant={view === type ? "contained" : "outlined"}
                onClick={() => handleViewChange(type)}
                sx={{
                  fontFamily: "poppins",
                  color: view === type ? "#fff" : colors.primary,
                  backgroundColor:
                    view === type ? colors.primary : "transparent",
                  borderColor: colors.primary,
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "50px",
                  px: 3,
                  py: 1,
                  m: 0.5,
                  "&:hover": {
                    backgroundColor:
                      view === type ? colors.primary : `${colors.primary}22`, // light hover tint
                    borderColor: colors.primary,
                  },
                }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </Box>
          <Box sx={{ color: colors.textPrimary, flex: 1, textAlign: "right" }}>
            <IconButton
              sx={{ ml: 1 }}
              onClick={() => {
                toggleTheme();
              }}
              color="inherit"
            >
              {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
        </Stack>
      </Box>

      {loading ? (
        <Box
          sx={{
            paddingTop: "25vh",
            width: "100vw",
            height: "100vh",
            backgroundColor: colors.backgroundPrimary,
            display: "flex",
            justifyContent: "center",
            justifyItems: "center",
          }}
        >
          <ClipLoader
            color={colors.timelineLineActive}
            loading={loading}
            size={50}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </Box>
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
      ) : (
        <>
          {view == "modern" ? (
            <>
              <ModernView />
            </>
          ) : (
            <>
              <OrgChart />
            </>
          )}
        </>
      )}
    </Box>
  );
}

export default Navbar;
