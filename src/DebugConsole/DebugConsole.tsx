/* eslint-disable no-console */
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './DebugConsole.css';

interface LogEntry {
  message: string;
  timestamp: string;
  type: 'log' | 'warn' | 'error' | 'info';
}

function DebugConsole(): JSX.Element {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Store original console methods
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    // Helper to format arguments
    const formatArgs = (...args: unknown[]): string => {
      return args
        .map((arg) => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(' ');
    };

    // Helper to add log entry
    const addLog = (type: LogEntry['type'], ...args: unknown[]): void => {
      const timestamp: string = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        hour12: false,
        minute: '2-digit',
        second: '2-digit'
      });

      setLogs((prev) => [
        ...prev,
        {
          message: formatArgs(...args),
          timestamp,
          type
        }
      ]);
    };

    // Override console methods
    console.log = (...args: unknown[]): void => {
      originalLog(...args);
      addLog('log', ...args);
    };

    console.warn = (...args: unknown[]): void => {
      originalWarn(...args);
      addLog('warn', ...args);
    };

    console.error = (...args: unknown[]): void => {
      originalError(...args);
      addLog('error', ...args);
    };

    console.info = (...args: unknown[]): void => {
      originalInfo(...args);
      addLog('info', ...args);
    };

    // Cleanup: restore original console methods
    return (): void => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.info = originalInfo;
    };
  }, []);

  // Auto-scroll to bottom when new logs added
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCopy = async (): Promise<void> => {
    const logText: string = logs.map((log) => `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}`).join('\n');

    try {
      await navigator.clipboard.writeText(logText);
      alert('Logs copied to clipboard!');
    } catch {
      // Fallback for older browsers
      const textArea: HTMLTextAreaElement = document.createElement('textarea');
      textArea.value = logText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Logs copied to clipboard!');
      } catch {
        alert('Failed to copy logs');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleClear = (): void => {
    setLogs([]);
  };

  const handleClose = (): void => {
    setIsVisible(false);
  };

  const consolePanel: JSX.Element = (
    <div className="debug-console">
      <div className="debug-console-header">
        <span className="debug-console-title">Debug Console ({logs.length})</span>
        <div className="debug-console-actions">
          <button className="debug-console-button" onClick={handleClear} title="Clear logs">
            Clear
          </button>
          <button className="debug-console-button" onClick={handleCopy} title="Copy all logs">
            Copy
          </button>
          <button className="debug-console-button" onClick={handleClose} title="Close">
            ✕
          </button>
        </div>
      </div>
      <div className="debug-console-body">
        {logs.length === 0 ? (
          <div className="debug-console-empty">No logs yet...</div>
        ) : (
          logs.map((log, index) => (
            <div className={`debug-console-entry debug-console-${log.type}`} key={index}>
              <span className="debug-console-timestamp">{log.timestamp}</span>
              <span className="debug-console-type">[{log.type.toUpperCase()}]</span>
              <pre className="debug-console-message">{log.message}</pre>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );

  return (
    <>
      <button className="debug-console-show-button" onClick={() => setIsVisible(true)}>
        Show Debug Console
      </button>
      {isVisible && createPortal(consolePanel, document.body)}
    </>
  );
}

export default DebugConsole;
