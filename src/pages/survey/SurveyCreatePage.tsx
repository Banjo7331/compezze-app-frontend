import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Importujemy Formularz z folderu features!
import { SurveyCreateForm } from '@/features/survey/components/SurveyCreateForm'; 

const SurveyCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/survey');
  };

  const handleSuccess = () => {
    // Po udanym zapisie, przejdź do strony ankiet
    navigate('/survey');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Create New Survey
        </Typography>
        
        {/* Renderowanie Komponentu Formularza */}
        <SurveyCreateForm 
            onCancel={handleCancel} 
            onSuccess={handleSuccess} 
        />
        
      </Box>
    </Container>
  );
};

export default SurveyCreatePage;