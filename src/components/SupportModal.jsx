import React, { useState } from 'react';

export default function SupportModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const pixKey = "seu-pix-aqui@email.com"; // User will replace this with their actual PIX key

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 110 }}>
      <div className="modal-content animate-fadeIn" style={{ maxWidth: '450px', textAlign: 'center' }}>
        <h2 className="text-numeric" style={{ color: 'var(--yellow-neon)', fontSize: '1.5rem', marginBottom: '1rem' }}>
          ☕ APOIE O PROJETO
        </h2>
        
        <p style={{ fontSize: '0.9rem', color: '#c2c8d4', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          O <strong>24a0</strong> é um projeto gratuito e independente. 
          Se você se divertiu jogando e quer nos ajudar a manter o servidor online e a adicionar novas temporadas, considere fazer uma contribuição de qualquer valor!
        </p>

        {/* PIX Details */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.06)',
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
            Chave PIX (E-mail)
          </span>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            background: 'rgba(0,0,0,0.4)',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <code style={{ fontSize: '0.9rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
              {pixKey}
            </code>
            
            <button 
              className="btn btn-primary" 
              onClick={handleCopy}
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', minWidth: '80px', textTransform: 'none' }}
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#8a92a6', display: 'block', marginTop: '0.5rem' }}>
            *Substitua esta chave no código por sua chave PIX real no arquivo src/components/SupportModal.jsx
          </span>
        </div>

        <button className="btn btn-secondary" onClick={onClose} style={{ width: '100%' }}>
          Fechar
        </button>
      </div>
    </div>
  );
}
