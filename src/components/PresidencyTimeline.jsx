import { useEffect, useRef, useState } from "react";
import { Box, Avatar, Typography, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
// import colors from "../assets/colors";
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedIndex,
  setSelectedDate,
  setSelectedPresident,
} from "../store/presidencySlice";
import { setGazetteData } from "../store/gazetteDate";
import utils from "../utils/utils";
import StyledBadge from "../utils/materialCustomAvatar";
import { useThemeContext } from "../themeContext";
import modeEnum from "../../src/enums/mode";

export default function PresidencyTimeline({ mode = modeEnum.ORGCHART }) {
  const dispatch = useDispatch();

  //redux state
  const presidents = useSelector((state) => state.presidency.presidentDict);
  const selectedPresident = useSelector(
    (state) => state.presidency.selectedPresident
  );
  const selectedIndex = useSelector((state) => state.presidency.selectedIndex);
  const selectedDate = useSelector((state) => state.presidency.selectedDate);
  const presidentRelationDict = useSelector(
    (state) => state.presidency.presidentRelationDict
  );
  const { gazetteData } = useSelector((state) => state.gazettes);
  const gazetteDateClassic = useSelector(
    (state) => state.gazettes.gazetteDataClassic
  );

  //ref
  const scrollRef = useRef(null);
  const avatarRef = useRef(null);
  const dotRef = useRef(null);
  const initialSelectionDone = useRef(false);

  //states
  const [lineStyle, setLineStyle] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { colors } = useThemeContext();

  useEffect(() => {
    console.log("this is the mode", mode);
  }, [mode]);

  const updateScrollButtons = () => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    setCanScrollLeft(scrollEl.scrollLeft > 0);
    setCanScrollRight(
      scrollEl.scrollLeft + scrollEl.clientWidth < scrollEl.scrollWidth - 1
    );
  };

  useEffect(() => {
    if (!initialSelectionDone.current && presidents.length > 0) {
      initialSelectionDone.current = true;
      const lastIndex = presidents.length - 1;
      dispatch(setSelectedIndex(lastIndex));
      dispatch(setSelectedPresident(presidents[lastIndex]));
    }
    updateScrollButtons();
  }, [selectedPresident]);

  useEffect(() => {
    if (selectedIndex !== null) {
      setTimeout(() => {
        const scrollContainer = scrollRef.current;
        const lastItem = scrollContainer?.children[selectedIndex];
        if (scrollContainer && lastItem) {
          const scrollLeft =
            lastItem.offsetLeft - scrollContainer.offsetLeft - 24;
          scrollContainer.scrollTo({
            left: scrollLeft,
            behavior: "smooth",
          });
          updateScrollButtons();
        }
      }, 50);
    }
  }, [selectedIndex]);

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    el?.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      el?.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, []);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 100;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const drawLine = () => {
    if (!avatarRef.current || !dotRef.current || !scrollRef.current) {
      setLineStyle(null);
      return;
    }

    const avatarBox = avatarRef.current.getBoundingClientRect();
    const dotBox = dotRef.current.getBoundingClientRect();
    const containerBox = scrollRef.current.getBoundingClientRect();

    const startX = avatarBox.left + avatarBox.width;
    const endX = dotBox.left + dotBox.width / 2 + 34;
    const containerHeight = containerBox.height;
    const top = containerHeight / 2 - 30;

    setLineStyle({
      left: startX - containerBox.left,
      width: endX - startX,
      top,
    });
  };

  useEffect(() => {
    setTimeout(() => {
      drawLine();
    }, 200);
  }, [selectedIndex, selectedDate]);

  useEffect(() => {
    drawLine();

    window.addEventListener("resize", drawLine);
    const scrollContainer = scrollRef.current;
    scrollContainer?.addEventListener("scroll", drawLine);

    return () => {
      window.removeEventListener("resize", drawLine);
      scrollContainer?.removeEventListener("scroll", drawLine);
    };
  }, []);

  useEffect(() => {
    if (selectedPresident?.created) {
      const presidentRelationByStartTime = {};
      Object.values(presidentRelationDict).forEach((rel) => {
        presidentRelationByStartTime[rel.startTime] = rel;
      });

      // Lookup the relation by selectedPresident.created
      const matchedPresidentRelation =
        presidentRelationByStartTime[selectedPresident.created];

      fetchGazetteData(matchedPresidentRelation);
    }
  }, [selectedPresident]);

  const fetchGazetteData = async (selectedPresident) => {
    try {
      const startTime = selectedPresident.startTime.split("T")[0];
      const endTime = selectedPresident.endTime.split("T")[0];

      var filteredDates = [];
      if (endTime == "") {
        filteredDates = gazetteDateClassic.filter((date) => date >= startTime);
      } else {
        filteredDates = gazetteDateClassic.filter(
          (date) => date >= startTime && date < endTime
        );
      }

      const transformed = filteredDates.map((date) => ({ date: date }));

      dispatch(setGazetteData(transformed));

      if (transformed.length > 0) {
        dispatch(setSelectedDate(transformed[transformed.length - 1]));
      }
    } catch (e) {
      console.log(`Error fetching gazette data : ${e.message}`);
    }
  };

  return (
    <>
      {mode == modeEnum.ORGCHART ? (
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            maxWidth: "100%",
            overflow: "hidden",
            width: "80%",
          }}
        >
          <IconButton
            onClick={() => scroll("left")}
            sx={{
              zIndex: 2,
              mt: -6.8,
              backgroundColor: colors.backgroundPrimary,
              visibility: canScrollLeft ? "visible" : "hidden",
              borderRadius: "50%",
              "&:hover": {
                backgroundColor: colors.backgroundPrimary,
              },
              color: colors.timelineColor,
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>

          <Box
            sx={{
              position: "absolute",
              top: "calc(50% - 28px)",
              width: "92%",
              left: 50,
              right: 50,
              height: "2px",
              backgroundColor: colors.timelineColor,
              zIndex: 0,
            }}
          />

          {lineStyle && selectedIndex !== null && selectedDate && (
            <Box
              sx={{
                position: "absolute",
                height: "5px",
                // backgroundColor: colors.timelineLineActive,
                backgroundColor: selectedPresident.themeColorLight,
                top: `${lineStyle.top}px`,
                left: `${lineStyle.left}px`,
                width: `${lineStyle.width}px`,
                zIndex: 1,
                transition: "left 0.3s ease, width 0.3s ease",
              }}
            />
          )}

          <Box
            ref={scrollRef}
            sx={{
              display: "flex",
              overflowX: "auto",
              gap: 14,
              padding: 4,
              paddingLeft: 6,
              paddingRight: 14,
              flexWrap: "nowrap",
              scrollBehavior: "smooth",
              flexGrow: 1,
              position: "relative",
              zIndex: 1,
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {presidents &&
              presidents.map((president, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flexShrink: 0,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Box
                      onClick={() => {
                        if (!isSelected) {
                          dispatch(setSelectedPresident(null));
                          dispatch(setSelectedIndex(null));
                          dispatch(setSelectedPresident(president));
                          dispatch(setSelectedIndex(index));
                        }
                      }}
                      sx={{
                        cursor: "pointer",
                        textAlign: "center",
                        transform: isSelected ? "scale(1.3)" : "scale(1)",
                        transition: "all 0.3s ease",
                        minWidth: 80,
                      }}
                    >
                      {index === presidents.length - 1 ? (
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <StyledBadge
                            ref={isSelected ? avatarRef : null}
                            overlap="circular"
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "right",
                            }}
                            variant="dot"
                            sx={{
                              border: isSelected
                                ? `4px solid ${selectedPresident.themeColorLight}`
                                : // ? `4px solid ${colors.timelineLineActive}`
                                  `2px solid ${colors.inactiveBorderColor}`,
                              backgroundColor: colors.backgroundPrimary,
                              margin: "auto",
                              borderRadius: 50,
                            }}
                          >
                            <Avatar
                              alt={president.name}
                              src={president.imageUrl}
                              sx={{
                                width: 50,
                                height: 50,
                                border: `3px solid ${colors.backgroundPrimary}`,
                                backgroundColor: colors.backgroundPrimary,
                                margin: "auto",
                                filter: isSelected ? "none" : "grayscale(50%)",
                              }}
                            />
                          </StyledBadge>
                        </Box>
                      ) : (
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <Box
                            sx={{
                              border: isSelected
                                ? `4px solid ${selectedPresident.themeColorLight}`
                                : `2px solid ${colors.inactiveBorderColor}`,
                              borderRadius: "50%",
                            }}
                          >
                            <Avatar
                              ref={isSelected ? avatarRef : null}
                              src={president.imageUrl}
                              alt={president.name}
                              sx={{
                                width: 50,
                                height: 50,
                                border: `3px solid ${colors.backgroundPrimary}`,
                                backgroundColor: colors.backgroundPrimary,
                                margin: "auto",
                                filter: isSelected ? "none" : "grayscale(50%)",
                              }}
                            />
                          </Box>
                        </Box>
                      )}

                      <Typography
                        variant="body2"
                        sx={{
                          mt: 1,
                          color: colors.textPrimary,
                          fontFamily: "poppins",
                          fontWeight: isSelected ? 600 : "",
                        }}
                      >
                        {utils.extractNameFromProtobuf(president.name)}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{ color: colors.textMuted, fontFamily: "poppins" }}
                      >
                        {selectedPresident && (
                          <>
                            {president.created.split("-")[0]} - {" "}
                            {(() => {
                              const relation =
                                presidentRelationDict[president.id];

                                console.log('this is the dictionary of zaeema', presidentRelationDict)

                                console.log('this relation is returened by zaeema', relation)
                              if (!relation) return "zaeema";

                              return relation.endTime
                                ? new Date(relation.endTime).getFullYear()
                                : "Present";
                            })()}
                          </>
                        )}
                      </Typography>
                    </Box>

                    {isSelected && gazetteData?.length > 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          transition: "all 0.3s ease",
                          ml: 1,
                          pr: 2,
                        }}
                      >
                        {gazetteData.map((item) => {
                          var isDateSelected = false;
                          if (selectedDate) {
                            isDateSelected = item.date === selectedDate.date;
                          }

                          return (
                            <Box
                              key={item.date}
                              onClick={() => dispatch(setSelectedDate(item))}
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                cursor: "pointer",
                                transform: isDateSelected
                                  ? "scale(1.1)"
                                  : "scale(1)",
                                transition: "transform 0.2s ease",
                                mt: "-32px",
                              }}
                            >
                              <Box
                                ref={isDateSelected ? dotRef : null}
                                sx={{
                                  width: 15,
                                  height: 15,
                                  borderRadius: "50%",
                                  backgroundColor: isDateSelected
                                    ? selectedPresident.themeColorLight
                                    : // ? colors.dotColorActive
                                      colors.dotColorInactive,
                                  border: `3px solid ${colors.backgroundPrimary}`,
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  mt: 0.5,
                                  color: isDateSelected
                                    ? selectedPresident.themeColorLight
                                    : // ? colors.dotColorActive
                                      colors.dotColorInactive,
                                  fontSize: "0.75rem",
                                  fontWeight: isDateSelected ? "bold" : "",
                                  fontFamily: "poppins",
                                }}
                              >
                                {item.date}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                );
              })}
          </Box>

          <IconButton
            onClick={() => scroll("right")}
            sx={{
              zIndex: 2,
              mt: -6.8,
              backgroundColor: colors.backgroundPrimary,
              visibility: canScrollRight ? "visible" : "hidden",
              borderRadius: "50%",
              "&:hover": {
                backgroundColor: colors.backgroundPrimary,
              },
              color: colors.timelineColor,
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      ) : (
        <Box
          sx={{
            // position: "relative",
            // display: "flex",
            // alignItems: "center",
            // maxWidth: "100%",
            // overflow: "hidden",
            // width: "80%",
          }}
        >
          <IconButton
            onClick={() => scroll("left")}
            sx={{
              // zIndex: 2,
              // mt: -6.8,
              // backgroundColor: colors.backgroundPrimary,
              // visibility: canScrollLeft ? "visible" : "hidden",
              // borderRadius: "50%",
              // "&:hover": {
              //   backgroundColor: colors.backgroundPrimary,
              // },
              // color: colors.timelineColor,
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>

          <Box
            sx={{
              // position: "absolute",
              // top: "calc(50% - 28px)",
              // width: "92%",
              // left: 50,
              // right: 50,
              // height: "2px",
              // backgroundColor: colors.timelineColor,
              // zIndex: 0,
            }}
          />

          {lineStyle && selectedIndex !== null && selectedDate && (
            <Box
              sx={{
                // position: "absolute",
                // height: "5px",
                // // backgroundColor: colors.timelineLineActive,
                // backgroundColor: selectedPresident.themeColorLight,
                // top: `${lineStyle.top}px`,
                // left: `${lineStyle.left}px`,
                // width: `${lineStyle.width}px`,
                // zIndex: 1,
                // transition: "left 0.3s ease, width 0.3s ease",
              }}
            />
          )}

          <Box
            ref={scrollRef}
            sx={{
              // display: "flex",
              // overflowX: "auto",
              // gap: 14,
              // padding: 4,
              // paddingLeft: 6,
              // paddingRight: 14,
              // flexWrap: "nowrap",
              // scrollBehavior: "smooth",
              // flexGrow: 1,
              // position: "relative",
              // zIndex: 1,
              // "&::-webkit-scrollbar": { display: "none" },
              // scrollbarWidth: "none",
              // msOverflowStyle: "none",
            }}
          >
            {presidents &&
              presidents.map((president, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flexShrink: 0,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Box
                      onClick={() => {
                        if (!isSelected) {
                          dispatch(setSelectedPresident(null));
                          dispatch(setSelectedIndex(null));
                          dispatch(setSelectedPresident(president));
                          dispatch(setSelectedIndex(index));
                        }
                      }}
                      sx={{
                        cursor: "pointer",
                        textAlign: "center",
                        transform: isSelected ? "scale(1.3)" : "scale(1)",
                        transition: "all 0.3s ease",
                        minWidth: 80,
                      }}
                    >
                      {index === presidents.length - 1 ? (
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <StyledBadge
                            ref={isSelected ? avatarRef : null}
                            overlap="circular"
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "right",
                            }}
                            variant="dot"
                            sx={{
                              border: isSelected
                                ? `4px solid ${selectedPresident.themeColorLight}`
                                : // ? `4px solid ${colors.timelineLineActive}`
                                  `2px solid ${colors.inactiveBorderColor}`,
                              backgroundColor: colors.backgroundPrimary,
                              margin: "auto",
                              borderRadius: 50,
                            }}
                          >
                            <Avatar
                              alt={president.name}
                              src={president.imageUrl}
                              sx={{
                                width: 50,
                                height: 50,
                                border: `3px solid ${colors.backgroundPrimary}`,
                                backgroundColor: colors.backgroundPrimary,
                                margin: "auto",
                                filter: isSelected ? "none" : "grayscale(50%)",
                              }}
                            />
                          </StyledBadge>
                        </Box>
                      ) : (
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <Box
                            sx={{
                              border: isSelected
                                ? `4px solid ${selectedPresident.themeColorLight}`
                                : `2px solid ${colors.inactiveBorderColor}`,
                              borderRadius: "50%",
                            }}
                          >
                            <Avatar
                              ref={isSelected ? avatarRef : null}
                              src={president.imageUrl}
                              alt={president.name}
                              sx={{
                                width: 50,
                                height: 50,
                                border: `3px solid ${colors.backgroundPrimary}`,
                                backgroundColor: colors.backgroundPrimary,
                                margin: "auto",
                                filter: isSelected ? "none" : "grayscale(50%)",
                              }}
                            />
                          </Box>
                        </Box>
                      )}

                      {/* <Typography
                        variant="body2"
                        sx={{
                          mt: 1,
                          color: colors.textPrimary,
                          fontFamily: "poppins",
                          fontWeight: isSelected ? 600 : "",
                        }}
                      >
                        {utils.extractNameFromProtobuf(president.name)}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{ color: colors.textMuted, fontFamily: "poppins" }}
                      >
                        {selectedPresident && (
                          <>
                            {president.created.split("-")[0]} -{" "}
                            {(() => {
                              const relation =
                                presidentRelationDict[president.id];
                              if (!relation) return "Unknown";

                              return relation.endTime
                                ? new Date(relation.endTime).getFullYear()
                                : "Present";
                            })()}
                          </>
                        )}
                      </Typography> */}
                    </Box>
                  </Box>
                );
              })}
          </Box>
        </Box>
      )}
    </>
  );
}
