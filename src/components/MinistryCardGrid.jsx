import {
  Box, Grid, Typography, Alert, AlertTitle, Chip, TextField, Select, MenuItem, FormControl, InputLabel, Button, Card, DialogContent, Avatar
} from "@mui/material";
import MinistryCard from "./MinistryCard";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useRef, useState } from "react";
import api from "./../services/services";
import { ClipLoader } from "react-spinners";
import { useThemeContext } from "../themeContext";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import InfoTooltip from "../components/InfoToolTip";
import { Link, useLocation } from "react-router-dom";

import utils from "./../utils/utils";
import MinistryViewModeToggleButton from "./ministryViewModeToggleButton";
import GraphComponent from "./graphComponent";
import { clearTimeout } from "highcharts";

import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import PersonsTab from "./PersonsTab";
import useUrlParamState from "../hooks/singleSharingURL";
import DepartmentTab from "./DepartmentTab";
import personImages from "../assets/personImages.json";

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
  const [searchText, setSearchText] = useUrlParamState("filterByName", "");
  const [filterType, setFilterType] = useUrlParamState("filterByType", "all");
  const [viewMode, setViewMode] = useUrlParamState("viewMode", "Grid");
  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState("departments");
  const [selectedCard, setSelectedCard] = useState(null);
  const { colors } = useThemeContext();
  const dispatch = useDispatch();
  const location = useLocation();
  const [primeMinister, setPrimeMinister] = useState({
    relation: null,
    person: null,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ministryId = params.get("ministry");

    if (!ministryId || activeMinistryList.length === 0) {
      setSelectedCard(null);
      setActiveStep(0);
      return;
    }

    const matchedCard = activeMinistryList.find(
      (card) => String(card.id) === String(ministryId)
    );

    if (matchedCard) {
      // dispatch(setSelectedMinistry(matchedCard.id));
      setSelectedCard(matchedCard);
      setActiveStep(1);
    }
  }, [location.search, activeMinistryList, viewMode]);

  useEffect(() => {
    if (
      !selectedDate ||
      !allMinistryData ||
      Object.keys(allMinistryData).length === 0
    ) {
      return;
    }
    setTimeout(() => {
      fetchActiveMinistryList();
    }, 1500);
  }, [selectedDate, allMinistryData, selectedPresident]);

  useEffect(() => {
    if (!selectedDate) {
      return;
    }
    setPrimeMinister({ relation: null, person: null });
    const timeoutId = setTimeout(() => {
      fetchPrimeMinister();
    }, 1000);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [selectedDate]);

  const fetchPrimeMinister = async () => {
    try {
      setLoading(true);
      var response = await api.fetchActiveRelationsForMinistry(
        selectedDate.date,
        "gov_01",
        "AS_PRIME_MINISTER"
      );

      response = await response.json();
      if (response.length === 0) {
        setLoading(false);
        return;
      }
      let pmPerson = allPersonDict[response[0].relatedEntityId];
      // Try to find a matching image from personImages
      if (pmPerson && pmPerson.name) {
        const pmName = utils.extractNameFromProtobuf(pmPerson.name).trim();
        const found = personImages.find(
          (img) => img.presidentName.trim() === pmName
        );
        if (found && found.imageUrl) {
          pmPerson = { ...pmPerson, imageUrl: found.imageUrl };
        }
      }
      if (response.length > 0 && pmPerson) {
        setPrimeMinister({
          relation: response[0],
          person: pmPerson,
        });
      }
      setLoading(false);
    } catch (e) {
      console.error("Failed to fetch prime minister data:", e);
    }
  };

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

          // Lookup only the relevant people directly from allPerson dict
          const personListInDetail = Array.from(startTimeMap.keys())
            .map((id) => {
              const person = allPersonDict[id];
              if (!person) return null;
              return {
                ...person,
                startTime: startTimeMap.get(id) || null,
                id,
              };
            })
            .filter(Boolean); // remove any missing ids

          const headMinisterName = personListInDetail[0]?.name || null;
          const headMinisterStartTime =
            personListInDetail[0]?.startTime || null;
          const headMinisterId = personListInDetail[0]?.id || null;

          return {
            ...ministry,
            headMinisterId,
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
      label: "Departments & People",
      description: "All departments under this ministry",
    },
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => {
      const newStep = prevActiveStep - 1;

      if (newStep === 0) {
        const params = new URLSearchParams(window.location.search);
        params.delete("ministry");

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);
      }

      return newStep;
    });
  };

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.delete("ministry");
    setActiveStep(0);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  }, [selectedDate]);

  const handleCardClick = async (card) => {
    // dispatch(setSelectedMinistry(card.id));
    handleNext();
    setSelectedCard(card);

    const params = new URLSearchParams(window.location.search);
    params.set("ministry", card.id);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  };

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 4, md: 10, lg: 15, xl: 23 },
        mt: -2

      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "stretch",
          justifyContent: { xs: "center", md: "space-between" },
          width: "100%",
          gap: { xs: 2, sm: 4, md: 6, lg: 4, xl: 4 },
          mb: 3,
        }}
      >
        {/* Gazette Date */}
        <Box
          sx={{
            flex: { xs: "1 1 100%", sm: "0 0 40%", md: "1 1 100%", lg: "0 0 10%" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            ml: { xs: 0, md: 1 },
            mb: { xs: 2, md: 0 },
          }}
        >
          <Typography
            sx={{
              color: colors.textPrimary,
              fontFamily: "poppins",
              fontSize: 16,
            }}
          >
            Gazette Date
          </Typography>

          <Chip
            label={new Date(selectedDate.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
            sx={{
              backgroundColor: "transparent",
              fontWeight: "bold",
              color: selectedPresident.themeColorLight,
              fontFamily: "poppins",
              fontSize: 16,
            }}
          />

        </Box>

        {/* Key Highlights */}
        <Box
          sx={{
            flex: { xs: "1 1 100%", sm: "1 1 60%", md: "1 1 100%", lg: "0 0 40%" },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2,
            backgroundColor: colors.backgroundWhite,
            overflow: "hidden",
            p: 1.5,
            ml: { xs: 0, md: 3 },
            mb: { xs: 2, md: 0 },
          }}
        >
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 400,
              fontSize: 16,
              color: colors.textPrimary,
              mb: 0.5,
            }}
          >
            Key Highlights
          </Typography>

          <Box
            sx={{
              width: "100%",
              px: 1,
              display: "flex",
              flexDirection: "column",
              gap: 0.4,
            }}
          >
            {/* New Ministries */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <AccountBalanceIcon sx={{ color: colors.textMuted, fontSize: 18 }} />
              <Typography
                sx={{
                  flex: 1,
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  color: colors.textMuted,
                  fontSize: 15,
                }}
              >
                New Ministries{" "}
                <InfoTooltip
                  message="New ministry portfolios created on selected date"
                  iconColor={colors.textPrimary}
                  iconSize={13}
                />
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontSize: 17,
                  fontWeight: 500,
                  color: colors.textPrimary,
                }}
              >
                {activeMinistryList.filter((m) => m.newMin).length}
              </Typography>
            </Box>

            {/* New Ministers */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <PersonAddAlt1Icon sx={{ color: colors.textMuted, fontSize: 18 }} />
              <Typography
                sx={{
                  flex: 1,
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  color: colors.textMuted,
                  fontSize: 15,
                }}
              >
                New Ministers{" "}
                <InfoTooltip
                  message="New ministers assigned to portfolios on selected date"
                  iconColor={colors.textPrimary}
                  iconSize={13}
                />
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontSize: 17,
                  fontWeight: 500,
                  color: colors.textPrimary,
                }}
              >
                {activeMinistryList.filter((m) => m.newPerson).length}
              </Typography>
            </Box>

            {/* Ministries under president */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <WorkspacePremiumIcon sx={{ color: colors.textMuted, fontSize: 18 }} />
              <Typography
                sx={{
                  flex: 1,
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  color: colors.textMuted,
                  fontSize: 15,
                }}
              >
                Ministries under president{" "}
                <InfoTooltip
                  message="Ministry portfolios under the president on selected date"
                  iconColor={colors.textPrimary}
                  iconSize={13}
                />
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontSize: 17,
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

        {/* Prime Minister */}
        <Card
          sx={{
            flex: { xs: "1 1 100%", sm: "1 1 60%", md: "1 1 100%", lg: "0 0 34%" },
            border: `2px solid ${selectedPresident.themeColorLight}`,
            borderRadius: "15px",
            backgroundColor: colors.backgroundPrimary,
            boxShadow: "none",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            mb: { xs: 2, md: 0 },
          }}
        >
          <Typography
            sx={{
              fontWeight: 300,
              color: colors.white,
              fontSize: 16,
              textAlign: "left",
              pt: "5px",
              px: 2,
            }}
          >
            Prime Minister
          </Typography>

          <Box sx={{ p: 1.2 }}>
            {primeMinister.person && primeMinister.relation && selectedPresident ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <Avatar
                  src={primeMinister.person.imageUrl}
                  alt={primeMinister.person.name}
                  sx={{
                    width: 55,
                    height: 55,
                    backgroundColor: colors.backgroundPrimary,
                  }}
                />
                <Box sx={{ display: "block", ml: 1.2 }}>
                  <Typography
                    sx={{
                      fontWeight: 400,
                      fontSize: 15,
                      fontFamily: "poppins",
                      color: colors.textPrimary,
                      textAlign: "left",
                      margin: 0,
                    }}
                  >
                    {utils.extractNameFromProtobuf(primeMinister.person.name)}
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: colors.textMuted }}>
                    {(() => {
                      if (!primeMinister.relation) return "Unknown";
                      return primeMinister.relation.endTime
                        ? `${primeMinister.relation.startTime.split("-")[0]} - ${new Date(
                          primeMinister.relation.endTime
                        ).getFullYear()}`
                        : `${primeMinister.relation.startTime.split("-")[0]} - Present`;
                    })()}
                  </Typography>
                  <Button
                    component={Link}
                    to={`/person-profile/${primeMinister.person?.id}`}
                    state={{ mode: "back" }}
                    disableRipple
                    disableElevation
                    sx={{
                      p: 0,
                      minWidth: "auto",
                      backgroundColor: "transparent",
                      textTransform: "none",
                      textAlign: "left",
                      "&:hover": { backgroundColor: "transparent" },
                    }}
                  >
                    <Typography
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: 13,
                        color: "#6491DA",
                        transition: "color 0.3s, text-decoration 0.3s",
                        ":hover": {
                          textDecoration: "underline",
                          color: selectedPresident.themeColorLight,
                        },
                      }}
                    >
                      View Profile
                    </Typography>
                  </Button>
                </Box>
              </Box>
            ) : primeMinister.person == null && primeMinister.relation == null && !loading ? (
              <Typography
                sx={{
                  fontStyle: "italic",
                  color: colors.textMuted,
                  textAlign: "left",
                }}
              >
                No Prime Minister appointed on this date.
              </Typography>
            ) : (
              loading && (
                <Typography
                  sx={{
                    fontStyle: "italic",
                    color: colors.textMuted,
                    textAlign: "left",
                  }}
                >
                  Loading Prime Minister data...
                </Typography>
              )
            )}
          </Box>
        </Card>
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
              {new Date(selectedDate.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
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
                  color: colors.textMuted,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.textMuted,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.textMuted,
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.textMuted,
                  },
                  "&.MuiOutlinedInput-root:hover": {
                    backgroundColor: colors.backgroundColor,
                  },
                  "& .MuiSvgIcon-root": {
                    color: colors.textMuted,
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
                <MenuItem value="newPerson">New Ministers Appointed</MenuItem>
                <MenuItem value="newMinistry">New Ministries</MenuItem>
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
            <Box
              sx={{
                width: "100%",
                display: "flex",
                pl: viewMode == "Grid" ? 8 : 0,
              }}
            >
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
                              step.label == "Departments & People")
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
                                      onClick={() => handleCardClick(card)}
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
                                      No ministries.
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
                          step.label == "Departments & People" && (
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
                                backgroundColor: colors.backgroundBlue,
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
                                {["departments", "people"].map((tab) => {
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
                                      <DepartmentTab
                                        selectedDate={
                                          selectedDate?.date || selectedDate
                                        }
                                        ministryId={selectedCard?.id}
                                      />
                                    )}
                                  {selectedCard && activeTab === "people" && (
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
                <GraphComponent
                  activeMinistries={filteredMinistryList}
                  filterType={filterType}
                />
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default MinistryCardGrid;
