import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from '@/shared/ui/Layout'; 
import { LinearProgress } from '@mui/material';

// Dynamiczne importy (lazy loading)
const HomePage = lazy(() => import('./HomePage'));
const LoginPage = lazy(() => import('./auth/LoginPage'));
const RegisterPage = lazy(() => import('./auth/RegisterPage'));
// --- Trasy Survey ---
const SurveyPage = lazy(() => import('./survey/SurveyPage'));
const SurveyCreatePage = lazy(() => import('./survey/SurveyCreatePage'));
// NOWE: Strony Pokoju
const SurveyRoomPage = lazy(() => import('./survey/SurveyRoomPage'));
const SurveyParticipantPage = lazy(() => import('./survey/SurveyParticipantPage'));

// Placeholderowe komponenty dla innych sekcji
const ContestPage = () => <div>Contest Page (TODO)</div>; 
const QuizPage = () => <div>Quiz Page (TODO)</div>;       

export const Routing = () => {
  return (
    <Suspense fallback={<LinearProgress sx={{ position: 'fixed', top: 0, width: '100%' }} />}>
      <Routes>
        {/* ==================================================== */}
        {/* 1. TRASY WYMAGAJĄCE GŁÓWNEGO LAYOUTU (Host/Auth User) */}
        {/* ==================================================== */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          
          {/* Trasy Ankiet */}
          <Route path="survey">
            {/* /survey - Lista główna */}
            <Route index element={<SurveyPage />} />
            
            {/* /survey/create - Kreator */}
            <Route path="create" element={<SurveyCreatePage />} />
            
            {/* /survey/room/:id - Główny widok pokoju (Host/Participant) */}
            <Route path="room/:roomId" element={<SurveyRoomPage />} />
            
            {/* /survey/join/:id - Alias dla uczestników (ładniejszy URL) */}
            {/* To nadal renderuje ten sam SurveyRoomPage! */}
            <Route path="join/:roomId" element={<SurveyRoomPage />} />
          </Route>

          {/* Inne trasy */}
          <Route path="contest" element={<ContestPage />} /> 
          <Route path="quiz" element={<QuizPage />} />
        </Route>

        {/* ==================================================== */}
        {/* 2. TRASY BEZ LAYOUTU (Logowanie, Uczestnik Ankiety) */}
        {/* ==================================================== */}
        
        {/* Logowanie */}
        <Route path="/login" element={<LoginPage />} />

        {/* 2. REJESTRUJEMY TRASĘ TUTAJ */}
        <Route path="/register" element={<RegisterPage />} />

        {/* 404 */}
        <Route path="*" element={<div>404 - Strony nie znaleziono</div>} />
      </Routes>
    </Suspense>
  );
};