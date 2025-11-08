// Modal.js
import React from 'react';
import './modal.css';

export default function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{title}</h3>
        {children}
        <button onClick={onClose} className="close-btn">Close</button>
      </div>
    </div>
  );
}
