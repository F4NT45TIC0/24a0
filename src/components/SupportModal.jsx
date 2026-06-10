import React, { useState } from 'react';

export default function SupportModal({ isOpen, onClose, t, lang }) {
  const [copied, setCopied] = useState(false);
  const pixKey = "363df8c5-402e-400d-aac3-138f23ee58d3"; // Chave aleatória do usuário

  if (!isOpen) return null;

  // Safe fallback if t is not passed
  if (!t) {
    t = {
      supportTitle: "APOIE O PROJETO",
      supportWelcome: "O 24a0 é um projeto gratuito e independente...",
      pixKeyTitle: "Chave Aleatória PIX",
      copied: "Copiado!",
      copy: "Copiar",
      close: "Fechar"
    };
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 110 }}>
      <div className="modal-content animate-fadeIn" style={{ maxWidth: '450px', textAlign: 'center', border: '1px solid var(--border-color-default)' }}>
        <h2 className="text-numeric" style={{ color: 'var(--yellow-neon)', fontSize: '1.5rem', marginBottom: '1rem' }}>
          {t.supportTitle}
        </h2>
        
        <p style={{ fontSize: '0.9rem', color: 'var(--text-card-desc)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          {t.supportWelcome}
        </p>

        {/* PIX Details */}
        <div style={{
          background: 'var(--bg-darker)',
          border: '1px solid var(--border-color-default)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <span style={{ 
            fontSize: '0.65rem', 
            textTransform: 'uppercase', 
            letterSpacing: '1px', 
            color: 'var(--green-neon)', 
            fontWeight: 'bold',
            display: 'block',
            marginBottom: '0.5rem'
          }}>
            {t.pixKeyTitle}
          </span>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            background: 'var(--bg-dark)',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid var(--border-color-default)'
          }}>
            <code style={{ fontSize: '0.9rem', color: 'var(--text-bright)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
              {pixKey}
            </code>
            
            <button 
              className="btn btn-primary" 
              onClick={handleCopy}
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', minWidth: '80px', textTransform: 'none' }}
            >
              <span className="btn-content">{copied ? t.copied : t.copy}</span>
            </button>
          </div>
        </div>

        <button className="btn btn-secondary" onClick={onClose} style={{ width: '100%' }}>
          <span className="btn-content">{t.close}</span>
        </button>
      </div>
    </div>
  );
}
