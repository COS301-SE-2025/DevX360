<<<<<<< HEAD
import { TriangleAlert } from 'lucide-react';

const WarningToast = ({message}) => { //place here for now
  return (
      <div style={{
        background: 'var(--bg-container)',
        color: 'var(--text)',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'

      }}>
        <TriangleAlert size={16} color="var(--primary" style={{ flexShrink: 0 }} />
        <span>{message}</span>
      </div>
  );
};

=======
import { TriangleAlert } from 'lucide-react';

const WarningToast = ({message}) => { //place here for now
  return (
      <div style={{
        background: 'var(--bg-container)',
        color: 'var(--text)',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'

      }}>
        <TriangleAlert size={16} color="var(--primary" style={{ flexShrink: 0 }} />
        <span>{message}</span>
      </div>
  );
};

>>>>>>> dev
export default WarningToast;