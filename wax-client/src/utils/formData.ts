export const toFormData = (dto: Record<string, unknown>) => {
  const formData = new FormData();

  Object.entries(dto).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof Blob) {
        formData.append(key, value);
        return;
      }

      if (value instanceof Date) {
        formData.append(key, value.toISOString());
        return;
      }

      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        formData.append(key, String(value));
        return;
      }

      throw new TypeError(`Unsupported form data value for key: ${key}`);
    }
  });

  return formData;
};