import { z } from 'zod';

// ═══════════════════════════════════════
// Invoice Validation
// ═══════════════════════════════════════

export const invoiceSchema = z.object({
  name: z.string().min(1, 'اسم الفاتورة مطلوب'),
  amount: z.number().min(0, 'المبلغ يجب أن يكون 0 أو أكثر'),
  description: z.string().optional(),
  category: z.enum(['REVENUE', 'EXPENSE', 'RETURN', 'SALARY'], {
    message: 'يرجى اختيار تصنيف الفاتورة',
  }),
  currency: z.enum(['SAR', 'USD']).default('SAR'),
  date: z.string().min(1, 'التاريخ مطلوب'),
  employeeId: z.string().optional(),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;

// ═══════════════════════════════════════
// Employee Validation
// ═══════════════════════════════════════

export const employeeSchema = z.object({
  name: z.string().min(1, 'اسم الموظف مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صالح').optional().or(z.literal('')),
  phone: z.string().optional(),
  position: z.string().min(1, 'المسمى الوظيفي مطلوب'),
  salary: z.number().min(0, 'الراتب يجب أن يكون 0 أو أكثر'),
  currency: z.enum(['SAR', 'USD']).default('SAR'),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;

// ═══════════════════════════════════════
// User Validation
// ═══════════════════════════════════════

export const userSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'DATA_ENTRY', 'VIEWER']).default('DATA_ENTRY'),
});

export type UserInput = z.infer<typeof userSchema>;

// ═══════════════════════════════════════
// Login Validation
// ═══════════════════════════════════════

export const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ═══════════════════════════════════════
// Settings Validation
// ═══════════════════════════════════════

export const settingsSchema = z.object({
  companyName: z.string().min(1, 'اسم الشركة مطلوب'),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),
  defaultCurrency: z.enum(['SAR', 'USD']).default('SAR'),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
