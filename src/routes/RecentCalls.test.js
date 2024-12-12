import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecentCalls from './RecentCalls';

// Mock the Audio API
window.HTMLMediaElement.prototype.play = jest.fn();
window.HTMLMediaElement.prototype.pause = jest.fn();

describe('RecentCalls Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders call list correctly', () => {
    render(<RecentCalls />);
    expect(screen.getByText(/Recent Calls/i)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('opens call details when View Details is clicked', async () => {
    render(<RecentCalls />);
    
    // Click the View Details button
    const viewDetailsButton = screen.getByRole('button', { name: /View Details/i });
    fireEvent.click(viewDetailsButton);
    
    // Wait for and verify the content
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Call Details/i })).toBeInTheDocument();
    });

    // Check for buttons instead of tabs
    expect(screen.getByRole('button', { name: /Transcript/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analytics/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Notes/i })).toBeInTheDocument();
  });

  test('plays audio when Play Recording button is clicked', async () => {
    render(<RecentCalls />);
    
    // Open call details
    const viewDetailsButton = screen.getByRole('button', { name: /View Details/i });
    fireEvent.click(viewDetailsButton);
    
    // Find and click play button
    const playButton = await screen.findByRole('button', { name: /Play Recording/i });
    fireEvent.click(playButton);
    
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  test('displays correct analytics data', async () => {
    render(<RecentCalls />);
    
    // Open call details
    const viewDetailsButton = screen.getByRole('button', { name: /View Details/i });
    fireEvent.click(viewDetailsButton);
    
    // Switch to analytics tab
    const analyticsButton = screen.getByRole('button', { name: /Analytics/i });
    fireEvent.click(analyticsButton);
    
    // Wait for and verify analytics content
    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('Positive')).toBeInTheDocument();
    });
  });
});
