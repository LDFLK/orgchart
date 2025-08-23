import { Box, Card, Typography, Avatar } from "@mui/material";
import PresidencyTimeline from "./PresidencyTimeline";
// import colors from "../assets/colors";
import { useSelector } from "react-redux";
import { useState } from "react";
import InfoTab from "./InfoTab";
import MinistryCardGrid from "./MinistryCardGrid";
import utils from "../utils/utils";
import { useThemeContext } from "../themeContext";
import ChatbotComponent from "./chatbot_screen";

const ModernView = () => {
  const { selectedDate, selectedPresident } = useSelector((state) => state.presidency);
  const { selectedMinistry } = useSelector((state) => state.allMinistryData);
  const presidencyRelationList = useSelector((state) => state.presidency.presidentRelationList);

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
      {/* Chabot component */}
      {/* <ChatbotComponent/> */}
      
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
              border: `2px solid ${selectedPresident.themeColorLight}`,
              // border: `2px solid ${colors.purple}50`,
              borderRadius: "15px",
              backgroundColor: colors.backgroundPrimary,
              boxShadow: "none",
            }}
          >
            <Box
              sx={{
                width: "175px",
                height: "35px",
                backgroundColor: `${selectedPresident.themeColorLight}`,
                // backgroundColor: `${colors.purple}`,
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
                          // border: `3px solid ${colors.backgroundSecondary}`,
                          border: `3px solid ${selectedPresident.themeColorLight}`,
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
        selectedPresident={selectedPresident}
      />
    </Box>
  );
};

export default ModernView;
