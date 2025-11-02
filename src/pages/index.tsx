import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from '@/shared/ui/Layout'; // Import ogólnego layoutu

// Dynamiczne importy (lazy loading)
// Strony załadują się tylko wtedy, gdy użytkownik na nie wejdzie
const HomePage = lazy(() => import('./HomePage'));
const LoginPage = lazy(() => import('./LoginPage'));

export const Routing = () => {
  return (
    <Routes>
      {/* Definiujemy trasy, które używają wspólnego Layoutu */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        {/* Tutaj dodasz inne strony, np. profilu, ustawień */}
      </Route>

      {/* Trasa dla logowania (zazwyczaj ma inny, prostszy layout) */}
      <Route path="/login" element={<LoginPage />} />

      {/* Domyślna trasa dla nieznalezionych stron */}
      <Route path="*" element={<div>404 - Strony nie znaleziono</div>} />
    </Routes>
  );
};