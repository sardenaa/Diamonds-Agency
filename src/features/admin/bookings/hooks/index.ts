import { useState } from 'react';

export function useBookingsFilter() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  return { search, setSearch, status, setStatus };
}
