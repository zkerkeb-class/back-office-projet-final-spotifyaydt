import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Mock useOfflineMode hook
jest.mock('./hooks/useOfflineMode', () => ({
  useOfflineMode: () => ({
    isOnline: true,
    db: null,
    syncData: jest.fn()
  })
}));

test('renders spotify admin title', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  const titleElement = screen.getByText(/Spotify Admin/i);
  expect(titleElement).toBeInTheDocument();
});

