import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from '@/shared/ui/Layout'; 
import { LinearProgress } from '@mui/material';

// Dynamiczne importy (lazy loading)
const HomePage = lazy(() => import('./HomePage'));
const LoginPage = lazy(() => import('./LoginPage'));
// --- NOWE TRASY ---
const SurveyPage = lazy(() => import('./survey/SurveyPage'));
const SurveyCreatePage = lazy(() => import('./survey/SurveyCreatePage'));
// Trzeba dodać placeholderowe komponenty, jeśli ich nie masz
const ContestPage = () => <div>Contest Page (TODO)</div>; 
const QuizPage = () => <div>Quiz Page (TODO)</div>;       

export const Routing = () => {
  return (
    <Suspense fallback={<LinearProgress sx={{ position: 'fixed', top: 0, width: '100%' }} />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="survey" element={<SurveyPage />} />    {/* <-- Trasa Survey */}
          {/* NOWA TRASA DO TWORZENIA ANKIETY */}
          <Route path="survey/create" element={<SurveyCreatePage />} />
          <Route path="contest" element={<ContestPage />} />  {/* <-- Trasa Contest */}
          <Route path="quiz" element={<QuizPage />} />        {/* <-- Trasa Quiz */}
        </Route>

        <Route path="/login" element={<LoginPage />} />

        <Route path="*" element={<div>404 - Strony nie znaleziono</div>} />
      </Routes>
    </Suspense>
  );
};