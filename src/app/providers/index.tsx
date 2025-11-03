import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ThemeProvider } from './ThemeProvider';
import { RouterProvider } from './RouterProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Wygodna opcja developerska
    },
  },
});

// Komponent "awaryjny", gdyby cała aplikacja się zawiesiła
const ErrorFallback = () => <div>Wystąpił błąd aplikacji</div>;

// Ten komponent "ubiera" aplikację we wszystkie niezbędne konteksty
export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <React.Suspense fallback={<div>Ładowanie...</div>}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {/* 3. Dodaj Providera */}
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <RouterProvider>{children}</RouterProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};