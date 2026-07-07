import { useState } from 'react';

export function useCrmFilters() {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  return { search, setSearch, selectedTag, setSelectedTag };
}
