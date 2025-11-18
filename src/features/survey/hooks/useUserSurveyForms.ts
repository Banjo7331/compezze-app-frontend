import { useState, useEffect } from 'react';

// Importy typów
import type { Page, PageableParams } from '@/shared/api/types'; 
import type { SurveyFormResponse } from '../model/types'; 
import { surveyService } from '../api/surveyService';

// --- NOWY INTERFEJS DLA PARAMETRÓW HOOKA ---
// Rozszerzamy ogólne parametry paginacji o opcjonalny trigger odświeżania.
interface UseUserSurveyFormsParams extends PageableParams {
    refreshTrigger?: number; 
}

interface UseUserSurveyFormsResult {
    data: SurveyFormResponse[] | null;
    isLoading: boolean;
    error: Error | null;
    page: number;
    totalPages: number;
    setPage: (newPage: number) => void;
}

const DEFAULT_PAGE_SIZE = 20;

// FIX: Zmieniamy argument hooka, aby przyjmował nasz rozszerzony interfejs
export const useUserSurveyForms = (params: UseUserSurveyFormsParams = {}): UseUserSurveyFormsResult => {
    // 1. Destrukturyzacja i wyodrębnienie refreshTrigger i domyślnych parametrów
    const { refreshTrigger = 0, page: initialPage = 0 } = params;
    
    // Używamy PageableParams do przekazania reszty opcji (rozmiar, sortowanie) do serwisu
    const apiParams: PageableParams = { 
        size: params.size || DEFAULT_PAGE_SIZE,
        sort: params.sort || 'title,asc',
    };
    
    // 2. Stan (dostosowany)
    const [data, setData] = useState<SurveyFormResponse[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [page, setPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    
    // --- Logika Fetching'u ---
    useEffect(() => {
        const fetchForms = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Składamy parametry API: strona + stałe parametry
                const fetchParams: PageableParams = {
                    ...apiParams,
                    page: page,
                };

                const response = await surveyService.getAllForms(fetchParams) as Page<SurveyFormResponse>;
                
                setData(response.content);
                setTotalPages(response.totalPages);

            } catch (err: any) {
                console.error("Failed to fetch user survey forms:", err);
                setError(new Error(err.message || "Failed to load surveys."));
            } finally {
                setIsLoading(false);
            }
        };

        // Zależności muszą obejmować 'page' i 'refreshTrigger'
        fetchForms();
    }, [page, refreshTrigger]); 

    return {
        data,
        isLoading,
        error,
        page,
        totalPages,
        setPage,
    };
};