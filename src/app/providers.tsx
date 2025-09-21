'use client';

import { Auth0Provider } from '@auth0/nextjs-auth0';
import { SWRConfig } from 'swr';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Auth0Provider>
      <SWRConfig value={{ fetcher: (url: string) => fetch(url).then(r => {
        if (!r.ok) {
          const err = new Error('Request failed') as Error & { status?: number };
          err.status = r.status;
          throw err;
        }
        return r.json();
      }), dedupingInterval: 5000 }}>
        {children}
      </SWRConfig>
    </Auth0Provider>
  );
}
