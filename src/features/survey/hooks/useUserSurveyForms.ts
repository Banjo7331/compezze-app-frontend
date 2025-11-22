import { useState, useEffect } from 'react';

// Importy typów z warstwy Shared (Paginacja)
import type { Page, PageableParams } from '@/shared/api/types'; 
// Importy typów domenowych
import type { SurveyFormResponse } from '../model/types'; 
// Import serwisu
import { surveyService } from '../api/surveyService';

// Rozszerzamy parametry o trigger odświeżania (przydatne po utworzeniu nowej ankiety)
interface UseUserSurveyFormsParams extends PageableParams {
    refreshTrigger?: number; 
}

const DEFAULT_PAGE_SIZE = 10;

export const useUserSurveyForms = (params: UseUserSurveyFormsParams = {}) => {
    // Destrukturyzacja parametrów z wartościami domyślnymi
    const { 
        refreshTrigger = 0, 
        page: initialPage = 0,
        size = DEFAULT_PAGE_SIZE,
        sort = 'id,desc' // Domyślne sortowanie: najnowsze
    } = params;

    // --- STAN ---
    const [data, setData] = useState<SurveyFormResponse[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    
    // Stan paginacji
    const [page, setPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);

    // --- EFEKT POBIERANIA DANYCH ---
    useEffect(() => {
        const fetchForms = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Składamy parametry zapytania
                const apiParams: PageableParams = {
                    page,
                    size,
                    sort
                };

                // Wywołanie serwisu (rzutujemy na Page<SurveyFormResponse> dla pewności typów)
                const response = await surveyService.getAllForms(apiParams) as Page<SurveyFormResponse>;
                
                setData(response.content);
                setTotalPages(response.totalPages);

            } catch (err: any) {
                console.error("Failed to fetch user survey forms:", err);
                setError(new Error(err.message || "Failed to load surveys."));
            } finally {
                setIsLoading(false);
            }
        };

        fetchForms();
    }, [page, size, sort, refreshTrigger]); // Re-fetch przy zmianie tych wartości

    // --- ZWRACANE WARTOŚCI ---
    return {
        data,
        isLoading,
        error,
        page,
        totalPages,
        setPage, // Funkcja do zmiany strony (używana w Pagination)
    };
};