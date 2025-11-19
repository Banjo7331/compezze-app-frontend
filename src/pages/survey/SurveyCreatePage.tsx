import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { SurveyCreateForm } from '@/features/survey/components/SurveyCreateForm'; 
// Nie potrzebujemy innych importów API, bo cała logika jest w komponencie niżej

const SurveyCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    // Wróć do strony głównej Survey
    navigate('/survey');
  };

  const handleFormCreated = () => {
    // KROK: Po utworzeniu FORMULARZA, po prostu wracamy do listy formularzy.
    navigate('/survey'); 
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Utwórz Nową Ankietę
        </Typography>
        
        {/* Renderujemy Formularz, który wykona całą pracę */}
        <SurveyCreateForm 
            onCancel={handleCancel} 
            onSuccess={handleFormCreated} // Wywołuje przekierowanie
        />
        
      </Box>
    </Container>
  );
};

export default SurveyCreatePage;