import { Card, Typography, Box, Stack } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import utils from "../utils/utils";
import { useSelector } from "react-redux";
import { useThemeContext } from "../themeContext";

const MinistryCard = ({ card, onClick }) => {
  const { selectedPresident } = useSelector((state) => state.presidency);
  const { colors } = useThemeContext();

  return (
    <Card
      sx={{
        cursor: "pointer",
        boxShadow: "none",
        border: `2px solid ${colors.backgroundSecondary}50`,
        transition: "box-shadow 0.2s",
        "&:hover": {
          border: `2px solid ${colors.ministryCardBorderHover}`,
        },
        backgroundColor: colors.backgroundPrimary,
        borderRadius: "10px",
        position: "relative",
      }}
      onClick={() => onClick(card)}
    >
    
      <Stack>
        {/* Ministry Title */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          minHeight={50}
          sx={{ px: 2, py: 1, backgroundColor: colors.backgroundSecondary }}
        >
          <Typography variant="h7" sx={{ color: "#ffffff", fontWeight: 600 }}>
            {card.name.split(":")[0]}
          </Typography>
           {(card.newMin || card.newPerson) && (
          <Box
            sx={{
              backgroundColor: colors.green,
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
              sx={{ color: colors.backgroundSecondary, alignSelf: "center" }}
              fontSize="small"
            />
            <Stack direction="column" spacing={0}>
              {/* Minister / President label */}
              {(!card.headMinisterName ||
                (selectedPresident &&
                  utils.extractNameFromProtobuf(card.headMinisterName) ===
                    utils
                      .extractNameFromProtobuf(selectedPresident.name)
                      .split(":")[0])) ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: colors.textSecondary,
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
                      color: colors.textSecondary,
                      fontFamily: "poppins",
                      py: "5px",
                      px: "8px",
                      backgroundColor: `${colors.green}50`,
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
                    color: colors.textSecondary,
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

                {/* {card.newPerson && (
                  <Box
                    sx={{
                      backgroundColor: colors.purple,
                      color: "#fff",
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
                )} */}
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};

export default MinistryCard;
