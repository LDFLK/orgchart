import { Box, Button, Drawer, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MinistryDrawerContent from "./MinistryDrawerContent";
import DepartmentHistoryTimeline from "./DepartmentHistoryTimeline";

import { useThemeContext } from "../themeContext";

const InfoTab = ({
  drawerOpen,
  drawerMode,
  selectedCard,
  selectedDepartment,
  selectedDate,
  onClose,
  onBack,
  onDepartmentClick,
  selectedPresident
}) => {
  const { colors } = useThemeContext();

  return (
    <Drawer anchor="right" open={drawerOpen} onClose={onClose}>
      <Box
        sx={{
          width: {
            xs: 350,
            sm: 450,
            md: 650,
            lg: 700,
            xl: 750,
          },
          p: 2,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: colors.backgroundPrimary,
          overflow: "auto",
        }}
      >
        {/* Header */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          {drawerMode === "department" ? (
            <Button onClick={onBack}
            // color={selectedPresident.themeColorLight}
            sx={{
              color:`${selectedPresident.themeColorLight}`
            }}
            >← Back</Button>
          ) : (
            <Box width={75} /> // spacer
          )}

          <IconButton onClick={onClose}>
            <CloseIcon
              sx={{
                color: colors.textPrimary,
              }}
            />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1 }}>
          {drawerMode === "ministry" && selectedCard && (
            <MinistryDrawerContent
              selectedCard={selectedCard}
              selectedDate={selectedDate.date}
              onDepartmentClick={onDepartmentClick}
            />
          )}

          {drawerMode === "department" && selectedDepartment && (
            <DepartmentHistoryTimeline
              selectedDepartment={selectedDepartment}
            />
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default InfoTab;
