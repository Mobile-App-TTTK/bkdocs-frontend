import { render, screen } from '@testing-library/react-native';
import React from 'react';

import UploadPage from '@/app/(app)/(tabs)/upload';

describe('UploadScreen', () => {
  describe('Smoke Tests', () => {
    it('should render without crashing', () => {
      render(<UploadPage />);
      expect(screen).toBeTruthy();
    });

    it('should render transparent view', () => {
      const { root } = render(<UploadPage />);
      expect(root).toBeTruthy();
    });
  });
});

