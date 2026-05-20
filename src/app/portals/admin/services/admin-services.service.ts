import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Service, ServiceCategory } from '../../../core/models';

type NullableString = string | null | undefined;

interface ServiceDto {
  id: string;
  name?: NullableString;
  description?: NullableString;
  estimatedDurationMinutes?: number | null;
  price?: number | null;
  category?: ServiceCategory | string | null;
  doctorIds?: string[] | null;
  isActive?: boolean | null;
}

export interface ManagedService extends Service {
  isActive: boolean;
}

export interface ServiceWriteDto extends Omit<Service, 'id'> {
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminServicesService {
  private readonly apiService = inject(ApiService);

  getServices(): Observable<ManagedService[]> {
    return this.apiService.get<ServiceDto[]>('/services').pipe(
      map((services) => services.map((service) => mapManagedServiceDto(service)))
    );
  }

  createService(service: ServiceWriteDto): Observable<ManagedService> {
    return this.apiService.post<ServiceDto>('/services', service).pipe(map((dto) => mapManagedServiceDto(dto)));
  }

  addService(service: ServiceWriteDto): Observable<ManagedService> {
    return this.createService(service);
  }

  updateService(id: string, service: ServiceWriteDto): Observable<ManagedService> {
    return this.apiService.put<ServiceDto>(`/services/${id}`, service).pipe(map((dto) => mapManagedServiceDto(dto)));
  }

  deleteService(id: string): Observable<void> {
    return this.apiService.delete<void>(`/services/${id}`);
  }

  toggleServiceStatus(service: ManagedService, isActive: boolean): Observable<ManagedService> {
    const { id: _id, isActive: _current, ...payload } = service;
    return this.updateService(service.id, { ...payload, isActive });
  }
}

function mapManagedServiceDto(dto: ServiceDto): ManagedService {
  return {
    id: dto.id,
    name: normalizeString(dto.name) || '',
    description: normalizeString(dto.description),
    estimatedDurationMinutes: dto.estimatedDurationMinutes ?? 0,
    price: dto.price ?? 0,
    category: (dto.category as ServiceCategory) ?? 'Consultation',
    doctorIds: dto.doctorIds ?? [],
    isActive: dto.isActive ?? true
  };
}

function normalizeString(value: NullableString): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
