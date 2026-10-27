import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from '../Header';

describe('Header', () => {
  it('renders the app title', () => {
    render(<Header loading={false} online={true} />);
    expect(screen.getByText('News Digest RAG Agent')).toBeInTheDocument();
  });

  it('shows health status', () => {
    render(<Header loading={false} online={true} />);
    expect(screen.getByText('● Backend Online')).toBeInTheDocument();
  });

  it('shows offline status', () => {
    render(<Header loading={false} online={false} />);
    expect(screen.getByText('● Backend Offline')).toBeInTheDocument();
  });
});
