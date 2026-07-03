/**
 * Google Sheets API Integration Service
 * Compiling real-time luxury travel registers directly into Sovereign spreadsheets.
 */

export interface SheetExportResult {
  id: string;
  url: string;
}

/**
 * Create a new, blank Google Spreadsheet with a specified title.
 */
export async function createSpreadsheet(
  accessToken: string,
  title: string
): Promise<SheetExportResult> {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Sheets creation failed: ${errText}`);
  }

  const data = await response.json();
  return {
    id: data.spreadsheetId,
    url: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
  };
}

/**
 * Writes raw row-major values into the specified range of a spreadsheet.
 */
export async function writeSheetData(
  accessToken: string,
  spreadsheetId: string,
  values: any[][],
  range: string = 'Sheet1!A1'
): Promise<boolean> {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: range,
        majorDimension: 'ROWS',
        values: values,
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Writing sheet values failed: ${errText}`);
  }

  return true;
}

/**
 * Format and export full booking records into a highly polished Google Sheet layout.
 */
export async function exportBookingsToSheets(
  accessToken: string,
  bookings: any[],
  title: string = 'MAS Agency Enterprise - Sovereign Bookings Ledger'
): Promise<SheetExportResult> {
  // Create spreadsheet
  const sheet = await createSpreadsheet(accessToken, title);

  // Compile row values
  const headers = [
    'Reservation ID',
    'Customer Name',
    'Customer Email',
    'Nationality',
    'Luxury Excursion',
    'Travel Date',
    'Travelers Count',
    'Pickup Hotel',
    'Total Amount (USD)',
    'Payment Status',
    'Booking Status',
    'Assigned Chauffeur',
    'Assigned Egyptologist',
    'Luxury Add-ons',
    'Special Requests',
    'Created At'
  ];

  const rows = bookings.map((b) => [
    b.id || '',
    b.customerName || '',
    b.customerEmail || '',
    b.customerNationality || '',
    b.tourTitle?.en || b.tourTitle || '',
    b.date || '',
    b.travelerCount || 1,
    b.pickupHotel || '',
    b.totalAmountUSD || 0,
    b.paymentStatus || '',
    b.status || '',
    b.driverName || 'Not Assigned',
    b.guideName || 'Not Assigned',
    b.luxuryAddon ? `${b.luxuryAddon.title.en} (+$${b.luxuryAddon.priceUSD})` : 'None',
    b.specialRequests || '',
    b.createdAt || ''
  ]);

  const sheetValues = [headers, ...rows];

  // Write values starting at A1 on Sheet1
  await writeSheetData(accessToken, sheet.id, sheetValues, 'Sheet1!A1');

  return sheet;
}
