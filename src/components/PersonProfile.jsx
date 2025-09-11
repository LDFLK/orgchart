import { useState, useEffect } from 'react';
import { Typography, Paper, Avatar, Box, Button } from '@mui/material';
import { useSelector } from "react-redux";
import {
    Timeline,
    TimelineItem,
    TimelineOppositeContent,
    TimelineSeparator,
    TimelineDot,
    TimelineConnector,
    TimelineContent,
} from '@mui/lab';
import { useThemeContext } from '../themeContext';
import { ClipLoader } from "react-spinners";
import utils from '../utils/utils';
import api from '../services/services';
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PersonIcon from "@mui/icons-material/Person"
import personDetails from "./../assets/personImages.json";

/* ------------------- Timeline Component ------------------- */
const PersonHistoryTimeline = ({ selectedPerson, onTimelineUpdate, presidentRelationDict }) => {
    const [timelineData, setTimelineData] = useState([]);
    const [loading, setLoading] = useState(false);
    const allMinistryData = useSelector((state) => state.allMinistryData.allMinistryData);
    const { colors } = useThemeContext();

    useEffect(() => {
        const fetchPersonHistory = async () => {
            if (!selectedPerson?.id) return;
            setLoading(true);
            console.log(selectedPerson.id)
            try {
                const res = await api.getMinistriesByPerson(selectedPerson.id);
                const data = await res.json();

                const enriched = data
                    .map(d => {
                        const ministry = allMinistryData[d.relatedEntityId];
                        return {
                            ...d,
                            ministryName: ministry ? utils.extractNameFromProtobuf(ministry.name) : 'Unknown Ministry',
                            startTime: d.startTime,
                            endTime: d.endTime,
                        };
                    })
                    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

                setTimelineData(enriched);
                onTimelineUpdate?.(enriched);
            } catch (err) {
                console.error("Error fetching person history:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPersonHistory();
    }, [selectedPerson, allMinistryData, onTimelineUpdate]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "20vh" }}>
                <ClipLoader color={colors.textMuted2} loading={loading} size={25} />
            </Box>
        );
    }

    if (!timelineData.length) {
        return (
            <Typography variant="body2" sx={{ mt: 2, fontFamily: "poppins", color: colors.textPrimary }}>
                No timeline history available.
            </Typography>
        );
    }
    const isPresidentDuring = (ministryStart, ministryEnd) => {
        return Object.values(presidentRelationDict).some(rel => {
            if (rel.relatedEntityId !== selectedPerson?.id) return false;
            const presStart = new Date(rel.startTime);
            const presEnd = rel.endTime ? new Date(rel.endTime) : null;

            const mStart = new Date(ministryStart);
            const mEnd = ministryEnd ? new Date(ministryEnd) : null;

            // overlap condition
            return (!presEnd || mStart <= presEnd) && (!mEnd || mEnd >= presStart);
        });
    };

    return (
        <Box
            sx={{
                width: "100%",
                alignItems: "center",
                p: 3,
                borderRadius: 2,
                backgroundColor: colors.backgroundWhite,
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                gap: 2,
            }}
        >
            <Timeline position="alternate" sx={{ py: 0 }}>
                {timelineData.map((entry, idx, arr) => {
                    const wasPresident = isPresidentDuring(entry.startTime, entry.endTime);

                    return (
                        <TimelineItem key={idx} sx={{ py: 0.5 }}>
                            <TimelineOppositeContent
                                sx={{
                                    m: 'auto 0',
                                    color: colors.textMuted,
                                    fontWeight: '600',
                                    fontSize: 12,
                                    minWidth: 70,
                                    pr: 1,
                                    fontFamily: "poppins"
                                }}
                                align="right"
                                variant="body2"
                            >
                                {entry.startTime
                                    ? `${new Date(entry.startTime).toISOString().slice(0, 10)} - ${entry.endTime ? new Date(entry.endTime).toISOString().slice(0, 10) : 'Present'}`
                                    : 'Unknown'}
                            </TimelineOppositeContent>

                            <TimelineSeparator>
                                <TimelineDot
                                    color="primary"
                                    sx={{
                                        width: 2,
                                        height: 2,
                                        boxShadow: `0 0 6px ${colors.textMuted}`,
                                        animation: 'pulse 2.5s infinite',
                                        backgroundColor: colors.textMuted,
                                    }}
                                />
                                {idx < arr.length && (
                                    <TimelineConnector sx={{ bgcolor: colors.textMuted, height: 2 }} />
                                )}
                            </TimelineSeparator>

                            <TimelineContent sx={{ py: 0.5, px: 1 }}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        p: 1,
                                        borderRadius: 2,
                                        backgroundColor: 'background.paper',
                                        boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar sx={{ bgcolor: colors.textMuted2, width: 30, height: 30, fontSize: 14 }}>
                                            <AccountBalanceIcon />
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: '700', fontSize: 15, fontFamily: "poppins" }}>
                                                {entry.ministryName.split(":")[0]}
                                            </Typography>
                                        </Box>

                                        {wasPresident && (
                                            <Box
                                                sx={{
                                                    px: 1,
                                                    py: 0.2,
                                                    borderRadius: 1,
                                                    bgcolor: colors.textMuted,
                                                    color: "white",
                                                    fontSize: 10,
                                                    fontWeight: 600,
                                                    fontFamily: "poppins",
                                                }}
                                            >
                                                President
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>
                            </TimelineContent>
                        </TimelineItem>
                    );
                })}
            </Timeline>
        </Box>
    );
};

/* ------------------- Profile Component ------------------- */
const PersonProfile = ({ selectedPerson }) => {
    const { colors } = useThemeContext();
    const [activeTab, setActiveTab] = useState("history");
    const [timelineData, setTimelineData] = useState([]);
    const presidentRelationDict = useSelector(
        (state) => state.presidency.presidentRelationDict
    );

    const workedMinistries = timelineData.length || 0;
    const workedAsPresident = Object.values(presidentRelationDict).filter(
        (rel) => rel.relatedEntityId === selectedPerson?.id
    ).length;

    const personName = utils.extractNameFromProtobuf(selectedPerson?.name || "Unknown");

    const matchingPresident = personDetails.find(
        (p) => p.presidentName === personName
    );
    const imageUrl = matchingPresident ? matchingPresident.imageUrl : null;

    const tabOptions = ["history", "statistics"];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 6, backgroundColor: colors.backgroundPrimary, mt: -5 }}>
            {/* --- Person Card --- */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", mb: 3 }}>
                <Typography
                    variant="h6"
                    sx={{ fontFamily: "Poppins", fontWeight: 600, color: colors.textPrimary, mb: 2 }}
                >
                    Profile
                </Typography>

                <Box
                    sx={{
                        width: "100%",
                        maxWidth: 500,
                        display: "flex",
                        flexDirection: "row", 
                        alignItems: "center",
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: colors.backgroundWhite,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        gap: 2,
                        
                    }}
                >
                    {/* Avatar */}
                    <Avatar
                        src={imageUrl}
                        alt={selectedPerson?.name}
                        sx={{ width: 100, height: 100, bgcolor: colors.textMuted2, fontSize: 24 }}
                    >
                        {personName.charAt(0).toUpperCase() || "?"}
                    </Avatar>

                    {/* Info stacked in 3 rows */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
                        <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, color: colors.textPrimary }}>
                            {utils.extractNameFromProtobuf(selectedPerson?.name || "Unknown")}
                        </Typography>

                        {/* Worked Ministries */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                            <Typography sx={{ display: "flex", alignItems: "center", gap: 1, fontFamily: "Poppins", fontWeight: 500, color: colors.textMuted }}>
                                <AccountBalanceIcon sx={{ fontSize: 18, color: colors.textMuted }} />
                                Worked Ministries
                            </Typography>
                            <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, color: colors.textPrimary }}>
                                {workedMinistries}
                            </Typography>
                        </Box>

                        {/* Worked as President */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                            <Typography sx={{ display: "flex", alignItems: "center", gap: 1, fontFamily: "Poppins", fontWeight: 500, color: colors.textMuted }}>
                                <PersonIcon sx={{ fontSize: 18, color: colors.textMuted }} />
                                Worked as President
                            </Typography>
                            <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, color: colors.textPrimary }}>
                                {workedAsPresident}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* --- Tabs (Elliptical Buttons) --- */}
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                {tabOptions.map((tab) => {
                    const label = tab.charAt(0).toUpperCase() + tab.slice(1);
                    const isActive = activeTab === tab;

                    return (
                        <Button
                            key={tab}
                            variant={isActive ? "contained" : "outlined"}
                            onClick={() => setActiveTab(tab)}
                            sx={{
                                textTransform: "none",
                                borderRadius: "50px",
                                px: 3,
                                py: 0.8,
                                fontFamily: "poppins",
                                color: isActive ? colors.backgroundPrimary : `${colors.textPrimary}`,
                                backgroundColor: isActive ? `${colors.textPrimary}` : "transparent",
                                borderColor: `${colors.textPrimary}`,
                                "&:hover": {
                                    backgroundColor: isActive ? `${colors.textPrimary}` : `${colors.primary}10`,
                                },
                            }}
                        >
                            {label}
                        </Button>
                    );
                })}
            </Box>

            {/* --- Tab Panels --- */}
            {activeTab === "history" && (
                <Box sx={{ mt: 2 }}>
                    <PersonHistoryTimeline selectedPerson={selectedPerson} onTimelineUpdate={setTimelineData} presidentRelationDict={presidentRelationDict} />
                </Box>
            )}
            {activeTab === "statistics" && (
                <Box sx={{ mt: 2 }}>
                    <Typography sx={{ color: colors.textMuted }}>coming soon...</Typography>
                </Box>
            )}
        </Box>
    );
};

export default PersonProfile;

