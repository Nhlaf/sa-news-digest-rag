import EmptyState from './EmptyState';
import NewsCard from './NewsCard';
import type { NewsDigestResponse } from '../types/news';

type NewsDigestProps = {
  digest: NewsDigestResponse | null;
};

export default function NewsDigest({ digest }: NewsDigestProps) {
  if (!digest) {
    return null;
  }

  return (
    <section className="panel digest-panel">
      <h2>News Digest</h2>
      <div className="digest-box">{digest.answer}</div>

      {digest.articles.length ? (
        <div className="article-list">
          {digest.articles.map((article, index) => (
            <NewsCard key={`${article.title}-${index}`} article={article} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </section>
  );
}
