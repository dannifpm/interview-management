import React, { ReactNode } from 'react';
import './Modal.css';

interface ModalProps {
  title: string;
  message: ReactNode; 
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ title, message, onClose }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h2 className="modal-title">{title}</h2>
        <div className="modal-message">{message}</div> 
        <button className="modal-close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
