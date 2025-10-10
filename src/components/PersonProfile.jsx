import { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Avatar,
  Box,
  Button,
  ButtonBase,
} from "@mui/material";
import { useSelector } from "react-redux";
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
} from "@mui/lab";
import { useThemeContext } from "../themeContext";
import { ClipLoader } from "react-spinners";
import utils from "../utils/utils";
import api from "../services/services";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PersonIcon from "@mui/icons-material/Person";
import personDetails from "./../assets/personImages.json";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaAngleLeft } from "react-icons/fa6";
import colors from "../assets/colors";

/* ------------------- Timeline Component ------------------- */
const PersonHistoryTimeline = ({
  selectedPerson,
  onTimelineUpdate,
  presidentRelationDict,
}) => {
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(false);
  const allMinistryData = useSelector(
    (state) => state.allMinistryData.allMinistryData
  );
  const { colors } = useThemeContext();

  useEffect(() => {
    const fetchPersonHistory = async () => {
      if (!selectedPerson?.id) return;
      setLoading(true);
      try {
        const res = await api.getMinistriesByPerson(selectedPerson.id);
        const data = await res.json();

        const enriched = data
          .filter(d => d.startTime !== d.endTime)
          .map((d) => {
            const ministry = allMinistryData[d.relatedEntityId];
            return {
              ...d,
              ministryName: ministry
                ? utils.extractNameFromProtobuf(ministry.name)
                : "Unknown Ministry",
              startTime: d.startTime,
              endTime: d.endTime,
            };
          })
          .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

        setTimelineData(enriched);
        onTimelineUpdate?.(enriched);
      } catch (err) {
        console.error("Error fetching person history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonHistory();
  }, [selectedPerson, allMinistryData, onTimelineUpdate]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "20vh",
        }}
      >
        <ClipLoader color={colors.primary} loading={loading} size={25} />
      </Box>
    );
  }

  if (!timelineData.length) {
    return (
      <Typography
        variant="body2"
        sx={{ mt: 2, fontFamily: "poppins", color: colors.textPrimary }}
      >
        No timeline history available.
      </Typography>
    );
  }
  const isPresidentDuring = (ministryStart, ministryEnd) => {
    return Object.values(presidentRelationDict).some((rel) => {
      if (rel.id !== selectedPerson?.id) return false;
      const presStart = new Date(rel.startTime);
      const presEnd = rel.endTime ? new Date(rel.endTime) : null;

      const mStart = new Date(ministryStart);
      const mEnd = ministryEnd ? new Date(ministryEnd) : null;

      // overlap condition
      return (!presEnd || mStart <= presEnd) && (!mEnd || mEnd >= presStart);
    });
  };

  return (
    <Box
      sx={{
        width: "100%",
        alignItems: "center",
        p: { xs: 2, sm: 4 },
        borderRadius: 2,
        backgroundColor: colors.backgroundWhite,
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        gap: 2,
      }}
    >
      <Timeline position="alternate" sx={{ py: 0 }}>
        {timelineData.map((entry, idx, arr) => {
          const wasPresident = isPresidentDuring(
            entry.startTime,
            entry.endTime
          );

          return (
            <TimelineItem key={idx} sx={{ py: 0 }}>
              <TimelineOppositeContent
                sx={{
                  m: "auto 0",
                  color: colors.textMuted,
                  fontWeight: "600",
                  fontSize: 12,
                  minWidth: 70,
                  pr: 1,
                  fontFamily: "poppins",
                }}
                align="right"
                variant="body2"
              >
                {entry.startTime
                  ? `${new Date(entry.startTime)
                    .toISOString()
                    .slice(0, 10)} - ${entry.endTime
                      ? new Date(entry.endTime).toISOString().slice(0, 10)
                      : "Present"
                  }`
                  : "Unknown"}
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot
                  color="primary"
                  sx={{
                    width: 2,
                    height: 2,
                    boxShadow: `0 0 6px ${colors.textPrimary}`,
                    animation: "pulse 2.5s infinite",
                    backgroundColor: colors.textPrimary,
                  }}
                />
                {idx < arr.length && (
                  <TimelineConnector
                    sx={{ bgcolor: colors.textMuted, height: 2 }}
                  />
                )}
              </TimelineSeparator>

              <TimelineContent sx={{ py: 0.5, px: 1 }}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: colors.backgroundBlue,
                    boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
                  }}
                >
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
                  >
                    {/* Avatar */}
                    <Avatar
                      sx={{
                        bgcolor: colors.textPrimary,
                        width: 25,
                        height: 25,
                        fontSize: 14,
                      }}
                    >
                      <AccountBalanceIcon style={{ color: colors.backgroundBlue, width: 15, height: 15 }} />
                    </Avatar>

                    {/* Text + President badge */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        flexGrow: 1,
                        alignSelf: "flex-start",
                      }}
                    >
                      {/* Ministry Name */}
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: "600",
                          fontSize: { xs: 12, sm: 15 }, // responsive font
                          fontFamily: "poppins",
                          wordBreak: "break-word",
                          width: "100%",
                          textAlign: "left",
                          color: colors.textPrimary
                        }}
                      >
                        {entry.ministryName.split(":")[0]}
                      </Typography>

                      {/* President Badge */}
                      {wasPresident && (
                        <Box
                          sx={{
                            mt: 0.5,
                            px: 1,
                            py: 0.2,
                            borderRadius: 1,
                            bgcolor: colors.textMuted,
                            color: colors.backgroundBlue,
                            fontSize: { xs: 8, sm: 10 }, // responsive font
                            fontWeight: 500,
                            fontFamily: "poppins",
                            alignSelf: "flex-start",
                          }}
                        >
                          President
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Box>
  );
};

/* ------------------- Profile Component ------------------- */
const PersonProfile = () => {
  const { colors } = useThemeContext();
  const { personId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const [activeTab, setActiveTab] = useState("history");
  const [timelineData, setTimelineData] = useState([]);
  const presidentRelationDict = useSelector(
    (state) => state.presidency.presidentRelationDict
  );
  const { allPerson } = useSelector((state) => state.allPerson);

  const selectedPerson = allPerson[personId];

  const workedMinistries = timelineData.length || 0;
  const workedAsPresident = Object.values(presidentRelationDict).filter(
    (rel) => rel.id === selectedPerson?.id
  ).length;

  const personName = utils.extractNameFromProtobuf(
    selectedPerson?.name || "Unknown"
  );

  const matchingPresident = personDetails.find(
    (p) => p.presidentName === personName
  );

  const imageUrl = matchingPresident ? matchingPresident.imageUrl : null;

  const tabOptions = ["history"];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: colors.backgroundPrimary,
        width: "100%",
        minHeight: { xs: "auto", sm: "100vh" },
        px: { xs: 6, sm: 14, md: 36 },
        py: { xs: 4, sm: 6 },
      }}
    >
      {state.mode === "back" ? (
        <ButtonBase
          onClick={() => navigate(-1)}
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            mb: 2,
            width: 100,
            color: colors.textPrimary,
          }}
        >
          <FaAngleLeft />
          <Typography
            variant="h8"
            sx={{
              fontFamily: "Poppins",
              color: colors.textPrimary,
              textTransform: "none",
              ml: 1,
            }}
          >
            Back
          </Typography>
        </ButtonBase>
      ) : (
        <ButtonBase
          onClick={() => navigate('/')}
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            mb: 2,
            width: 200,
            color: colors.textPrimary,
          }}
        >
          <FaAngleLeft />
          <Typography
            variant="h8"
            sx={{
              fontFamily: "Poppins",
              color: colors.textPrimary,
              textTransform: "none",
            }}
          >
            Go to XploreGov
          </Typography>
        </ButtonBase>
      )}
      <Typography
        variant="h6"
        sx={{
          fontFamily: "Poppins",
          fontWeight: 600,
          color: colors.textPrimary,
          my: 2,
        }}
      >
        Person profile
      </Typography>
      {/* --- Person Card --- */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          backgroundColor: colors.backgroundWhite,
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          gap: { xs: 2, sm: 3 },
          my: 3,
        }}
      >
        {/* Avatar */}
        <Avatar
          src={imageUrl}
          alt={selectedPerson?.name}
          sx={{
            width: { xs: 70, sm: 90, md: 100 },
            height: { xs: 70, sm: 90, md: 100 },
            bgcolor: colors.textMuted2,
            fontSize: { xs: 18, sm: 22, md: 24 },
            flexShrink: 0,
          }}
        >
          {personName.charAt(0).toUpperCase() || "?"}
        </Avatar>

        {/* Info */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            flex: 1,
            width: "100%",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 600,
              color: colors.textPrimary,
              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
              wordBreak: "break-word",
            }}
          >
            {utils.extractNameFromProtobuf(selectedPerson?.name || "Unknown")}
          </Typography>

          {/* Info Fields */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              width: "100%",
            }}
          >
            {[
              {
                icon: <AccountBalanceIcon sx={{ fontSize: 18, color: colors.textMuted }} />,
                label: "Ministries Worked At",
                value: workedMinistries,
              },
              {
                icon: <PersonIcon sx={{ fontSize: 18, color: colors.textMuted }} />,
                label: "Worked as President",
                value: workedAsPresident,
              },
            ].map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1,
                  width: "100%",
                  maxWidth: { xs: "100%", sm: "400px" },
                }}
              >
                <Typography
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    color: colors.textMuted,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                  {item.label}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    color: colors.textPrimary,
                    textAlign: "right",
                    wordBreak: "break-word",
                  }}
                >
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>


      {/* --- Tabs (Elliptical Buttons) --- */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
          justifyContent: { xs: "center", sm: "flex-start" },
        }}
      >
        {tabOptions.map((tab) => {
          const label = tab.charAt(0).toUpperCase() + tab.slice(1);
          const isActive = activeTab === tab;

          return (
            <Button
              key={tab}
              variant={isActive ? "contained" : "outlined"}
              onClick={() => setActiveTab(tab)}
              sx={{
                textTransform: "none",
                borderRadius: "50px",
                px: { xs: 2, sm: 3 },
                py: 0.8,
                fontFamily: "poppins",
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                color: isActive ? colors.backgroundPrimary : colors.textPrimary,
                backgroundColor: isActive ? colors.textPrimary : "transparent",
                borderColor: colors.textPrimary,
                "&:hover": {
                  backgroundColor: isActive
                    ? colors.textPrimary
                    : `${colors.primary}10`,
                },
              }}
            >
              {label}
            </Button>
          );
        })}
      </Box>

      {/* --- Tab Panels --- */}
      {activeTab === "history" && (
        <PersonHistoryTimeline
          selectedPerson={selectedPerson}
          onTimelineUpdate={setTimelineData}
          presidentRelationDict={presidentRelationDict}
        />
      )}
      {/* {activeTab === "statistics" && (
                <Box sx={{ mt: 2 }}>
                    <Typography sx={{ color: colors.textMuted }}>coming soon...</Typography>
                </Box>
            )} */}
    </Box>
  );
};

export default PersonProfile;
