import { useState } from 'react';

export function useAnalyticsFilters() {
  const [subTab, setSubTab] = useState<'sovereign' | 'core'>('sovereign');
  return { subTab, setSubTab };
}
