import { Box, Card, Typography, Avatar, Button } from "@mui/material";
import PresidencyTimeline from "./PresidencyTimeline";
import MinistryCardGrid from "./MinistryCardGrid";
import utils from "../utils/utils";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useThemeContext } from "../themeContext";
import api from "../services/services";
import personImages from "../assets/personImages.json";

const ModernView = () => {
  const { selectedDate, selectedPresident } = useSelector(
    (state) => state.presidency
  );
  // const { selectedMinistry } = useSelector((state) => state.allMinistryData);
  const presidentRelationDict = useSelector(
    (state) => state.presidency.presidentRelationDict
  );
  const allPersonData = useSelector((state) => state.allPerson.allPerson);

  const { colors } = useThemeContext();

  const [primeMinister, setPrimeMinister] = useState({
    relation: null,
    person: null,
  });
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { president } = location.state || {};

  useEffect(() => {
    if (president) {
      const currentState = location.state || {};
      const newState = { ...currentState };
      if (Object.prototype.hasOwnProperty.call(newState, "president")) {
        delete newState.president;
      }
      navigate(location.pathname, { replace: true, state: newState });
    }
  }, [president, navigate, location.pathname]);

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
      (<Box sx={{ display: "flex", mt: 5, justifyContent: "center" }}>
        <PresidencyTimeline />
      </Box>)

      {selectedPresident && (<><Box
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

        {/* Card Grid for Modern View */}
        {selectedDate != null && <MinistryCardGrid />}
      </Box>
    </Box>
  );
};

export default ModernView;
