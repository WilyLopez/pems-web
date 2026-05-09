export interface ApiResponse<T>{
    success: boolean;
    message?: string;
    data: T;
    timestamp?: string;
}

export interface PagedResponse<T>{
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export interface ApiError {
    status: number;
    error: string;
    codigoError: string;
    message: string;
    path: string;
    timestamp: string;
    errorsCampo?: CampoError[];    
}

export interface CampoError {
    campo?: string;
    mensaje: string;
    valorRechazado?: unknown;
}