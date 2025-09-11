import { Box, Card, Typography, Avatar, Dialog, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PresidencyTimeline from "./PresidencyTimeline";
import MinistryCardGrid from "./MinistryCardGrid";
import InfoTab from "./InfoTab";
import utils from "../utils/utils";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useThemeContext } from "../themeContext";
import PersonProfile from "./PersonProfile";

const ModernView = () => {
  const { selectedDate, selectedPresident } = useSelector((state) => state.presidency);
  const { selectedMinistry } = useSelector((state) => state.allMinistryData);
  const presidentRelationDict = useSelector((state) => state.presidency.presidentRelationDict);
  const { colors } = useThemeContext();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [drawerMode, setDrawerMode] = useState("ministry");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false); // <-- Dialog open state

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
            justifyContent: "Center",
          }}
        >
          <Card
            sx={{
              width: { sm: "45%", lg: "25%" },
              marginRight: 1,
              border: `2px solid ${selectedPresident.themeColorLight}`,
              borderRadius: "15px",
              backgroundColor: colors.backgroundPrimary,
              boxShadow: "none",
              cursor: "pointer", // make card clickable
            }}
            onClick={() => setProfileOpen(true)} // <-- open popup
          >
            <Box
              sx={{
                width: "175px",
                height: "35px",
                backgroundColor: `${selectedPresident.themeColorLight}`,
                borderBottomRightRadius: "15px",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  color: colors.white,
                  fontSize: 18,
                  textAlign: "center",
                  pt: "5px",
                }}
              >
                President
              </Typography>
            </Box>
            <Box sx={{ padding: 1 }}>
              {selectedPresident && (
                <Box
                  direction="row"
                  sx={{
                    display: "flex",
                    justifyContent: "left",
                    ml: "20px",
                    my: "10px",
                  }}
                >
                  <Avatar
                    src={selectedPresident.imageUrl}
                    alt={selectedPresident.name}
                    sx={{
                      width: 75,
                      height: 75,
                      border: `3px solid ${selectedPresident.themeColorLight}`,
                      backgroundColor: colors.backgroundPrimary,
                      margin: "auto",
                    }}
                  />
                  <Box sx={{ display: "block", justifyContent: "left", ml: "15px" }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: 20,
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        fontFamily: "poppins",
                        color: colors.textPrimary,
                      }}
                    >
                      {utils.extractNameFromProtobuf(selectedPresident.name)}
                    </Typography>
                    <Typography sx={{ fontSize: 18, color: colors.textMuted }}>
                      {selectedPresident.created.split("-")[0]} -{" "}
                      {(() => {
                        const relation = presidentRelationDict[selectedPresident.id];
                        if (!relation) return "Unknown";
                        return relation.endTime
                          ? new Date(relation.endTime).getFullYear()
                          : "Present";
                      })()}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Card>
        </Box>

        <Dialog
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          maxWidth="md"
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
          <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", px: 2, pt: 2 }}>
            <IconButton onClick={() => setProfileOpen(false)}>
              <CloseIcon sx={{ color: colors.textPrimary }} />
            </IconButton>
          </Box>

          <Box sx={{ px: 3, pb: 3 }}>
            <PersonProfile selectedPerson={selectedPresident} />
          </Box>
        </Dialog>


        {/* Card Grid for Modern View */}
        {selectedDate != null && <MinistryCardGrid onCardClick={handleCardClick} />}
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
