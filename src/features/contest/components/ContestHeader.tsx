import React from 'react';
import { Box, Typography, Paper, Chip, Stack, Stepper, Step, StepLabel } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import type { ContestDetailsDto } from '../model/types';

export const ContestHeader: React.FC<{ contest: ContestDetailsDto }> = ({ contest }) => {
    
    const activeStep = contest.currentStageId 
        ? contest.stages.findIndex(s => s.id === contest.currentStageId)
        : (contest.status === 'FINISHED' ? contest.stages.length : -1);

    return (
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(to right, #ffffff, #f3e5f5)' }}>
            
            {/* GÓRA: Kategorie i Status */}
            <Stack direction="row" spacing={2} mb={2}>
                <Chip label={contest.category} color="secondary" variant="outlined" size="small" />
                <Chip 
                    label={contest.status} 
                    color={contest.status === 'ACTIVE' ? 'success' : contest.status === 'DRAFT' ? 'warning' : 'default'} 
                    size="small" 
                />
                {contest.isPrivate && <Chip label="Prywatny" size="small" icon={<LockIcon fontSize="small"/>} />}
            </Stack>

            <Typography variant="h3" fontWeight="bold" gutterBottom>{contest.name}</Typography>
            
            {/* METADANE */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 3, color: 'text.secondary' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayIcon fontSize="small" />
                    <Typography variant="body2">
                        {new Date(contest.startDate).toLocaleDateString()} - {new Date(contest.endDate).toLocaleDateString()}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" />
                    <Typography variant="body2">
                        {contest.currentParticipantsCount} / {contest.participantLimit || '∞'}
                    </Typography>
                </Box>
                {contest.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon fontSize="small" />
                        <Typography variant="body2">{contest.location}</Typography>
                    </Box>
                )}
            </Stack>

            <Typography variant="body1" paragraph>{contest.description}</Typography>

            {/* TIMELINE (ETAPY) */}
            <Box sx={{ mt: 6 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {contest.stages.map((stage) => (
                        <Step key={stage.id}>
                            <StepLabel>
                                <Typography variant="caption" fontWeight="bold">{stage.type}</Typography>
                                <div>{stage.name}</div>
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>
        </Paper>
    );
};

import LockIcon from '@mui/icons-material/Lock';