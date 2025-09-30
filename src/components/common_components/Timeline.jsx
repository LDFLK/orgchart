import React, { useState, useRef, useEffect } from "react";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";
import utils from "../../utils/utils";
import { useSearchParams } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";

export default function YearRangeSelector({
  startYear,
  dates,
  latestPresStartDate,
  onDateChange,
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const endYear = new Date().getFullYear();
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );
  const initialStartYear = Math.max(
    startYear,
    latestPresStartDate.getFullYear()
  );
  const initialEndYear = Math.min(endYear, new Date().getFullYear());

  // Helper: safely parse YYYY-MM-DD → Date
  const parseDate = (dateStr, fallback) => {
    if (!dateStr) return fallback;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? fallback : date;
  };

  // Helper: safely format Date → YYYY-MM-DD
  const formatDate = (date, fallback = "") => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return fallback;
    return date.toISOString().split("T")[0];
  };

  const [selectedRange, setSelectedRange] = useState([
    initialStartYear,
    initialEndYear,
  ]);
  const [startDate, setStartDate] = useState(latestPresStartDate);
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    let urlStart = parseDate(
      searchParams.get("startDate"),
      latestPresStartDate
    );
    let urlEnd = parseDate(searchParams.get("endDate"), new Date());

    if (urlEnd < urlStart) {
      urlEnd = new Date(urlStart); // clamp endDate to startDate
    }

    setStartDate(urlStart);
    setEndDate(urlEnd);
    setTempStartDate(urlStart);
    setTempEndDate(urlEnd);
    setSelectedRange([urlStart.getUTCFullYear(), urlEnd.getUTCFullYear()]);
  }, [searchParams, latestPresStartDate]);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(null);
  const [isMovingWindow, setIsMovingWindow] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [preciseMode, setPreciseMode] = useState(true);
  const [activePreset, setActivePreset] = useState(null);
  const [activePresident, setActivePresident] = useState("");
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: '' });
  const presidentsArray = useSelector(
    (state) => state.presidency.presidentDict
  );
  const presidentRelationDict = useSelector(
    (state) => state.presidency.presidentRelationDict
  );
  const containerRef = useRef(null);
  const dragStartRef = useRef(null);
  const scrollWrapperRef = useRef(null);
  const debounceRef = useRef(null);

  const presidents = React.useMemo(() => {
    if (!presidentsArray || !presidentRelationDict) return {};
    const obj = {};
    presidentsArray.forEach((president) => {
      const relation = presidentRelationDict[president.id];
      if (!relation) return;

      const displayName = utils.extractNameFromProtobuf(president.name);

      obj[president.id] = {
        name: displayName.split(" ")[0],
        start: relation.startTime,
        end: relation.endTime || new Date().toISOString().slice(0, 10),
      };
    });

    return obj;
  }, [presidentsArray, presidentRelationDict]);

  //   useEffect(() => {
  //     const latestYear = latestPresStartDate.getFullYear();
  //     const validStartYear = Math.max(startYear, latestYear);
  //     const validEndYear = Math.min(endYear, new Date().getFullYear());
  //     console.log("President array", presidentsArray);
  //     console.log("President relation dict", presidentRelationDict);

  //     setStartDate(latestPresStartDate);
  //     setSelectedRange([validStartYear, validEndYear]);
  //     setTempStartDate(latestPresStartDate);
  //   }, [latestPresStartDate, endYear, startYear]);

  // Preprocess dates into a lookup: year -> month -> count
  const dateCounts = dates.reduce((acc, d) => {
    const dt = new Date(d);
    const year = dt.getUTCFullYear();
    const month = dt.getUTCMonth(); // 0 = Jan, 11 = Dec
    if (!acc[year]) acc[year] = Array(12).fill(0);
    acc[year][month] += 1;
    return acc;
  }, {});

  // Generate mini chart data
  const yearData = useRef(
    years.reduce((acc, year) => {
      if (dateCounts[year]) {
        acc[year] = dateCounts[year];
      } else {
        // fallback: zero for months with no data
        acc[year] = Array.from({ length: 12 }, () => 0);
      }
      return acc;
    }, {})
  ).current;

  // Update yearData when years array changes
  useEffect(() => {
    const newYearData = years.reduce((acc, year) => {
      if (dateCounts[year]) {
        acc[year] = dateCounts[year];
      } else {
        acc[year] = Array.from({ length: 12 }, () => 0);
      }
      return acc;
    }, {});

    // Update the ref
    Object.keys(newYearData).forEach((year) => {
      yearData[year] = newYearData[year];
    });
  }, [startYear, endYear, years]);

  // Utility: check if endDate is today
  function isEndDateToday() {
    const today = new Date();
    const todayUTC = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    );
    const endDateUTC = new Date(
      Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    );
    return endDateUTC.getTime() === todayUTC.getTime();
  }

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trigger = () => {
      onDateChange?.([startDate, endDate]);
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("startDate", formatDate(startDate));
      newParams.set("endDate", formatDate(endDate));
      setSearchParams(newParams);
    };

    // While dragging/moving, debounce; otherwise fire immediately
    if (isDragging || isMovingWindow) {
      console.log("debouncing date change");
      debounceRef.current = setTimeout(trigger, 1000);
    } else {
      console.log("triggering date change");
      trigger();
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [startDate, endDate, onDateChange, isDragging, isMovingWindow]);

  // Get overlay metrics (left, width) for selected range
  function getPreciseOverlayMetrics() {
    if (!preciseMode) {
      const startPos = getYearPosition(selectedRange[0]);
      const endPos = getYearPosition(selectedRange[1]);
      const yearWidth = 100 / years.length;
      return {
        left: `${startPos}%`,
        width: `${endPos - startPos + yearWidth}%`,
      };
    }

    const startYearVal = startDate.getUTCFullYear();
    const endYearVal = endDate.getUTCFullYear();
    const startMonth = startDate.getUTCMonth();
    const startDay = startDate.getUTCDate();
    const endMonth = endDate.getUTCMonth();
    const endDay = endDate.getUTCDate();

    const daysInStartMonth = new Date(
      Date.UTC(startYearVal, startMonth + 1, 0)
    ).getUTCDate();
    const dayProgressInStartMonth = (startDay - 1) / daysInStartMonth;
    const monthProgress = (startMonth + dayProgressInStartMonth) / 12;
    const startYearIndex = years.indexOf(startYearVal);
    const startPosition =
      ((startYearIndex + monthProgress) / years.length) * 100;

    const currentYear = new Date().getFullYear();
    const endYearIndex = years.indexOf(endYearVal);
    let endPosition;

    if (endYearVal === currentYear && isEndDateToday()) {
      endPosition = ((endYearIndex + 1) / years.length) * 100;
    } else {
      const daysInEndMonth = new Date(
        Date.UTC(endYearVal, endMonth + 1, 0)
      ).getUTCDate();
      const dayProgressInEndMonth = endDay / daysInEndMonth;
      const endMonthProgress = (endMonth + dayProgressInEndMonth) / 12;
      endPosition = ((endYearIndex + endMonthProgress) / years.length) * 100;
    }

    return {
      left: `${startPosition}%`,
      width: `${endPosition - startPosition}%`,
    };
  }

  // Get drag handle positions
  function getHandlePositions() {
    if (!preciseMode) {
      const startPos = getYearPosition(selectedRange[0]);
      const endPos = getYearPosition(selectedRange[1]);
      const yearWidth = 100 / years.length;
      return {
        startLeft: `${startPos}%`,
        endLeft: `${endPos + yearWidth}%`,
      };
    }

    const startYearVal = startDate.getUTCFullYear();
    const endYearVal = endDate.getUTCFullYear();
    const startMonth = startDate.getUTCMonth();
    const startDay = startDate.getUTCDate();
    const endMonth = endDate.getUTCMonth();
    const endDay = endDate.getUTCDate();

    const daysInStartMonth = new Date(
      Date.UTC(startYearVal, startMonth + 1, 0)
    ).getUTCDate();
    const dayProgressInStartMonth = (startDay - 1) / daysInStartMonth;
    const monthProgress = (startMonth + dayProgressInStartMonth) / 12;
    const startYearIndex = years.indexOf(startYearVal);
    const startPosition =
      ((startYearIndex + monthProgress) / years.length) * 100;

    const currentYear = new Date().getFullYear();
    const endYearIndex = years.indexOf(endYearVal);
    let endPosition;

    if (endYearVal === currentYear && isEndDateToday()) {
      endPosition = ((endYearIndex + 1) / years.length) * 100;
    } else {
      const daysInEndMonth = new Date(
        Date.UTC(endYearVal, endMonth + 1, 0)
      ).getUTCDate();
      const dayProgressInEndMonth = endDay / daysInEndMonth;
      const endMonthProgress = (endMonth + dayProgressInEndMonth) / 12;
      endPosition = ((endYearIndex + endMonthProgress) / years.length) * 100;
    }

    return {
      startLeft: `${startPosition}%`,
      endLeft: `${endPosition}%`,
    };
  }

  // Helper: get position % for a year
  const getYearPosition = (year) => {
    const index = years.indexOf(year);
    if (index === -1) {
      // If year is not in range, clamp it to the nearest valid year
      if (year < startYear) return 0;
      if (year > endYear) return 100;
      return 0;
    }
    return (index / years.length) * 100;
  };

  // overlay and handle positions
  const overlayMetrics = React.useMemo(
    () => getPreciseOverlayMetrics(),
    [startDate, endDate, selectedRange]
  );
  const handlePositions = React.useMemo(
    () => getHandlePositions(),
    [startDate, endDate, selectedRange]
  );

  // Scroll overlay into view when metrics change
  useEffect(() => {
    if (!scrollWrapperRef.current || !containerRef.current) return;

    const scrollEl = scrollWrapperRef.current;
    const overlayLeftPct = parseFloat(overlayMetrics.left);
    const overlayWidthPct = parseFloat(overlayMetrics.width);

    const containerWidth = containerRef.current.offsetWidth;
    const overlayLeftPx = (overlayLeftPct / 100) * containerWidth;
    const overlayWidthPx = (overlayWidthPct / 100) * containerWidth;
    const overlayCenter = overlayLeftPx + overlayWidthPx / 2;

    const targetScrollLeft = overlayCenter - scrollEl.clientWidth / 2;

    scrollEl.scrollTo({
      left: targetScrollLeft,
      behavior: "smooth",
    });
  }, [overlayMetrics, selectedRange]);

  // Dragging logic
  const handleMouseDown = (e, handle) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(handle);
    setPreciseMode(true); // Enable precise mode when dragging
    setActivePreset(null);
    setActivePresident("");
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const totalYears = years.length;
    const exactYearPosition = percentage * totalYears;

    // Calculate the exact date based on position
    const yearIndex = Math.floor(exactYearPosition);
    const yearProgress = exactYearPosition - yearIndex;
    const targetYear =
      years[Math.max(0, Math.min(yearIndex, years.length - 1))];

    // Convert year progress to month and day
    const monthProgress = yearProgress * 12;
    const month = Math.floor(monthProgress);
    const dayProgress = monthProgress - month;
    const daysInMonth = new Date(
      Date.UTC(targetYear, month + 1, 0)
    ).getUTCDate();
    const day = Math.max(1, Math.floor(dayProgress * daysInMonth) + 1);

    const newDate = new Date(Date.UTC(targetYear, month, day));

    if (isDragging === "start") {
      if (newDate <= endDate) {
        setStartDate(newDate);
        setSelectedRange([newDate.getUTCFullYear(), endDate.getUTCFullYear()]);
      }
    }

    if (isDragging === "end") {
      if (newDate >= startDate) {
        setEndDate(newDate);
        setSelectedRange([
          startDate.getUTCFullYear(),
          newDate.getUTCFullYear(),
        ]);
      }
    }
  };

  const handleWindowMove = (e) => {
    if (!isMovingWindow || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartRef.current;
    const percentageDelta = deltaX / rect.width;
    const totalYears = years.length;
    const yearDelta = percentageDelta * totalYears;

    // Calculate new start position
    const currentStartYearPos =
      years.indexOf(startDate.getUTCFullYear()) +
      (startDate.getUTCMonth() +
        (startDate.getUTCDate() - 1) /
          new Date(
            Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + 1, 0)
          ).getUTCDate()) /
        12;

    // Calculate new end position
    const currentEndYearPos =
      years.indexOf(endDate.getUTCFullYear()) +
      (endDate.getUTCMonth() +
        endDate.getUTCDate() /
          new Date(
            Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth() + 1, 0)
          ).getUTCDate()) /
        12;

    const newStartYearPos = currentStartYearPos + yearDelta;
    const newEndYearPos = currentEndYearPos + yearDelta;

    // Clamp to bounds and convert back to dates
    const clampedStartPos = Math.max(
      0,
      Math.min(newStartYearPos, totalYears - 1)
    );
    const clampedEndPos = Math.max(0, Math.min(newEndYearPos, totalYears - 1));

    // If clamped, adjust both positions to maintain window size
    let finalStartPos = clampedStartPos;
    let finalEndPos = clampedEndPos;

    if (newStartYearPos < 0) {
      finalStartPos = 0;
      finalEndPos = Math.min(
        totalYears - 1,
        currentEndYearPos - currentStartYearPos
      );
    } else if (newEndYearPos > totalYears - 1) {
      finalEndPos = totalYears - 1;
      finalStartPos = Math.max(
        0,
        totalYears - 1 - (currentEndYearPos - currentStartYearPos)
      );
    }

    // Convert positions back to dates
    function positionToDate(pos) {
      const yearIndex = Math.floor(pos);
      const yearProgress = pos - yearIndex;
      const targetYear =
        years[Math.max(0, Math.min(yearIndex, years.length - 1))];

      const monthProgress = yearProgress * 12;
      const month = Math.floor(monthProgress);
      const dayProgress = monthProgress - month;
      const daysInMonth = new Date(
        Date.UTC(targetYear, month + 1, 0)
      ).getUTCDate();
      const day = Math.max(1, Math.floor(dayProgress * daysInMonth) + 1);

      return new Date(Date.UTC(targetYear, month, day));
    }

    const newStartDate = positionToDate(finalStartPos);
    const newEndDate = positionToDate(finalEndPos);

    if (newStartDate <= newEndDate) {
      setStartDate(newStartDate);
      setEndDate(newEndDate);
      setSelectedRange([
        newStartDate.getUTCFullYear(),
        newEndDate.getUTCFullYear(),
      ]);
    }

    dragStartRef.current = e.clientX;
  };

  const handleMouseUp = () => {
    setIsDragging(null);
    setIsMovingWindow(false);
  };

  useEffect(() => {
    if (isDragging || isMovingWindow) {
      const moveHandler = isDragging ? handleMouseMove : handleWindowMove;
      document.addEventListener("mousemove", moveHandler);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", moveHandler);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isMovingWindow, selectedRange]);

  // MiniChart component
  const MiniChart = ({ data, year, isInRange }) => {
    // Ensure data is valid and has values
    const validData =
      Array.isArray(data) && data.length > 0 ? data : Array(12).fill(0);
    const maxValue = Math.max(...validData, 1); // Ensure maxValue is at least 1 to avoid division by zero
    const points = validData
      .map((value, index) => {
        const x = (index / (validData.length - 1)) * 100;
        const y = 20 + (100 - (value / maxValue) * 80);
        return `${x},${y}`;
      })
      .join(" ");

    let startPercent = 0;
    let endPercent = 100;
    let hasSelection = isInRange;

    if (preciseMode && isInRange) {
      const currentYear = new Date().getFullYear();
      if (year === startDate.getUTCFullYear()) {
        const startMonth = startDate.getUTCMonth();
        const startDay = startDate.getUTCDate();
        const daysInMonth = new Date(
          Date.UTC(year, startMonth + 1, 0)
        ).getUTCDate();
        const dayProgress = (startDay - 1) / daysInMonth;
        startPercent = ((startMonth + dayProgress) / 12) * 100;
      }

      if (year === endDate.getUTCFullYear()) {
        if (year === currentYear && isEndDateToday()) {
          endPercent = 100;
        } else {
          const endMonth = endDate.getUTCMonth();
          const endDay = endDate.getUTCDate();
          const daysInMonth = new Date(
            Date.UTC(year, endMonth + 1, 0)
          ).getUTCDate();
          const dayProgress = endDay / daysInMonth;
          endPercent = ((endMonth + dayProgress) / 12) * 100;
        }
      }
    }

    const selectedWidth = endPercent - startPercent;

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const monthIndex = Math.floor(percentage * 12);
        const clampedMonth = Math.max(0, Math.min(11, monthIndex));

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = monthNames[clampedMonth];
        const count = validData[clampedMonth];

        setTooltip({
            show: true,
            x: e.clientX,
            y: e.clientY - 10,
            content: `${monthName} ${year}: ${count} gazettes`
        });
    };

    const handleMouseLeave = () => {
        setTooltip({ show: false, x: 0, y: 0, content: '' });
    };

    return (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: 'crosshair' }}
      >
        <defs>
          <linearGradient
            id={`gradient-unselected-${year}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient
            id={`gradient-selected-${year}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.2" />
          </linearGradient>
          <clipPath id={`clip-selected-${year}`}>
            <rect x={startPercent} y="0" width={selectedWidth} height="100" />
          </clipPath>
          <clipPath id={`clip-unselected-${year}`}>
            <rect x="0" y="0" width="100" height="100" />
            <rect
              x={startPercent}
              y="0"
              width={selectedWidth}
              height="100"
              fill="black"
            />
          </clipPath>
        </defs>

        <polyline
          fill={`url(#gradient-unselected-${year})`}
          stroke="#94a3b8"
          strokeWidth="1"
          points={`0,100 ${points} 100,100`}
          clipPath={hasSelection ? `url(#clip-unselected-${year})` : undefined}
        />
        <polyline
          fill="none"
          stroke="#64748b"
          strokeWidth="1.5"
          points={points}
          clipPath={hasSelection ? `url(#clip-unselected-${year})` : undefined}
        />

        {hasSelection && (
          <>
            <polyline
              fill={`url(#gradient-selected-${year})`}
              stroke="#2563eb"
              strokeWidth="1"
              points={`0,100 ${points} 100,100`}
              clipPath={`url(#clip-selected-${year})`}
            />
            <polyline
              fill="none"
              stroke="#1d4ed8"
              strokeWidth="1.5"
              points={points}
              clipPath={`url(#clip-selected-${year})`}
            />
          </>
        )}
      </svg>
    );
  };

  // UI rendering
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-6xl mx-auto mt-6">
      {/* Presets and calendar */}
      <div className="flex gap-2 mb-6 flex-wrap sm:justify-start justify-center">
        {/* Year presets */}
        {[
          { label: "1Y", years: 1 },
          { label: "2Y", years: 2 },
          { label: "3Y", years: 3 },
          { label: "5Y", years: 5 },
          { label: "All", years: endYear - startYear + 1 },
        ].map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              if (preset.label === "All") {
                setStartDate(new Date(Date.UTC(startYear, 0, 1)));
                setEndDate(new Date());
                setSelectedRange([startYear, endYear]);
              } else {
                const today = new Date();
                const start = new Date(
                  Date.UTC(
                    today.getUTCFullYear() - preset.years,
                    today.getUTCMonth(),
                    today.getUTCDate()
                  )
                );
                setStartDate(start);
                setEndDate(today);
                setSelectedRange([
                  start.getUTCFullYear(),
                  today.getUTCFullYear(),
                ]);
              }
              setPreciseMode(true);
              setActivePreset(preset.label);
              setActivePresident("");
            }}
            className={`px-2 text-sm font-medium rounded-lg transition-colors hover:cursor-pointer ${
              activePreset === preset.label
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-800 bg-gray-700 text-gray-300 hover:cursor-pointer"
            }`}
          >
            {preset.label}
          </button>
        ))}
        {/* Presidents dropdown */}
        <select
          value={activePresident}
          onChange={(e) => {
            const selected = e.target.value;
            if (selected && presidents[selected]) {
              const { start, end } = presidents[selected];
              setStartDate(new Date(start));
              setEndDate(new Date(end));
              setSelectedRange([
                new Date(start).getUTCFullYear(),
                new Date(end).getUTCFullYear(),
              ]);
              setPreciseMode(true);
              setActivePreset(null);
              setActivePresident(selected);
            }
          }}
          className="px-4 py-2 text-sm font-medium rounded-lg
     bg-gray-700
     text-gray-300
     focus:outline-none"
        >
          {!activePresident && (
            <option value="" disabled hidden>
              President
            </option>
          )}
          {Object.entries(presidents).map(([id, data]) => (
            <option key={id} value={id}>
              {data.name}
            </option>
          ))}
        </select>
        {/* Calendar button */}
        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => {
              setTempStartDate(startDate);
              setTempEndDate(endDate);
              setCalendarOpen((o) => !o);
            }}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-3 py-2 text-sm text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors hover:cursor-pointer"
          >
            Select Range
          </button>
          {calendarOpen && (
            <div className="absolute right-0 mt-2 z-50 w-full sm:w-auto bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col">
                  <p className="text-xs text-gray-300 mb-2">From</p>
                  <DatePicker
                    selected={tempStartDate}
                    onChange={setTempStartDate}
                    inline
                    monthsShown={1}
                    minDate={new Date(startYear, 0, 1)}
                    maxDate={new Date()}
                    dayClassName={(date) => {
                      if (!tempStartDate) return "";
                      const start = tempStartDate;
                      const endOfMonth = new Date(
                        start.getFullYear(),
                        start.getMonth() + 1,
                        0
                      );
                      if (date >= start && date <= endOfMonth) {
                        return "bg-blue-500/20 rounded-none";
                      }
                      return "";
                    }}
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <p className="text-xs text-gray-300 mb-2">To</p>
                  <DatePicker
                    selected={tempEndDate}
                    onChange={setTempEndDate}
                    inline
                    monthsShown={1}
                    minDate={tempStartDate}
                    maxDate={new Date()}
                    dayClassName={(date) => {
                      if (!tempEndDate) return "";
                      const end = tempEndDate;
                      const startOfMonth = new Date(
                        end.getFullYear(),
                        end.getMonth(),
                        1
                      );
                      if (date >= startOfMonth && date <= end) {
                        return "bg-blue-500/20 rounded-none";
                      }
                      return "";
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                <button
                  onClick={() => setCalendarOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-gray-300 rounded-lg hover:cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (
                      tempStartDate &&
                      tempEndDate &&
                      tempStartDate <= tempEndDate
                    ) {
                      setStartDate(tempStartDate);
                      setEndDate(tempEndDate);
                      setSelectedRange([
                        tempStartDate.getUTCFullYear(),
                        tempEndDate.getUTCFullYear(),
                      ]);
                      setPreciseMode(true);
                      setCalendarOpen(false);
                      setActivePreset(null);
                      setActivePresident("");
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selected range display */}
        <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
          <div className="px-3 py-1.5 rounded-full text-xs bg-blue-500/10 border border-blue-500/30 text-blue-300 font-medium">
            {startDate.toISOString().split("T")[0]}
          </div>
          <span className="text-blue-300 font-medium">→</span>
          <div className="px-3 py-1.5 rounded-full text-xs bg-blue-500/10 border border-blue-500/30 text-blue-300 font-medium">
            {endDate.toISOString().split("T")[0]}
          </div>
        </div>
      </div>

      {/* Scrollable chart */}
      <div
        ref={scrollWrapperRef}
        className="overflow-x-auto overflow-y-hidden scroll-wrapper"
        style={{ paddingLeft: "8px" }}
      >
        <div
          ref={containerRef}
          className="relative bg-gray-700 mb-6"
          style={{ height: "55px", minWidth: `${years.length * 80}px` }}
        >
          <div className="flex h-full items-end">
            {years.map((year) => {
              const isInRange =
                year >= selectedRange[0] && year <= selectedRange[1];
              return (
                <div
                  key={year}
                  className={`relative transition-all duration-200 ${
                    isInRange ? "opacity-100" : "opacity-40"
                  } border-l-1 border-r-1 border-gray-500`}
                  style={{ height: "80px", flex: "1 0 0" }}
                  onClick={() => {
                    setSelectedRange([year, year]);
                    const newStartDate = new Date(Date.UTC(year, 0, 1));
                    let newEndDate;
                    const currentYear = new Date().getUTCFullYear();
                    if (year === currentYear) {
                      const today = new Date();
                      newEndDate = new Date(
                        Date.UTC(
                          today.getUTCFullYear(),
                          today.getUTCMonth(),
                          today.getUTCDate()
                        )
                      );
                    } else {
                      newEndDate = new Date(Date.UTC(year, 11, 31));
                    }

                    setStartDate(newStartDate);
                    setEndDate(newEndDate);
                    setActivePreset(null);
                    setActivePresident("");
                  }}
                >
                  <MiniChart
                    data={yearData[year] || Array(12).fill(0)}
                    year={year}
                    isInRange={isInRange}
                  />
                  <div
                    className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold ${
                      isInRange ? "text-blue-400" : "text-gray-400"
                    }`}
                  >
                    {year}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overlay */}
          <div
            className="absolute top-0 bg-blue-500/40 border-t-2 border-blue-500 transition-all duration-200"
            style={{
              left: overlayMetrics.left,
              width: overlayMetrics.width,
              height: "100%",
              pointerEvents: "none",
            }}
          />

          {/* Drag window */}
          <div
            className="absolute top-0 h-full cursor-move"
            style={{ left: overlayMetrics.left, width: overlayMetrics.width }}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsMovingWindow(true);
              setPreciseMode(true);
              dragStartRef.current = e.clientX;
            }}
          />

          {/* Drag handles */}
          <div
            className="absolute top-7 transform -translate-y-1/2 -translate-x-1/2 w-4 h-6 bg-blue-600 rounded cursor-ew-resize flex items-center justify-center shadow hover:bg-blue-700 z-20"
            style={{ left: handlePositions.startLeft }}
            onMouseDown={(e) => handleMouseDown(e, "start")}
          >
            <DragIndicatorIcon className="w-4 h-6 text-white" />
          </div>
          <div
            className="absolute top-7 transform -translate-y-1/2 -translate-x-1/2 w-4 h-6 bg-blue-600 rounded cursor-ew-resize flex items-center justify-center shadow hover:bg-blue-700 z-20"
            style={{ left: handlePositions.endLeft }}
            onMouseDown={(e) => handleMouseDown(e, "end")}
          >
            <DragIndicatorIcon className="w-4 h-6 text-white" />
          </div>
          {/* Tooltip */}
          {tooltip.show && (
                        <div
                            className="fixed bg-gray-900 text-white px-2 py-1 rounded text-xs pointer-events-none z-50"
                            style={{
                                left: tooltip.x + 10,
                                top: tooltip.y - 30,
                                transform: 'translateX(-50%)'
                            }}
                        >
                            {tooltip.content}
                        </div>
                    )}
        </div>
      </div>
    </div>
  );
}
