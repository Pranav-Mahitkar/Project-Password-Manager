import { useState, useCallback } from 'react';
import api from '../services/api.js';

export function useVault() {
  const [entries,  setEntries]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/vault');
      setEntries(data.entries);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load vault.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOne = useCallback(async (id) => {
    const { data } = await api.get(`/vault/${id}`);
    return data.entry;
  }, []);

  const createEntry = useCallback(async (payload) => {
    const { data } = await api.post('/vault', payload);
    await fetchAll();
    return data.entry;
  }, [fetchAll]);

  const updateEntry = useCallback(async (id, payload) => {
    const { data } = await api.put(`/vault/${id}`, payload);
    await fetchAll();
    return data.entry;
  }, [fetchAll]);

  const deleteEntry = useCallback(async (id) => {
    await api.delete(`/vault/${id}`);
    setEntries((prev) => prev.filter((e) => e._id !== id));
  }, []);

  const toggleFavorite = useCallback(async (id) => {
    const { data } = await api.patch(`/vault/${id}/favorite`);
    setEntries((prev) =>
      prev.map((e) => (e._id === id ? { ...e, isFavorite: data.isFavorite } : e))
    );
  }, []);

  return {
    entries, loading, error,
    fetchAll, fetchOne, createEntry, updateEntry, deleteEntry, toggleFavorite,
  };
}
