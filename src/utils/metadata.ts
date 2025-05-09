// filepath: d:\task_frontend\src\util\metadata.ts
/**
 * Configuración de metadata para cacheo de páginas en Next.js
 * Esto asegura que las páginas protegidas no se cachan incorrectamente
 */
export function generateCacheMetadata() {
  return {
    cache: 'no-store',
    headers: [
      {
        key: 'Cache-Control',
        value: 'no-cache, no-store, max-age=0, must-revalidate'
      }
    ]
  };
}
