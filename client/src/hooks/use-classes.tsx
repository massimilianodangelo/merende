import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Chiave query per gli endpoint delle classi
const CLASSES_QUERY_KEY = ['/api/admin/classes'];

// Lista di classi predefinite
const defaultClasses = [
  "1A", "2A", "3A", "4A", "5A",
  "1B", "2B", "3B", "4B", "5B",
  "1C", "2C", "3C", "4C", "5C",
  "1D", "2D", "3D", "4D", "5D",
  "1E", "2E", "3E", "4E", "5E",
  "1F", "2F", "3F", "4F", "5F",
  "1G", "2G", "3G",
  "1H", "2H", "3H", "4H", "5H",
  "2L", "3L"
];

/**
 * Hook personalizzato per gestire l'elenco delle classi
 * Centralizza la logica per recuperare e aggiornare le classi in tutta l'app
 */
export function useClasses() {
  const queryClient = useQueryClient();

  // Funzione per recuperare le classi
  async function fetchClasses() {
    try {
      const response = await fetch('/api/admin/classes');
      if (!response.ok) {
        throw new Error('Errore nel recupero delle classi');
      }
      return await response.json() as string[];
    } catch (err) {
      console.error('Errore nel recupero delle classi:', err);
      
      // Fallback al localStorage
      const cachedClasses = localStorage.getItem('availableClasses');
      if (cachedClasses) {
        return JSON.parse(cachedClasses) as string[];
      }
      
      // Se non ci sono classi salvate, usa quelle predefinite
      return defaultClasses;
    }
  }

  // Query per ottenere l'elenco delle classi disponibili
  const { data: classes = [], isLoading, error } = useQuery({
    queryKey: CLASSES_QUERY_KEY,
    queryFn: fetchClasses,
    staleTime: 1000 * 60 * 5, // 5 minuti
  });

  // Callback per aggiornare l'elenco delle classi in tutta l'app
  const updateClasses = useCallback(async (newClasses: string[]) => {
    try {
      // Invia l'aggiornamento al server
      await fetch('/api/admin/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ classes: newClasses }),
      });
      
      // Aggiorna la cache di React Query
      queryClient.setQueryData(CLASSES_QUERY_KEY, newClasses);
      
      // Memorizza nel localStorage come fallback
      localStorage.setItem('availableClasses', JSON.stringify(newClasses));
      
      return true;
    } catch (error) {
      console.error('Errore nell\'aggiornamento delle classi:', error);
      return false;
    }
  }, [queryClient]);

  return {
    classes: Array.isArray(classes) ? [...classes].sort() : [],
    isLoading,
    error,
    updateClasses,
  };
}