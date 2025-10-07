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
import { Link } from "react-router-dom";

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

const MinistryDrawerContent = ({ selectedDate, ministryId }) => {
  const { colors } = useThemeContext();
  const { selectedPresident } = useSelector((state) => state.presidency);
  const { selectedMinistry } = useSelector((state) => state.allMinistryData);
  const allDepartmentList = useSelector(
    (state) => state.allDepartmentData.allDepartmentData
  );

  const [departmentListForMinistry, setDepartmentListForMinistry] = useState(
    []
  );
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);

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
    <Box sx={{ mt: -2 }}>
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
      ) : (
        <>
          {/* Key Highlights */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              my: 3,
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
                borderRadius: 2,
                backgroundColor: colors.backgroundWhite,
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
              borderRadius: 2,
              backgroundColor: colors.backgroundWhite,
            }}
          >
            <Stack spacing={1}>
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((dep, idx) => {
                  const depName = utils.extractNameFromProtobuf(dep.name);
                  return (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: colors.backgroundPrimary,
                        color: selectedPresident.themeColorLight,
                        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
                        borderRadius: "12px",
                        padding: "12px 16px",
                        marginBottom: "12px",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <AccountBalanceIcon
                          fontSize="small"
                          sx={{ color: selectedPresident.themeColorLight }}
                        />
                        <Typography
                          sx={{
                            fontFamily: "Poppins, sans-serif",
                            color: colors.textPrimary,
                            fontWeight: 500,
                            fontSize: "0.95rem",
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
                              py: 0.2,
                              borderRadius: "6px",
                              backgroundColor:
                                selectedPresident.themeColorLight,
                              color: colors.white,
                              fontFamily: "Poppins, sans-serif",
                              fontWeight: 600,
                              letterSpacing: "0.3px",
                            }}
                          >
                            New
                          </Typography>
                        )}
                      </Box>

                      <Link
                        to={`/department-profile/${dep.id}`}
                        state={{ mode: "back" }}
                        style={{
                          textDecoration: "none",
                          color: selectedPresident.themeColorLight,
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: 500,
                          fontSize: "0.9rem",
                          borderRadius: "8px",
                          transition: "all 0.3s ease",
                        }}
                      >
                        View Profile
                      </Link>
                    </Box>
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
