import {
  Box,
  Grid,
  Typography,
  Alert,
  AlertTitle,
  Divider,
  Chip,
  TextField,
} from "@mui/material";
import MinistryCard from "./MinistryCard";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import api from "./../services/services";
import { ClipLoader } from "react-spinners";
import { setSelectedMinistry } from "../store/allMinistryData";
import { useThemeContext } from "../themeContext";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

const MinistryCardGrid = ({ onCardClick }) => {
  const dispatch = useDispatch();
  const { allMinistryData } = useSelector((state) => state.allMinistryData);
  const { selectedDate, selectedPresident } = useSelector((state) => state.presidency);
  const allPersonList = useSelector((state) => state.allPerson.allPerson);
  const [activeMinistryList, setActiveMinistryList] = useState([]);
  const [filteredMinistryList, setFilteredMinistryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const { colors } = useThemeContext();

  useEffect(() => {
    fetchActiveMinistryList();
  }, [selectedDate, allMinistryData, selectedPresident]);

  useEffect(() => {
    const searchedMinistry = searchByText(searchText);
    if (searchedMinistry) {
      setFilteredMinistryList(searchedMinistry);
    }
  }, [searchText]);

  const searchByText = (searchText) => {
    if (searchText != "") {
      const normalizedSearchText = (
        searchText ? String(searchText).trim() : ""
      ).toLowerCase();

      const filteredMinistry = activeMinistryList.filter((minister) => {
        const ministerName = minister.name
          ? minister.name.toLowerCase().trim()
          : "";
        return ministerName.toLowerCase().includes(normalizedSearchText);
      });
      return filteredMinistry;
    } else {
      setFilteredMinistryList(activeMinistryList);
    }
  };

  const handleChange = (event) => {
    setSearchText(event.target.value);
  };

  const fetchActiveMinistryList = async () => {
    if (!selectedDate || !allMinistryData || allMinistryData.length === 0)
      return;

    try {
      setLoading(true);
      const activeMinistry = await api.fetchActiveMinistries(
        selectedDate,
        allMinistryData,
        selectedPresident
      );

      const enrichedMinistries = await Promise.all(
        activeMinistry.children.map(async (ministry) => {
          const response = await api.fetchActiveRelationsForMinistry(
            selectedDate.date,
            ministry.id,
            "AS_APPOINTED"
          );
          const res = await response.json();

          // Create a map of relatedEntityId -> startTime for fast lookup
          const startTimeMap = new Map();
          res.forEach((relation) => {
            if (relation.relatedEntityId) {
              startTimeMap.set(relation.relatedEntityId, relation.startTime);
            }
          });

          // Enrich each person with their own startTime
          const personListInDetail = allPersonList
            .filter((person) => startTimeMap.has(person.id))
            .map((person) => ({
              ...person,
              startTime: startTimeMap.get(person.id) || null,
            }));

          const headMinisterName = personListInDetail[0]?.name || null;
          const headMinisterStartTime =
            personListInDetail[0]?.startTime || null;

          return {
            ...ministry,
            headMinisterName,
            newPerson:
              headMinisterStartTime?.startsWith(selectedDate.date) || false,
            newMin: ministry.startTime?.startsWith(selectedDate.date) || false,
          };
        })
      );

      setActiveMinistryList(enrichedMinistries);
      setFilteredMinistryList(enrichedMinistries);
      setLoading(false);
    } catch (e) {
      console.log("error fetch ministry list : ", e.message);
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        py: {
          xs: 2,
          sm: 3,
          md: 5,
        },
        overflowX: "auto",
      }}
    >
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography
          variant="h6"
          sx={{
            color: colors.textPrimary,
            fontFamily: "poppins",
          }}
        >
          Gazette Date
        </Typography>
        <Divider>
          <Chip
            label={selectedDate.date}
            sx={{
              backgroundColor: "transparent",
              fontWeight: "bold",
              // color: colors.textSecondary,
              color: selectedPresident.themeColorLight,
              fontFamily: "poppins",
              fontSize: 25,
              P: 1,
            }}
          />
        </Divider>
      </Box>

      <Box width="100%" display="flex" justifyContent="center">
        <Box sx={{ width: 500, maxWidth: "100%" }}>
          <TextField
            fullWidth
            label="Search By Ministry Name"
            id="ministry-search"
            onChange={handleChange}
            value={searchText}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon sx={{
                      color: colors.textMuted
                    }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              marginBottom: "20px",
              backgroundColor: colors.backgroundColor, // Apply custom background color
              "& .MuiInputLabel-root": {
                color: colors.textMuted, // Label color
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: colors.textMuted, // Border color when not focused
                },
                "&:hover fieldset": {
                  borderColor: colors.textMuted, // Border color when hovered
                },
                "&.Mui-focused fieldset": {
                  borderColor: colors.textMuted, // Border color when focused
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: colors.textMuted, // Focused state label color
              },
              "& .MuiInputBase-input": {
                color: colors.textMuted, // Input text color
              },
            }}
          />
        </Box>
      </Box>

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
        <Box sx={{ width: "100%" }}>
          <Grid
            container
            justifyContent="center"
            gap={1}
            sx={{ width: "100%" }}
          >
            {filteredMinistryList && filteredMinistryList.length > 0 ? (
              filteredMinistryList.map((card) => (
                <Grid
                  key={card.id}
                  sx={{
                    display: "grid",
                    flexBasis: {
                      xs: "100%",
                      sm: "48%",
                      md: "31.5%",
                      lg: "23.5%",
                    },
                    maxWidth: {
                      xs: "100%",
                      sm: "48%",
                      md: "31.5%",
                      lg: "23.5%",
                    },
                  }}
                >
                  <MinistryCard
                    card={card}
                    onClick={() => {
                      dispatch(setSelectedMinistry(card.id)), onCardClick(card);
                    }}
                  />
                </Grid>
              ))
            ) : activeMinistryList && activeMinistryList.length == 0  ? (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "15px",
                }}
              >
                <Alert severity="info" sx={{ backgroundColor: "transparent" }}>
                  <AlertTitle
                    sx={{
                      fontFamily: "poppins",
                      color: colors.textPrimary,
                    }}
                  >
                    No ministries in the goverment. Sometimes this can be
                    the president appointed date.
                  </AlertTitle>
                </Alert>
              </Box>
            ) : (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "15px",
                }}
              >
                <Alert severity="info" sx={{ backgroundColor: "transparent" }}>
                  <AlertTitle
                    sx={{
                      fontFamily: "poppins",
                      color: colors.textPrimary,
                    }}
                  >
                    No Search Result
                  </AlertTitle>
                </Alert>
              </Box>
            )}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default MinistryCardGrid;
