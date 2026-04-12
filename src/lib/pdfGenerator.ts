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
    
    // Define stark monochrome colors
    const black = rgb(0, 0, 0)
    const white = rgb(1, 1, 1)
    const gray = rgb(0.4, 0.4, 0.4)
    
    // 1. Brutalist Header
    page.drawRectangle({ x: 40, y: height - 120, width: width - 80, height: 80, color: black })
    page.drawText('SAMPLES WALA', { x: 60, y: height - 85, size: 32, font: helveticaBold, color: white })
    page.drawText('INVOICE / RECEIPT', { x: width - 240, y: height - 75, size: 16, font: helveticaBold, color: white })
    page.drawText('STRICTLY DIGITAL', { x: width - 240, y: height - 95, size: 9, font: helveticaBold, color: gray })

    // 2. Order Meta Grid
    page.drawLine({ start: { x: 40, y: height - 150 }, end: { x: width - 40, y: height - 150 }, thickness: 2, color: black })
    
    // Columns
    page.drawText('ORDER ID', { x: 40, y: height - 175, size: 9, font: helveticaBold, color: gray })
    page.drawText(orderId, { x: 40, y: height - 192, size: 12, font: helveticaBold, color: black })

    page.drawText('DATE OF ISSUE', { x: 220, y: height - 175, size: 9, font: helveticaBold, color: gray })
    page.drawText(date, { x: 220, y: height - 192, size: 12, font: helveticaBold, color: black })

    page.drawText('BILLED TO', { x: 400, y: height - 175, size: 9, font: helveticaBold, color: gray })
    page.drawText(name.toUpperCase() || 'PRODUCER', { x: 400, y: height - 192, size: 12, font: helveticaBold, color: black })

    page.drawLine({ start: { x: 40, y: height - 210 }, end: { x: width - 40, y: height - 210 }, thickness: 2, color: black })

    // 3. Invoice Table Structure
    const tableTop = height - 280;
    
    // Heavy Top border for table
    page.drawLine({ start: { x: 40, y: tableTop }, end: { x: width - 40, y: tableTop }, thickness: 4, color: black })
    
    // Table Headers
    page.drawText('ITEM DESCRIPTION', { x: 50, y: tableTop - 25, size: 10, font: helveticaBold, color: black })
    page.drawText('FORMAT', { x: 350, y: tableTop - 25, size: 10, font: helveticaBold, color: black })
    page.drawText('AMOUNT', { x: width - 120, y: tableTop - 25, size: 10, font: helveticaBold, color: black })
    
    // Thick Divider
    page.drawLine({ start: { x: 40, y: tableTop - 40 }, end: { x: width - 40, y: tableTop - 40 }, thickness: 2, color: black })
    
    // Product Row
    page.drawText(itemName.toUpperCase(), { x: 50, y: tableTop - 80, size: 14, font: helveticaBold, color: black })
    page.drawText(itemType.toUpperCase(), { x: 350, y: tableTop - 80, size: 10, font: helveticaBold, color: gray })
    page.drawText(`INR ${amount.toFixed(2)}`, { x: width - 140, y: tableTop - 80, size: 14, font: helveticaBold, color: black })
    
    // Bottom border for calculation
    page.drawLine({ start: { x: 40, y: tableTop - 130 }, end: { x: width - 40, y: tableTop - 130 }, thickness: 4, color: black })
    
    // Grand Total Box (Inverted)
    page.drawRectangle({ x: width - 260, y: tableTop - 195, width: 220, height: 45, color: black })
    page.drawText('TOTAL PAID', { x: width - 245, y: tableTop - 177, size: 12, font: helveticaBold, color: white })
    page.drawText(`Rs. ${amount.toFixed(2)}`, { x: width - 140, y: tableTop - 177, size: 16, font: helveticaBold, color: white })

    // 4. Disclaimers at the bottom
    page.drawLine({ start: { x: 40, y: 100 }, end: { x: width - 40, y: 100 }, thickness: 2, color: black })
    page.drawText('AUTHORIZED SIGNATURE NOT REQUIRED.', { x: 40, y: 80, size: 9, font: helveticaBold, color: black })
    page.drawText('THIS IS A COMPUTER-GENERATED TAX INVOICE. SECURELY ISSUED BY THE SAMPLES WALA PAYMENT NETWORK.', { x: 40, y: 65, size: 7, font: helveticaBold, color: gray })

    // Build the final PDF array buffer and convert to base64
    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes).toString('base64');
}
