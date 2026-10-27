import type { RetrievedArticle } from '../types/news';

type NewsCardProps = {
  article: RetrievedArticle;
};

export default function NewsCard({ article }: NewsCardProps) {
  return (
    <article className="article-card">
      <h3>{article.title}</h3>
      <p>{article.content}</p>
      <div className="meta">
        <span>Source: {article.source.domain}</span>
        {article.published_at ? <span>Published: {article.published_at}</span> : null}
      </div>
      {article.source.url ? (
        <a href={article.source.url} target="_blank" rel="noopener noreferrer">
          Read Original Article →
        </a>
      ) : null}
    </article>
  );
}
