
import { VercelRequest, VercelResponse } from '@vercel/node';
import Iyzipay from 'iyzipay';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    // 1. Validate Environment Variables
    if (!process.env.IYZICO_API_KEY || !process.env.IYZICO_SECRET_KEY) {
        console.error('Missing Iyzico API Keys');
        return res.status(500).json({
            error: 'Sunucu yapılandırma hatası: Iyzico API anahtarları eksik. Lütfen Vercel panelinden IYZICO_API_KEY ve IYZICO_SECRET_KEY değişkenlerini kontrol edin.'
        });
    }

    const { userId, email, userDetails } = req.body;

    const iyzipay = new Iyzipay({
        apiKey: process.env.IYZICO_API_KEY,
        secretKey: process.env.IYZICO_SECRET_KEY,
        uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
    });

    // ... (rest of request construction remains similar but safer)

    // Ensure all required fields are present to avoid Iyzico validation errors
    if (!userId || !email) {
        return res.status(400).json({ error: 'Kullanıcı bilgileri eksik (ID veya Email).' });
    }

    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['host'];
    const origin = `${protocol}://${host}`;

    const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: userId,
        price: '50.00',
        paidPrice: '50.00',
        currency: Iyzipay.CURRENCY.TRY,
        basketId: `B${Date.now()}`,
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        callbackUrl: `${origin}/api/payment-callback`,
        enabledInstallments: [2, 3, 6, 9],
        buyer: {
            id: userId,
            name: userDetails?.name || 'Misafir',
            surname: userDetails?.surname || 'Kullanici',
            gsmNumber: userDetails?.phone || '+905555555555',
            email: email,
            identityNumber: '11111111111',
            lastLoginDate: '2015-10-05 12:43:35',
            registrationDate: '2013-04-21 15:12:09',
            registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
            ip: req.headers['x-forwarded-for'] as string || '85.34.78.112',
            city: 'Istanbul',
            country: 'Turkey',
            zipCode: '34732'
        },
        shippingAddress: {
            contactName: userDetails?.name || 'Misafir Kullanici',
            city: 'Istanbul',
            country: 'Turkey',
            address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
            zipCode: '34742'
        },
        billingAddress: {
            contactName: userDetails?.name || 'Misafir Kullanici',
            city: 'Istanbul',
            country: 'Turkey',
            address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
            zipCode: '34742'
        },
        basketItems: [
            {
                id: 'PREMIUM_MONTHLY',
                name: 'Osmanlıca Arşiv Premium Üyelik',
                category1: 'Membership',
                itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
                price: '50.00'
            }
        ]
    };

    return new Promise((resolve, reject) => {
        iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
            console.log('Iyzico Response:', JSON.stringify(result)); // Log for debugging

            if (err) {
                console.error('Iyzico Init Error:', err);
                res.status(500).json({ error: 'Iyzico bağlantı hatası: ' + JSON.stringify(err) });
                resolve();
            } else {
                if (result.status === 'success') {
                    if (result.paymentPageUrl) {
                        res.status(200).json({
                            paymentPageUrl: result.paymentPageUrl,
                            token: result.token
                        });
                    } else {
                        // Success status but NO URL?!
                        console.error('Iyzico Success but No URL:', result);
                        res.status(500).json({
                            error: 'Ödeme servisi başarılı yanıt verdi ancak URL oluşturulamadı. (Hata Kodu: NO_URL)',
                            debug: result
                        });
                    }
                } else {
                    console.error('Iyzico Failure:', result.errorMessage);
                    res.status(400).json({
                        error: result.errorMessage || 'Iyzico tarafında bir hata oluştu.',
                        errorCode: result.errorCode
                    });
                }
                resolve();
            }
        });
    });
}
