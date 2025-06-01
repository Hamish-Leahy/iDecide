import { render, screen } from '@testing-library/react';
import App from '../src/app';

describe('App Component', () => {
  test('renders the main application', () => {
    render(<App />);
    const headingElement = screen.getByText(/Travel Module/i);
    expect(headingElement).toBeInTheDocument();
  });

  // Add more tests as needed
});