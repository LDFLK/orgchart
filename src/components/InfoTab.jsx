import { Box, Dialog, DialogContent, IconButton, Typography, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ApartmentIcon from "@mui/icons-material/Apartment";
import MinistryDrawerContent from "./MinistryDrawerContent";
import { useState } from "react";
import { useThemeContext } from "../themeContext";
import PersonsTab from "./PersonsTab";

const InfoTab = ({ drawerOpen, selectedCard, selectedDate, onClose, selectedPresident }) => {
  const { colors } = useThemeContext();
  const [activeTab, setActiveTab] = useState("departments");

  const presidentColor = selectedPresident?.themeColorLight || colors.textPrimary;

  return (
    <Dialog
      open={drawerOpen}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { height: "100vh", borderRadius: 2, backgroundColor: colors.backgroundPrimary },
      }}
    >
      <DialogContent sx={{ p: 2, display: "flex", flexDirection: "column", minHeight: 400 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>

          <IconButton onClick={onClose}>
            <CloseIcon sx={{ color: colors.textPrimary }} />
          </IconButton>
        </Box>

        <Box sx={{ p: 2, backgroundColor: colors.backgroundPrimary, mt: -3 }}>

          {/* Date */}
          <Typography variant="h6" sx={{ color: `${presidentColor}90`, fontFamily: "poppins" }}>
            Gazette Date
          </Typography>
          <Typography variant="h5" sx={{ color: presidentColor, fontFamily: "poppins", fontWeight: "bold" }}>
            {selectedDate ? (selectedDate.date || selectedDate) : "Unknown"}
          </Typography>

          {/* Ministry Name */}
          <Box display="flex" alignItems="center" my={1}>
            <ApartmentIcon sx={{ mr: 1, color: presidentColor }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: colors.textPrimary,
                fontFamily: "poppins",
                fontSize: { xs: "1.2rem", sm: "1.2rem", md: "1.3rem", lg: "1.3rem", xl: "1.5rem" },
              }}
            >
              {selectedCard?.name?.split(":")[0] || "No Ministry Selected"}
            </Typography>
          </Box>

          {/* Tabs */}
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            {["departments", "persons", "structure"].map((tab) => {
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
                    px: 3,
                    py: 0.8,
                    fontFamily: "poppins",
                    color: isActive ? colors.white : presidentColor,
                    backgroundColor: isActive ? presidentColor : "transparent",
                    borderColor: presidentColor,
                    "&:hover": {
                      backgroundColor: isActive ? presidentColor : `${presidentColor}10`,
                    },
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </Box>

        </Box>
        {/* Content */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", mt: 2 }}>
          {selectedCard && activeTab === "departments" && (
            <MinistryDrawerContent selectedDate={selectedDate?.date || selectedDate} />
          )}
          {selectedCard && activeTab === "persons" && (
            <PersonsTab
              selectedDate={selectedDate?.date || selectedDate}

            />
          )}

        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default InfoTab;
