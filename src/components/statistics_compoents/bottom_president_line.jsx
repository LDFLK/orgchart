import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import utils from "../../utils/utils";

import { Box, Avatar, Typography, IconButton } from "@mui/material";

import { useThemeContext } from "../../themeContext";

export default function BottomPresidentLine() {
  const { presidentDict } = useSelector((state) => state.presidency);

  const { colors } = useThemeContext();

  //redux
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("This is the president dict", presidentDict);
  }, [presidentDict]);

  const handlePresidentClick = async () => {
    try {
      dispatch()
    } catch (e) {
      console.log("president selection failed", e.message);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white shadow-xl flex p-2 rounded-xl gap-2">
      {Object.keys(presidentDict).map((presidentKey) => {
        return (
          <div className="block" onClick={() => handlePresidentClick(presidentDict[presidentKey])}>
            <Avatar
              src={presidentDict[presidentKey].imageUrl}
              alt={presidentDict[presidentKey].name}
              sx={{
                width: 75,
                height: 75,
                // border: `3px solid ${colors.backgroundSecondary}`,
                border: `3px solid ${presidentDict[presidentKey].themeColorLight}`,
                backgroundColor: colors.backgroundPrimary,
                margin: "auto",
              }}
            />
            <p className="text-sm text-center">
              {
                utils
                  .extractNameFromProtobuf(presidentDict[presidentKey].name)
                  .split(" ")[0]
              }
            </p>
          </div>
        );
      })}
    </div>
  );
}
