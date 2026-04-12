import { Resend } from 'resend'
import { generateInvoicePDF } from '@/lib/pdfGenerator'
import { getAdminClient } from '@/lib/supabase/admin'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendPurchaseEmail(
    userId: string,
    email: string, 
    name: string, 
    itemName: string, 
    itemType: string, 
    amountPaid: number, 
    orderId: string, 
    downloadUrls?: {label: string, url: string}[],
    paymentMethod: 'FIAT' | 'CREDITS' = 'FIAT'
) {
    if (!resend) {
        console.log('[EMAIL_SYSTEM] RESEND_API_KEY missing. Skipping email for:', email);
        return;
    }

    try {
        // Fetch current credits remaining
        const adminClient = getAdminClient()
        const { data: userAccounts } = await adminClient.from('user_accounts').select('credits').eq('user_id', userId).single()
        const currentCredits = userAccounts?.credits || 0

        const isCredits = paymentMethod === 'CREDITS'
        const currencySymbol = isCredits ? 'Credits' : '₹'
        const amountDisplay = isCredits ? `${amountPaid} Credits` : `₹${amountPaid}`

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #050505; color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #1a1a1a;">
                
                <!-- HEADER WITH LOGO -->
                <div style="text-align: center; border-bottom: 1px dashed #333; padding-bottom: 25px; margin-bottom: 30px;">
                    <img src="https://imagizer.imageshack.com/img924/3983/vzoEZd.png" alt="SamplesWala Root" style="height: 55px; margin-bottom: 15px;" />
                    <h1 style="color: #a6e22e; font-style: italic; font-weight: 900; text-transform: uppercase; margin: 0; font-size: 20px; letter-spacing: 2px;">Auto-Generated Invoice</h1>
                </div>

                <p style="font-size: 16px; margin-bottom: 20px;">Hey ${name || 'Producer'},</p>
                
                <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.5;">
                    Your transaction was successfully processed. Access to <strong>${itemName}</strong> is now securely linked to your profile. Please keep this invoice for your financial records.
                </p>

                <div style="background-color: #111; padding: 25px; border-radius: 8px; border: 1px solid #222; margin: 30px 0;">
                    <p style="margin: 0 0 20px 0; font-size: 14px; font-weight: bold; color: #a6e22e; text-transform: uppercase; letter-spacing: 1px;">Order Information</p>
                    
                    <table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 14px;">
                        <tr>
                            <td style="padding: 10px 0; color: #888;">Order ID:</td>
                            <td style="padding: 10px 0; text-align: right; color: #fff; font-weight: bold;">${orderId}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #888;">Date of Issue:</td>
                            <td style="padding: 10px 0; text-align: right; color: #fff;">${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #888;">Product Identity:</td>
                            <td style="padding: 10px 0; text-align: right; color: #fff;">${itemName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #888;">License Format:</td>
                            <td style="padding: 10px 0; text-align: right; color: #fff;">${itemType}</td>
                        </tr>
                        <tr style="border-top: 1px dashed #333;">
                            <td style="padding: 15px 0 0 0; font-weight: 900; color: #a6e22e; font-size: 16px; text-transform: uppercase;">Total Paid</td>
                            <td style="padding: 15px 0 0 0; text-align: right; font-weight: 900; color: #a6e22e; font-size: 16px;">${amountDisplay}</td>
                        </tr>
                    </table>
                </div>

                <!-- CREDIT METRICS BLOCK -->
                <div style="background-color: #0a0a0a; border: 1px solid #333; padding: 15px 25px; border-radius: 8px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #888; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; font-size: 12px;">Active Credit Balance</span>
                    <span style="color: #fff; font-family: monospace; font-weight: bold; font-size: 18px;">${currentCredits} Credits Left</span>
                </div>

                ${downloadUrls && downloadUrls.length > 0 ? `
                <div style="background-color: #0a0a0a; border: 1px solid #222; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: bold; color: #a6e22e; text-transform: uppercase;">Direct Download Links</p>
                    ${downloadUrls.map(link => `
                        <a href="${link.url}" style="display: block; background-color: #111; color: #fff; text-decoration: none; padding: 12px 20px; border: 1px solid #333; margin-bottom: 10px; border-radius: 4px; font-weight: bold; text-align: center;">
                            ⬇️ ${link.label}
                        </a>
                    `).join('')}
                </div>
                ` : ''}

                <p style="font-size: 16px; margin-bottom: 30px; line-height: 1.5; text-align: center;">
                    You can also access your assets anytime directly from your dashboard.
                </p>

                <div style="margin-bottom: 40px; text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://sampleswala.com'}/profile" style="display: inline-block; background-color: #a6e22e; color: #000; text-decoration: none; padding: 16px 32px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; border-radius: 4px; font-size: 14px;">Access Library</a>
                </div>

                <hr style="border: 0; border-top: 1px solid #1a1a1a; margin: 40px 0 30px 0;">
                
                <!-- EXCLUSIVE FOOTER -->
                <div style="text-align: center;">
                    <p style="font-size: 14px; color: #aaa; line-height: 1.5; margin: 0 0 15px 0;">
                        Need help? Contact us: <a href="mailto:info@sampleswala.com" style="color: #a6e22e; text-decoration: none; font-weight: bold;">info@sampleswala.com</a>
                    </p>
                    
                    <div style="margin: 25px 0;">
                        <a href="https://instagram.com/SamplesWala" style="color: #fff; text-decoration: none; margin: 0 12px; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">📷 @SamplesWala</a>
                        <a href="https://twitter.com/SamplesWala" style="color: #fff; text-decoration: none; margin: 0 12px; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">🐦 @SamplesWala</a>
                        <a href="https://youtube.com/@SamplesWala" style="color: #fff; text-decoration: none; margin: 0 12px; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">📺 @SamplesWala</a>
                    </div>
                    
                    <p style="font-size: 10px; color: #444; line-height: 1.6; margin: 30px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">
                        This is a computer-generated invoice and requires no physical signature.<br>
                        Generated securely by the Samples Wala Network.
                    </p>
                </div>
            </div>
        `;

        const pdfBase64 = await generateInvoicePDF(
            orderId, 
            name || 'Producer', 
            itemName, 
            itemType, 
            amountPaid, 
            new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        );

        await resend.emails.send({
            from: 'SamplesWala <info@sampleswala.com>',
            to: email,
            subject: `Invoice: ${itemName} | SamplesWala`,
            html: html,
            attachments: [
                {
                    filename: `Invoice_${orderId}.pdf`,
                    content: pdfBase64,
                }
            ]
        });
        console.log(`[EMAIL_SENT] Invoice sent to: ${email} for ${itemName}`);
    } catch (e) {
        console.error('[EMAIL_FAILED]', e);
    }
}
