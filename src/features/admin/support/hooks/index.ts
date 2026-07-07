import { useState } from 'react';

export function useSupportFilters() {
  const [filter, setFilter] = useState('all');
  return { filter, setFilter };
}
