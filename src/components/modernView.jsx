import React, { useEffect } from "react";
import { Box, Card, Typography, Avatar } from "@mui/material";
import PresidencyTimeline from "./PresidencyTimeline";
// import colors from "../assets/colors";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import InfoTab from "./InfoTab";
import MinistryCardGrid from "./MinistryCardGrid";
import api from "../services/services";
import utils from "../utils/utils";
import { setSelectedDate } from "../store/presidencySlice";
import { setGazetteData } from "../store/gazetteDate";
import { useThemeContext } from "../themeContext";

const ModernView = () => {
  const dispatch = useDispatch();
  const { selectedDate, selectedPresident, presidentRelationList } =
    useSelector((state) => state.presidency);
  const { selectedMinistry } = useSelector((state) => state.allMinistryData);
  const presidencyRelationList = useSelector((state) => state.presidency.presidentRelationList)
  // const presidents = useSelector((state) => state.presidency.presidentList);
  //   const selectedPresident =
  //     selectedIndex !== null ? presidents[selectedIndex] : null;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [drawerMode, setDrawerMode] = useState("ministry");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const {colors} = useThemeContext();

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setDrawerMode("ministry");
    setSelectedDepartment(null);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedCard(null);
    setDrawerMode("ministry");
    setSelectedDepartment(null);
  };

  const handleDepartmentClick = (dep) => {
    setSelectedDepartment(dep);
    setDrawerMode("department");
  };

  useEffect(() => {
    if (selectedPresident?.created) {
      const matchedPresidentRelation = presidentRelationList.find(
        (obj) => obj.startTime == selectedPresident.created
      );
      fetchGazetteData(matchedPresidentRelation);
      console.log('matched president relation : ',matchedPresidentRelation)
      console.log('selected president : ', selectedPresident)
    }
  }, [selectedPresident]);

  const fetchGazetteData = async (selectedPresident) => {
    try {
      const startTime = selectedPresident.startTime.split("T")[0];
      const endTime = selectedPresident.endTime.split("T")[0];

      const { dates } = await api.fetchInitialGazetteData();

      // console.log('returned date : ',dates)
      // console.log('start date : ',startTime);
      // console.log('endTime : ', endTime)

      var filteredDates = [];
      if (endTime == "") {
        filteredDates = dates.filter((date) => date >= startTime);
      } else {
        filteredDates = dates.filter(
          (date) => date >= startTime && date < endTime
        );
      }

      const transformed = filteredDates.map((date) => ({ date: date }));

      console.log('transform data : ', dates)

      dispatch(setGazetteData(transformed));
      // dispatch(setAllMinistryData(allMinistryData));

      if (transformed.length > 0) {
        dispatch(setSelectedDate(transformed[transformed.length - 1]));
      }
    } catch (e) {
      console.log(`Error fetching gazette data : ${e.message}`);
    }
  };

  return (
    <Box
      sx={{
        paddingTop: "2vw",
        width: "100vw",
        minHeight: "100vh",
        backgroundColor: colors.backgroundPrimary,
        overflowX: "hidden",
      }}
    >
      {/* Search Bar */}
      {/* <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 4,
          p: 2,
          justifyContent: "center",
        }}
      >
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          fullWidth
          sx={{
            input: { color: colors.textSearch },
            label: { color: colors.textSearch },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#1565c0" },
              "&:hover fieldset": { borderColor: colors.textSearch },
              "&.Mui-focused fieldset": { borderColor: colors.textSearch },
            },
          }}
        />
        <Button
          variant="contained"
          sx={{
            minWidth: 120,
            height: "40px",
            fontWeight: 600,
            backgroundColor: colors.textSearch,
            color: "#fff",
            textTransform: "none",
            "&:hover": { backgroundColor: "#1565c0" },
          }}
        >
          Search
        </Button>
      </Box> */}

      <Box sx={{ display: "flex", mt: 5, justifyContent: "center" }}>
        <PresidencyTimeline />
      </Box>

      <Box
        sx={{
          border: `2px solid ${colors.primary}10`,
          p: 3,
          mx: {
            xs: 2,
            xl: 5,
          },
          my: 2,
          borderRadius: "15px",
          backgroundColor: colors.backgroundWhite,
        }}
      >
        {/* Selected Info Card */}
        <Box
          sx={{
            textAlign: "left",
            width: "100%",
            display: {
              xs: "block",
              md: "flex",
            },
            justifyContent: "Center",
          }}
        >
          <Card
            sx={{
              width: {
                sm: "45%",
                lg: "25%",
              },
              marginRight: 1,
              border: `2px solid ${colors.purple}50`,
              borderRadius: "15px",
              backgroundColor: colors.backgroundPrimary,
              boxShadow: "none",
            }}
          >
            <Box
              sx={{
                width: "175px",
                height: "35px",
                backgroundColor: `${colors.purple}`,
                borderBottomRightRadius: "15px",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  color: colors.white,
                  fontSize: 18,
                  textAlign: "center",
                  justifyItems: "center",
                  pt: "5px",
                }}
              >
                President
              </Typography>
            </Box>
            <Box sx={{ padding: 1 }}>
              {selectedPresident && (
                <>
                  <Box
                    direction="row"
                    sx={{
                      display: "flex",
                      justifyContent: "left",
                      ml: "20px",
                      my: "10px",
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: "50%",
                      }}
                    >
                      <Avatar
                        src={selectedPresident.imageUrl}
                        alt={selectedPresident.name}
                        sx={{
                          width: 75,
                          height: 75,
                          border: `3px solid ${colors.backgroundSecondary}`,
                          backgroundColor: colors.backgroundPrimary,
                          margin: "auto",
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "block",
                        justifyContent: "left",
                        ml: "15px",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: 20,
                          whiteSpace: "normal",
                          overflow: "visible",
                          textOverflow: "unset",
                          wordBreak: "break-word",
                          fontFamily: "poppins",
                          color: colors.textPrimary,
                        }}
                      >
                        {utils.extractNameFromProtobuf(selectedPresident.name)}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 18, color: colors.textMuted }}
                      >
                        {selectedPresident.created.split("-")[0]} -{" "}
                        {(() => {
                          const relation = presidencyRelationList.find(
                            (rel) => rel.relatedEntityId === selectedPresident.id
                          );
                          if (!relation) return "Unknown";

                          return relation.endTime
                            ? new Date(relation.endTime).getFullYear()
                            : "Present";
                        })()}
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Card>
          {/* <Card
            sx={{
              width: {
                sm: "45%",
                lg: "25%",
              },
              marginRight: 1,
              border: `2px solid ${colors.secondary}50`,
              borderRadius: "15px",
              backgroundColor: colors.white,
              boxShadow: "none",
            }}
          >
            <Box
              sx={{
                width: "175px",
                height: "35px",
                backgroundColor: colors.secondary,

                borderBottomRightRadius: "15px",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  color: colors.white,
                  fontSize: 18,
                  textAlign: "center",
                  justifyItems: "center",
                  pt: "5px",
                }}
              >
                Prime Minister
              </Typography>
            </Box>
            <Box sx={{ padding: 1 }}>
              {selectedPresident && (
                <>
                  <Box
                    direction="row"
                    sx={{
                      display: "flex",
                      justifyContent: "left",
                      ml: "20px",
                      my: "10px",
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: "50%",
                      }}
                    >
                      <Avatar
                        src={selectedPresident.imageUrl}
                        alt={selectedPresident.name}
                        sx={{
                          width: 75,
                          height: 75,
                          border: "3px solid white",
                          backgroundColor: "white",
                          margin: "auto",
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "block",
                        justifyContent: "left",
                        ml: "15px",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: 20,
                          color: colors.textPrimary,
                          whiteSpace: "normal", // allow wrapping
                          overflow: "visible", // show overflow content
                          textOverflow: "unset", // disable text truncation
                          wordBreak: "break-word", // break long words if needed
                        }}
                      >
                        {utils.extractNameFromProtobuf(selectedPresident.name)}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 18, color: colors.textMuted }}
                      >
                        {selectedPresident.created.split("-")[0]} -
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Card> */}
        </Box>

        {/* Card Grid for Modern View */}
        {selectedDate != null && (
          <MinistryCardGrid onCardClick={handleCardClick} />
        )}
      </Box>

      {/* Right Drawer */}
      <InfoTab
        drawerOpen={drawerOpen}
        drawerMode={drawerMode}
        selectedCard={selectedCard}
        selectedDepartment={selectedDepartment}
        selectedDate={selectedDate}
        onClose={handleDrawerClose}
        onBack={() => setDrawerMode("ministry")}
        onDepartmentClick={handleDepartmentClick}
        ministryId={selectedMinistry}
      />
    </Box>
  );
};

export default ModernView;
