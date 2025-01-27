import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
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

test('renders login page when not authenticated', () => {
  render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );

  // Vérifie que la page de login est affichée
  const loginTitle = screen.getByText(/Connexion/i);
  expect(loginTitle).toBeInTheDocument();

  // Vérifie que les champs de connexion sont présents
  const emailInput = screen.getByLabelText(/Email/i);
  const passwordInput = screen.getByLabelText(/Mot de passe/i);
  const submitButton = screen.getByText(/Se connecter/i);

  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
  expect(submitButton).toBeInTheDocument();

  // Vérifie que les informations d'aide sont affichées
  const helpText = screen.getByText(/Comptes de test/i);
  expect(helpText).toBeInTheDocument();
});

