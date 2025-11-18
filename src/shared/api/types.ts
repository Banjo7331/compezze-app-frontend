// Typ odpowiadający standardowej odpowiedzi Spring Data Page
export interface Page<T> {
    content: T[];              // Rzeczywista lista elementów
    totalPages: number;        // Całkowita liczba stron
    totalElements: number;     // Całkowita liczba elementów
    size: number;              // Elementów na stronę
    number: number;            // Aktualny numer strony (zaczynając od 0)
    
    // Pola statusu
    first: boolean;
    last: boolean;
    empty: boolean;
    
    // Pola metadanych i paginacji (często powodują błędy, gdy brakuje któregokolwiek)
    numberOfElements: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    pageable: {
        offset: number;
        sort: any;
        pageSize: number;
        pageNumber: number;
        paged: boolean;
        unpaged: boolean;
    };
}

// Parametry, które są wysyłane do backendu
export interface PageableParams {
    page?: number;  
    size?: number;  
    sort?: string;  
}