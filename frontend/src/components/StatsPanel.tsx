interface StatsPanelProps {
  totalPiiEmails: number;
  loading?: boolean;
}

export function StatsPanel({ totalPiiEmails, loading }: StatsPanelProps) {
  return (
    <div className="stats-panel">
      <h3>Statistics</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <p>
          Total PII emails detected: <strong>{totalPiiEmails}</strong>
        </p>
      )}
    </div>
  );
}
