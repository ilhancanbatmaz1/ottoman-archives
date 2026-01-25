```typescript
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

        return new Promise((resolve, reject) => {
            iyzipay.checkoutForm.retrieve({ token }, async (err: any, result: any) => {
                if (err) {
                    console.error('Iyzico Retrieve Error:', err);
                    // Redirect to error page
                    res.redirect('/premium?status=error&message=connection_failed');
                    resolve();
                    return;
                }

                if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
                    const userId = result.conversationId; // We stored userId here

                    console.log(`Payment success for user: ${ userId } `);

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
                        res.redirect('/premium?status=error&message=db_update_failed');
                    } else {
                        // Success Redirect
                        res.redirect('/success?status=success');
                    }

                } else {
                    console.error('Payment Failed:', result.errorMessage);
                    res.redirect(`/ premium ? status = failed & message=${ encodeURIComponent(result.errorMessage) } `);
                }
                resolve();
            });
        });
    } catch (err: any) {
        console.error('Critical Error in callback:', err);
        res.redirect(`/ premium ? status = error & message=${ encodeURIComponent('Sunucu hatası: ' + err.message) } `);
    }
}
```
