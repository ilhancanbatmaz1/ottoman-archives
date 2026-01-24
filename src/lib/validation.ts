import { z } from 'zod';

// Login Schema
export const LoginSchema = z.object({
    username: z.string().min(1, 'Kullanıcı adı gereklidir'),
    password: z.string().min(1, 'Şifre gereklidir'),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

// Signup Schema
export const SignupSchema = z.object({
    fullName: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır'),
    username: z.string().min(3, 'Kullanıcı adı en az 3 karakter olmalıdır'),
    email: z.string().email('Geçersiz email adresi'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

export type SignupFormData = z.infer<typeof SignupSchema>;

// Password Reset Request Schema
export const ResetPasswordSchema = z.object({
    email: z.string().email('Geçersiz email adresi'),
});

export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;

// New Password Schema
export const NewPasswordSchema = z.object({
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
});

export type NewPasswordFormData = z.infer<typeof NewPasswordSchema>;
