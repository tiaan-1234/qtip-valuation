const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface SubmitResponse {
  submissionId: string;
  piiCount: number;
}

export interface StatisticsResponse {
  totalPiiEmails: number;
}

export async function submitText(text: string): Promise<SubmitResponse> {
  const response = await fetch(`${API_BASE}/api/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error('Submission failed');
  return response.json();
}

export async function getStatistics(): Promise<StatisticsResponse> {
  const response = await fetch(`${API_BASE}/api/statistics`);
  if (!response.ok) throw new Error('Failed to fetch statistics');
  return response.json();
}
