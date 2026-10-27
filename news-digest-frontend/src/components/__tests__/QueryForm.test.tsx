import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QueryForm from '../QueryForm';

describe('QueryForm', () => {
  const defaultProps = {
    query: 'test query',
    location: 'South Africa',
    maxItems: 8,
    loading: false,
    onQueryChange: vi.fn(),
    onLocationChange: vi.fn(),
    onMaxItemsChange: vi.fn(),
    onSubmit: vi.fn(),
  };

  it('renders the form fields', () => {
    render(<QueryForm {...defaultProps} />);
    expect(screen.getByLabelText('Ask about the news')).toBeInTheDocument();
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Maximum articles')).toBeInTheDocument();
  });

  it('disables button when loading', () => {
    render(<QueryForm {...defaultProps} loading={true} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Searching...');
  });

  it('calls onSubmit when form is submitted', () => {
    const handleSubmit = vi.fn((e) => e.preventDefault());
    render(<QueryForm {...defaultProps} onSubmit={handleSubmit} />);
    const form = screen.getByRole('button').closest('form')!;
    fireEvent.submit(form);
    expect(handleSubmit).toHaveBeenCalled();
  });

  it('validates query is required', () => {
    render(<QueryForm {...defaultProps} />);
    const textarea = screen.getByLabelText('Ask about the news');
    expect(textarea).toHaveAttribute('required');
    expect(textarea).toHaveAttribute('minLength', '3');
  });
});
