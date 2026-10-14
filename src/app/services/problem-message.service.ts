import { HttpErrorResponse } from '@angular/common/http';


export function problemMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 403) return 'You are not allowed to do that.';
    const body = err.error;
    if (body?.detail) return body.detail;
    if (body?.errors) return Object.values(body.errors as Record<string, string[]>).flat().join(' ');
    if (body?.title) return body.title;
  }
  return fallback;
}
