import { useState } from 'react';

export function useMarketingState() {
  const [loading, setLoading] = useState(false);
  return { loading, setLoading };
}
