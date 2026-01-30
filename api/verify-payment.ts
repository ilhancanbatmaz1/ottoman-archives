import { VercelRequest, VercelResponse } from '@vercel/node';
import { createRequire } from 'module';
import { createClient } from '@supabase/supabase-js';

const require = createRequire(import.meta.url);
const Iyzipay = require('iyzipay');

// Initialize Supabase Admin
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method !== 'GET') {
            res.setHeader('Allow', 'GET');
            return res.status(405).json({ error: 'Method Not Allowed' });
        }

        // Token query parametreden gelir
        const token = req.query.token as string;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Token parametresi eksik'
            });
        }

        const iyzipay = new Iyzipay({
            apiKey: process.env.IYZICO_API_KEY!,
            secretKey: process.env.IYZICO_SECRET_KEY!,
            uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
        });

        return new Promise<void>((resolve) => {
            iyzipay.checkoutForm.retrieve({ token }, async (err: any, result: any) => {
                if (err) {
                    console.error('Iyzico Retrieve Error:', err);
                    res.status(500).json({
                        success: false,
                        error: 'Ödeme doğrulama hatası',
                        details: err.errorMessage || err
                    });
                    resolve();
                    return;
                }

                console.log('Iyzico Verification Result:', {
                    status: result.status,
                    paymentStatus: result.paymentStatus,
                    conversationId: result.conversationId
                });

                // Başarılı ödeme kontrolü
                if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
                    const userId = result.conversationId;

                    // UUID format kontrolü
                    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

                    if (!userId || !uuidRegex.test(userId)) {
                        console.error('Invalid UUID from Iyzico:', userId);
                        res.status(400).json({
                            success: false,
                            error: 'Geçersiz kullanıcı ID',
                            userId: userId
                        });
                        resolve();
                        return;
                    }

                    // 30 gün sonrası hesapla
                    const endDate = new Date();
                    endDate.setDate(endDate.getDate() + 30);

                    // Supabase'i güncelle
                    const { error: dbError } = await supabase
                        .from('users')
                        .update({
                            subscription_status: 'premium',
                            subscription_end_date: endDate.toISOString()
                        } as any)
                        .eq('id', userId);

                    if (dbError) {
                        console.error('Supabase Update Error:', dbError);
                        res.status(500).json({
                            success: false,
                            error: 'Veritabanı güncelleme hatası',
                            details: dbError.message
                        });
                    } else {
                        console.log(`✅ Subscription updated for user: ${userId}`);
                        res.status(200).json({
                            success: true,
                            userId: userId,
                            message: 'Premium üyeliğiniz başarıyla aktifleştirildi!',
                            subscriptionEndDate: endDate.toISOString()
                        });
                    }

                } else {
                    // Ödeme başarısız
                    const errorMessage = result.errorMessage || 'Ödeme tamamlanamadı';
                    console.log('Payment Failed:', errorMessage);

                    res.status(400).json({
                        success: false,
                        error: errorMessage,
                        paymentStatus: result.paymentStatus
                    });
                }
                resolve();
            });
        });
    } catch (err: any) {
        console.error('Critical Error in verify-payment:', err);
        return res.status(500).json({
            success: false,
            error: 'Sunucu hatası',
            details: err.message || err
        });
    }
}
