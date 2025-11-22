import React from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Grid, 
    Divider, 
    Alert, 
    Card, 
    CardContent,
    Stack
} from '@mui/material';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell 
} from 'recharts';
import { useSurveyRoomSocket } from '../hooks/useSurveyRoomSocket'; 
import type { QuestionResultDto } from '../model/socket.types'; 
import type { QuestionType as RestQuestionType } from '../model/types'; 

// --- STAŁE (bez zmian) ---
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

// --- KOMPONENT WIZUALIZACJI PYTANIA (bez zmian) ---
interface ChartData {
    name: string;
    count: number;
}
interface QuestionVizProps {
    result: QuestionResultDto;
}
const QuestionVisualization: React.FC<QuestionVizProps> = ({ result }) => {
    // ... (Logika renderowania wykresów bez zmian)
    const chartData: ChartData[] = Object.entries(result.answerCounts).map(([option, count]) => ({
        name: option,
        count: count,
    }));
    const questionType = result.type as RestQuestionType; 

    // 1. WYKRES SŁUPKOWY
    if (questionType !== 'OPEN_TEXT') {
        chartData.sort((a, b) => b.count - a.count);
        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} angle={-15} textAnchor="end" height={50} />
                    <YAxis allowDecimals={false} label={{ value: 'Submissions', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value: number) => [value, 'Votes']} />
                    <Bar dataKey="count" fill="#8884d8" minPointSize={5}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        );
    } 
    
    // 2. WIDOK LISTY
    return (
        <Box sx={{ maxHeight: 250, overflowY: 'auto', p: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Open Answers ({result.openAnswers.length}):</Typography>
            <Stack spacing={1}>
                {result.openAnswers.map((answer, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 1, backgroundColor: '#f5f5f5' }}>
                        <Typography variant="body2">{answer}</Typography>
                    </Paper>
                ))}
            </Stack>
            {result.openAnswers.length === 0 && (
                <Typography variant="body2" color="text.secondary">No text answers submitted yet.</Typography>
            )}
        </Box>
    );
};


// --- GŁÓWNY KOMPONENT DASHBOARDU ---
interface LiveResultSurveyDashboardProps {
    roomId: string;
    isHost: boolean; 
    isParticipantSubmitted?: boolean; 
}

export const LiveResultSurveyDashboard: React.FC<LiveResultSurveyDashboardProps> = ({ 
    roomId, 
    isHost,
    isParticipantSubmitted = false
}) => {
    const { liveResults, participantCount, isRoomOpen } = useSurveyRoomSocket(roomId);
    
    // 1. Oczekiwanie na dane
    if (!liveResults) {
        return <Alert severity="info">Waiting for real-time data or the first submission...</Alert>;
    }
    
    // 2. Walidacja dla UCZESTNIKA (bez zmian)
    const isAccessDenied = !isHost && !isParticipantSubmitted && isRoomOpen && liveResults.totalSubmissions === 0;

    if (isAccessDenied) {
        return (
            <Alert severity="info">
                The survey is live! Submit your answers to view the aggregate results in real-time.
            </Alert>
        );
    }
    
    // 3. Render Dashboardu
    const displayResults = liveResults.results;

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Live Results Summary
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
                <Typography variant="body1">Total Participants: **{participantCount}**</Typography>
                <Typography variant="body1">Total Submissions: **{liveResults.totalSubmissions}**</Typography>
            </Stack>

            <Grid container spacing={4}>
                {displayResults.map((result, index) => (
                    // FIX: Używamy składni size={{ ... }}
                    <Grid key={result.questionId} size={{ xs: 12, md: 6 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Q{index + 1}: {result.title}
                                </Typography>
                                <QuestionVisualization result={result} />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            
            {displayResults.length === 0 && (
                <Alert severity="info" sx={{ mt: 3 }}>No results received yet.</Alert>
            )}
        </Box>
    );
};