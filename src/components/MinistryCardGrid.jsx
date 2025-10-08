import {
  Box,
  Grid,
  Typography,
  Alert,
  AlertTitle,
  Divider,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  DialogContent,
} from "@mui/material";
import MinistryCard from "./MinistryCard";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import api from "./../services/services";
import { ClipLoader } from "react-spinners";
import { setSelectedMinistry } from "../store/allMinistryData";
import { useThemeContext } from "../themeContext";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PersonIcon from "@mui/icons-material/Person";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import InfoTooltip from "./common_components/InfoToolTip";

import utils from "./../utils/utils";
import MinistryViewModeToggleButton from "./ministryViewModeToggleButton";
import GraphComponent from "./graphComponent";
import { clearTimeout } from "highcharts";
import UrlParamState from "../hooks/singleSharingURL";

import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import PersonsTab from "./PersonsTab";
import MinistryDrawerContent from "./MinistryDrawerContent";

const MinistryCardGrid = () => {
  const { allMinistryData } = useSelector((state) => state.allMinistryData);
  const { selectedDate, selectedPresident } = useSelector(
    (state) => state.presidency
  );
  const allPersonDict = useSelector((state) => state.allPerson.allPerson);
  const [activeMinistryList, setActiveMinistryList] = useState([]);
  const [filteredMinistryList, setFilteredMinistryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [searchText, setSearchText] = UrlParamState("filterByName", "");
  const [filterType, setFilterType] = UrlParamState("filterByType", "all");
  const [viewMode, setViewMode] = UrlParamState("viewMode", "Grid");
  const { colors } = useThemeContext();
  const dispatch = useDispatch();

  useEffect(() => {
    if (
      !selectedDate ||
      !allMinistryData ||
      Object.keys(allMinistryData).length === 0
    ) {
      return;
    }

    fetchActiveMinistryList();
  }, [selectedDate, allMinistryData, selectedPresident]);

  useEffect(() => {
    let delayDebounceFunction;
    setFilterLoading(true);
    delayDebounceFunction = setTimeout(() => {
      let result = activeMinistryList;

      if (filterType === "newPerson") {
        result = result.filter((m) => m.newPerson);
      } else if (filterType === "newMinistry") {
        result = result.filter((m) => m.newMin);
      } else if (filterType === "presidentAsMinister") {
        result = result.filter((m) => {
          const headName = m.headMinisterName
            ? utils.extractNameFromProtobuf(m.headMinisterName)
            : selectedPresident?.name
            ? utils
                .extractNameFromProtobuf(selectedPresident.name)
                .split(":")[0]
            : null;

          const presidentName = selectedPresident?.name
            ? utils
                .extractNameFromProtobuf(selectedPresident.name)
                .split(":")[0]
            : null;

          return (
            headName &&
            presidentName &&
            headName.toLowerCase().trim() === presidentName.toLowerCase().trim()
          );
        });
      }

      if (searchText !== "") {
        result = searchByText(searchText, result);
      }
      setFilteredMinistryList(result);
      setFilterLoading(false);
    }, 1000);

    return () => clearTimeout(delayDebounceFunction);
  }, [searchText, filterType, activeMinistryList, selectedPresident]);

  const searchByText = (searchText, list = activeMinistryList) => {
    if (searchText !== "") {
      const normalizedSearchText = (
        searchText ? String(searchText).trim() : ""
      ).toLowerCase();

      return list.filter((minister) => {
        const ministerName = minister.name
          ? minister.name.toLowerCase().trim()
          : "";
        return ministerName.includes(normalizedSearchText);
      });
    } else {
      return list;
    }
  };

  const handleChange = (event) => {
    setSearchText(event.target.value);
  };

  const fetchActiveMinistryList = async () => {
    if (
      !selectedDate ||
      !allMinistryData ||
      Object.keys(allMinistryData).length === 0
    )
      return;

    try {
      const startTime = new Date().getTime();
      setLoading(true);
      const activeMinistry = await api.fetchActiveMinistries(
        selectedDate,
        allMinistryData,
        selectedPresident
      );

      const enrichedMinistries = await Promise.all(
        activeMinistry.children.map(async (ministry) => {
          const response = await api.fetchActiveRelationsForMinistry(
            selectedDate.date,
            ministry.id,
            "AS_APPOINTED"
          );
          const res = await response.json();

          // Create a map of relatedEntityId -> startTime for fast lookup
          const startTimeMap = new Map();
          res.forEach((relation) => {
            if (relation.relatedEntityId) {
              startTimeMap.set(relation.relatedEntityId, relation.startTime);
            }
          });

          // Lookup only the relevant persons directly from allPerson dict
          const personListInDetail = Array.from(startTimeMap.keys())
            .map((id) => {
              const person = allPersonDict[id];
              if (!person) return null;
              return {
                ...person,
                startTime: startTimeMap.get(id) || null,
              };
            })
            .filter(Boolean); // remove any missing ids

          const headMinisterName = personListInDetail[0]?.name || null;
          const headMinisterStartTime =
            personListInDetail[0]?.startTime || null;

          return {
            ...ministry,
            headMinisterName,
            newPerson:
              headMinisterStartTime?.startsWith(selectedDate.date) || false,
            newMin: ministry.startTime?.startsWith(selectedDate.date) || false,
          };
        })
      );

      setActiveMinistryList(enrichedMinistries);
      setFilteredMinistryList(enrichedMinistries);
      setLoading(false);
      const endTime = new Date().getTime();
      console.log(
        "Fetch and Enrichment time for active ministry list:",
        endTime - startTime,
        "ms"
      );
    } catch (e) {
      console.log("error fetch ministry list : ", e.message);
      setLoading(false);
    }
  };

  const steps = [
    {
      label: "Ministries",
      description: `All active ministries on this date`,
    },
    {
      label: "Departments & Persons",
      description: "All departments under this ministry",
    },
  ];

  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState("departments");
  const [selectedCard, setSelectedCard] = useState();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  useEffect(() => {
    console.log(activeStep);
  }, [activeStep]);

  return (
    <Box
      sx={{
        py: {
          xs: 2,
          sm: 3,
          md: 5,
        },
        overflowX: "auto",
      }}
    >
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography
          variant="h6"
          sx={{
            color: colors.textPrimary,
            fontFamily: "poppins",
          }}
        >
          Gazette Date
        </Typography>
        <Divider>
          <Chip
            label={selectedDate.date}
            sx={{
              backgroundColor: "transparent",
              fontWeight: "bold",
              // color: colors.textSecondary,
              color: selectedPresident.themeColorLight,
              fontFamily: "poppins",
              fontSize: 25,
              P: 1,
            }}
          />
        </Divider>
      </Box>
      {/* Key Highlights Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 3,
        }}
      >
        {/* Heading outside the box */}
        <Typography
          variant="h6"
          sx={{
            mt: 1,
            fontFamily: "Poppins",
            fontWeight: 600,
            color: colors.textPrimary,
            mb: 2, // space between heading and card
          }}
        >
          Key Highlights
        </Typography>

        {/* The Card */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 500,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 3,
            borderRadius: 2,
            backgroundColor: colors.backgroundWhite,
          }}
        >
          {/* Rows */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {/* New Ministries */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <AccountBalanceIcon sx={{ color: colors.textMuted }} />

              <Typography
                sx={{
                  flex: 1,
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  color: colors.textMuted,
                }}
              >
                New Ministries{" "}
                <InfoTooltip
                  message="New ministry portfolios created on selected date"
                  iconColor={colors.textPrimary}
                  iconSize={14}
                />
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontSize: 20,
                  fontWeight: 500,
                  color: colors.textPrimary,
                }}
              >
                {activeMinistryList.filter((m) => m.newMin).length}
              </Typography>
            </Box>

            {/* new persons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <PersonAddAlt1Icon sx={{ color: colors.textMuted }} />
              <Typography
                sx={{
                  flex: 1,
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  color: colors.textMuted,
                }}
              >
                New Ministers{" "}
                <InfoTooltip
                  message="New ministers assigned to portfolios on selected date"
                  iconColor={colors.textPrimary}
                  iconSize={14}
                />
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontSize: 20,
                  fontWeight: 500,
                  color: colors.textPrimary,
                }}
              >
                {activeMinistryList.filter((m) => m.newPerson).length}
              </Typography>
            </Box>

            {/* Ministries assigned to president */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <WorkspacePremiumIcon sx={{ color: colors.textMuted }} />
              <Typography
                sx={{
                  flex: 1,
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  color: colors.textMuted,
                }}
              >
                Ministries assigned to president{" "}
                <InfoTooltip
                  message="Ministry portfolios under the president on selected date"
                  iconColor={colors.textPrimary}
                  iconSize={14}
                />
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontSize: 20,
                  fontWeight: 500,
                  color: colors.textPrimary,
                }}
              >
                {
                  activeMinistryList.filter((m) => {
                    const headName = m.headMinisterName
                      ? utils.extractNameFromProtobuf(m.headMinisterName)
                      : null;

                    const presidentName = selectedPresident?.name
                      ? utils
                          .extractNameFromProtobuf(selectedPresident.name)
                          .split(":")[0]
                      : null;

                    if (!headName && presidentName) return true;

                    return (
                      headName &&
                      presidentName &&
                      headName.toLowerCase().trim() ===
                        presidentName.toLowerCase().trim()
                    );
                  }).length
                }
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Container for Active Ministries Section */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          py: 2,
          borderRadius: 2,
          //backgroundColor: colors.backgroundColor,
          backgroundColor: colors.backgroundWhite,
        }}
      >
        {/* Top Bar with Title + Search + Filter */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" }, // stack on xs, row on sm+
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            mb: 1,
            px: 5,
            pt: 3,
          }}
        >
          {/* Left Title */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              mb: { xs: 2, sm: 0 },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: colors.textPrimary,
                fontFamily: "Poppins",
              }}
            >
              {activeMinistryList.length > 0
                ? `${activeMinistryList.length} `
                : ""}
              Active Ministries
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 500,
                color: colors.textMuted,
                fontFamily: "Poppins",
              }}
            >
              {selectedDate.date}
            </Typography>
          </Box>

          {/* Right Controls (Search + Filter) */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" }, // stack on xs, row on sm+
              gap: 2,
              width: { xs: "100%", sm: "auto" },
              alignItems: { xs: "stretch", sm: "center" },
            }}
          >
            {/* Search Bar */}
            <Box
              sx={{
                flex: 1,
                minWidth: { xs: "100%", sm: "30%" },
                maxWidth: { sm: "68%" },
              }}
            >
              <TextField
                fullWidth
                label="Search by ministry name"
                id="ministry-search"
                onChange={handleChange}
                value={searchText}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchIcon sx={{ color: colors.textMuted }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  backgroundColor: colors.backgroundColor,
                  "& .MuiInputLabel-root": { color: colors.textMuted },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: colors.textMuted },
                    "&:hover fieldset": { borderColor: colors.textMuted },
                    "&.Mui-focused fieldset": { borderColor: colors.textMuted },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: colors.textMuted,
                  },
                  "& .MuiInputBase-input": { color: colors.textMuted },
                }}
              />
            </Box>

            {/* Dropdown Filter */}
            <FormControl
              sx={{ minWidth: { xs: "100%", sm: 30 }, flexShrink: 0 }}
            >
              <InputLabel
                sx={{
                  color: colors.textMuted,
                  "&.Mui-focused": { color: colors.textMuted },
                }}
              >
                Filter
              </InputLabel>
              <Select
                value={filterType}
                label="Filter"
                onChange={(e) => setFilterType(e.target.value)}
                sx={{
                  backgroundColor: colors.backgroundColor,
                  color: colors.textMuted, // selected value color
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.textMuted,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.textMuted,
                  },
                  "& .MuiSvgIcon-root": {
                    color: colors.textMuted, // dropdown arrow
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: colors.backgroundPrimary, // dropdown background
                      "& .MuiMenuItem-root": {
                        color: colors.textPrimary, // menu item text
                      },
                      "& .MuiMenuItem-root.Mui-selected": {
                        color: colors.textMuted, // selected item text
                        backgroundColor: `${colors.backgroundColor} !important`,
                      },
                      "& .MuiMenuItem-root:hover": {
                        backgroundColor: `${colors.textMuted}10 !important`,
                      },
                    },
                  },
                }}
              >
                <MenuItem value="all">All Ministries</MenuItem>
                <MenuItem value="newPerson">New Person</MenuItem>
                <MenuItem value="newMinistry">New Ministry</MenuItem>
                <MenuItem value="presidentAsMinister">
                  President as Minister
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <MinistryViewModeToggleButton
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "20vh",
            }}
          >
            <ClipLoader
              color={selectedPresident.themeColorLight}
              loading={loading}
              size={25}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </Box>
        ) : (
          <>
            <Box sx={{ width: "100%", display: "flex", pl: viewMode == "Grid" ? 8 : 0 }}>
              {viewMode == "Grid" ? (
                <Stepper
                  activeStep={activeStep}
                  sx={{
                    width: "100%",
                    "& .MuiStepConnector-line": {
                      borderColor: colors.textMuted,
                    },
                  }}
                  orientation="vertical"
                >
                  {steps.map((step, index) => (
                    <Step key={step.label}>
                      <StepLabel
                        onClick={
                          (activeStep != 0 &&
                            step.label == "Ministries" &&
                            selectedCard) ||
                          (activeStep == 1 &&
                            step.label == "Departments & Persons")
                            ? handleBack
                            : null
                        }
                        sx={{
                          fontWeight: 700,
                          cursor: "pointer",
                          "&:hover .MuiTypography-root": {
                            textDecoration: "underline",
                          },
                          "& .MuiStepIcon-root": {
                            fontSize: "2rem", // Increase icon size
                            color: selectedPresident.themeColorLight,
                            "&.Mui-active": {
                              color: selectedPresident.themeColorLight,
                            },
                            "&.Mui-completed": {
                              color: selectedPresident.themeColorLight,
                            },
                          },
                        }}
                      >
                        <Typography
                          component="span"
                          sx={{
                            color: colors.textPrimary,
                            fontWeight: "semibold",
                            fontSize: "1.1rem", // Increase text size
                            transition: "text-decoration 0.2s ease-in-out",
                          }}
                        >
                          {selectedCard &&
                          step.label == "Ministries" &&
                          activeStep !== 0
                            ? selectedCard.name
                            : step.label}
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        {step.label == "Ministries" ? (
                          <>
                            <Grid
                              mt={2}
                              position={"relative"}
                              container
                              justifyContent="center"
                              gap={1}
                              sx={{ width: "100%" }}
                            >
                              {filteredMinistryList &&
                              filteredMinistryList.length > 0 ? (
                                filteredMinistryList.map((card) => (
                                  <Grid
                                    key={card.id}
                                    sx={{
                                      display: "grid",
                                      flexBasis: {
                                        xs: "100%",
                                        sm: "48%",
                                        md: "31.5%",
                                        lg: "23.5%",
                                      },
                                      maxWidth: {
                                        xs: "100%",
                                        sm: "48%",
                                        md: "31.5%",
                                        lg: "23.5%",
                                      },
                                    }}
                                  >
                                    <MinistryCard
                                      card={card}
                                      onClick={() => {
                                        dispatch(setSelectedMinistry(card.id));
                                        handleNext();
                                        setSelectedCard(card);
                                      }}
                                    />
                                  </Grid>
                                ))
                              ) : !loading &&
                                activeMinistryList &&
                                activeMinistryList.length === 0 ? (
                                <Box
                                  sx={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    marginTop: "15px",
                                  }}
                                >
                                  <Alert
                                    severity="info"
                                    sx={{ backgroundColor: "transparent" }}
                                  >
                                    <AlertTitle
                                      sx={{
                                        fontFamily: "poppins",
                                        color: colors.textPrimary,
                                      }}
                                    >
                                      No ministries in the government. Sometimes
                                      this can be the president appointed date.
                                    </AlertTitle>
                                  </Alert>
                                </Box>
                              ) : (
                                <Box
                                  sx={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    marginTop: "15px",
                                  }}
                                >
                                  <Alert
                                    severity="info"
                                    sx={{ backgroundColor: "transparent" }}
                                  >
                                    <AlertTitle
                                      sx={{
                                        fontFamily: "poppins",
                                        color: colors.textPrimary,
                                      }}
                                    >
                                      No Search Result
                                    </AlertTitle>
                                  </Alert>
                                </Box>
                              )}
                            </Grid>
                            {/* If filtering is happening, overlay a subtle loader */}
                            {filterLoading && (
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "center",
                                  mt: 2,
                                }}
                              >
                                <ClipLoader
                                  color={selectedPresident.themeColorLight}
                                  loading={filterLoading}
                                  size={18}
                                />
                              </Box>
                            )}
                          </>
                        ) : (
                          step.label == "Departments & Persons" && (
                            <DialogContent
                              sx={{
                                p: 4,
                                borderRadius: "14px",
                                mr: 4,
                                mt: 2,
                                display: "flex",
                                flexDirection: "column",
                                overflowY: "auto",
                                scrollbarWidth: "none",
                                backgroundColor: "#0a1929",
                                "&::-webkit-scrollbar": { display: "none" },
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 2,
                                  mb: 4,
                                  justifyContent: {
                                    xs: "center",
                                    sm: "flex-start",
                                  },
                                }}
                              >
                                {["departments", "persons"].map((tab) => {
                                  const label =
                                    tab.charAt(0).toUpperCase() + tab.slice(1);
                                  const isActive = tab == activeTab;
                                  return (
                                    <Button
                                      key={tab}
                                      variant={
                                        isActive ? "contained" : "outlined"
                                      }
                                      onClick={() => setActiveTab(tab)}
                                      sx={{
                                        textTransform: "none",
                                        borderRadius: "50px",
                                        px: { xs: 2, sm: 3 },
                                        py: 0.8,
                                        backgroundColor: isActive
                                          ? selectedPresident.themeColorLight
                                          : "none",
                                        borderColor:
                                          selectedPresident.themeColorLight,
                                        color: isActive
                                          ? colors.textPrimary
                                          : selectedPresident.themeColorLight,
                                        fontFamily: "poppins",
                                        fontSize: {
                                          xs: "0.8rem",
                                          sm: "0.9rem",
                                          md: "1rem",
                                        },
                                      }}
                                    >
                                      {label}
                                    </Button>
                                  );
                                })}
                              </Box>
                              <Box sx={{ flexGrow: 1, mt: 2, width: "100%" }}>
                                <>
                                  {selectedCard &&
                                    activeTab === "departments" && (
                                      <MinistryDrawerContent
                                        selectedDate={
                                          selectedDate?.date || selectedDate
                                        }
                                        ministryId={selectedCard?.id}
                                      />
                                    )}
                                  {selectedCard && activeTab === "persons" && (
                                    <PersonsTab
                                      selectedDate={
                                        selectedDate?.date || selectedDate
                                      }
                                    />
                                  )}
                                </>
                              </Box>
                            </DialogContent>
                          )
                        )}
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              ) : (
                <GraphComponent activeMinistries={filteredMinistryList} />
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default MinistryCardGrid;
