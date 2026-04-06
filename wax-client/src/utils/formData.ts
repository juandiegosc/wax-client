export const toFormData = (dto: Record<string, unknown>) => {
  const formData = new FormData();

  Object.entries(dto).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value instanceof File ? value : String(value));
    }
  });

  return formData;
};