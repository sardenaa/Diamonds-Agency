import { useState } from 'react';

export function useDashboardState() {
  const [loading, setLoading] = useState(false);
  return { loading, setLoading };
}
