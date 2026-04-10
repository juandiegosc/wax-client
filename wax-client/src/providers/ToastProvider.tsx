import type { PropsWithChildren } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const ToastProvider = ({ children }: PropsWithChildren) => {
  return (
    <>
      {children}
      <ToastContainer position="bottom-right" autoClose={3500} />
    </>
  );
};