import { useState, type ComponentProps } from 'react';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

type PasswordInputProps = Omit<ComponentProps<'input'>, 'type'>;

export const PasswordInput = (props: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input-wrap">
      <input {...props} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        className="password-toggle"
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        onClick={() => setVisible((prev) => !prev)}
      >
        {visible ? (
          <VisibilityOffOutlinedIcon sx={{ fontSize: 19 }} />
        ) : (
          <VisibilityOutlinedIcon sx={{ fontSize: 19 }} />
        )}
      </button>
    </div>
  );
};
