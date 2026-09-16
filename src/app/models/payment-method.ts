// ============================================================
//  PaymentMethod
//  Contraparte en TypeScript del ENUM `payment_method` de la
//  tabla `expenses`. Limita los valores a los mismos de la BD.
// ============================================================
export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'otro';
