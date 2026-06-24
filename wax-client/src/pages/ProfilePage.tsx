import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import { useCurrentUser, useLogout, useSaveAddress, useUserAddress } from '@/features/auth/hooks';
import { billingProfileSchema } from '@/lib/schemas/billingProfileSchema';
import type { BillingProfileSchema } from '@/lib/schemas/billingProfileSchema';
import type { Address, UserInfo } from '@/lib/types/user';
import { routePaths } from '@/routes/routePaths';

const countryNames: Record<string, string> = {
  EC: 'Ecuador',
  CO: 'Colombia',
  PE: 'Perú',
  MX: 'México',
  AR: 'Argentina',
  CL: 'Chile',
  US: 'Estados Unidos',
  ES: 'España',
};

const buildBillingDefaults = (address?: Partial<Address> | null): BillingProfileSchema => ({
  firstName: address?.firstName ?? '',
  lastName: address?.lastName ?? '',
  identificationType: address?.identificationType ?? '',
  identificationNumber: address?.identificationNumber ?? '',
  phone: address?.phone ?? '',
  name: address?.name ?? '',
  line1: address?.line1 ?? '',
  line2: address?.line2 ?? '',
  city: address?.city ?? '',
  state: address?.state ?? '',
  postalCode: address?.postalCode ?? '',
  country: address?.country ?? '',
});

const getSaveErrorMessage = (error: unknown) => {
  if (Array.isArray(error)) {
    return error.join(' ');
  }

  return 'No pudimos guardar tus datos. Por favor intenta de nuevo.';
};

const getSubmitLabel = (addressExists: boolean, isBusy: boolean) => {
  if (isBusy) return 'Guardando...';
  return addressExists ? 'Actualizar perfil' : 'Guardar y completar registro';
};

type ProfileStatusBannerProps = {
  needsProfileCompletion: boolean;
};

type ProfileDetailsCardProps = {
  address: Partial<Address>;
  currentUser: UserInfo;
  onEdit: () => void;
};

const ProfileStatusBanner = ({ needsProfileCompletion }: ProfileStatusBannerProps) => {
  if (needsProfileCompletion) {
    return (
      <div className="profile-status-banner profile-status-banner-warning">
        <strong>Completa tu registro</strong>
        <p>
          Te faltan algunos datos para finalizar tu cuenta. Completa el formulario de facturación para acceder a todas las funciones.
        </p>
      </div>
    );
  }

  return (
    <div className="profile-status-banner profile-status-banner-success">
      <strong>¡Cuenta verificada!</strong>
      <p>Tu cuenta está completa y lista para usar.</p>
    </div>
  );
};

type BillingCompletionFormProps = {
  addressExists: boolean;
  errors: ReturnType<typeof useForm<BillingProfileSchema>>['formState']['errors'];
  handleSubmit: ReturnType<typeof useForm<BillingProfileSchema>>['handleSubmit'];
  isSubmitting: boolean;
  isPending: boolean;
  onSubmit: (values: BillingProfileSchema) => Promise<void>;
  register: ReturnType<typeof useForm<BillingProfileSchema>>['register'];
};

const BillingCompletionForm = ({
  addressExists,
  errors,
  handleSubmit,
  isSubmitting,
  isPending,
  onSubmit,
  register,
}: BillingCompletionFormProps) => {
  const submitLabel = getSubmitLabel(addressExists, isPending || isSubmitting);

  return (
    <form className="profile-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="profile-form-header">
        <span className="profile-kicker">Perfil privado</span>
        <h2 className="profile-section-title">Termina tu registro</h2>
        <p className="profile-form-intro">
          Completa tus datos de facturación para activar todas las funciones privadas de WAX.
        </p>
      </div>

      <fieldset className="profile-fieldset">
        <legend className="profile-legend">Datos personales</legend>
        <div className="profile-form-grid">
        <label className="profile-field">
          <span className="profile-label">Nombre</span>
          <input className="profile-input" placeholder="Tu nombre" {...register('firstName')} />
          {errors.firstName ? <span className="profile-error">{errors.firstName.message}</span> : null}
        </label>

        <label className="profile-field">
          <span className="profile-label">Apellido</span>
          <input className="profile-input" placeholder="Tu apellido" {...register('lastName')} />
          {errors.lastName ? <span className="profile-error">{errors.lastName.message}</span> : null}
        </label>

        <label className="profile-field">
          <span className="profile-label">Tipo de identificación</span>
          <select className="profile-input" {...register('identificationType')}>
            <option value="">Selecciona...</option>
            <option value="CI">Cédula de identidad</option>
            <option value="DNI">DNI</option>
            <option value="Passport">Pasaporte</option>
            <option value="RUC">RUC</option>
          </select>
          {errors.identificationType ? <span className="profile-error">{errors.identificationType.message}</span> : null}
        </label>

        <label className="profile-field">
          <span className="profile-label">Número de identificación</span>
          <input className="profile-input" placeholder="Ej: 1700000000" {...register('identificationNumber')} />
          {errors.identificationNumber ? <span className="profile-error">{errors.identificationNumber.message}</span> : null}
        </label>

        <label className="profile-field profile-span-full">
          <span className="profile-label">Teléfono</span>
          <input className="profile-input" type="tel" placeholder="Ej: +593 99 000 0000" {...register('phone')} />
          {errors.phone ? <span className="profile-error">{errors.phone.message}</span> : null}
        </label>
        </div>
      </fieldset>

      <fieldset className="profile-fieldset">
        <legend className="profile-legend">Dirección de facturacion</legend>
        <div className="profile-form-grid">
        <label className="profile-field profile-span-full">
          <span className="profile-label">Nombre o razón social</span>
          <input className="profile-input" placeholder="Nombre completo o empresa" {...register('name')} />
          {errors.name ? <span className="profile-error">{errors.name.message}</span> : null}
        </label>

        <label className="profile-field profile-span-full">
          <span className="profile-label">Dirección</span>
          <input className="profile-input" placeholder="Calle, número, etc." {...register('line1')} />
          {errors.line1 ? <span className="profile-error">{errors.line1.message}</span> : null}
        </label>

        <label className="profile-field profile-span-full">
          <span className="profile-label">Referencia (opcional)</span>
          <input className="profile-input" placeholder="Piso, oficina, cerca de..." {...register('line2')} />
          {errors.line2 ? <span className="profile-error">{errors.line2.message}</span> : null}
        </label>

        <label className="profile-field">
          <span className="profile-label">Ciudad</span>
          <input className="profile-input" placeholder="Tu ciudad" {...register('city')} />
          {errors.city ? <span className="profile-error">{errors.city.message}</span> : null}
        </label>

        <label className="profile-field">
          <span className="profile-label">Provincia</span>
          <input className="profile-input" placeholder="Tu provincia" {...register('state')} />
          {errors.state ? <span className="profile-error">{errors.state.message}</span> : null}
        </label>

        <label className="profile-field">
          <span className="profile-label">Código postal</span>
          <input className="profile-input" placeholder="Ej: 170101" {...register('postalCode')} />
          {errors.postalCode ? <span className="profile-error">{errors.postalCode.message}</span> : null}
        </label>

        <label className="profile-field">
          <span className="profile-label">País</span>
          <select className="profile-input" {...register('country')}>
            <option value="">Selecciona...</option>
            <option value="EC">Ecuador</option>
            <option value="CO">Colombia</option>
            <option value="PE">Perú</option>
            <option value="MX">México</option>
            <option value="AR">Argentina</option>
            <option value="CL">Chile</option>
            <option value="US">Estados Unidos</option>
            <option value="ES">España</option>
          </select>
          {errors.country ? <span className="profile-error">{errors.country.message}</span> : null}
        </label>
        </div>
      </fieldset>

      {errors.root?.message ? <p className="profile-error profile-error-general">{errors.root.message}</p> : null}

      <div className="profile-submit-bar">
        <div className="profile-submit-copy">
          <strong>Guardar cambios</strong>
          <span>Tus datos se usan para habilitar experiencias privadas y tu dirección de facturación.</span>
        </div>
        <button
          className="profile-submit-btn"
          type="submit"
          disabled={isSubmitting || isPending}
        >
          {submitLabel}
        </button>
      </div>

      <p className="profile-help-link">
        <Link to={routePaths.support}>¿Necesitas ayuda?</Link>
      </p>
    </form>
  );
};

const ProfileDetailsCard = ({ address, currentUser, onEdit }: ProfileDetailsCardProps) => (
  <div className="profile-data-card">
    <div className="profile-data-header">
      <h2 className="profile-data-title">Mis datos</h2>
      <button type="button" className="profile-edit-btn" onClick={onEdit}>
        Editar
      </button>
    </div>

    <div className="profile-data-grid">
      <div className="profile-data-section profile-span-full">
        <span className="profile-data-label">Correo</span>
        <strong className="profile-data-value">{currentUser.email}</strong>
      </div>

      {address.firstName || address.lastName ? (
        <div className="profile-data-section">
          <span className="profile-data-label">Nombre</span>
          <strong className="profile-data-value">{[address.firstName, address.lastName].filter(Boolean).join(' ')}</strong>
        </div>
      ) : null}

      {address.phone ? (
        <div className="profile-data-section">
          <span className="profile-data-label">Teléfono</span>
          <strong className="profile-data-value">{address.phone}</strong>
        </div>
      ) : null}

      {address.identificationType || address.identificationNumber ? (
        <div className="profile-data-section">
          <span className="profile-data-label">Identificación</span>
          <strong className="profile-data-value">{[address.identificationType, address.identificationNumber].filter(Boolean).join(' · ')}</strong>
        </div>
      ) : null}

      {address.name ? (
        <div className="profile-data-section profile-span-full">
          <span className="profile-data-label">Facturación</span>
          <strong className="profile-data-value">{address.name}</strong>
        </div>
      ) : null}

      {address.line1 ? (
        <div className="profile-data-section profile-span-full">
          <span className="profile-data-label">Dirección</span>
          <strong className="profile-data-value">
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ''}
          </strong>
        </div>
      ) : null}

      {address.city || address.state ? (
        <div className="profile-data-section">
          <span className="profile-data-label">Ciudad</span>
          <strong className="profile-data-value">{[address.city, address.state].filter(Boolean).join(', ')}</strong>
        </div>
      ) : null}

      {address.postalCode ? (
        <div className="profile-data-section">
          <span className="profile-data-label">Código postal</span>
          <strong className="profile-data-value">{address.postalCode}</strong>
        </div>
      ) : null}

      {address.country ? (
        <div className="profile-data-section">
          <span className="profile-data-label">País</span>
          <strong className="profile-data-value">{countryNames[address.country] ?? address.country}</strong>
        </div>
      ) : null}
    </div>
  </div>
);

export const ProfilePage = () => {
  const { data: currentUser, isLoading } = useCurrentUser();
  const { data: address, isLoading: isLoadingAddress } = useUserAddress(Boolean(currentUser));
  const saveAddressMutation = useSaveAddress();
  const logoutMutation = useLogout();
  const [isEditing, setIsEditing] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<BillingProfileSchema>({
    mode: 'onChange',
    resolver: zodResolver(billingProfileSchema),
    defaultValues: buildBillingDefaults(),
  });

  useEffect(() => {
    reset(buildBillingDefaults(address));
  }, [address, reset]);

  if (isLoading) {
    return (
      <section className="auth-loading-shell">
        <div className="auth-loading-card">
          <span className="auth-loading-kicker">Cuenta WAX</span>
          <h1 className="auth-loading-title">Preparando tu perfil...</h1>
        </div>
      </section>
    );
  }

  if (!currentUser) {
    return null;
  }

  const isEnrolledUser = currentUser.roles?.includes('Enrolled') ?? false;
  const needsProfileCompletion = isEnrolledUser || (!isLoadingAddress && !address);
  const showForm = needsProfileCompletion || isEditing;

  const submitBillingProfile = async (values: BillingProfileSchema) => {
    try {
      await saveAddressMutation.mutateAsync({
        ...values,
        line2: values.line2 || undefined,
      });
      toast.success(needsProfileCompletion ? '¡Listo! Tu cuenta ha sido verificada.' : 'Datos actualizados correctamente.');
      setIsEditing(false);
    } catch (error) {
      setError('root', { message: getSaveErrorMessage(error) });
    }
  };

  const handleCancelEdit = () => {
    reset(buildBillingDefaults(address));
    setIsEditing(false);
  };

  return (
    <section className="profile-page">
      <div className="profile-shell">
        <div className="profile-hero">
          <div className="profile-hero-top">
            <div className="profile-hero-identity">
              <span className="profile-avatar" aria-hidden>
                {(currentUser.email?.[0] ?? 'W').toUpperCase()}
              </span>
              <div className="profile-hero-copy">
                <h1 className="profile-title">Mi cuenta</h1>
                <span className="profile-hero-email">{currentUser.email}</span>
              </div>
            </div>
            <button
              type="button"
              className="profile-logout-btn"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? 'Saliendo…' : 'Cerrar sesión'}
            </button>
          </div>
          <ProfileStatusBanner needsProfileCompletion={needsProfileCompletion} />
        </div>

        {showForm ? (
          <div className="profile-form-container">
            <BillingCompletionForm
              addressExists={Boolean(address)}
              errors={errors}
              handleSubmit={handleSubmit}
              isPending={saveAddressMutation.isPending}
              isSubmitting={isSubmitting}
              onSubmit={submitBillingProfile}
              register={register}
            />
            {isEditing && !needsProfileCompletion ? (
              <div className="profile-cancel-row">
                <button type="button" className="profile-btn profile-btn-link" onClick={handleCancelEdit}>
                  Cancelar edicion
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="profile-completed">
            <nav className="profile-shortcuts" aria-label="Accesos de cuenta">
              <Link to={routePaths.myOrders} className="profile-shortcut">
                <span className="profile-shortcut-label">Mis pedidos</span>
                <span className="profile-shortcut-desc">Historial y estado de tus compras</span>
              </Link>
              <Link to={routePaths.myCustomProducts} className="profile-shortcut">
                <span className="profile-shortcut-label">Mis cotizaciones</span>
                <span className="profile-shortcut-desc">Tus encargos y propuestas</span>
              </Link>
              <Link to={routePaths.atelier} className="profile-shortcut profile-shortcut-feature">
                <span className="profile-shortcut-label">Atelier AI</span>
                <span className="profile-shortcut-desc">Diseña tu pieza a medida</span>
              </Link>
              <Link to={routePaths.catalog} className="profile-shortcut">
                <span className="profile-shortcut-label">Catálogo</span>
                <span className="profile-shortcut-desc">Explora la colección</span>
              </Link>
              <Link to={routePaths.support} className="profile-shortcut">
                <span className="profile-shortcut-label">Soporte</span>
                <span className="profile-shortcut-desc">Ayuda y acompañamiento</span>
              </Link>
            </nav>

            {address ? <ProfileDetailsCard address={address} currentUser={currentUser} onEdit={() => setIsEditing(true)} /> : null}
          </div>
        )}
      </div>
    </section>
  );
};