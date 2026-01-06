import { NextResponse } from 'next/server';

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

/**
 * Create a success response
 */
export function successResponse<T>(data: T, message?: string, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    } as ApiSuccess<T>,
    { status }
  );
}

/**
 * Create an error response
 */
export function errorResponse(
  message: string,
  code: string = 'ERROR',
  status: number = 400,
  details?: any
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    } as ApiError,
    { status }
  );
}

/**
 * Common error responses
 */
export const errors = {
  unauthorized: (message: string = 'Unauthorized') =>
    errorResponse(message, 'UNAUTHORIZED', 401),
  
  forbidden: (message: string = 'Forbidden') =>
    errorResponse(message, 'FORBIDDEN', 403),
  
  notFound: (resource: string = 'Resource') =>
    errorResponse(`${resource} not found`, 'NOT_FOUND', 404),
  
  badRequest: (message: string) =>
    errorResponse(message, 'BAD_REQUEST', 400),
  
  conflict: (message: string) =>
    errorResponse(message, 'CONFLICT', 409),
  
  internal: (message: string = 'Internal server error') =>
    errorResponse(message, 'INTERNAL_ERROR', 500),
  
  validation: (details: any) =>
    errorResponse('Validation failed', 'VALIDATION_ERROR', 422, details),
};
