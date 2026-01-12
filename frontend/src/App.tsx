import { useEffect, useState } from 'react';
import { TextInput } from './components/TextInput';
import { StatsPanel } from './components/StatsPanel';
import { getStatistics, submitText } from './api';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [totalPiiEmails, setTotalPiiEmails] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getStatistics()
      .then((data) => setTotalPiiEmails(data.totalPiiEmails))
      .catch(console.error)
      .finally(() => setStatsLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await submitText(text);
      setMessage(`Submitted! Found ${result.piiCount} email(s).`);
      setText('');

      const stats = await getStatistics();
      setTotalPiiEmails(stats.totalPiiEmails);
    } catch (error) {
      setMessage('Submission failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>QTip</h1>
        <p>PII Detection & Tokenization</p>
      </header>

      <main>
        <TextInput value={text} onChange={setText} disabled={loading} />

        <div className="actions">
          <button onClick={handleSubmit} disabled={loading || !text.trim()}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        {message && <div className="message">{message}</div>}

        <StatsPanel totalPiiEmails={totalPiiEmails} loading={statsLoading} />
      </main>
    </div>
  );
}

export default App;
