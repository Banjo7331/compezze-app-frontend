// src/pages/SurveyPage.tsx

import React from 'react';
import { 
    Typography, 
    Container, 
    Box, 
    Paper, 
    Divider,
    Grid, // <-- Standardowy import z MUI Material
} from '@mui/material';
import type { ButtonProps } from '@mui/material'; 
import AddIcon from '@mui/icons-material/Add';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { Button } from '@/shared/ui/Button'; 
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom'; 


// Przykładowy komponent kafelka ankiety
interface SurveyData {
    id: number;
    title: string;
    isLive: boolean;
}

const SurveyItem: React.FC<SurveyData> = ({ title, isLive }) => (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        mb: 1.5, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderLeft: `5px solid ${isLive ? 'green' : 'gray'}`,
      }}
    >
      <Typography variant="body1" sx={{ fontWeight: isLive ? 'bold' : 'normal' }}>
        {title}
      </Typography>
      <Button 
        size="small" 
        variant="contained" 
        color={isLive ? "success" : "secondary"}
        sx={{ ml: 2 }}
      >
        {isLive ? 'Dołącz' : 'Zobacz Wyniki'}
      </Button>
    </Paper>
);

// JAWNE ZRZUTOWANIE NA 'any'
// Omija to błąd 'No overload matches this call', który wynika z konfliktu definicji typów Grid w środowisku.
const AnyGrid = Grid as any;


const SurveyPage: React.FC = () => {
    // Przykładowe dane
    const liveSurveys: SurveyData[] = [
        { id: 1, title: 'Ankieta Satysfakcji Zespołu Q4', isLive: true },
        { id: 2, title: 'Wybór nowej funkcjonalności v2.0', isLive: true },
        { id: 3, title: 'Planowanie urlopów 2026', isLive: false },
    ];

    const LinkButton = Button as React.ComponentType<ButtonProps & Pick<LinkProps, 'to'>>;

    return (
        <Container maxWidth="lg">
            <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 5 }}>
                Zarządzanie Ankietami
            </Typography>

            {/* Używamy AnyGrid, aby pominąć błąd typowania */}
            <AnyGrid container spacing={4}>
                {/* 1. SEKCJA: Utwórz Nową Ankietę (CREATE YOUR SURVEY) */}
                <AnyGrid item xs={12} md={5}>
                    <Paper 
                        elevation={6} 
                        sx={{ 
                            p: 4, 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            backgroundColor: '#e3f2fd',
                            borderRadius: 2
                        }}
                    >
                        <AddIcon sx={{ fontSize: 90, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h4" component="h2" align="center" sx={{ mb: 1 }}>
                            **Create Your Survey**
                        </Typography>
                        <Typography variant="body1" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
                            Zaprojektuj i uruchom własny kwestionariusz lub ankietę.
                        </Typography>
                        <LinkButton 
                            variant="contained"
                            size="large"
                            startIcon={<AddIcon />}
                            component={Link}
                            to="/survey/create"
                        >
                            UTWÓRZ NOWĄ
                        </LinkButton>
                    </Paper>
                </AnyGrid>

                {/* 2. SEKCJA: Dołącz do Trwających (OR JOIN FROM THE LIVE ONES) */}
                <AnyGrid item xs={12} md={7}>
                    <Paper elevation={3} sx={{ p: 4, height: '100%', backgroundColor: '#f9f9f9', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <ListAltIcon sx={{ mr: 1, fontSize: 30, color: 'text.primary' }} />
                            <Typography variant="h5" component="h2">
                                or **join from the live ones**
                            </Typography>
                        </Box>
                        
                        <Divider sx={{ mb: 3 }} />

                        {/* Lista aktywnych ankiet */}
                        {liveSurveys.map((survey) => (
                            <SurveyItem key={survey.id} {...survey} />
                        ))}

                        {liveSurveys.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 5 }}>
                                <Typography color="text.secondary">Brak aktywnych ankiet do dołączenia.</Typography>
                            </Box>
                        )}
                    </Paper>
                </AnyGrid>
            </AnyGrid>
        </Container>
    );
};

export default SurveyPage;