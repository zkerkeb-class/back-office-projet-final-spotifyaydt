import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import App from './App';

// Mock useOfflineMode hook
jest.mock('./hooks/useOfflineMode', () => ({
  useOfflineMode: () => ({
    isOnline: true,
    db: null,
    syncData: jest.fn()
  })
}));

// Initialize i18n for tests
i18n.use(initReactI18next).init({
  lng: 'fr',
  fallbackLng: 'fr',
  ns: ['translations'],
  defaultNS: 'translations',
  resources: {
    fr: {
      translations: {
        'nav': {
          'admin': 'Administration'
        }
      }
    }
  }
});

const queryClient = new QueryClient();

// Mock window.matchMedia for theme context
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

test('renders spotify admin title', () => {
  render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <App RouterComponent={MemoryRouter} />
      </ThemeProvider>
    </QueryClientProvider>
  );
  
  const titleElement = screen.getByText(/Spotify/i);
  expect(titleElement).toBeInTheDocument();
  
  const adminText = screen.getByText(/Administration/i);
  expect(adminText).toBeInTheDocument();
});

