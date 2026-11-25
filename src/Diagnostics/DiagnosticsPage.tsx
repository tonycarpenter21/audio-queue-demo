import audioqPackage from 'audioq/package.json';
import { type JSX, useState } from 'react';
import { audioFilesVocalExamples, longTeleportation } from '../audio/audioFilesAndUtils';
import { EXPERIMENTS, Experiment, ExperimentResult } from './experiments';
import { PAUSE_EXPERIMENTS } from './pauseExperiments';
import { postReport, SaveState, withDeviceInfo } from './report';
import './DiagnosticsPage.css';

/** Short voice clips (1-2 s), like the Queue Management tab. */
const CLIPS: readonly string[] = audioFilesVocalExamples.slice(0, 4);

const ALL_EXPERIMENTS: readonly Experiment[] = [...EXPERIMENTS, ...PAUSE_EXPERIMENTS];

/** Answers for experiments that ask what was heard. */
const HEARD: readonly string[] = ['Every word once', 'A word was skipped', 'A word repeated', 'Silence after the pause'];

/** Sends the results to the phone server, which saves them under qa-reports/ on the computer. */
const saveReport = (results: ExperimentResult[]): Promise<SaveState> => postReport({ results });

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

  const recordHeard = async (id: string, heard: string): Promise<void> => {
    const next = results.map((item) => (item.id === id ? { ...item, heard } : item));
    setResults(next);
    setSaved(await saveReport(next));
  };

  const download = (): void => {
    const blob = new Blob([JSON.stringify(withDeviceInfo({ results }), null, 2)], { type: 'application/json' });
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
        {ALL_EXPERIMENTS.map((experiment) => {
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
              {result && experiment.askWhatYouHeard === true && (
                <div className="diagnostics-heard">
                  What did you hear?
                  {HEARD.map((answer) => (
                    <button
                      className={`button ${result.heard === answer ? 'active' : ''}`}
                      key={answer}
                      onClick={() => {
                        void recordHeard(experiment.id, answer);
                      }}
                    >
                      {answer}
                    </button>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {saved && <p className={saved.ok ? 'diagnostics-saved' : 'diagnostics-unsaved'}>{saved.message}</p>}
      <button className="button" disabled={results.length === 0} onClick={download}>
        Download report
      </button>
      <h3>Progress bar trace</h3>
      <p>
        Open the <a href={`${process.env.PUBLIC_URL}/queue-management?trace`}>queue page with tracing on</a> and tap{' '}
        <strong>Add Sound To End Of Queue (Channel 0)</strong>. For 4 seconds every frame is recorded (audioq’s position and each progress
        bar’s width), then saved to your computer; a note appears at the top of the page. Do it once or twice.
      </p>
      <p className="diagnostics-meta">
        audioq {audioqPackage.version} · {navigator.userAgent}
      </p>
    </div>
  );
}

export default DiagnosticsPage;
