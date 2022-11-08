export interface ErrorPageProps {
  statusCode: number;
  message: string;
}

export interface BasePageProps {
  error?: ErrorPageProps;
}
