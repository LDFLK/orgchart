import React, { useState, useRef, useEffect } from "react";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function YearRangeSelector({
    startYear = 2019,
    dates = ["2010-09-23T00:00:00Z",
        "2024-09-23T00:00:00Z", "2024-09-25T00:00:00Z", "2024-09-25T00:00:00Z",
        "2024-11-18T00:00:00Z", "2024-11-18T00:00:00Z", "2024-09-27T00:00:00Z",
        "2024-11-25T00:00:00Z", "2024-09-23T00:00:00Z", "2022-07-20T00:00:00Z",
        "2022-07-26T00:00:00Z", "2022-08-04T00:00:00Z", "2022-11-04T00:00:00Z",
        "2023-01-19T00:00:00Z", "2023-10-12T00:00:00Z", "2023-10-23T00:00:00Z",
        "2023-12-01T00:00:00Z", "2022-07-22T00:00:00Z", "2022-09-16T00:00:00Z",
        "2022-10-05T00:00:00Z", "2022-10-26T00:00:00Z", "2022-12-22T00:00:00Z",
        "2023-01-19T00:00:00Z", "2023-04-27T00:00:00Z", "2023-05-30T00:00:00Z",
        "2023-07-31T00:00:00Z", "2023-10-23T00:00:00Z", "2023-10-23T00:00:00Z",
        "2023-12-22T00:00:00Z", "2024-02-27T00:00:00Z", "2024-08-23T00:00:00Z",
        "2024-08-23T00:00:00Z", "2025-08-23T00:00:00Z"
    ],
    latestPresStartDate = new Date(Date.UTC(2024, 8, 23)),
    onDateChange,
}) {

    const endYear = new Date().getFullYear();
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

    // Ensure selectedRange is within valid bounds
    const initialStartYear = Math.max(startYear, latestPresStartDate.getFullYear());
    const initialEndYear = Math.min(endYear, new Date().getFullYear());

    const [selectedRange, setSelectedRange] = useState([initialStartYear, initialEndYear]);
    const [startDate, setStartDate] = useState(latestPresStartDate);
    const [endDate, setEndDate] = useState(new Date());
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(null);
    const [isMovingWindow, setIsMovingWindow] = useState(false);
    const [tempStartDate, setTempStartDate] = useState(startDate);
    const [tempEndDate, setTempEndDate] = useState(endDate);
    const [preciseMode, setPreciseMode] = useState(true);

    const containerRef = useRef(null);
    const dragStartRef = useRef(null);
    const scrollWrapperRef = useRef(null);

    useEffect(() => {
        const latestYear = latestPresStartDate.getFullYear();
        const validStartYear = Math.max(startYear, latestYear);
        const validEndYear = Math.min(endYear, new Date().getFullYear());

        setStartDate(latestPresStartDate);
        setSelectedRange([validStartYear, validEndYear]);
        setTempStartDate(latestPresStartDate);
    }, [latestPresStartDate, endYear, startYear]);

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
    React.useEffect(() => {
        const newYearData = years.reduce((acc, year) => {
            if (dateCounts[year]) {
                acc[year] = dateCounts[year];
            } else {
                acc[year] = Array.from({ length: 12 }, () => 0);
            }
            return acc;
        }, {});

        // Update the ref
        Object.keys(newYearData).forEach(year => {
            yearData[year] = newYearData[year];
        });
    }, [startYear, endYear, years]);

    // Utility: check if endDate is today
    function isEndDateToday() {
        const today = new Date();
        const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
        const endDateUTC = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()));
        return endDateUTC.getTime() === todayUTC.getTime();
    }

    useEffect(() => {
        onDateChange?.([startDate, endDate]);
    }, [startDate, endDate, onDateChange]);

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

        const daysInStartMonth = new Date(Date.UTC(startYearVal, startMonth + 1, 0)).getUTCDate();
        const dayProgressInStartMonth = (startDay - 1) / daysInStartMonth;
        const monthProgress = (startMonth + dayProgressInStartMonth) / 12;
        const startYearIndex = years.indexOf(startYearVal);
        const startPosition = (startYearIndex + monthProgress) / years.length * 100;

        const currentYear = new Date().getFullYear();
        const endYearIndex = years.indexOf(endYearVal);
        let endPosition;

        if (endYearVal === currentYear && isEndDateToday()) {
            endPosition = (endYearIndex + 1) / years.length * 100;
        } else {
            const daysInEndMonth = new Date(Date.UTC(endYearVal, endMonth + 1, 0)).getUTCDate();
            const dayProgressInEndMonth = endDay / daysInEndMonth;
            const endMonthProgress = (endMonth + dayProgressInEndMonth) / 12;
            endPosition = (endYearIndex + endMonthProgress) / years.length * 100;
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

        const daysInStartMonth = new Date(Date.UTC(startYearVal, startMonth + 1, 0)).getUTCDate();
        const dayProgressInStartMonth = (startDay - 1) / daysInStartMonth;
        const monthProgress = (startMonth + dayProgressInStartMonth) / 12;
        const startYearIndex = years.indexOf(startYearVal);
        const startPosition = (startYearIndex + monthProgress) / years.length * 100;

        const currentYear = new Date().getFullYear();
        const endYearIndex = years.indexOf(endYearVal);
        let endPosition;

        if (endYearVal === currentYear && isEndDateToday()) {
            endPosition = (endYearIndex + 1) / years.length * 100;
        } else {
            const daysInEndMonth = new Date(Date.UTC(endYearVal, endMonth + 1, 0)).getUTCDate();
            const dayProgressInEndMonth = endDay / daysInEndMonth;
            const endMonthProgress = (endMonth + dayProgressInEndMonth) / 12;
            endPosition = (endYearIndex + endMonthProgress) / years.length * 100;
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
    const overlayMetrics = React.useMemo(() => getPreciseOverlayMetrics(), [startDate, endDate, selectedRange]);
    const handlePositions = React.useMemo(() => getHandlePositions(), [startDate, endDate, selectedRange]);

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

    const updateDatesFromRange = (range) => {
        const [startYearVal, endYearVal] = range;

        // Start date is always Jan 1 of start year
        const newStartDate = new Date(Date.UTC(startYearVal, 0, 1));

        // End date: if current year, use today; otherwise, use Dec 31
        const today = new Date();
        const currentYear = today.getUTCFullYear();
        let newEndDate;
        if (endYearVal === currentYear) {
            newEndDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
        } else {
            newEndDate = new Date(Date.UTC(endYearVal, 11, 31));
        }

        setStartDate(newStartDate);
        setEndDate(newEndDate);
    };


    // Dragging logic
    const handleMouseDown = (e, handle) => {
        e.stopPropagation();
        e.preventDefault();
        setIsDragging(handle);
        setPreciseMode(false);
    };

    // const yearWidth = React.useMemo(() => {
    //     return Math.max(80, Math.min(150, 800 / years.length)); // Min 80px, max 150px, or proportional
    // }, [years.length]);
    const handleMouseMove = (e) => {
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const yearWidth = rect.width / years.length;
        const yearIndex = Math.round(x / yearWidth);
        const year = years[Math.max(0, Math.min(yearIndex, years.length - 1))];

        if (isDragging === "start") {
            const newRange = [Math.min(year, selectedRange[1]), selectedRange[1]];
            // Ensure the range is within valid bounds
            if (newRange[0] >= startYear && newRange[0] <= endYear) {
                setSelectedRange(newRange);
                updateDatesFromRange(newRange);
            }
        }

        if (isDragging === "end") {
            const newRange = [selectedRange[0], Math.max(year, selectedRange[0])];
            // Ensure the range is within valid bounds
            if (newRange[1] >= startYear && newRange[1] <= endYear) {
                setSelectedRange(newRange);
                updateDatesFromRange(newRange);
            }
        }
    };

    const handleWindowMove = (e) => {
        if (!isMovingWindow || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const deltaX = e.clientX - dragStartRef.current;
        const yearWidth = rect.width / years.length;
        const deltaYears = Math.round(deltaX / yearWidth);

        let newStart = selectedRange[0] + deltaYears;
        let newEnd = selectedRange[1] + deltaYears;

        // Clamp to available years
        if (newStart < startYear) {
            const diff = startYear - newStart;
            newEnd = Math.min(endYear, selectedRange[1] + diff);
            newStart = startYear;
        }
        if (newEnd > endYear) {
            const diff = newEnd - endYear;
            newStart = Math.max(startYear, selectedRange[0] - diff);
            newEnd = endYear;
        }

        // Ensure we don't have an invalid range
        if (newStart <= newEnd && newStart >= startYear && newEnd <= endYear) {
            const newRange = [newStart, newEnd];
            setSelectedRange(newRange);
            updateDatesFromRange(newRange);
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
        const validData = Array.isArray(data) && data.length > 0 ? data : Array(12).fill(0);
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
                const daysInMonth = new Date(Date.UTC(year, startMonth + 1, 0)).getUTCDate();
                const dayProgress = (startDay - 1) / daysInMonth;
                startPercent = ((startMonth + dayProgress) / 12) * 100;
            }

            if (year === endDate.getUTCFullYear()) {
                if (year === currentYear && isEndDateToday()) {
                    endPercent = 100;
                } else {
                    const endMonth = endDate.getUTCMonth();
                    const endDay = endDate.getUTCDate();
                    const daysInMonth = new Date(Date.UTC(year, endMonth + 1, 0)).getUTCDate();
                    const dayProgress = endDay / daysInMonth;
                    endPercent = ((endMonth + dayProgress) / 12) * 100;
                }
            }
        }

        const selectedWidth = endPercent - startPercent;

        return (
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <linearGradient id={`gradient-unselected-${year}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id={`gradient-selected-${year}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.2" />
                    </linearGradient>
                    <clipPath id={`clip-selected-${year}`}>
                        <rect x={startPercent} y="0" width={selectedWidth} height="100" />
                    </clipPath>
                    <clipPath id={`clip-unselected-${year}`}>
                        <rect x="0" y="0" width="100" height="100" />
                        <rect x={startPercent} y="0" width={selectedWidth} height="100" fill="black" />
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-6xl mx-auto">
            {/* Presets and calendar */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {[{ label: "1Y", years: 1 }, { label: "2Y", years: 2 }, { label: "3Y", years: 3 }, { label: "5Y", years: 5 }, { label: "All", years: endYear - startYear + 1 }].map((preset) => (
                    <button
                        key={preset.label}
                        onClick={preset.label === "All" ? () => { setStartDate(new Date(Date.UTC(startYear, 0, 1))); setEndDate(new Date()); setSelectedRange([startYear, endYear]); setPreciseMode(true) } : () => {
                            const today = new Date();
                            const start = new Date(Date.UTC(today.getUTCFullYear() - preset.years, today.getUTCMonth(), today.getUTCDate()));
                            setStartDate(start); setEndDate(today); setSelectedRange([start.getUTCFullYear(), today.getUTCFullYear()]); setPreciseMode(true)
                        }}
                        className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                    >
                        {preset.label}
                    </button>
                ))}

                {/* Calendar button */}
                <div className="ml-auto relative">
                    <button
                        onClick={() => { setTempStartDate(startDate); setTempEndDate(endDate); setCalendarOpen(o => !o) }}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        📅 Date Range
                    </button>
                    {calendarOpen && (
                        <div className="absolute right-0 mt-2 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col">
                            <div className="flex gap-4">
                                <div className="flex-1 flex flex-col">
                                    <p className="text-xs text-gray-500 mb-2">From</p>
                                    <DatePicker selected={tempStartDate} onChange={setTempStartDate} inline monthsShown={1} minDate={new Date(startYear, 0, 1)} maxDate={new Date()} />
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <p className="text-xs text-gray-500 mb-2">To</p>
                                    <DatePicker selected={tempEndDate} onChange={setTempEndDate} inline monthsShown={1} minDate={tempStartDate} maxDate={new Date()} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={() => setCalendarOpen(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">Cancel</button>
                                <button onClick={() => { if (tempStartDate && tempEndDate && tempStartDate <= tempEndDate) { setStartDate(tempStartDate); setEndDate(tempEndDate); setSelectedRange([tempStartDate.getUTCFullYear(), tempEndDate.getUTCFullYear()]); setPreciseMode(true); setCalendarOpen(false) } }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Apply</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Scrollable chart */}
            <div
                ref={scrollWrapperRef}
                className="overflow-x-auto overflow-y-hidden scroll-wrapper"
                style={{ paddingLeft: "24px", paddingRight: "24px" }}
            >

                <div ref={containerRef} className="relative bg-gray-50 dark:bg-gray-700 mb-6" style={{ height: "70px", minWidth: `${years.length * 80}px` }}>
                    <div className="flex h-full items-end">
                        {years.map(year => {
                            const isInRange = year >= selectedRange[0] && year <= selectedRange[1];
                            return (
                                <div
                                    key={year}
                                    className={`relative transition-all duration-200 ${isInRange ? "opacity-100" : "opacity-40"} border-l-1 border-r-1 border-gray-500`}
                                    style={{ height: "80px", flex: "1 0 0" }}
                                    onClick={() => {
                                        setSelectedRange([year, year]);
                                        const newStartDate = new Date(Date.UTC(year, 0, 1));
                                        let newEndDate;
                                        const currentYear = new Date().getUTCFullYear();
                                        if (year === currentYear) {
                                            const today = new Date();
                                            newEndDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
                                        } else {
                                            newEndDate = new Date(Date.UTC(year, 11, 31));
                                        }

                                        setStartDate(newStartDate);
                                        setEndDate(newEndDate);
                                    }}
                                >
                                    <MiniChart data={yearData[year] || Array(12).fill(0)} year={year} isInRange={isInRange} />
                                    <div className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold ${isInRange ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}>{year}</div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Overlay */}
                    <div className="absolute top-0 bg-blue-500/40 border-t-2 border-blue-500 transition-all duration-200" style={{ left: overlayMetrics.left, width: overlayMetrics.width, height: "100%", pointerEvents: "none" }} />

                    {/* Drag window */}
                    <div className="absolute top-0 h-full cursor-move" style={{ left: overlayMetrics.left, width: overlayMetrics.width }} onMouseDown={e => { e.preventDefault(); setIsMovingWindow(true); setPreciseMode(false); dragStartRef.current = e.clientX }} />

                    {/* Drag handles */}
                    <div className="absolute top-9 transform -translate-y-1/2 -translate-x-1/2 w-4 h-6 bg-blue-600 rounded cursor-ew-resize flex items-center justify-center shadow hover:bg-blue-700 z-20" style={{ left: handlePositions.startLeft }} onMouseDown={e => handleMouseDown(e, "start")}><DragIndicatorIcon className="w-4 h-6 text-white" /></div>
                    <div className="absolute top-9 transform -translate-y-1/2 -translate-x-1/2 w-4 h-6 bg-blue-600 rounded cursor-ew-resize flex items-center justify-center shadow hover:bg-blue-700 z-20" style={{ left: handlePositions.endLeft }} onMouseDown={e => handleMouseDown(e, "end")}><DragIndicatorIcon className="w-4 h-6 text-white" /></div>

                </div>
            </div>

            {/* Selected range display */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Start Date</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{startDate.toISOString().split("T")[0]}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">End Date</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{endDate.toISOString().split("T")[0]}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
