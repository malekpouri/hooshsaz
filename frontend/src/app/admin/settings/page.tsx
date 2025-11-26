'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import styles from './Settings.module.css';

export default function SettingsPage() {
  const { token } = useAuth();
  const [config, setConfig] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/config`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Failed to fetch config', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchConfig();
  }, [token]);

  const handleUpdate = async (key: string, value: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/config`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ key, value }),
      });
      setConfig({ ...config, [key]: value });
      alert('Configuration updated');
    } catch (error) {
      console.error('Failed to update config', error);
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('idle');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/test-ollama`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (res.ok) {
        setTestStatus('success');
        setTestMessage(data.message);
      } else {
        setTestStatus('error');
        setTestMessage(data.message);
      }
    } catch (error: any) {
      setTestStatus('error');
      setTestMessage(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>

      <div className={styles.card}>
        <h2 className="text-lg font-semibold mb-4">Ollama Configuration</h2>
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Ollama API URL</label>
            <div className="flex gap-2">
              <Input 
                value={config['OLLAMA_URL'] || ''}
                onChange={(e) => setConfig({ ...config, 'OLLAMA_URL': e.target.value })}
                placeholder="http://localhost:11434"
              />
              <Button onClick={() => handleUpdate('OLLAMA_URL', config['OLLAMA_URL'])}>
                Save
              </Button>
            </div>
          </div>

          <div className="border-t pt-4 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Connection Status</span>
              <Button variant="outline" onClick={handleTestConnection} className="gap-2">
                <RefreshCw size={16} /> Test Connection
              </Button>
            </div>
            
            {testStatus !== 'idle' && (
              <div className={`mt-4 p-3 rounded-md flex items-center gap-2 ${
                testStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {testStatus === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                <span className="text-sm">{testMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
