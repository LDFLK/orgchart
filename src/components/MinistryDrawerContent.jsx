import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Divider,
  Alert,
  AlertTitle,
  TextField,
  InputAdornment,
} from "@mui/material";

import ApartmentIcon from "@mui/icons-material/Apartment";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SearchIcon from "@mui/icons-material/Search";
import { ClipLoader } from "react-spinners";
import { useSelector } from "react-redux";
import DepartmentHistoryTimeline from "./DepartmentHistoryTimeline";
import DomainAddIcon from "@mui/icons-material/DomainAdd";
import utils from "../utils/utils";
import api from "../services/services";
import { useThemeContext } from "../themeContext";
import enumMode from "../enums/mode";
import { useNavigate } from "react-router-dom";
import InfoTooltip from "./common_components/InfoToolTip";


const MinistryDrawerContent = ({ selectedDate, selectedDepartment: propSelectedDepartment, ministryId }) => {
  const { colors } = useThemeContext();
  const { selectedPresident } = useSelector((state) => state.presidency);
  const { selectedMinistry } = useSelector((state) => state.allMinistryData);
  const allDepartmentList = useSelector(
    (state) => state.allDepartmentData.allDepartmentData
  );

  const [departmentListForMinistry, setDepartmentListForMinistry] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(propSelectedDepartment || null); // local state for timeline

  const navigate = useNavigate();


  // Always select the department from prop when InfoTab opens
  React.useEffect(() => {
    if (propSelectedDepartment && (!selectedDepartment || selectedDepartment.id !== propSelectedDepartment.id)) {
      setSelectedDepartment(propSelectedDepartment);
    }
    // If propSelectedDepartment is null, allow user to clear selection
    if (!propSelectedDepartment && selectedDepartment) {
      setSelectedDepartment(null);
    }
  }, [propSelectedDepartment]);


  useEffect(() => {
    fetchDepartmentList(ministryId || selectedMinistry);
  }, [ministryId, selectedMinistry, selectedDate]);

  const fetchDepartmentList = async (ministryId) => {
    if (!ministryId) return;
    try {
      setLoading(true);

      const responseDepartments = await api.fetchActiveRelationsForMinistry(
        selectedDate,
        ministryId,
        "AS_DEPARTMENT"
      );

      const resDepartments = await responseDepartments.json();

      // --- Departments ---
      const depMap = new Map();
      resDepartments.forEach(
        (r) => r.relatedEntityId && depMap.set(r.relatedEntityId, r.startTime)
      );
      const depList = Array.from(depMap.keys())
        .map((id) => {
          const dep = allDepartmentList[id];
          if (!dep) return null;
          return {
            ...dep,
            startTime: depMap.get(id),
            isNew: depMap.get(id)?.startsWith(selectedDate) || false,
          };
        })
        .filter(Boolean);
      setDepartmentListForMinistry(depList);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching ministry data:", err);
      setLoading(false);
    }
  };

  const filteredDepartments =
    departmentListForMinistry?.filter((dep) =>
      utils
        .extractNameFromProtobuf(dep.name)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) || [];
  return (
    <Box sx={{ px: 2, backgroundColor: colors.backgroundPrimary, mt: -2 }}>
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
          />
        </Box>
      ) : selectedDepartment ? (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box
            sx={{
              //position: 'sticky',
              top: 0,
              zIndex: 10,
              mb: 2,
              backgroundColor: colors.backgroundPrimary,
            }}
          >
            <Button
              onClick={() => setSelectedDepartment(null)}
              disableRipple
              sx={{
                textTransform: "none",
                fontFamily: "Poppins",
                "&:focus": {
                  outline: "none",
                  boxShadow: "none",
                },
              }}
            >
              {ministryId != null && (<Typography sx={{ color: colors.textMuted }}>← Back</Typography>)}
            </Button>

            {ministryId != null && (<Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: "bold",
                mb: 3,
                color: colors.textPrimary,
                fontFamily: "poppins",
              }}
            >
              {utils.extractNameFromProtobuf(selectedDepartment.name)}
            </Typography>)}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography
                gutterBottom
                sx={{
                  mt: -2,
                  color: colors.textPrimary,
                  fontFamily: "poppins",
                }}
              >
                Department History Timeline{" "}
                <InfoTooltip
                  message="Ministers the department was under throughout the history"
                  iconColor={colors.textPrimary}
                  iconSize={14}
                />
              </Typography>
            </Box>
          </Box>

          {/* Timeline */}
          <DepartmentHistoryTimeline selectedDepartment={selectedDepartment} />
        </Box>
      ) : (
        <>
          {/* Key Highlights */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mt: 1,
                fontFamily: "Poppins",
                fontWeight: 600,
                color: colors.textPrimary,
                mb: 2,
              }}
            >
              Key Highlights
            </Typography>
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
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <ApartmentIcon sx={{ color: colors.textMuted }} />
                  <Typography
                    sx={{
                      flex: 1,
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      color: colors.textMuted,
                    }}
                  >
                    Total Departments{" "}
                    <InfoTooltip
                      message="Total of departments under the minister on this date"
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
                    {departmentListForMinistry.length}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <DomainAddIcon sx={{ color: colors.textMuted }} />
                  <Typography
                    sx={{
                      flex: 1,
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      color: colors.textMuted,
                    }}
                  >
                    New Departments{" "}
                    <InfoTooltip
                      message="Total of newly added departments to this minister on this date"
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
                      departmentListForMinistry.filter((dep) => dep.isNew)
                        .length
                    }
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Departments Header + Search */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontSize: "1.25rem",
                color: colors.textPrimary,
                fontFamily: "poppins",
                fontWeight: 600,
              }}
            >
              Departments
            </Typography>
            <Box sx={{ width: 250 }}>
              <TextField
                fullWidth
                label="Search departments"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon
                        fontSize="small"
                        sx={{ color: colors.textMuted }}
                      />
                    </InputAdornment>
                  ),
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
          </Box>
          <Divider sx={{ py: 1 }} />

          {/* Department List */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              p: 2,
              borderRadius: 2,
              backgroundColor: colors.backgroundWhite,
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <Stack spacing={1}>
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((dep, idx) => {
                  const depName = utils.extractNameFromProtobuf(dep.name);
                  return (
                    <Button
                      key={idx}
                      variant="contained"
                      size="medium"
                      sx={{
                        justifyContent: "flex-start",
                        textTransform: "none",
                        backgroundColor: colors.backgroundPrimary,
                        color: selectedPresident.themeColorLight,
                        boxShadow: "none",
                        "&:hover": {
                          backgroundColor: `${selectedPresident.themeColorLight}10`,
                        },
                      }}
                      fullWidth
                      onClick={() => setSelectedDepartment(dep)}
                    >
                      <AccountBalanceIcon
                        fontSize="small"
                        sx={{ mr: 2, color: selectedPresident.themeColorLight }}
                      />
                      <Typography
                        sx={{
                          fontFamily: "poppins",
                          color: colors.textPrimary,
                          textAlign: "left",
                        }}
                      >
                        {depName}
                      </Typography>
                      {dep.isNew && (
                        <Typography
                          variant="caption"
                          sx={{
                            ml: 1,
                            px: 1,
                            py: 0.3,
                            borderRadius: "5px",
                            backgroundColor: selectedPresident.themeColorLight,
                            color: colors.white,
                            fontFamily: "poppins",
                            fontWeight: 600,
                          }}
                        >
                          New
                        </Typography>
                      )}
                    </Button>
                  );
                })
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Alert
                    severity="info"
                    sx={{ backgroundColor: "transparent" }}
                  >
                    <AlertTitle
                      sx={{ fontFamily: "poppins", color: colors.textPrimary }}
                    >
                      Info: No departments found.
                    </AlertTitle>
                  </Alert>
                </Box>
              )}
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
};

export default MinistryDrawerContent;
