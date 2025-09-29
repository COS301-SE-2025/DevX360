<<<<<<< HEAD
import React from 'react';
import { createPortal } from 'react-dom';

// import { Toaster } from 'react-hot-toast';

// Modal Portal Wrapper Component
// This component renders its children in a portal at the document root
const ModalPortal = ({ children, isOpen }) => {
    if (!isOpen) return null;

    return createPortal(
        <div style={{ position: 'relative', zIndex: 10000 }}>
            {children}
        </div>,
        document.body
    );
};

=======
import React from 'react';
import { createPortal } from 'react-dom';

// import { Toaster } from 'react-hot-toast';

// Modal Portal Wrapper Component
// This component renders its children in a portal at the document root
const ModalPortal = ({ children, isOpen }) => {
    if (!isOpen) return null;

    return createPortal(
        <div style={{ position: 'relative', zIndex: 10000 }}>
            {children}
        </div>,
        document.body
    );
};

>>>>>>> dev
export default ModalPortal;