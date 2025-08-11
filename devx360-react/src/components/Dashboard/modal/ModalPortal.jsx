import React from 'react';
import { createPortal } from 'react-dom';

import { Toaster } from 'react-hot-toast';

// Modal Portal Wrapper Component
// This component renders its children in a portal at the document root
const ModalPortal = ({ children, isOpen }) => {
    if (!isOpen) return null;

    return createPortal(
        <div style={{ position: 'relative', zIndex: 10000 }}>
            {children}
            {/* Dedicated Toaster for modals */}
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: 'var(--bg-container)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow)',
                        zIndex: 10002, // Higher than modal
                    }
                }}
                containerStyle={{
                    zIndex: 10002
                }}
            />
        </div>,
        document.body
    );
};

export default ModalPortal;