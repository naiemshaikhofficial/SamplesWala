import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

/**
 * Validates and Generates a Digital PDF PDF using pdf-lib 
 * for attaching securely within Resend Email Handlers.
 */
export async function generateInvoicePDF(
    orderId: string, 
    name: string, 
    itemName: string, 
    itemType: string, 
    amount: number, 
    date: string
): Promise<string> {
    // Creating blank PDF canvas
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595.28, 841.89]) // Standard A4 Dimension
    const { width, height } = page.getSize()
    
    // Embed standard fonts to reduce dependency
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    // 🧬 LOGO_INTEGRATION: Fetch and embed the brand identity (PROPORTIONAL)
    let logoImage;
    let logoDims = { width: 140, height: 40 };
    try {
        const logoUrl = 'https://imagizer.imageshack.com/img924/3983/vzoEZd.png';
        const logoResponse = await fetch(logoUrl);
        const logoBytes = await logoResponse.arrayBuffer();
        logoImage = await pdfDoc.embedPng(logoBytes);
        
        // Calculate proportional dimensions to prevent "squashing"
        const originalDims = logoImage.scale(0.38);
        logoDims = { width: originalDims.width, height: originalDims.height };
    } catch (e) {
        console.error("[PDF_LOGO_ERROR] Failed to fetch brand logo:", e);
    }

    // Define stark monochrome colors
    const black = rgb(0, 0, 0)
    const white = rgb(1, 1, 1)
    const gray = rgb(0.4, 0.4, 0.4)
    
    // 1. Brutalist Header
    page.drawRectangle({ x: 40, y: height - 150, width: width - 80, height: 110, color: black })
    
    if (logoImage) {
        page.drawImage(logoImage, {
            x: 60,
            y: height - 60 - (logoDims.height / 2),
            width: logoDims.width,
            height: logoDims.height
        });
    }

    page.drawText('BILL OF SUPPLY / RECEIPT', { x: width - 240, y: height - 75, size: 14, font: helveticaBold, color: white })
    
    // Seller Details (Correct Indian Norms)
    page.drawText('SAMPLES WALA STUDIO', { x: 60, y: height - 105, size: 10, font: helveticaBold, color: white })
    page.drawText('SANGAMNER, MAHARASHTRA 422605', { x: 60, y: height - 118, size: 9, font: helveticaFont, color: white })
    page.drawText('EMAIL: CONTACT@SAMPLESWALA.COM', { x: 60, y: height - 131, size: 9, font: helveticaFont, color: white })
    
    page.drawText('STRICTLY DIGITAL', { x: width - 240, y: height - 95, size: 9, font: helveticaBold, color: gray })

    // 2. Order Meta Grid
    page.drawLine({ start: { x: 40, y: height - 165 }, end: { x: width - 40, y: height - 165 }, thickness: 2, color: black })
    
    // Columns
    page.drawText('ORDER ID', { x: 40, y: height - 185, size: 9, font: helveticaBold, color: gray })
    page.drawText(orderId, { x: 40, y: height - 202, size: 12, font: helveticaBold, color: black })

    page.drawText('DATE OF ISSUE', { x: 200, y: height - 185, size: 9, font: helveticaBold, color: gray })
    page.drawText(date, { x: 200, y: height - 202, size: 12, font: helveticaBold, color: black })

    page.drawText('BILLED TO', { x: 380, y: height - 185, size: 9, font: helveticaBold, color: gray })
    page.drawText(name.toUpperCase() || 'PRODUCER', { x: 380, y: height - 202, size: 12, font: helveticaBold, color: black })

    page.drawLine({ start: { x: 40, y: height - 225 }, end: { x: width - 40, y: height - 225 }, thickness: 2, color: black })

    // 3. Invoice Table Structure
    const tableTop = height - 295;
    
    // Heavy Top border for table
    page.drawLine({ start: { x: 40, y: tableTop }, end: { x: width - 40, y: tableTop }, thickness: 4, color: black })
    
    // Table Headers
    page.drawText('ITEM DESCRIPTION (SAC 998432)', { x: 50, y: tableTop - 25, size: 10, font: helveticaBold, color: black })
    page.drawText('PRICE', { x: width - 80, y: tableTop - 25, size: 10, font: helveticaBold, color: black })
    
    // Thick Divider
    page.drawLine({ start: { x: 40, y: tableTop - 40 }, end: { x: width - 40, y: tableTop - 40 }, thickness: 2, color: black })
    
    // Product Row
    page.drawText(itemName.toUpperCase(), { x: 50, y: tableTop - 80, size: 14, font: helveticaBold, color: black })
    page.drawText(itemType.toUpperCase(), { x: 50, y: tableTop - 95, size: 8, font: helveticaFont, color: gray })
    
    const priceText = `INR ${amount.toFixed(2)}`;
    const priceWidth = helveticaBold.widthOfTextAtSize(priceText, 14);
    page.drawText(priceText, { x: width - 50 - priceWidth, y: tableTop - 80, size: 14, font: helveticaBold, color: black })
    
    // Bottom border for calculation
    page.drawLine({ start: { x: 40, y: tableTop - 130 }, end: { x: width - 40, y: tableTop - 130 }, thickness: 4, color: black })
    
    // Grand Total Box (Inverted)
    page.drawRectangle({ x: width - 260, y: tableTop - 195, width: 220, height: 45, color: black })
    page.drawText('TOTAL PAID', { x: width - 245, y: tableTop - 177, size: 12, font: helveticaBold, color: white })
    
    const totalText = `Rs. ${amount.toFixed(2)}`;
    const totalWidth = helveticaBold.widthOfTextAtSize(totalText, 16);
    page.drawText(totalText, { x: width - 60 - totalWidth, y: tableTop - 177, size: 16, font: helveticaBold, color: white })

    // 4. Disclaimers at the bottom (LEGAL_HARDENING)
    page.drawLine({ start: { x: 40, y: 120 }, end: { x: width - 40, y: 120 }, thickness: 2, color: black })
    page.drawText('AUTHORIZED SIGNATURE NOT REQUIRED. COMPUTER GENERATED BILL OF SUPPLY.', { x: 40, y: 105, size: 8, font: helveticaBold, color: black })
    
    // Compliance & Policy Notes
    const footStyle = { size: 7, font: helveticaFont, color: gray };
    page.drawText('GST NOT APPLICABLE - SUPPLIER NOT REGISTERED UNDER GST.', { x: 40, y: 92, ...footStyle })
    page.drawText('DIGITAL PRODUCT - NO PHYSICAL DELIVERY. ALL SALES ARE FINAL (NON-REFUNDABLE).', { x: 40, y: 82, ...footStyle })
    page.drawText('SUPPORT: CONTACT@SAMPLESWALA.COM | REDISTRIBUTION PROHIBITED.', { x: 40, y: 72, ...footStyle })
    
    page.drawText('ISSUED SECURELY BY SAMPLES WALA STUDIO, SANGAMNER, MAHARASHTRA 422605.', { x: 40, y: 55, size: 6, font: helveticaBold, color: gray })

    // Build the final PDF array buffer and convert to base64
    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes).toString('base64');
}
