import { useEffect, useRef, useState, useCallback } from "react";
import { Box, Avatar, Typography, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedDate } from "../store/presidencySlice";
import utils from "../utils/utils";
import StyledBadge from "../utils/materialCustomAvatar";
import { useThemeContext } from "../themeContext";
import modeEnum from "../../src/enums/mode";
import YearRangeSelector from "./common_components/Timeline";
import { Tooltip } from "@mui/material";

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

  //states
  const [lineStyle, setLineStyle] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [latestPresStartDate, setLatestPresStartDate] = useState(new Date());
  const [userSelectedDateRange, setUserSelectedDateRange] = useState([null, null]);
  const [latestPresidentId, setLatestPresidentId] = useState(null);

  const { colors } = useThemeContext();

  const updateScrollButtons = () => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    setCanScrollLeft(scrollEl.scrollLeft > 0);
    setCanScrollRight(
      scrollEl.scrollLeft + scrollEl.clientWidth < scrollEl.scrollWidth - 1
    );
  };

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
    const containerBox = scrollRef.current.parentElement.getBoundingClientRect();

    const startX = avatarBox.left + avatarBox.width;
    const endX = dotBox.left + dotBox.width / 2;
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
    if (!presidents || presidents.length === 0 || !presidentRelationDict) return;

    const relationEntries = Object.entries(presidentRelationDict);
    if (relationEntries.length === 0) return;

    // Last relation 
    const [lastPresId, lastRelation] = relationEntries[relationEntries.length - 1];

    if (lastPresId && lastRelation?.startTime) {
      setLatestPresidentId(lastPresId);
      setLatestPresStartDate(new Date(lastRelation.startTime.split("T")[0]));
    }
  }, [presidents, presidentRelationDict]);

  useEffect(() => {
    if (selectedIndex !== null) {
      setTimeout(() => {
        const scrollContainer = scrollRef.current;
        if (scrollContainer) {
          scrollContainer.scrollTo({
            left: 0,
            behavior: "smooth",
          });
          updateScrollButtons();
        }
      }, 50);
    }
  }, [selectedIndex]);

  // Auto-scroll selected dot into view
  useEffect(() => {
    if (selectedDate && dotRef.current && scrollRef.current) {
      setTimeout(() => {
        const container = scrollRef.current;
        const dot = dotRef.current;

        const containerRect = container.getBoundingClientRect();
        const dotRect = dot.getBoundingClientRect();

        const dotCenter = dotRect.left + dotRect.width / 2;
        const containerCenter = containerRect.left + containerRect.width / 2;
        const scrollOffset = dotCenter - containerCenter;

        container.scrollBy({
          left: scrollOffset,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [selectedDate]);

  const handleDateRangeChange = useCallback((dateRange) => {
    const [startDate, endDate] = dateRange;
    setUserSelectedDateRange([startDate, endDate]);
  }, []);

  const dates = gazetteDateClassic.map(d => `${d}T00:00:00Z`);

  return (
    <>

      {mode == modeEnum.ORGCHART ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            px: { xs: 1, sm: 2 },
            width: "100%",
          }}
        >
          <YearRangeSelector
            startYear={2019}
            dates={dates}
            latestPresStartDate={latestPresStartDate}
            onDateChange={handleDateRangeChange}
          />
          {selectedIndex !== null && (
            <Box
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                width: "100%",
                maxWidth: { xs: "100vw", sm: "90vw", md: "80vw", lg: "1200px" },
                overflow: "hidden",
                minWidth: 0,
                height: "150px"
              }}
            >
              <IconButton
                onClick={() => scroll("left")}
                sx={{
                  zIndex: 10,
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
                    backgroundColor: selectedPresident?.themeColorLight || colors.timelineColor,
                    top: `${lineStyle.top}px`,
                    left: `${lineStyle.left}px`,
                    width: `${lineStyle.width}px`,
                    zIndex: 5,
                    transition: "left 0.3s ease, width 0.3s ease",

                  }}
                />
              )}

              {selectedPresident && (
                <Box
                  sx={{
                    position: "absolute",
                    left: { xs: 3, sm: 6 },
                    zIndex: 9,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexShrink: 0,
                    transition: "all 0.3s ease",
                    padding: { xs: 2, sm: 4 },
                    pointerEvents: "none",


                  }}
                >
                  {selectedPresident.id === latestPresidentId ? (
                    <Box sx={{ textAlign: "center", minWidth: { xs: 60, sm: 80 }, background: `linear-gradient(to right, ${colors.backgroundPrimary} 65%, rgba(0,0,0,0) 50%)` }}>
                      <StyledBadge
                        ref={avatarRef}
                        overlap="circular"
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        variant="dot"
                        sx={{
                          border: `4px solid ${selectedPresident?.themeColorLight || colors.timelineColor
                            }`,
                          backgroundColor: colors.backgroundPrimary,
                          margin: "auto",
                          borderRadius: 50,
                        }}
                      >
                        <Avatar
                          alt={selectedPresident.name}
                          src={selectedPresident.imageUrl}
                          sx={{
                            width: { xs: 40, sm: 50 },
                            height: { xs: 40, sm: 50 },
                            border: `3px solid ${colors.backgroundPrimary}`,
                            backgroundColor: colors.backgroundPrimary,
                            margin: "auto",
                          }}
                        />
                      </StyledBadge>
                      <Typography
                        variant="body2"

                        sx={{
                          mt: 1,
                          color: colors.textPrimary,
                          fontFamily: "poppins",
                          fontWeight: 600,
                        }}
                      >
                        {utils.extractNameFromProtobuf(selectedPresident.name)}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{ color: colors.textMuted, fontFamily: "poppins" }}
                      >
                        {selectedPresident.created.split("-")[0]} -{" "}
                        {selectedPresident.endTime
                          ? new Date(selectedPresident.endTime).getFullYear()
                          : "Present"}
                      </Typography>

                    </Box>
                  ) : (
                    <Box sx={{ textAlign: "center", minWidth: { xs: 60, sm: 80 }, background: `linear-gradient(to right, ${colors.backgroundPrimary} 65%, rgba(0,0,0,0) 50%)`, }}>
                      <Box
                        sx={{
                          border: `4px solid ${selectedPresident?.themeColorLight || colors.timelineColor
                            }`,
                          backgroundColor: colors.backgroundPrimary,
                          margin: "auto",
                          borderRadius: "50%",
                          display: "inline-flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Avatar
                          ref={avatarRef}
                          alt={selectedPresident.name}
                          src={selectedPresident.imageUrl}
                          sx={{
                            width: { xs: 40, sm: 50 },
                            height: { xs: 40, sm: 50 },
                            border: `3px solid ${colors.backgroundPrimary}`,
                            backgroundColor: colors.backgroundPrimary,
                            margin: "auto",
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 1,
                          color: colors.textPrimary,
                          fontFamily: "poppins",
                          fontWeight: 600,
                        }}
                      >
                        {utils.extractNameFromProtobuf(selectedPresident.name)}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{ color: colors.textMuted, fontFamily: "poppins" }}
                      >
                        {(() => {
                          const relation =
                            presidentRelationDict[selectedPresident.id];
                          if (!relation) return "Unknown";

                          return relation.startTime
                            ? new Date(relation.startTime).getFullYear()
                            : "Unknown";
                        })()} -{" "}

                        {(() => {
                          const relation =
                            presidentRelationDict[selectedPresident.id];
                          if (!relation) return "Unknown";

                          return relation.endTime
                            ? new Date(relation.endTime).getFullYear()
                            : "Present";
                        })()}
                      </Typography>

                    </Box>
                  )}
                </Box>
              )}

              <Box
                ref={scrollRef}
                sx={{
                  display: "flex",
                  overflowX: "auto",
                  gap: 2,
                  padding: { xs: 2, sm: 4 },
                  paddingLeft: { xs: 22, sm: 28 },
                  paddingRight: { xs: 8, sm: 14 },
                  paddingTop: { xs: 7, sm: 4 },
                  flexWrap: "nowrap",
                  scrollBehavior: "smooth",
                  flexGrow: 1,
                  position: "relative",
                  zIndex: 5,
                  "&::-webkit-scrollbar": { display: "none" },
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  alignItems: "center",

                }}
              >
                {gazetteData?.length > 0 ? (
                  gazetteData.map((item) => {
                    const isDateSelected = selectedDate?.date === item.date;
                    return (
                      <Box
                        key={item.date}
                        onClick={() => dispatch(setSelectedDate(item))}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          cursor: "pointer",
                          transform: isDateSelected ? "scale(1.1)" : "scale(1)",
                          transition: "transform 0.2s ease",
                          flexShrink: 0,
                          mt: { xs: -8.5, sm: -4 },
                        }}
                      >
                        <Tooltip title="Gazette published date" placement="top" arrow>
                          <Box
                            ref={isDateSelected ? dotRef : null}
                            sx={{
                              width: 15,
                              height: 15,
                              borderRadius: "50%",
                              backgroundColor: isDateSelected
                                ? selectedPresident?.themeColorLight || colors.timelineColor
                                : colors.dotColorInactive,
                              border: `3px solid ${colors.backgroundPrimary}`,
                              zIndex: 20,
                              pointerEvents: "auto",
                            }}
                          />
                        </Tooltip>
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 0.5,
                            color: isDateSelected
                              ? selectedPresident?.themeColorLight || colors.timelineColor
                              : colors.dotColorInactive,
                            fontSize: "0.75rem",
                            fontWeight: isDateSelected ? "bold" : "",
                            fontFamily: "poppins",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.date}
                        </Typography>
                      </Box>
                    );
                  })
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mt: { xs: -7.5, sm: -2 },
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      sx={{
                        color: colors.textMuted,
                        borderRadius: 2,
                        px: 2.5,
                        py: 1,
                        fontSize: "0.85rem",
                        fontFamily: "poppins",
                        whiteSpace: "nowrap",
                      }}
                    >
                      No new gazette publications
                    </Box>
                  </Box>
                )}
              </Box>

              <IconButton
                onClick={() => scroll("right")}
                sx={{
                  zIndex: 9,
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
          )}
        </Box>
      ) : (
        <Box
          sx={{
            backgroundColor: colors.backgroundPrimary,
            height: "100%",
            boxShadow: "0 100px 50px 0 rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box
            sx={{
              backgroundColor: colors.timelineColor,
            }}
          />
          <Box
            ref={scrollRef}
            sx={{
              display: "block",
              overflowY: "auto",
              gap: 4,
              padding: 2,
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
            {selectedPresident && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexShrink: 0,
                  transition: "all 0.3s ease",
                  marginBottom: 2,
                }}
              >
                <Box
                  sx={{
                    cursor: "pointer",
                    textAlign: "center",
                    transform: "scale(1.3)",
                    transition: "all 0.3s ease",
                    minWidth: 80,
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <StyledBadge
                      ref={avatarRef}
                      overlap="circular"
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      variant="dot"
                      sx={{
                        border: `4px solid ${selectedPresident?.themeColorLight || colors.timelineColor}`,
                        backgroundColor: colors.backgroundPrimary,
                        margin: "auto",
                        borderRadius: 50,
                      }}
                    >
                      <Avatar
                        alt={selectedPresident.name}
                        src={selectedPresident.imageUrl}
                        sx={{
                          width: 50,
                          height: 50,
                          border: `3px solid ${colors.backgroundPrimary}`,
                          backgroundColor: colors.backgroundPrimary,
                          margin: "auto",
                          filter: "none",
                        }}
                      />
                    </StyledBadge>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </>
  );
}