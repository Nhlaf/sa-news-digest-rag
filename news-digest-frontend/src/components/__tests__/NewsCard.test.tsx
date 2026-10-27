import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NewsCard from '../NewsCard';

describe('NewsCard', () => {
  const mockArticle = {
    title: 'Test Article',
    content: 'Test content',
    source: {
      domain: 'test.com',
      section: 'news',
      url: 'https://test.com/article',
    },
    published_at: '2024-01-01T00:00:00Z',
  };

  it('renders article information', () => {
    render(<NewsCard article={mockArticle} />);
    expect(screen.getByText('Test Article')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByText(/Source: test.com/)).toBeInTheDocument();
  });

  it('renders article link', () => {
    render(<NewsCard article={mockArticle} />);
    const link = screen.getByText('Read Original Article →');
    expect(link).toHaveAttribute('href', 'https://test.com/article');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('handles missing publication date', () => {
    const articleWithoutDate = { ...mockArticle, published_at: null };
    render(<NewsCard article={articleWithoutDate} />);
    expect(screen.queryByText(/Published:/)).not.toBeInTheDocument();
  });
});
