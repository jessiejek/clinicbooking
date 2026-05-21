import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  private buildUrl(url: string): string {
    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    return `${this.apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  get<T>(url: string, options?: object): Observable<T> {
    return this.http.get<T>(this.buildUrl(url), options);
  }

  getBlob(url: string, options?: object): Observable<Blob> {
    return this.http.get(this.buildUrl(url), { ...options, responseType: 'blob' as const });
  }

  post<T>(url: string, body: unknown, options?: object): Observable<T> {
    return this.http.post<T>(this.buildUrl(url), body, options);
  }

  put<T>(url: string, body: unknown, options?: object): Observable<T> {
    return this.http.put<T>(this.buildUrl(url), body, options);
  }

  patch<T>(url: string, body: unknown, options?: object): Observable<T> {
    return this.http.patch<T>(this.buildUrl(url), body, options);
  }

  delete<T>(url: string, options?: object): Observable<T> {
    return this.http.delete<T>(this.buildUrl(url), options);
  }
}
