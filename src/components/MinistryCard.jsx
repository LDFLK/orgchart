import { Card, Typography, Box, Stack } from "@mui/material";
import utils from "../utils/utils";
import { useSelector } from "react-redux";
import { useThemeContext } from "../themeContext";
import { useBadgeContext } from "./badgeContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MinistryCard = ({ card, onClick }) => {
  const { selectedPresident } = useSelector((state) => state.presidency);
  const { colors } = useThemeContext();
  const { showMinistryBadge, showPersonBadge } = useBadgeContext();
  const [mouseHover, setMouseHover] = useState(false);
  const navigate = useNavigate();

  const handleOpenProfile = (id) => {
    navigate(`/person-profile/${id}`, {
      state: { mode: "back" },
    })
  }

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

        backgroundColor: colors.backgroundBlue,
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
            px: 1.5,
            py: 0.5,
            backgroundColor:
              mouseHover && mouseHover.id == card.id
                ? `${selectedPresident.themeColorLight}`
                : `${selectedPresident.themeColorLight}99`,
            "&:hover": {
              backgroundColor: selectedPresident.themeColorLight,
            },
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center", // vertically centers content
              height: `calc(1.4em * 4)`, // fixed 4-line height
              overflow: "hidden",
            }}
          >
            <Typography
              variant="h7"
              sx={{
                color: "#ffffff",
                fontWeight: 600,
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.4,
              }}
            >
              {card.name.split(":")[0]}
            </Typography>
          </Box>

          {card.newMin && showMinistryBadge && (
            <Box
              sx={{
                backgroundColor: selectedPresident.themeColorLight,
                color: "#fff",
                fontSize: "0.7rem",
                fontWeight: "bold",
                borderRadius: "5px",
                px: 1,
                py: "2px",
                fontFamily: "poppins",
                ml: 1,
              }}
            >
              NEW
            </Box>
          )}
        </Stack>


        {/* Minister Info */}
        <Stack spacing={0.5} sx={{ p: 1, minHeight: 60 }}>
          <Stack direction="row" spacing={1}>
            {/* <PersonIcon
              sx={{
                color: selectedPresident.themeColorLight,
                // color: colors.backgroundSecondary,
                alignSelf: "center",
              }}
              fontSize="small"
            /> */}
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
                      color: colors.white,
                      fontFamily: "poppins",
                      py: "3px",
                      px: "5px",
                      // backgroundColor: `${colors.green}50`,
                      backgroundColor: `${selectedPresident.themeColorLight}`,
                      borderRadius: "5px",
                    }}
                  >
                    President
                  </Typography>
                </Box>
              ) : (
                <></>
              )}

              {/* Head Minister Name + NEW badge if newPerson */}
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  variant="subtitle2"
                  onClick={() =>
                    handleOpenProfile(card.headMinisterId || selectedPresident?.id)
                  }
                  sx={{
                    fontWeight: 600,
                    color: colors.textPrimary,
                    fontFamily: "poppins",
                    textDecorationThickness: "1px",
                    textUnderlineOffset: "3px",
                    cursor: "pointer",
                    "&:hover": {
                      textDecoration: "underline",
                      opacity: 0.9,
                    },
                  }}
                >
                  {card.headMinisterName
                    ? utils.extractNameFromProtobuf(card.headMinisterName)
                    : selectedPresident &&
                    utils.extractNameFromProtobuf(selectedPresident.name).split(":")[0]}
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
