import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

type InterfaceMode = 'si' | 'user';

interface InterfaceModeContextType {
  mode: InterfaceMode;
  setMode: (mode: InterfaceMode) => void;
  canSwitchMode: boolean;
  toggleMode: () => void;
}

const InterfaceModeContext = createContext<InterfaceModeContextType | undefined>(undefined);

export function InterfaceModeProvider({ children }: { children: ReactNode }) {
  const { isITStaff, loading } = useAuth();
  const [mode, setModeState] = useState<InterfaceMode>('user');
  const [initialized, setInitialized] = useState(false);

  // Initialize mode based on user role
  useEffect(() => {
    if (!loading) {
      if (isITStaff) {
        const savedMode = localStorage.getItem('itsm-interface-mode') as InterfaceMode;
        if (savedMode === 'user' || savedMode === 'si') {
          setModeState(savedMode);
        } else {
          setModeState('si');
          localStorage.setItem('itsm-interface-mode', 'si');
        }
      } else {
        setModeState('user');
        localStorage.removeItem('itsm-interface-mode');
      }
      setInitialized(true);
    }
  }, [isITStaff, loading]);

  const setMode = useCallback((newMode: InterfaceMode) => {
    if (isITStaff) {
      setModeState(newMode);
      localStorage.setItem('itsm-interface-mode', newMode);
    }
  }, [isITStaff]);

  const toggleMode = useCallback(() => {
    if (isITStaff) {
      const newMode = mode === 'si' ? 'user' : 'si';
      setModeState(newMode);
      localStorage.setItem('itsm-interface-mode', newMode);
    }
  }, [isITStaff, mode]);

  // Only IT staff (admin/manager) can switch modes
  const canSwitchMode = isITStaff;

  // Compute the actual mode to expose
  const effectiveMode = isITStaff ? mode : 'user';

  return (
    <InterfaceModeContext.Provider value={{
      mode: effectiveMode,
      setMode,
      canSwitchMode,
      toggleMode
    }}>
      {children}
    </InterfaceModeContext.Provider>
  );
}

export function useInterfaceMode() {
  const context = useContext(InterfaceModeContext);
  if (context === undefined) {
    throw new Error('useInterfaceMode must be used within an InterfaceModeProvider');
  }
  return context;
}
