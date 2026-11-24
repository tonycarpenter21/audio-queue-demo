import audioqPackage from 'audioq/package.json';
import { type JSX, useState } from 'react';
import { audioFilesVocalExamples, longTeleportation } from '../audio/audioFilesAndUtils';
import { EXPERIMENTS, Experiment, ExperimentResult } from './experiments';
import './DiagnosticsPage.css';

/** Short voice clips (1-2 s), like the Queue Management tab. */
const CLIPS: readonly string[] = audioFilesVocalExamples.slice(0, 4);

type SaveState = { message: string; ok: boolean } | undefined;

/** The report sent to the computer running `npm run phone`. */
const buildReport = (results: ExperimentResult[]): object => ({
  audioqVersion: audioqPackage.version,
  createdAt: new Date().toISOString(),
  maxTouchPoints: navigator.maxTouchPoints,
  page: window.location.href,
  results,
  userAgent: navigator.userAgent
});

/** Sends the report to the phone server, which saves it under qa-reports/ on the computer. */
const saveReport = async (results: ExperimentResult[]): Promise<SaveState> => {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/__qa`, {
      body: JSON.stringify(buildReport(results), null, 2),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    });
    if (!response.ok) throw new Error(`HTTP ${String(response.status)}`);
    return { message: `Saved on your computer: ${await response.text()}`, ok: true };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown error';
    return { message: `Could not save (${reason}). Serve with npm run phone, or use Download.`, ok: false };
  }
};

/** Runs device experiments one tap at a time and reports what happened. */
function DiagnosticsPage(): JSX.Element {
  const [results, setResults] = useState<ExperimentResult[]>([]);
  const [running, setRunning] = useState<string | undefined>(undefined);
  const [saved, setSaved] = useState<SaveState>(undefined);

  // Called directly from the tap: experiments start their first sound synchronously.
  const run = (experiment: Experiment): void => {
    setRunning(experiment.id);
    void experiment.run(CLIPS, longTeleportation).then(async (result) => {
      const next = [...results.filter((item) => item.id !== result.id), result];
      setResults(next);
      setRunning(undefined);
      setSaved(await saveReport(next));
    });
  };

  const download = (): void => {
    const blob = new Blob([JSON.stringify(buildReport(results), null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audioq-qa-${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="diagnostics content-container">
      <h2>Device diagnostics</h2>
      <p>
        Tap each <strong>Run</strong> button once and wait until it shows a result (each takes up to about 30 seconds). Every run saves the
        full report to the computer running <code>npm run phone</code>. Sounds will play; that is expected.
      </p>
      <ol className="diagnostics-list">
        {EXPERIMENTS.map((experiment) => {
          const result = results.find((item) => item.id === experiment.id);
          return (
            <li className="diagnostics-item" key={experiment.id}>
              <div className="diagnostics-head">
                <button className="button" disabled={running !== undefined} onClick={() => run(experiment)}>
                  {running === experiment.id ? 'Running…' : 'Run'}
                </button>
                <strong>{experiment.title}</strong>
              </div>
              <div className="diagnostics-description">{experiment.description}</div>
              {result && <div className="diagnostics-result">{result.summary}</div>}
            </li>
          );
        })}
      </ol>
      {saved && <p className={saved.ok ? 'diagnostics-saved' : 'diagnostics-unsaved'}>{saved.message}</p>}
      <button className="button" disabled={results.length === 0} onClick={download}>
        Download report
      </button>
      <p className="diagnostics-meta">
        audioq {audioqPackage.version} · {navigator.userAgent}
      </p>
    </div>
  );
}

export default DiagnosticsPage;
