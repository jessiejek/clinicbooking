export type BookingStatus =
  | 'Pending'
  | 'ProofSubmitted'
  | 'Confirmed'
  | 'OnHold'
  | 'Cancelled'
  | 'Completed'
  | 'Expired'
  | 'NoShow'
  | 'Rescheduled';

export type PaymentStatus = 'Unpaid' | 'Paid' | 'Waived' | 'Refunded';

export type PaymentMode = 'Online' | 'PayAtClinic';

export type PaymentMethod = 'GCash' | 'Maya' | 'BankTransfer' | 'PayAtClinic';

export type ServiceCategory = 'Consultation' | 'Procedure' | 'Laboratory' | 'Diagnostic';

export type ProofType = 'ReferenceNumber' | 'Screenshot';

export interface Service {
  id: string;
  name: string;
  description?: string;
  estimatedDurationMinutes: number;
  price: number;
  category: ServiceCategory;
  doctorIds: string[];
}

export interface Booking {
  id: string;
  patientId: string;
  doctorId: string;
  serviceId: string;
  appointmentDate: string;
  slotStartTime: string;
  slotEndTime: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMode: PaymentMode;
  queueNumber: number | null;
  totalFee: number;
  consultationFeeSnapshot: number;
  serviceFeeSnapshot: number;
  isWalkIn: boolean;
  proofType?: ProofType;
  proofValue?: string;
  proofSubmittedAt?: string;
  cancellationReason?: string;
  notes?: string;
  rescheduledFromBookingId?: string;
  receiptUrl?: string;
  createdAt: string;
  orNumber?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  proofImageUrl?: string;
  status: PaymentStatus;
  orNumber?: string;
  verifiedByUserId?: string;
  verifiedAt?: string;
  waivedByUserId?: string;
  waivedAt?: string;
  waivedReason?: string;
  refundedByUserId?: string;
  refundedAt?: string;
  refundReason?: string;
}

export interface TimeSlot {
  time: string;
  endTime: string;
  status: 'available' | 'full' | 'pending' | 'selected' | 'disabled';
}

export interface ReceiptData {
  orNumber: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicEmail: string;
  patientName: string;
  patientCode: string;
  doctorName: string;
  serviceName: string;
  appointmentDate: string;
  slotTime: string;
  queueNumber: number | null;
  consultationFee: number;
  serviceFee: number;
  totalFee: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  waivedReason?: string;
  isWalkIn: boolean;
  printedBy: string;
  printedAt: string;
}
