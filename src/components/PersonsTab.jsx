import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Divider,
  Stack,
  Button,
  Dialog,
  IconButton,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import utils from "../utils/utils";
import api from "../services/services";
import { useThemeContext } from "../themeContext";
import CloseIcon from "@mui/icons-material/Close";
import PersonProfile from "./PersonProfile";
import InfoTooltip from "./common_components/InfoToolTip";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";

const PersonsTab = ({ selectedDate }) => {
  const { colors } = useThemeContext();
  const allPersonDict = useSelector((state) => state.allPerson.allPerson);
  const { selectedMinistry } = useSelector((state) => state.allMinistryData);
  const { selectedPresident } = useSelector((state) => state.presidency);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [ministerListForMinistry, setministerListForMinistry] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedMinistry) return;

    const fetchPersons = async () => {
      try {
        setLoading(true);

        const resPersonsResponse = await api.fetchActiveRelationsForMinistry(
          selectedDate,
          selectedMinistry,
          "AS_APPOINTED"
        );
        const resPersons = await resPersonsResponse.json();

        const personMap = new Map();
        resPersons.forEach(
          (r) =>
            r.relatedEntityId && personMap.set(r.relatedEntityId, r.startTime)
        );

        // Map over person IDs, convert names from protobuf, fallback to president if null
        let personList = Array.from(personMap.keys())
          .map((id) => {
            const personFromDict = allPersonDict[id];
            let name;

            if (personFromDict && personFromDict.name) {
              name = personFromDict.name;
            }
            const isPresident =
              utils.extractNameFromProtobuf(name) ===
              utils.extractNameFromProtobuf(selectedPresident.name);
            return {
              id,
              name,
              startTime: personMap.get(id),
              isNew: personMap.get(id)?.startsWith(selectedDate) || false,
              isPresident,
            };
          })
          .filter(Boolean);

        // If API returned no persons, fallback to president
        if (personList.length === 0) {
          personList.push({
            id: selectedPresident.id,
            name: selectedPresident.name,
            startTime: selectedDate,
            isNew: true,
            isPresident: true,
          });
        }

        setministerListForMinistry(personList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching persons:", err);
        setLoading(false);
      }
    };

    fetchPersons();
  }, [selectedDate, selectedMinistry, allPersonDict, selectedPresident]);

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
        <ClipLoader
          color={selectedPresident.themeColorLight}
          loading={loading}
          size={25}
        />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: 2 }}>
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
                <PersonIcon sx={{ color: colors.textMuted }} />
                <Typography
                  sx={{
                    flex: 1,
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    color: colors.textMuted,
                  }}
                >
                  Total Persons{" "}
                  <InfoTooltip
                    message="Total people under the minister on this date"
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
                  {ministerListForMinistry.length}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <PersonAddAlt1Icon sx={{ color: colors.textMuted }} />
                <Typography
                  sx={{
                    flex: 1,
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    color: colors.textMuted,
                  }}
                >
                  New Persons{" "}
                  <InfoTooltip
                    message="New people assigned to this ministry on this date"
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
                  {ministerListForMinistry.filter((p) => p.isNew).length}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        <Typography
          variant="subtitle1"
          sx={{
            mt: -2,
            fontSize: "1.25rem",
            color: colors.textPrimary,
            fontWeight: 600,
            fontFamily: "poppins",
          }}
        >
          Ministers
        </Typography>
        <Divider sx={{ py: 1 }} />

        <Stack spacing={1} sx={{ mb: 2 }}>
          {ministerListForMinistry.map((person, idx) => (
            <Button
              key={idx}
              variant="contained"
              onClick={() =>
                navigate(`/person-profile/${person.id}`, {
                  state: { mode: "back" },
                })
              }
              size="medium"
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                backgroundColor: colors.backgroundPrimary,
                color: selectedPresident?.themeColorLight,
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: `${selectedPresident?.themeColorLight}10`,
                },
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
              fullWidth
            >
              <PersonIcon
                fontSize="small"
                sx={{ color: selectedPresident?.themeColorLight }}
              />

              {/* Name + badges container */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 0.5,
                  flexWrap: "wrap",
                  justifyContent: "flex-start",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "poppins",
                    color: colors.textPrimary,
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  {utils.extractNameFromProtobuf(person.name)}
                </Typography>

                {/* President Badge */}
                {person.isPresident && (
                  <Typography
                    variant="subtitle2"
                    sx={{
                      px: 1,
                      py: 0.3,
                      borderRadius: "5px",
                      // backgroundColor: selectedPresident.themeColorLight,
                      // color: colors.white,
                      backgroundColor: colors.backgroundPrimary,
                      color: selectedPresident.themeColorLight,
                      border: `1px solid ${selectedPresident.themeColorLight}`,
                      fontFamily: "poppins",
                      fontWeight: 600,
                    }}
                  >
                    President
                  </Typography>
                )}

                {/* New Badge */}
                {person.isNew && (
                  <Typography
                    variant="subtitle2"
                    sx={{
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
              </Box>
            </Button>
          ))}
        </Stack>

        <Box sx={{ p: 2 }}></Box>
        <Typography
          variant="subtitle1"
          sx={{
            mt: -2,
            fontSize: "1.25rem",
            color: colors.textPrimary,
            fontWeight: 600,
            fontFamily: "poppins",
          }}
        >
          Directors
        </Typography>
        <Divider sx={{ py: 1 }} />
      </Box>
      <Dialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            height: "100vh",
            overflowY: "auto",
            backgroundColor: colors.backgroundPrimary,
            borderRadius: 3,
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            px: 2,
            pt: 2,
          }}
        >
          <IconButton onClick={() => setProfileOpen(false)}>
            <CloseIcon sx={{ color: colors.textPrimary }} />
          </IconButton>
        </Box>

        <Box sx={{ px: 3, pb: 3 }}>
          <PersonProfile selectedPerson={selectedPerson} />
        </Box>
      </Dialog>
    </>
  );
};

export default PersonsTab;
