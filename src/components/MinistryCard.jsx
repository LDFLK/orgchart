import { Card, Typography, Box, Stack } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import utils from "../utils/utils";
import { useSelector } from "react-redux";
import { useThemeContext } from "../themeContext";
import { useBadgeContext } from "../badgeContext";
import { useState } from "react";

const MinistryCard = ({ card, onClick }) => {
  const { selectedPresident } = useSelector((state) => state.presidency);
  const { colors } = useThemeContext();
  const { showMinistryBadge, showPersonBadge } = useBadgeContext();
  const [mouseHover, setMouseHover] = useState(false);

  return (
    <Card
      sx={{
        cursor: "pointer",
        boxShadow: "none",
        // border: `2px solid ${colors.backgroundSecondary}50`,
        border: `2px solid ${selectedPresident.themeColorLight}99`,
        transition: "box-shadow 0.2s",
        "&:hover": {
          // border: `2px solid ${colors.ministryCardBorderHover}`,
          border: `2px solid ${selectedPresident.themeColorLight}`,
        },

        backgroundColor: "#0a1929",
        borderRadius: "10px",
        position: "relative",
        width: "100%",
      }}
      onMouseOver={() => setMouseHover(card)}
      onMouseOut={() => setMouseHover(null)}
      onClick={() => onClick(card)}
    >
      <Stack>
        {/* Ministry Title */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          minHeight={50}
          sx={{
            px: 2,
            py: 1,
            backgroundColor:
              mouseHover && mouseHover.id == card.id
                ? `${selectedPresident.themeColorLight}`
                : `${selectedPresident.themeColorLight}99`,
            "&:hover": {
              backgroundColor: selectedPresident.themeColorLight,
            },
            //  backgroundColor: colors.backgroundSecondary
          }}
        >
          <Typography variant="h7" sx={{ color: "#ffffff", fontWeight: 600 }}>
            {card.name.split(":")[0]}
          </Typography>
          {card.newMin && showMinistryBadge && (
            <Box
              sx={{
                backgroundColor: selectedPresident.themeColorLight,
                // backgroundColor: colors.green,
                color: "#fff",
                fontSize: "0.7rem",
                fontWeight: "bold",
                borderRadius: "5px",
                px: 1,
                py: "2px",
                fontFamily: "poppins",
              }}
            >
              NEW
            </Box>
          )}
        </Stack>

        {/* Minister Info */}
        <Stack spacing={0.5} sx={{ p: 1, minHeight: 60 }}>
          <Stack direction="row" spacing={1}>
            <PersonIcon
              sx={{
                color: selectedPresident.themeColorLight,
                // color: colors.backgroundSecondary,
                alignSelf: "center",
              }}
              fontSize="small"
            />
            <Stack direction="column" spacing={0}>
              {/* Minister / President label */}
              {!card.headMinisterName ||
              (selectedPresident &&
                utils.extractNameFromProtobuf(card.headMinisterName) ===
                  utils
                    .extractNameFromProtobuf(selectedPresident.name)
                    .split(":")[0]) ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      // color: colors.textSecondary,
                      color: selectedPresident.themeColorLight,
                      fontFamily: "poppins",
                      py: "5px",
                      pr: "8px",
                    }}
                  >
                    Minister
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
                    }}
                  >
                    President
                  </Typography>
                </Box>
              ) : (
                <Typography
                  variant="subtitle2"
                  sx={{
                    // color: colors.textSecondary,
                    color: selectedPresident.themeColorLight,
                    fontFamily: "poppins",
                    py: "5px",
                    pr: "10px",
                  }}
                >
                  Minister
                </Typography>
              )}

              {/* Head Minister Name + NEW badge if newPerson */}
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: colors.textPrimary,
                    fontFamily: "poppins",
                  }}
                >
                  {card.headMinisterName
                    ? utils.extractNameFromProtobuf(card.headMinisterName)
                    : selectedPresident &&
                      utils
                        .extractNameFromProtobuf(selectedPresident.name)
                        .split(":")[0]}
                </Typography>

                {card.newPerson && showPersonBadge && (
                  <Box
                    sx={{
                      // backgroundColor: colors.purple,
                      // backgroundColor: selectedPresident.themeColorLight,
                      border: `2px solid ${selectedPresident.themeColorLight}`,
                      // color: "#fff",
                      color: `${selectedPresident.themeColorLight}`,
                      fontSize: "0.65rem",
                      fontWeight: "bold",
                      borderRadius: "4px",
                      px: 1,
                      py: "1px",
                      fontFamily: "poppins",
                    }}
                  >
                    NEW
                  </Box>
                )}
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};

export default MinistryCard;
