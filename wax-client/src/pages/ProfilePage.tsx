import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import { useCurrentUser, useSaveAddress, useUserAddress } from '@/lib/hooks/useAccount';
import { billingProfileSchema } from '@/lib/schemas/billingProfileSchema';
import type { BillingProfileSchema } from '@/lib/schemas/billingProfileSchema';
import type { Address } from '@/lib/types/user';
import { routePaths } from '@/routes/routePaths';

const countryNames: Record<string, string> = {
  EC: 'Ecuador',
  CO: 'Colombia',
  PE: 'Peru',
  MX: 'Mexico',
  AR: 'Argentina',
  CL: 'Chile',
  US: 'Estados Unidos',
  ES: 'Espana',
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
  onEdit: () => void;
};

const ProfileStatusBanner = ({ needsProfileCompletion }: ProfileStatusBannerProps) => {
  if (needsProfileCompletion) {
    return (
      <div className="profile-status-banner profile-status-banner-warning">
        <strong>Completa tu registro</strong>
        <p>
          Te faltan algunos datos para finalizar tu cuenta. Completa el formulario de facturacion para acceder a todas las funciones.
        </p>
      </div>
    );
  }

  return (
    <div className="profile-status-banner profile-status-banner-success">
      <strong>¡Cuenta verificada!</strong>
      <p>Tu cuenta esta completa y lista para usar.</p>
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
          Completa tus datos de facturacion para activar todas las funciones privadas de WAX.
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
          <span className="profile-label">Tipo de identificacion</span>
          <select className="profile-input" {...register('identificationType')}>
            <option value="">Selecciona...</option>
            <option value="CI">Cedula de identidad</option>
            <option value="DNI">DNI</option>
            <option value="Passport">Pasaporte</option>
            <option value="RUC">RUC</option>
          </select>
          {errors.identificationType ? <span className="profile-error">{errors.identificationType.message}</span> : null}
        </label>

        <label className="profile-field">
          <span className="profile-label">Numero de identificacion</span>
          <input className="profile-input" placeholder="Ej: 1700000000" {...register('identificationNumber')} />
          {errors.identificationNumber ? <span className="profile-error">{errors.identificationNumber.message}</span> : null}
        </label>

        <label className="profile-field profile-span-full">
          <span className="profile-label">Telefono</span>
          <input className="profile-input" type="tel" placeholder="Ej: +593 99 000 0000" {...register('phone')} />
          {errors.phone ? <span className="profile-error">{errors.phone.message}</span> : null}
        </label>
        </div>
      </fieldset>

      <fieldset className="profile-fieldset">
        <legend className="profile-legend">Direccion de facturacion</legend>
        <div className="profile-form-grid">
        <label className="profile-field profile-span-full">
          <span className="profile-label">Nombre o razon social</span>
          <input className="profile-input" placeholder="Nombre completo o empresa" {...register('name')} />
          {errors.name ? <span className="profile-error">{errors.name.message}</span> : null}
        </label>

        <label className="profile-field profile-span-full">
          <span className="profile-label">Direccion</span>
          <input className="profile-input" placeholder="Calle, numero, etc." {...register('line1')} />
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
          <span className="profile-label">Codigo postal</span>
          <input className="profile-input" placeholder="Ej: 170101" {...register('postalCode')} />
          {errors.postalCode ? <span className="profile-error">{errors.postalCode.message}</span> : null}
        </label>

        <label className="profile-field">
          <span className="profile-label">Pais</span>
          <select className="profile-input" {...register('country')}>
            <option value="">Selecciona...</option>
            <option value="EC">Ecuador</option>
            <option value="CO">Colombia</option>
            <option value="PE">Peru</option>
            <option value="MX">Mexico</option>
            <option value="AR">Argentina</option>
            <option value="CL">Chile</option>
            <option value="US">Estados Unidos</option>
            <option value="ES">Espana</option>
          </select>
          {errors.country ? <span className="profile-error">{errors.country.message}</span> : null}
        </label>
        </div>
      </fieldset>

      {errors.root?.message ? <p className="profile-error profile-error-general">{errors.root.message}</p> : null}

      <div className="profile-submit-bar">
        <div className="profile-submit-copy">
          <strong>Guardar cambios</strong>
          <span>Tus datos se usan para habilitar experiencias privadas y tu direccion de facturacion.</span>
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

const ProfileDetailsCard = ({ address, onEdit }: ProfileDetailsCardProps) => (
  <div className="profile-data-card">
    <div className="profile-data-header">
      <h2 className="profile-data-title">Mis datos</h2>
      <button type="button" className="profile-edit-btn" onClick={onEdit}>
        Editar
      </button>
    </div>

    <div className="profile-data-grid">
      {address.firstName || address.lastName ? (
        <div className="profile-data-section">
          <span className="profile-data-label">Nombre</span>
          <strong className="profile-data-value">{[address.firstName, address.lastName].filter(Boolean).join(' ')}</strong>
        </div>
      ) : null}

      {address.phone ? (
        <div className="profile-data-section">
          <span className="profile-data-label">Telefono</span>
          <strong className="profile-data-value">{address.phone}</strong>
        </div>
      ) : null}

      {address.identificationType || address.identificationNumber ? (
        <div className="profile-data-section">
          <span className="profile-data-label">Identificacion</span>
          <strong className="profile-data-value">{[address.identificationType, address.identificationNumber].filter(Boolean).join(' · ')}</strong>
        </div>
      ) : null}

      <div className="profile-data-section">
        <span className="profile-data-label">Facturacion</span>
        <strong className="profile-data-value">{address.name}</strong>
      </div>

      <div className="profile-data-section">
        <span className="profile-data-label">Direccion</span>
        <strong className="profile-data-value">
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ''}
        </strong>
      </div>

      <div className="profile-data-section">
        <span className="profile-data-label">Ciudad</span>
        <strong className="profile-data-value">{address.city}, {address.state}</strong>
      </div>

      <div className="profile-data-section">
        <span className="profile-data-label">Codigo postal</span>
        <strong className="profile-data-value">{address.postalCode}</strong>
      </div>

      <div className="profile-data-section">
        <span className="profile-data-label">Pais</span>
        <strong className="profile-data-value">{countryNames[address.country ?? ''] ?? address.country}</strong>
      </div>
    </div>
  </div>
);

export const ProfilePage = () => {
  const { data: currentUser, isLoading } = useCurrentUser();
  const { data: address, isLoading: isLoadingAddress } = useUserAddress(Boolean(currentUser));
  const saveAddressMutation = useSaveAddress();
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
          <h1 className="profile-title">Mi cuenta</h1>
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
            {address ? <ProfileDetailsCard address={address} onEdit={() => setIsEditing(true)} /> : null}

            <div className="profile-quick-actions">
              <Link to={routePaths.catalog} className="profile-btn profile-btn-primary">
                Ver catalogo
              </Link>
              <Link to={routePaths.basket} className="profile-btn profile-btn-secondary">
                Mi carrito
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};