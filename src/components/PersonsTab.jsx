import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Typography, Divider, Stack, Button, Alert, AlertTitle } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import utils from "../utils/utils";
import api from "../services/services";
import { useThemeContext } from "../themeContext";

const PersonsTab = ({ selectedDate }) => {
  const { colors } = useThemeContext();
  const allPersonDict = useSelector((state) => state.allPerson.allPerson);
  const { selectedMinistry } = useSelector((state) => state.allMinistryData);
  const { selectedPresident } = useSelector((state) => state.presidency);

  const [personListForMinistry, setPersonListForMinistry] = useState([]);
  const [loading, setLoading] = useState(false);

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
        resPersons.forEach((r) => r.relatedEntityId && personMap.set(r.relatedEntityId, r.startTime));

        // Map over person IDs, convert names from protobuf, fallback to president if null
        let personList = Array.from(personMap.keys())
          .map((id) => {
            const personFromDict = allPersonDict[id];
            let name;

            if (personFromDict && personFromDict.name) {
              name = utils.extractNameFromProtobuf(personFromDict.name);
            } else {
              // fallback to president
              name = utils.extractNameFromProtobuf(selectedPresident.name);
            }

            const isPresident = name === utils.extractNameFromProtobuf(selectedPresident.name);

            return {
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
            name: utils.extractNameFromProtobuf(selectedPresident.name),
            startTime: selectedDate,
            isNew: true,
            isPresident: true,
          });
        }

        setPersonListForMinistry(personList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching persons:", err);
        // fallback to president
        setPersonListForMinistry([
          {
            name: utils.extractNameFromProtobuf(selectedPresident.name),
            startTime: selectedDate,
            isNew: true,
            isPresident: true,
          },
        ]);
        setLoading(false);
      }
    };

    fetchPersons();
  }, [selectedDate, selectedMinistry, allPersonDict, selectedPresident]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <Typography sx={{ fontFamily: "poppins", color: colors.textPrimary }}>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
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
        {personListForMinistry.map((person, idx) => (
          <Button
            key={idx}
            variant="contained"
            size="medium"
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              backgroundColor: colors.backgroundPrimary,
              color: selectedPresident?.themeColorLight,
              boxShadow: "none",
              "&:hover": { backgroundColor: `${selectedPresident?.themeColorLight}10` },
            }}
            fullWidth
          >
            <PersonIcon fontSize="small" sx={{ mr: 2, color: selectedPresident?.themeColorLight }} />
            <Typography sx={{ fontFamily: "poppins", color: colors.textPrimary, textAlign: "start" }}>
              {person.name}
            </Typography>
            {person.isPresident && (
              <Typography
                variant="subtitle2"
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
                President
              </Typography>
            )}
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
  );
};

export default PersonsTab;
