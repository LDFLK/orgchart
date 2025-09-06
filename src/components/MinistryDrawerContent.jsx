import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Divider,
  Alert,
  AlertTitle,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import utils from "../utils/utils";
import { ClipLoader } from "react-spinners";
import api from "././../services/services";
import { useSelector } from "react-redux";

import { useThemeContext } from "../themeContext";

const MinistryDrawerContent = ({
  selectedCard,
  selectedDate,
  onDepartmentClick,
}) => {
  const { colors } = useThemeContext();

  const allPersonDict = useSelector((state) => state.allPerson.allPerson);
  const allDepartmentList = useSelector(
    (state) => state.allDepartmentData.allDepartmentData
  );
  const { selectedPresident } = useSelector((state) => state.presidency);
  const { selectedMinistry } = useSelector((state) => state.allMinistryData);
  const [personListForMinistry, setPersonListForMinistry] = useState([]);
  const [departmentListForMinistry, setDepartmentListForMinistry] = useState(
    []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPersonListAndDepListForMinistry(selectedMinistry);
  }, [selectedMinistry]);

  const clearCurrentLists = () => {
    setDepartmentListForMinistry([]);
    setPersonListForMinistry([]);
  };

  const fetchPersonListAndDepListForMinistry = async (selectedMinistry) => {
    try {
      const startTime = new Date().getTime();
      setLoading(true);
      clearCurrentLists();

      const response1 = await api.fetchActiveRelationsForMinistry(
        selectedDate,
        selectedMinistry,
        "AS_APPOINTED"
      );
      const response2 = await api.fetchActiveRelationsForMinistry(
        selectedDate,
        selectedMinistry,
        "AS_DEPARTMENT"
      );

      const res1 = await response1.json();
      const res2 = await response2.json();

      // --- Persons ---
      const personStartTimeMap = new Map();
      res1.forEach((relation) => {
        if (relation.relatedEntityId) {
          personStartTimeMap.set(relation.relatedEntityId, relation.startTime);
        }
      });

      const personListInDetail = Array.from(personStartTimeMap.keys())
        .map((id) => {
          const person = allPersonDict[id];
          if (!person) return null;
          return {
            ...person,
            startTime: personStartTimeMap.get(id) || null,
            isNew:
              personStartTimeMap.get(id)?.startsWith(selectedDate) || false,
          };
        })
        .filter(Boolean);

      // --- Departments ---
      const departmentStartTimeMap = new Map();
      res2.forEach((relation) => {
        if (relation.relatedEntityId) {
          departmentStartTimeMap.set(
            relation.relatedEntityId,
            relation.startTime
          );
        }
      });

      const departmentListInDetail = Array.from(departmentStartTimeMap.keys())
        .map((id) => {
          const dep = allDepartmentList[id];
          if (!dep) return null;
          return {
            ...dep,
            startTime: departmentStartTimeMap.get(id) || null,
            isNew:
              departmentStartTimeMap.get(id)?.startsWith(selectedDate) || false,
          };
        })
        .filter(Boolean);

      setPersonListForMinistry(personListInDetail);
      setDepartmentListForMinistry(departmentListInDetail);

      setLoading(false);
      const endTime = new Date().getTime();
      console.log(
        "Fetch time for person and department list for ministry:",
        endTime - startTime,
        "ms"
      );
    } catch (e) {
      console.log(`Error fetching person list for ministry : `, e.message);
    }
  };


  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: colors.backgroundPrimary,
        mt: -5,
      }}
    >
      {/* Date */}
      <Typography
        variant="h6"
        sx={{
          // color: colors.textSecondary,
          color: `${selectedPresident.themeColorLight}90`,
          fontFamily: "poppins",
        }}
      >
        Gazette Date
      </Typography>
      <Box>
        <Typography
          variant="h5"
          sx={{
            // color: colors.secondary,
            color: selectedPresident.themeColorLight,
            fontFamily: "poppins",
            fontWeight: "bold",
          }}
        >
          {selectedDate}
        </Typography>
      </Box>

      {/* Ministry Name */}
      <Box display="flex" alignItems="center" my={1}>
        <ApartmentIcon
          color={colors.textPrimary}
          sx={{
            mr: 1,
            // color: colors.backgroundSecondary,
            color: selectedPresident.themeColorLight,
          }}
        />
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            color: colors.textPrimary,
            fontFamily: "poppins",
            fontSize: {
              xs: "1.2rem", // extra-small screens
              sm: "1.2rem", // small screens
              md: "1.3rem", // medium screens
              lg: "1.3rem", // large screens
              xl: "1.5rem", // extra-large screens
            },
          }}
        >
          {selectedCard.name.split(":")[0]}
        </Typography>
      </Box>

      <Divider sx={{ py: 1 }} />

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
            // color={colors.timelineLineActive}
            color={selectedPresident.themeColorLight}
            loading={loading}
            size={25}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </Box>
      ) : (
        <>
          {/* Ministers */}
          <Typography
            variant="subtitle1"
            sx={{
              mt: 2,
              fontSize: "1.25rem",
              color: colors.textPrimary,
              fontFamily: "poppins",
              fontWeight: 600,
            }}
          >
            Minister
          </Typography>

          <Divider sx={{ py: 1 }} />

          <Stack spacing={1} sx={{ mb: 2 }}>
            {personListForMinistry && personListForMinistry.length > 0 ? (
              personListForMinistry.map((dep, idx) => {
                const depName = utils.extractNameFromProtobuf(dep.name);
                const presidentName = selectedPresident
                  ? utils.extractNameFromProtobuf(selectedPresident.name)
                  : "";

                const isPresident = depName === presidentName;

                return (
                  <Button
                    key={idx}
                    variant="contained"
                    size="medium"
                    sx={{
                      p: 1,
                      boxShadow: "none",
                      justifyContent: "flex-start",
                      backgroundColor: colors.backgroundPrimary,
                      textTransform: "none",
                      border: `1px solid ${colors.backgroundPrimary}10`,
                      color: `${selectedPresident.themeColorLight}`,
                      "&:active": {
                        backgroundColor: `${selectedPresident.themeColorLight}10`,
                      },
                      "&:hover": {
                        backgroundColor: `${selectedPresident.themeColorLight}10`,
                        boxShadow: "none",
                      },
                    }}
                    fullWidth
                  >
                    <PersonIcon
                      fontSize="small"
                      sx={{
                        mr: 2,
                        // color: colors.backgroundSecondary,
                        color: selectedPresident.themeColorLight,
                      }}
                    />
                    <Typography
                      sx={{ fontFamily: "poppins", color: colors.textPrimary, textAlign: "start" }}
                    >
                      {depName}
                    </Typography>

                    {isPresident && (
                      <Typography
                        variant="subtitle2"
                        sx={{
                          // color: colors.textSecondary,
                          color: colors.white,
                          fontFamily: "poppins",
                          py: "5px",
                          px: "8px",
                          // backgroundColor: `${colors.green}50`,
                          backgroundColor: `${selectedPresident.themeColorLight}`,
                          borderRadius: "5px",
                          mx: "5px",
                        }}
                      >
                        President
                      </Typography>
                    )}
                  </Button>
                );
              })
            ) : (
              <Button
                variant="contained"
                size="medium"
                sx={{
                  p: 1,
                  boxShadow: "none",
                  justifyContent: "flex-start",
                  backgroundColor: colors.backgroundPrimary,
                  color: "primary.main",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: colors.buttonLight,
                    boxShadow: "none",
                  },
                  border: `1px solid ${colors.backgroundPrimary}10`,
                }}
                fullWidth
              >
                <PersonIcon
                  fontSize="small"
                  sx={{
                    mr: 1,
                    // color: colors.backgroundSecondary,
                    color: selectedPresident.themeColorLight,
                  }}
                />
                <Typography
                  sx={{ fontFamily: "poppins", color: colors.textPrimary }}
                >
                  {utils.extractNameFromProtobuf(selectedPresident.name)}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    // color: colors.textSecondary,
                    color: colors.white,
                    fontFamily: "poppins",
                    py: "5px",
                    px: "8px",
                    // backgroundColor: `${colors.green}50`,
                    backgroundColor: `${selectedPresident.themeColorLight}`,
                    borderRadius: "5px",
                    mx: "5px",
                  }}
                >
                  President
                </Typography>
              </Button>
            )}
          </Stack>

          {/* Departments */}
          <Typography
            variant="subtitle1"
            sx={{
              mt: 2,
              fontSize: "1.25rem",
              color: colors.textPrimary,
              fontFamily: "poppins",
              fontWeight: 600,
            }}
          >
            Departments
          </Typography>

          <Divider sx={{ py: 1 }} />
          <Stack spacing={1}>
            {departmentListForMinistry && departmentListForMinistry.length > 0 ? (
              departmentListForMinistry.map((dep, idx) => {
                const depName = utils.extractNameFromProtobuf(dep.name);

                return (
                  <Button
                    key={idx}
                    variant="contained"
                    size="medium"
                    sx={{
                      p: 1,
                      boxShadow: "none",
                      justifyContent: "flex-start",
                      backgroundColor: colors.backgroundPrimary,
                      textTransform: "none",
                      border: `1px solid ${colors.backgroundPrimary}10`,
                      textAlign: "start",
                      color: `${selectedPresident.themeColorLight}`,
                      "&:active": {
                        backgroundColor: `${selectedPresident.themeColorLight}10`,
                      },
                      "&:hover": {
                        backgroundColor: `${selectedPresident.themeColorLight}10`,
                        boxShadow: "none",
                      },
                    }}
                    fullWidth
                    onClick={() => onDepartmentClick(dep)}
                  >
                    <AccountBalanceIcon
                      fontSize="small"
                      sx={{
                        mr: 2,
                        color: selectedPresident.themeColorLight,
                      }}
                    />
                    <Typography
                      sx={{ fontFamily: "poppins", color: colors.textPrimary }}
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
                <Alert severity="info" sx={{ backgroundColor: "transparent" }}>
                  <AlertTitle
                    sx={{
                      fontFamily: "poppins",
                      color: colors.textPrimary,
                    }}
                  >
                    Info: No departments created for the ministry.
                  </AlertTitle>
                </Alert>
              </Box>
            )}
          </Stack>

        </>
      )}
    </Box>
  );
};

export default MinistryDrawerContent;
