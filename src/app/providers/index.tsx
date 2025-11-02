import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ThemeProvider } from './ThemeProvider';
import { RouterProvider } from './RouterProvider';

// Komponent "awaryjny", gdyby cała aplikacja się zawiesiła
const ErrorFallback = () => <div>Wystąpił błąd aplikacji</div>;

// Ten komponent "ubiera" aplikację we wszystkie niezbędne konteksty
export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <React.Suspense fallback={<div>Ładowanie...</div>}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {/* Usuwamy <HelmetProvider> */}
        <ThemeProvider>
          {/* Dostawca routingu */}
          <RouterProvider>{children}</RouterProvider>
        </ThemeProvider>
        {/* Usuwamy </HelmetProvider> */}
      </ErrorBoundary>
    </React.Suspense>
  );
};