import { useState } from 'react';

export function useAuditFilter() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  return { filter, setFilter, search, setSearch };
}
