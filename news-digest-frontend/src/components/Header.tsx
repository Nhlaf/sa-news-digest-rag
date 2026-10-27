import HealthStatus from './HealthStatus';

type HeaderProps = {
  loading: boolean;
  online: boolean;
};

export default function Header({ loading, online }: HeaderProps) {
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">South African News Assistant</p>
        <h1>News Digest RAG Agent</h1>
      </div>
      <HealthStatus loading={loading} online={online} />
    </header>
  );
}
