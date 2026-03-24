export function useCurrentRole(): string {
  return localStorage.getItem('dev_role') ?? 'anonymous';
}
