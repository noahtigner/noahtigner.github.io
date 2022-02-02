import React from 'react';
import { render, screen } from '@testing-library/react';
import { App } from './index';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/Some Things I've Built/i);
  expect(linkElement).toBeInTheDocument();
});
