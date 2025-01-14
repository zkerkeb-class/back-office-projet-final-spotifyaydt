// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock IndexedDB
const indexedDB = {
  open: jest.fn().mockReturnValue({
    result: {
      createObjectStore: jest.fn(),
      transaction: jest.fn().mockReturnValue({
        objectStore: jest.fn().mockReturnValue({
          put: jest.fn(),
          getAll: jest.fn(),
          delete: jest.fn()
        })
      })
    },
    addEventListener: jest.fn(),
    onupgradeneeded: null
  })
};

global.indexedDB = indexedDB;

// Mock navigator.onLine
Object.defineProperty(window.navigator, 'onLine', {
  writable: true,
  value: true
});
