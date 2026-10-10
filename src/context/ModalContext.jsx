import { createContext, useContext, useMemo, useState } from 'react';

const ModalContext = createContext(null);

/**
 * Modal "Open account" được mở từ nhiều nơi (nav + section sign up),
 * nên trạng thái của nó nằm ở context dùng chung.
 */
export function ModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      openModal: () => setIsOpen(true),
      closeModal: () => setIsOpen(false),
    }),
    [isOpen]
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal phải được dùng bên trong <ModalProvider />');
  return context;
}
