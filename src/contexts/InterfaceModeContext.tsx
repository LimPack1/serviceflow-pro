import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
  const [mode, setModeState] = useState<InterfaceMode>('si');

  // Initialize mode based on user role
  useEffect(() => {
    if (!loading) {
      // Get saved mode from localStorage if IT Staff
      if (isITStaff) {
        const savedMode = localStorage.getItem('itsm-interface-mode') as InterfaceMode;
        if (savedMode === 'user' || savedMode === 'si') {
          setModeState(savedMode);
        } else {
          setModeState('si');
        }
      } else {
        // Non IT staff always in user mode
        setModeState('user');
      }
    }
  }, [isITStaff, loading]);

  const setMode = (newMode: InterfaceMode) => {
    if (isITStaff) {
      setModeState(newMode);
      localStorage.setItem('itsm-interface-mode', newMode);
    }
  };

  const toggleMode = () => {
    if (isITStaff) {
      const newMode = mode === 'si' ? 'user' : 'si';
      setMode(newMode);
    }
  };

  // Only IT staff (admin/manager) can switch modes
  const canSwitchMode = isITStaff;

  return (
    <InterfaceModeContext.Provider value={{
      mode: isITStaff ? mode : 'user',
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
