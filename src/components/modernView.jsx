import { Box, Card, Typography, Avatar, Button } from "@mui/material";
import PresidencyTimeline from "./PresidencyTimeline";
import MinistryCardGrid from "./MinistryCardGrid";
import utils from "../utils/utils";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useThemeContext } from "../themeContext";
import api from "../services/services";
import personImages from "../assets/personImages.json";

const ModernView = () => {
  const { selectedDate, selectedPresident } = useSelector(
    (state) => state.presidency
  );
  // const { selectedMinistry } = useSelector((state) => state.allMinistryData);
  const presidentRelationDict = useSelector(
    (state) => state.presidency.presidentRelationDict
  );
  const allPersonData = useSelector((state) => state.allPerson.allPerson);

  const { colors } = useThemeContext();

  const [primeMinister, setPrimeMinister] = useState({
    relation: null,
    person: null,
  });
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { president } = location.state || {};

  useEffect(() => {
    if (president) {
      const currentState = location.state || {};
      const newState = { ...currentState };
      if (Object.prototype.hasOwnProperty.call(newState, "president")) {
        delete newState.president;
      }
      navigate(location.pathname, { replace: true, state: newState });
    }
  }, [president, navigate, location.pathname]);

  useEffect(() => {
    if (!selectedDate) {
      return;
    }
    setPrimeMinister({ relation: null, person: null });
    const timeoutId = setTimeout(() => {
      fetchPrimeMinister();
    }, 1000);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [selectedDate]);

  const fetchPrimeMinister = async () => {
    try {
      setLoading(true);
      var response = await api.fetchActiveRelationsForMinistry(
        selectedDate.date,
        "gov_01",
        "AS_PRIME_MINISTER"
      );

      response = await response.json();
      if (response.length === 0) {
        setLoading(false);
        return;
      }
      let pmPerson = allPersonData[response[0].relatedEntityId];
      // Try to find a matching image from personImages
      if (pmPerson && pmPerson.name) {
        const pmName = utils.extractNameFromProtobuf(pmPerson.name).trim();
        const found = personImages.find(
          (img) => img.presidentName.trim() === pmName
        );
        if (found && found.imageUrl) {
          pmPerson = { ...pmPerson, imageUrl: found.imageUrl };
        }
      }
      if (response.length > 0 && pmPerson) {
        setPrimeMinister({
          relation: response[0],
          person: pmPerson,
        });
      }
      setLoading(false);
    } catch (e) {
      console.error("Failed to fetch prime minister data:", e);
    }
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
      (
      <Box sx={{ display: "flex", mt: 5, justifyContent: "center" }}>
        <PresidencyTimeline />
      </Box>
      )
      {selectedPresident && (
        <>
          <Box
          >
            {/* Card Grid for Modern View */}
            {selectedDate != null && <MinistryCardGrid />}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ModernView;
