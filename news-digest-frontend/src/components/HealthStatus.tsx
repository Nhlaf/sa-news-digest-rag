type HealthStatusProps = {
  loading: boolean;
  online: boolean;
};

export default function HealthStatus({ loading, online }: HealthStatusProps) {
  return (
    <div className="status-pill" aria-live="polite">
      {loading ? 'Checking backend...' : online ? '● Backend Online' : '● Backend Offline'}
    </div>
  );
}
