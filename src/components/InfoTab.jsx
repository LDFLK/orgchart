import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
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
  selectedPresident,
}) => {
  const { colors } = useThemeContext();

  return (
    <Dialog
      open={drawerOpen}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
           height: "100vh",
          borderRadius: 2,
          backgroundColor: colors.backgroundPrimary,
        },
      }}
    >
      <DialogContent
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          minHeight: 400,
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
            <Button
              onClick={onBack}
              sx={{
                color: `${selectedPresident.themeColorLight}`,
                "&:active": {
                  backgroundColor: `${selectedPresident.themeColorLight}10`,
                },
                "&:hover": {
                  backgroundColor: `${selectedPresident.themeColorLight}10`,
                },
              }}
            >
              ← Back
            </Button>
          ) : (
            <Box width={75} /> // spacer
          )}

          <IconButton onClick={onClose}>
            <CloseIcon sx={{ color: colors.textPrimary }} />
          </IconButton>
        </Box>
        

        {/* Content */}
        <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
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
      </DialogContent>
    </Dialog>
  );
};

export default InfoTab;
