import {
  Box,
  Card,
  Typography,
  Avatar,
  Dialog,
  IconButton,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PresidencyTimeline from "./PresidencyTimeline";
import MinistryCardGrid from "./MinistryCardGrid";
import InfoTab from "./InfoTab";
import utils from "../utils/utils";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useThemeContext } from "../themeContext";
import PersonProfile from "./PersonProfile";
import api from "../services/services";
import personImages from "../assets/personImages.json";
import { FaRegEye } from "react-icons/fa";

const ModernView = () => {
  const { selectedDate, selectedPresident } = useSelector(
    (state) => state.presidency
  );
  const { selectedMinistry } = useSelector((state) => state.allMinistryData);
  const presidentRelationDict = useSelector(
    (state) => state.presidency.presidentRelationDict
  );
  const allPersonData = useSelector((state) => state.allPerson.allPerson);

  const { colors } = useThemeContext();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [drawerMode, setDrawerMode] = useState("ministry");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [primeMinister, setPrimeMinister] = useState({
    relation: null,
    person: null,
  });
  const [loading, setLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { president, openProfile } = location.state || {};

  useEffect(() => {
    if (openProfile && president) {
      setProfileOpen(true);
      navigate(location.pathname, { replace: true });
    }
  }, [openProfile, president, navigate, location.pathname]);

  useEffect(() => {
    if (!selectedDate) {
      console.warn("Selected date is null, cannot fetch prime minister data.");
      return;
    }
    setPrimeMinister({ relation: null, person: null });
    const timeoutId = setTimeout(() => {
      console.log("fetching prime minister data");
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
      let pmPerson = allPersonData[response[0].relatedEntityId];
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
      <Box sx={{ display: "flex", mt: 5, justifyContent: "center" }}>
        <PresidencyTimeline />
      </Box>

      <Box
        sx={{
          p: 3,
          mx: { xs: 2, xl: 5 },
          my: 2,
          borderRadius: "15px",
        }}
      >
        <Box
          sx={{
            textAlign: "left",
            width: "100%",
            display: { xs: "block", md: "flex" },
            justifyContent: "center",
          }}
        >
          {/* President Card */}
          <Card
            sx={{
              width: { xs: "100%", sm: "45%", lg: "25%" },
              marginRight: 1,
              border: `2px solid ${selectedPresident.themeColorLight}`,
              borderRadius: "15px",
              backgroundColor: colors.backgroundPrimary,
              boxShadow: "none",
              mr: 1,
            }}
          >
            <Box
              sx={{
                width: "175px",
                height: "35px",
                backgroundColor: `${selectedPresident.themeColorLight}`,
                borderBottomRightRadius: "15px",
                textAlign: "left", // Align the header text left
              }}
            >
              <Typography
                sx={{
                  fontWeight: 300,
                  color: colors.white,
                  fontSize: 18,
                  textAlign: "center",
                  pt: "5px",
                }}
              >
                President
              </Typography>
            </Box>

            <Box sx={{ padding: 2 }}>
              {selectedPresident && (
                <Box
                  direction="row"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    ml: 0,
                    my: 0,
                  }}
                >
                  <Avatar
                    src={selectedPresident.imageUrl}
                    alt={selectedPresident.name}
                    sx={{
                      width: 75,
                      height: 75,
                      // border: `3px solid ${selectedPresident.themeColorLight}`,
                      backgroundColor: colors.backgroundPrimary,
                    }}
                  />
                  <Box
                    sx={{
                      display: "block",
                      ml: "15px",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 400,
                        fontSize: 18,
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        fontFamily: "poppins",
                        color: colors.textPrimary,
                        textAlign: "left",
                        margin: 0,
                      }}
                    >
                      {utils.extractNameFromProtobuf(selectedPresident.name)}
                    </Typography>
                    <Typography sx={{ fontSize: 18, color: colors.textMuted }}>
                      {(() => {
                        const relation =
                          presidentRelationDict[selectedPresident.id];
                        if (!relation) return "Unknown";
                        return relation.endTime
                          ? `${relation.startTime.split("-")[0]} - ${new Date(
                              relation.endTime
                            ).getFullYear()}`
                          : `${relation.startTime.split("-")[0]} - Present`;
                      })()}
                    </Typography>

                    <Button
                      component={Link}
                      to={`/person-profile/${selectedPresident?.id}`}
                      state={{ mode: "back" }}
                      disableRipple
                      disableElevation
                      sx={{
                        p: 0,
                        minWidth: "auto",
                        backgroundColor: "transparent",
                        textTransform: "none",
                        textAlign: "left",
                        "&:hover": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          fontSize: 14,
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
              )}
            </Box>
          </Card>

          {/* Prime Minister Card */}
          <Card
            sx={{
              width: { xs: "100%", sm: "45%", lg: "25%" },
              marginRight: 1,
              border: `2px solid ${selectedPresident.themeColorLight}`,
              borderRadius: "15px",
              backgroundColor: colors.backgroundPrimary,
              boxShadow: "none",
              ml: 1,
            }}
          >
            <Box
              sx={{
                width: "175px",
                height: "35px",
                backgroundColor: `${selectedPresident.themeColorLight}`,
                borderBottomRightRadius: "15px",
                textAlign: "left",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 300,
                  color: colors.white,
                  fontSize: 18,
                  textAlign: "center",
                  pt: "5px",
                }}
              >
                Prime Minister
              </Typography>
            </Box>

            <Box sx={{ padding: 2 }}>
              {primeMinister.person &&
              primeMinister.relation &&
              selectedPresident ? (
                <Box
                  direction="row"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    ml: 0,
                    my: 0,
                  }}
                >
                  <Avatar
                    src={primeMinister.person.imageUrl}
                    alt={primeMinister.person.name}
                    sx={{
                      width: 75,
                      height: 75,
                      // border: `3px solid ${selectedPresident.themeColorLight}`,
                      backgroundColor: colors.backgroundPrimary,
                    }}
                  />
                  <Box
                    sx={{
                      display: "block",
                      ml: "15px",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 400,
                        fontSize: 18,
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        fontFamily: "poppins",
                        color: colors.textPrimary,
                        textAlign: "left",
                        margin: 0,
                      }}
                    >
                      {utils.extractNameFromProtobuf(primeMinister.person.name)}
                    </Typography>
                    <Typography sx={{ fontSize: 18, color: colors.textMuted }}>
                      {(() => {
                        if (!primeMinister.relation) return "Unknown";
                        return primeMinister.relation.endTime
                          ? `${
                              primeMinister.relation.startTime.split("-")[0]
                            } - ${new Date(
                              primeMinister.relation.endTime
                            ).getFullYear()}`
                          : `${
                              primeMinister.relation.startTime.split("-")[0]
                            } - Present`;
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
                        "&:hover": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          fontSize: 14,
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
              ) : primeMinister.person == null &&
                primeMinister.relation == null &&
                !loading ? (
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

        <Dialog
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          maxWidth="xl"
          fullWidth
          PaperProps={{
            sx: {
              height: 600,
              maxHeight: 600,
              overflowY: "auto",
              scrollbarWidth: "none", // Firefox
              "&::-webkit-scrollbar": { display: "none" }, // Chrome, Safari
              backgroundColor: colors.backgroundPrimary,
              borderRadius: 3,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              px: 2,
              pt: 2,
            }}
          >
            <IconButton onClick={() => setProfileOpen(false)}>
              <CloseIcon sx={{ color: colors.textPrimary }} />
            </IconButton>
          </Box>

          <Box sx={{ px: 3, pb: 3 }}>
            <PersonProfile selectedPerson={selectedPresident} />
          </Box>
        </Dialog>

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
        selectedPresident={selectedPresident}
      />
    </Box>
  );
};

export default ModernView;
