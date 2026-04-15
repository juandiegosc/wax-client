export type ApiValidationError = {
  [key: string]: string[];
};

export type ServerErrorState = {
  error?: unknown;
};