import React from 'react';
import { Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Importujemy formularz z warstwy Features
import { ContestCreateForm } from '@/features/contest/components/ContestCreateForm';

const ContestCreatePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md">
            <Box sx={{ py: 4 }}>
                <ContestCreateForm 
                    onCancel={() => navigate('/contest')} 
                    onSuccess={() => navigate('/profile')} // Po sukcesie idziemy do profilu
                />
            </Box>
        </Container>
    );
};

export default ContestCreatePage;