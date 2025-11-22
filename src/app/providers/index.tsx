import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ThemeProvider } from './ThemeProvider';
import { RouterProvider } from './RouterProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// === NOWY IMPORT ===
import { AuthProvider } from '@/features/auth/AuthContext'; 

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
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
        <QueryClientProvider client={queryClient}>
          {/* KLUCZOWA ZMIANA: Wstawienie AuthProvider */}
          <AuthProvider> 
            <ThemeProvider>
              <RouterProvider>{children}</RouterProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};