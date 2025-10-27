import React from 'react';
import { render, screen } from '@testing-library/react';
import FirebaseDataImproved from './FirebaseDataImproved';

// Mock the API calls
jest.mock('../api', () => ({
  settingsAPI: {
    getAll: jest.fn().mockResolvedValue({ data: [] })
  },
  areaAPI: {
    getAll: jest.fn().mockResolvedValue({ data: [] })
  },
  houseAPI: {
    create: jest.fn().mockResolvedValue({ data: {} })
  },
  memberAPI: {
    create: jest.fn().mockResolvedValue({ data: {} })
  }
}));

// Mock Firebase imports
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn().mockResolvedValue({ forEach: jest.fn() })
}));

describe('FirebaseDataImproved', () => {
  test('renders without crashing', () => {
    render(<FirebaseDataImproved />);
    expect(screen.getByText('🔥 Member Requests')).toBeInTheDocument();
  });
});