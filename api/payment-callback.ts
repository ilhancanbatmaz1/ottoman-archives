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
        if (req.method !== 'POST') {
            res.setHeader('Allow', 'POST');
            return res.status(405).end('Method Not Allowed');
        }

        const { token } = req.body;

        if (!token) {
            return res.status(400).send('Missing token');
        }

        const iyzipay = new Iyzipay({
            apiKey: process.env.IYZICO_API_KEY!,
            secretKey: process.env.IYZICO_SECRET_KEY!,
            uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
        });

        return new Promise<void>((resolve, reject) => {
            iyzipay.checkoutForm.retrieve({ token }, async (err: any, result: any) => {
                if (err) {
                    console.error('Iyzico Retrieve Error:', err);
                    // Redirect to error page
                    res.redirect('/premium?status=error&message=connection_failed');
                    resolve();
                    return;
                }

                if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
                    const userId = result.conversationId;

                    console.log(`Payment success for user string: ${userId}`);

                    // Validate UUID format
                    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

                    if (!userId || !uuidRegex.test(userId)) {
                        console.error('Invalid UUID received from Iyzico:', userId);
                        res.redirect(`/premium?status=warning&message=${encodeURIComponent('Ödeme başarılı ancak kullanıcı ID hatası. Lütfen yönetici ile iletişime geçin. Ref: ' + userId)}`);
                        return;
                    }

                    // Calculate end date (30 days)
                    const endDate = new Date();
                    endDate.setDate(endDate.getDate() + 30);

                    // Update user
                    const { error } = await supabase
                        .from('users')
                        .update({
                            subscription_status: 'premium',
                            subscription_end_date: endDate.toISOString()
                        } as any)
                        .eq('id', userId);

                    if (error) {
                        console.error('Supabase Update Error:', error);
                        // EXPOSE ERROR DETAILS FOR DEBUGGING
                        res.redirect(`/premium?status=error&message=${encodeURIComponent('DB Error: ' + JSON.stringify(error))}`);
                    } else {
                        // Success Redirect
                        res.redirect('/success?status=success');
                    }

                } else {
                    console.error('Payment Failed:', result.errorMessage);
                    res.redirect(`/premium?status=failed&message=${encodeURIComponent(result.errorMessage)}`);
                }
                resolve();
            });
        });
    } catch (err: any) {
        console.error('Critical Error in callback:', err);
        res.redirect(`/premium?status=error&message=${encodeURIComponent('Sunucu hatası: ' + err.message)}`);
    }
}
