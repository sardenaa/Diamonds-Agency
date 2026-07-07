import { useState } from 'react';

export function useCustomersHook() {
  const [loading, setLoading] = useState(false);
  return { loading, setLoading };
}
