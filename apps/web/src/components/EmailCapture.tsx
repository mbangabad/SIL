/**
 * EmailCapture Component
 * Newsletter signup / waitlist form
 */

'use client';

import React, { useState } from 'react';

export function EmailCapture() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    try {
      setStatus('loading');

      // TODO: Send to backend/email service
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage('Thanks for signing up! Check your inbox.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection.');
    }
  };

  return (
    <div className="email-capture">
      <h3 className="email-capture-title">Stay Updated</h3>
      <p className="email-capture-description">
        Get notified about new games, features, and platform updates
      </p>

      <form onSubmit={handleSubmit} className="email-capture-form">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading' || status === 'success'}
          className="email-input"
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="email-submit"
        >
          {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
        </button>
      </form>

      {message && (
        <div
          className={`email-message ${status === 'success' ? 'success' : 'error'}`}
          role="alert"
        >
          {message}
        </div>
      )}

      <style jsx>{`
        .email-capture {
          background: linear-gradient(135deg, #1e293b, #0f172a);
          border-radius: 12px;
          padding: 2rem;
          border: 1px solid #334155;
        }

        .email-capture-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.5rem;
        }

        .email-capture-description {
          color: #94a3b8;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
        }

        .email-capture-form {
          display: flex;
          gap: 0.75rem;
          flex-direction: column;
        }

        @media (min-width: 640px) {
          .email-capture-form {
            flex-direction: row;
          }
        }

        .email-input {
          flex: 1;
          padding: 0.75rem 1rem;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .email-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .email-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .email-submit {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .email-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
        }

        .email-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .email-message {
          margin-top: 1rem;
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.875rem;
        }

        .email-message.success {
          background: #10b98120;
          color: #10b981;
          border: 1px solid #10b981;
        }

        .email-message.error {
          background: #ef444420;
          color: #ef4444;
          border: 1px solid #ef4444;
        }
      `}</style>
    </div>
  );
}
