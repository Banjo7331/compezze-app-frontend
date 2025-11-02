import React from 'react';
import { AppProviders } from '@/app/providers';
import { Routing } from '@/pages'; // Import definicji stron

function App() {
  return (
    <AppProviders>
      {/* Routing zajmie się wyświetlaniem odpowiedniej strony */}
      <Routing />
    </AppProviders>
  );
}

export default App;