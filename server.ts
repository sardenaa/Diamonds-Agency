import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import PDFDocument from 'pdfkit';
import { getDB, saveDB, logAudit, DEFAULT_CURRENCIES } from './src/server/db.js';
import { createBackup, listBackups, restoreBackup, initDailyBackupScheduler } from './src/server/backup.js';
import { Tour, Booking, Review, Blog, Coupon, CustomerCRM } from './src/types.js';
import { buildSitemapXml } from './src/utils/generate-sitemap.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ----------------------------------------------------
  // Secure Session Manager & Cookie Parser Helper
  // ----------------------------------------------------
  const activeSessions = new Map<string, { tier: string; createdAt: number }>();
  const activeCustomerSessions = new Map<string, { email: string; createdAt: number }>();

  const getCookie = (req: any, name: string) => {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split(';').reduce((acc: any, cookie: string) => {
      const parts = cookie.split('=');
      const k = parts[0]?.trim();
      const v = parts.slice(1).join('=').trim();
      if (k) acc[k] = decodeURIComponent(v);
      return acc;
    }, {});
    return cookies[name] || null;
  };

  const requireClearance = (allowedTiers: string[]) => {
    return (req: any, res: any, next: any) => {
      const sessionToken = getCookie(req, 'mas_session_token');
      if (!sessionToken) {
        return res.status(401).json({ success: false, message: 'Unauthorized. No clearance token found.' });
      }
      const session = activeSessions.get(sessionToken);
      if (!session) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Session expired or invalid.' });
      }
      
      // Checking hierarchy: Sovereign Admin has master access to everything
      const hasAccess = session.tier === 'Sovereign Admin' || allowedTiers.includes(session.tier);
      if (hasAccess) {
        req.adminSession = session;
        return next();
      }
      
      return res.status(403).json({ success: false, message: 'Forbidden. Insufficient security clearance.' });
    };
  };

  // ----------------------------------------------------
  // Real-Time Alert Dispatch Registry & Broadcast Helper
  // ----------------------------------------------------
  let sseClients: any[] = [];

  function sendAdminNotification(type: string, message: string, data: any) {
    const db = getDB();
    if (!db.notifications) {
      db.notifications = [];
    }
    const newNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      data
    };
    db.notifications.unshift(newNotification);
    if (db.notifications.length > 100) {
      db.notifications = db.notifications.slice(0, 100);
    }
    saveDB(db);

    // Notify connected SSE clients
    const payload = JSON.stringify(newNotification);
    sseClients.forEach(client => {
      try {
        client.res.write(`data: ${payload}\n\n`);
      } catch (err) {
        // Failed write
      }
    });
  }

  // ----------------------------------------------------
  // Google Gemini AI Setup
  // ----------------------------------------------------
  let aiInstance: GoogleGenAI | null = null;
  function getAI() {
    if (!aiInstance) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('GEMINI_API_KEY is not defined. Running AI features in simulated mode.');
        return null;
      }
      aiInstance = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiInstance;
  }

  // Helper to trigger automated WhatsApp messages based on template rules
  function triggerWhatsAppAutomation(event: string, booking: Booking, metadata: Record<string, string> = {}) {
    const db = getDB();
    const template = db.whatsappTemplates?.find(t => t.triggerEvent === event && t.active);
    if (!template) return;

    let text = template.templateText;
    text = text.replace(/{customer_name}/g, booking.customerName);
    text = text.replace(/{booking_id}/g, booking.id);
    text = text.replace(/{tour_name}/g, booking.tourTitle.en);
    text = text.replace(/{date}/g, booking.date);
    text = text.replace(/{pickup_hotel}/g, booking.pickupHotel);
    text = text.replace(/{qr_code}/g, booking.qrCode);
    text = text.replace(/{driver_name}/g, booking.driverName || 'Sherif El Masry');
    text = text.replace(/{guide_name}/g, booking.guideName || 'Dr. Zahi');

    // Custom overrides
    Object.entries(metadata).forEach(([key, val]) => {
      text = text.replace(new RegExp(`{${key}}`, 'g'), val);
    });

    const customer = db.crm.find(c => c.email.toLowerCase() === booking.customerEmail.toLowerCase());
    if (customer) {
      customer.whatsappHistory.push({
        sender: 'system',
        message: text,
        timestamp: new Date().toISOString()
      });
      saveDB(db);
      logAudit('WHATSAPP_AUTO_DISPATCH', 'Automation Engine', `Triggered alert "${template.name}" for ${booking.id}`);
    }
  }

  // ----------------------------------------------------
  // REST API Endpoints
  // ----------------------------------------------------

  // Sitemap Route for Search Engine Crawlers
  app.get('/sitemap.xml', (req, res) => {
    try {
      const xml = buildSitemapXml(`https://${req.get('host') || 'mas-sovereign-tours.com'}`);
      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      console.error('Error generating dynamic sitemap.xml:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // 1. Currencies & Exchange Rates
  let currentCurrencies = JSON.parse(JSON.stringify(DEFAULT_CURRENCIES));
  app.get('/api/currencies', (req, res) => {
    // Introduce a tiny random fluctuation of up to +/- 0.4% to simulate live forex movements!
    currentCurrencies = currentCurrencies.map((c: any) => {
      if (c.code === 'USD') return c;
      // standard default baseline values
      let baseRate = 0.92;
      if (c.code === 'EUR') baseRate = 0.92;
      else if (c.code === 'GBP') baseRate = 0.78;
      else if (c.code === 'EGP') baseRate = 48.5;
      else if (c.code === 'SAR') baseRate = 3.75;
      else if (c.code === 'AED') baseRate = 3.67;

      const variation = 1 + (Math.random() * 0.008 - 0.004); // +/- 0.4%
      return {
        ...c,
        rateToUSD: parseFloat((baseRate * variation).toFixed(4))
      };
    });
    res.json(currentCurrencies);
  });

  // 2. Tours CRUD
  app.get('/api/tours', (req, res) => {
    const db = getDB();
    res.json(db.tours);
  });

  app.post('/api/tours', requireClearance(['Sovereign Admin', 'Operations Manager']), (req, res) => {
    const db = getDB();
    const newTour: Tour = {
      ...req.body,
      id: `tour-${Date.now()}`,
      rating: req.body.rating || 5.0,
      reviewCount: req.body.reviewCount || 0,
      itinerary: req.body.itinerary || [],
      faqs: req.body.faqs || [],
      pickupZones: req.body.pickupZones || [],
      hotels: req.body.hotels || [],
      extras: req.body.extras || []
    };
    db.tours.push(newTour);
    saveDB(db);
    logAudit('TOUR_CREATED', 'Admin Manager', `Created luxury tour: ${newTour.title.en}`);
    res.status(201).json(newTour);
  });

  app.put('/api/tours/:id', requireClearance(['Sovereign Admin', 'Operations Manager']), (req, res) => {
    const db = getDB();
    const index = db.tours.findIndex(t => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    db.tours[index] = { ...db.tours[index], ...req.body };
    saveDB(db);
    logAudit('TOUR_UPDATED', 'Admin Manager', `Updated tour details for: ${db.tours[index].title.en}`);
    res.json(db.tours[index]);
  });

  app.delete('/api/tours/:id', requireClearance(['Sovereign Admin']), (req, res) => {
    const db = getDB();
    const index = db.tours.findIndex(t => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    const tourTitle = db.tours[index].title.en;
    db.tours.splice(index, 1);
    saveDB(db);
    logAudit('TOUR_DELETED', 'Admin Manager', `Deleted tour: ${tourTitle}`);
    res.json({ success: true, message: `Tour ${tourTitle} deleted` });
  });

  // 3. Bookings CRM & Checkout
  app.get('/api/bookings', requireClearance(['Sovereign Admin', 'Operations Manager', 'Guest Relations Coordinator']), (req, res) => {
    const db = getDB();
    res.json(db.bookings);
  });

  app.get('/api/bookings/:id', (req, res) => {
    const db = getDB();
    const booking = db.bookings.find(b => b.id === req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  });

  app.post('/api/bookings', (req, res) => {
    const db = getDB();
    const {
      tourId,
      customerName,
      customerEmail,
      customerPhone,
      customerNationality,
      date,
      travelerCount,
      travelers,
      pickupHotel,
      roomNumber,
      specialRequests,
      paymentMethod,
      couponCode,
      selectedExtras, // array of extra IDs
      currency,
      signatureUrl,
      metadata
    } = req.body;

    const tour = db.tours.find(t => t.id === tourId);
    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Compute cost
    let basePrice = tour.priceUSD * travelerCount;
    let extrasPrice = 0;
    if (selectedExtras && selectedExtras.length > 0) {
      selectedExtras.forEach((extId: string) => {
        const ext = tour.extras.find(e => e.id === extId);
        if (ext) {
          extrasPrice += ext.priceUSD;
        }
      });
    }

    let subTotal = basePrice + extrasPrice;
    let discount = 0;
    if (couponCode) {
      const coupon = db.coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.active);
      if (coupon) {
        discount = subTotal * (coupon.discountPercent / 100);
      }
    }

    const totalUSD = subTotal - discount;

    // Set payment status based on method
    const paymentStatus = (paymentMethod === 'Cash' || paymentMethod === 'Pay at Pickup') ? 'unpaid' : 'paid';
    const amountPaidUSD = paymentStatus === 'paid' ? totalUSD : 0;

    const bookingId = `RES-${Math.floor(10000 + Math.random() * 90000)}`;

    const newBooking: Booking = {
      id: bookingId,
      tourId,
      tourTitle: tour.title,
      customerName,
      customerEmail,
      customerPhone,
      customerNationality,
      travelerCount,
      travelers: travelers || [{ name: customerName, ageGroup: 'adult' }],
      pickupHotel,
      roomNumber,
      specialRequests,
      date,
      status: 'pending',
      paymentStatus,
      paymentMethod,
      amountPaidUSD,
      totalAmountUSD: totalUSD,
      currencyUsed: currency || 'USD',
      qrCode: `MAS-QR-${bookingId}`,
      whatsappSent: true,
      signatureUrl,
      metadata: metadata || {},
      createdAt: new Date().toISOString()
    };

    db.bookings.push(newBooking);

    // Upsert CRM profile
    let customer = db.crm.find(c => c.email.toLowerCase() === customerEmail.toLowerCase());
    const initialWhatsApp = [
      { sender: 'system' as const, message: `Your luxury tour booking *${bookingId}* for *${tour.title.en}* on *${date}* has been received! Our coordinators are reviewing your VIP chauffeur details.`, timestamp: new Date().toISOString() },
      { sender: 'system' as const, message: `🎟️ *MAS Digital Ticket:* Your secure QR voucher code is *${newBooking.qrCode}*. Show this to your driver at pickup hotel *${pickupHotel}*.`, timestamp: new Date().toISOString() }
    ];

    // Generate formal email itinerary confirmation
    const emailId = `EML-${Math.floor(10000 + Math.random() * 90000)}`;
    const itineraryList = tour.itinerary
      ? tour.itinerary.map(item => `Day ${item.day}: ${item.title.en}\nDescription: ${item.description.en}`).join('\n\n')
      : 'Bespoke custom itinerary coordinated dynamically.';
    
    const emailBody = `Dear ${customerName},

We are absolutely thrilled to present your formal itinerary confirmation for your upcoming ultra-luxury expedition with MAS Agency.

Reservation ID: ${bookingId}
Tour Select: ${tour.title.en}
Date of Expedition: ${date}
Traveler(s): ${travelerCount} Guest(s)
Chauffeur Pickup Location: ${pickupHotel} (Room: ${roomNumber || 'TBD'})
Special Requests: ${specialRequests || 'None'}

--- EXPEDITION ITINERARY DETAILS ---
${itineraryList}

Your secure digital ticket and custom chauffeur credentials have been registered in our central ledger. A formal, print-ready PDF itinerary has been attached to this email.

If you require any bespoke modifications, helicopter scenic transfers, or premium security alignments, please reply to this email directly to connect with your designated Personal Travel Butler.

With our highest esteem,
MAS Agency Royal Concierge Division`;

    const emailMsg = {
      id: emailId,
      recipientEmail: customerEmail,
      subject: `👑 MAS Agency: Formal Expedition Itinerary Confirmation [${bookingId}]`,
      body: emailBody,
      attachmentName: `MAS_Itinerary_${bookingId}.pdf`,
      timestamp: new Date().toISOString()
    };

    if (!customer) {
      customer = {
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
        nationality: customerNationality,
        language: 'en',
        tags: ['VIP', 'New Customer'],
        notes: specialRequests || '',
        whatsappHistory: initialWhatsApp,
        supportHistory: [
          { sender: 'support' as const, message: `Hello ${customerName}! Thank you for choosing MAS Agency. Your personal luxury advisor is standing by.`, timestamp: new Date().toISOString() }
        ],
        emailHistory: [emailMsg],
        totalSpentUSD: amountPaidUSD,
        createdAt: new Date().toISOString()
      };
      db.crm.push(customer);
    } else {
      customer.totalSpentUSD += amountPaidUSD;
      customer.whatsappHistory.push(...initialWhatsApp);
      if (!customer.emailHistory) {
        customer.emailHistory = [];
      }
      customer.emailHistory.unshift(emailMsg);
    }

    sendAdminNotification('NEW_BOOKING', `New luxury reservation confirmed: ${bookingId} for ${customerName} (${tour.title.en})`, newBooking);

    saveDB(db);
    logAudit('BOOKING_CREATED', 'Guest Client', `Booking ${bookingId} successfully checked out. Formal PDF itinerary confirmation dispatched to: ${customerEmail}`);

    res.status(211).json({
      booking: newBooking,
      whatsappAlert: `🔔 MAS WhatsApp: Reservation ${bookingId} confirmed! QR voucher sent to +1 415-555-2671.`
    });
  });

  app.post('/api/bookings/bulk-import', requireClearance(['Sovereign Admin', 'Operations Manager']), (req, res) => {
    try {
      const db = getDB();
      const importedBookings = req.body;
      if (!Array.isArray(importedBookings)) {
        return res.status(400).json({ error: 'Payload must be an array of bookings' });
      }

      const addedBookings: Booking[] = [];
      for (const item of importedBookings) {
        const bookingId = item.id || `RES-${Math.floor(10000 + Math.random() * 90000)}`;
        const tourId = item.tourId || (db.tours[0]?.id || 'tour-1');
        const tour = db.tours.find(t => t.id === tourId) || db.tours[0];

        const newBooking: Booking = {
          id: bookingId,
          tourId: tourId,
          tourTitle: tour ? tour.title : { en: item.tourTitle?.en || 'Imported Expedition', ar: item.tourTitle?.ar || 'رحلة مستوردة' },
          customerName: item.customerName || 'Anonymous Traveler',
          customerEmail: item.customerEmail || 'imported@luxury-tours.com',
          customerPhone: item.customerPhone || '+201000000000',
          customerNationality: item.customerNationality || 'International',
          travelerCount: Number(item.travelerCount) || 1,
          travelers: item.travelers || [{ name: item.customerName || 'Anonymous Traveler', ageGroup: 'adult' }],
          pickupHotel: item.pickupHotel || 'Four Seasons Cairo',
          roomNumber: item.roomNumber || '707',
          specialRequests: item.specialRequests || '',
          date: item.date || new Date().toISOString().split('T')[0],
          status: item.status || 'pending',
          paymentStatus: item.paymentStatus || 'unpaid',
          paymentMethod: item.paymentMethod || 'Cash',
          amountPaidUSD: Number(item.amountPaidUSD) || 0,
          totalAmountUSD: Number(item.totalAmountUSD) || (tour ? tour.priceUSD : 500),
          currencyUsed: item.currencyUsed || 'USD',
          qrCode: item.qrCode || `MAS-QR-${bookingId}`,
          whatsappSent: false,
          signatureUrl: item.signatureUrl || '',
          metadata: item.metadata || {},
          createdAt: item.createdAt || new Date().toISOString()
        };

        if (!db.bookings.some(b => b.id === bookingId)) {
          db.bookings.push(newBooking);
          addedBookings.push(newBooking);

          let customer = db.crm.find(c => c.email.toLowerCase() === newBooking.customerEmail.toLowerCase());
          if (!customer) {
            db.crm.push({
              email: newBooking.customerEmail,
              name: newBooking.customerName,
              phone: newBooking.customerPhone,
              nationality: newBooking.customerNationality,
              language: 'en',
              tags: ['VIP', 'Imported'],
              totalSpentUSD: newBooking.totalAmountUSD,
              whatsappHistory: [],
              supportHistory: [],
              notes: `Imported via spreadsheet bulk ledger. Linked Reservation ID: ${newBooking.id}`,
              createdAt: new Date().toISOString()
            });
          } else {
            customer.totalSpentUSD += newBooking.totalAmountUSD;
            if (!customer.tags.includes('Imported')) {
              customer.tags.push('Imported');
            }
            customer.notes = (customer.notes || '') + ` | Import Linked Ref: ${newBooking.id}`;
          }
        }
      }

      saveDB(db);
      logAudit('BOOKINGS_BULK_IMPORT', 'Sovereign Sync Engine', `Bulk imported ${addedBookings.length} booking ledgers`);
      res.json({ success: true, count: addedBookings.length, bookings: addedBookings });
    } catch (e: any) {
      console.error('Bulk import failed:', e);
      res.status(500).json({ error: 'Bulk import failed', details: e.message });
    }
  });

  app.put('/api/bookings/:id', requireClearance(['Sovereign Admin', 'Operations Manager']), (req, res) => {
    const db = getDB();
    const index = db.bookings.findIndex(b => b.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const oldBooking = db.bookings[index];
    const updated = { ...oldBooking, ...req.body };
    db.bookings[index] = updated;

    // Trigger CRM updates & mock notifications if status/driver/guide shifts
    const customer = db.crm.find(c => c.email.toLowerCase() === updated.customerEmail.toLowerCase());
    if (customer) {
      if (req.body.status && req.body.status !== oldBooking.status) {
        let text = `Your luxury tour reservation *${updated.id}* is now *${updated.status.toUpperCase()}*!`;
        if (updated.status === 'confirmed') {
          text += ` Chauffeur: ${updated.driverName || 'Sherif El Masry'} (Mercedes V-Class). Guide: ${updated.guideName || 'Dr. Zahi'}. See you at ${updated.pickupHotel}!`;
        }
        customer.whatsappHistory.push({
          sender: 'system',
          message: text,
          timestamp: new Date().toISOString()
        });
      }

      // Live automated dispatch alerts
      if (req.body.driverName && req.body.driverName !== oldBooking.driverName) {
        triggerWhatsAppAutomation('on_driver_assign', updated);
      }
      if (req.body.guideName && req.body.guideName !== oldBooking.guideName) {
        triggerWhatsAppAutomation('on_guide_assign', updated);
      }
      if (req.body.paymentStatus === 'paid' && oldBooking.paymentStatus !== 'paid') {
        triggerWhatsAppAutomation('on_payment', updated);
      }
    }

    if (req.body.status === 'confirmed' && oldBooking.status !== 'confirmed') {
      sendAdminNotification('BOOKING_CONFIRMED', `Reservation ${updated.id} has been CONFIRMED for ${updated.customerName} (${updated.tourTitle.en})`, updated);
    }

    saveDB(db);
    const clientIp = (req.headers['x-forwarded-for'] as string || req.ip || req.socket.remoteAddress || '').split(',')[0].trim();
    const userAgentHeader = req.headers['user-agent'] || '';
    logAudit('BOOKING_UPDATED', 'Admin Operations', `Updated reservation status/driver for ${updated.id}`, clientIp, userAgentHeader);
    res.json(updated);
  });

  app.post('/api/bookings/:id/refund', requireClearance(['Sovereign Admin', 'Operations Manager']), (req, res) => {
    const db = getDB();
    const index = db.bookings.findIndex(b => b.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = db.bookings[index];
    booking.paymentStatus = 'refunded';
    booking.status = 'cancelled';
    
    // Decrement CRM total spent if refunded
    const customer = db.crm.find(c => c.email.toLowerCase() === booking.customerEmail.toLowerCase());
    if (customer) {
      customer.totalSpentUSD = Math.max(0, customer.totalSpentUSD - booking.totalAmountUSD);
      customer.whatsappHistory.push({
        sender: 'system',
        message: `🚨 *Refund Processed:* Your payment of $${booking.totalAmountUSD} for reservation *${booking.id}* has been successfully refunded to your original payment method. Booking is cancelled.`,
        timestamp: new Date().toISOString()
      });
    }

    saveDB(db);
    const clientIp = (req.headers['x-forwarded-for'] as string || req.ip || req.socket.remoteAddress || '').split(',')[0].trim();
    const userAgentHeader = req.headers['user-agent'] || '';
    logAudit('BOOKING_REFUNDED', 'Admin Finance', `Fully refunded booking ${booking.id} and updated CRM ledger.`, clientIp, userAgentHeader);
    res.json(booking);
  });

  app.delete('/api/bookings/:id', requireClearance(['Sovereign Admin']), (req, res) => {
    const db = getDB();
    const index = db.bookings.findIndex(b => b.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    const id = db.bookings[index].id;
    const customerEmail = db.bookings[index].customerEmail;
    db.bookings.splice(index, 1);
    saveDB(db);
    const clientIp = (req.headers['x-forwarded-for'] as string || req.ip || req.socket.remoteAddress || '').split(',')[0].trim();
    const userAgentHeader = req.headers['user-agent'] || '';
    logAudit('BOOKING_DELETED', 'Admin Operations', `Permanently deleted booking record: ${id} (Customer: ${customerEmail})`, clientIp, userAgentHeader);
    res.json({ success: true, message: `Booking ${id} deleted successfully.` });
  });

  // Post-Expedition review for individual tour components
  app.post('/api/bookings/:id/review', (req, res) => {
    const db = getDB();
    const index = db.bookings.findIndex(b => b.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = db.bookings[index];
    const reviewData = req.body; // { overallRating, components: { chauffeur, guide, itinerary, catering }, generalComment, photoUri }

    if (!booking.metadata) {
      booking.metadata = {};
    }
    if (reviewData.photoUri) {
      booking.metadata.reviewPhotoUri = reviewData.photoUri;
    }

    booking.review = {
      submittedAt: new Date().toISOString(),
      overallRating: Number(reviewData.overallRating) || 5,
      components: {
        chauffeur: {
          rating: Number(reviewData.components?.chauffeur?.rating) || 5,
          comment: reviewData.components?.chauffeur?.comment || ""
        },
        guide: {
          rating: Number(reviewData.components?.guide?.rating) || 5,
          comment: reviewData.components?.guide?.comment || ""
        },
        itinerary: {
          rating: Number(reviewData.components?.itinerary?.rating) || 5,
          comment: reviewData.components?.itinerary?.comment || ""
        },
        catering: {
          rating: Number(reviewData.components?.catering?.rating) || 5,
          comment: reviewData.components?.catering?.comment || ""
        }
      },
      generalComment: reviewData.generalComment || ""
    };

    // Also add to db.reviews list so it registers across the system
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      tourId: booking.tourId,
      customerName: booking.customerName,
      rating: Number(reviewData.overallRating) || 5,
      comment: reviewData.generalComment || `Splendid tour components review. Chauffeur: ${reviewData.components?.chauffeur?.rating || 5}/5. Guide: ${reviewData.components?.guide?.rating || 5}/5.`,
      language: booking.customerNationality === 'Egypt' || booking.customerNationality === 'Saudi Arabia' ? 'ar' : 'en',
      date: new Date().toISOString().split('T')[0],
      photoUri: reviewData.photoUri || undefined
    };
    db.reviews.unshift(newReview);

    // Update tour average rating & count
    const tourIndex = db.tours.findIndex(t => t.id === booking.tourId);
    if (tourIndex !== -1) {
      const tour = db.tours[tourIndex];
      const prevCount = tour.reviewCount || 0;
      const prevRating = tour.rating || 5.0;
      const newCount = prevCount + 1;
      const newRating = parseFloat(((prevRating * prevCount + (Number(reviewData.overallRating) || 5)) / newCount).toFixed(2));
      db.tours[tourIndex] = {
        ...tour,
        reviewCount: newCount,
        rating: newRating
      };
    }

    saveDB(db);
    logAudit('BOOKING_REVIEWED', booking.customerName, `Submitted post-expedition review for booking ${booking.id}. Overall rating: ${reviewData.overallRating}/5.`);
    res.json(booking);
  });

  // Get personalized luxury recommendations for a specific booking
  app.get('/api/bookings/:id/recommendations', async (req, res) => {
    const db = getDB();
    const booking = db.bookings.find(b => b.id === req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Get booking history of this customer
    const historyBookings = db.bookings.filter(b => 
      b.customerEmail.toLowerCase() === booking.customerEmail.toLowerCase() && 
      b.id !== booking.id
    );

    const tour = db.tours.find(t => t.id === booking.tourId);
    const tourTitle = tour ? tour.title.en : booking.tourTitle.en;

    // Rule-based high-quality backup recommendations (guarantees stunning curated upgrades!)
    const ruleBasedUpgrades = [
      {
        id: 'addon-helicopter',
        title: {
          en: 'Private Helicopter Scenic Transfer & Tour Flight',
          ar: 'نقل وطيران هليكوبتر بانورامي خاص'
        },
        description: {
          en: `Soar through the Egyptian skies in a private twin-engine helicopter. Fly directly from Cairo Heliport to the Pyramids Plateau, bypassing highway congestion in ultimate royal convenience.`,
          ar: `حلق في السماء المصرية بطائرة هليكوبتر خاصة ثنائية المحرك. سافر مباشرة من مهبط طائرات القاهرة إلى هضبة الأهرامات، متجاوزًا الازدحام المروري براحة ملوكية مطلقة.`
        },
        priceUSD: 1200,
        icon: 'Helicopter',
        reason: {
          en: `Complementing your high-end experience, this premium flight secures seamless, luxury transportation suited for MAS VIP travelers.`,
          ar: `استكمالاً لتجربتك الراقية، توفر هذه الرحلة المتميزة وسيلة نقل فاخرة وسلسة تناسب كبار الشخصيات.`
        }
      },
      {
        id: 'addon-sphynx-access',
        title: {
          en: 'Sovereign Sphinx Front-Row Access (Ministry Cleared)',
          ar: 'دخول سيادي حصري بين قدمي أبي الهول (بتصريح رسمي)'
        },
        description: {
          en: `Bypass all protective cordons with exclusive Ministry of Antiquities clearance. Walk between the paws of the Great Sphinx for a private up-close exploration.`,
          ar: `تخطى جميع الحواجز الأمنية بتصريح حصري من وزارة الآثار. تجول مباشرة بين قدمي تمثال أبي الهول العظيم في استكشاف خاص عن قرب.`
        },
        priceUSD: 1500,
        icon: 'Crown',
        reason: {
          en: `Aligned with your distinguished travel history, we have unlocked special access privileges normally closed to the public.`,
          ar: `بناءً على تاريخ سفرك المتميز وتفضيلاتك الراقية، قمنا بتوفير امتيازات دخول خاصة مغلقة عادةً أمام الجمهور.`
        }
      },
      {
        id: 'addon-private-dining',
        title: {
          en: 'Exclusive Dunes Sunset Private Dining Pavilion',
          ar: 'جناح عشاء صحراوي خاص وحصري عند غروب الشمس'
        },
        description: {
          en: `An enchanting royal dinner under the stars at a private, secluded desert oasis. Includes a 5-star personal chef, a live harpist, and private security guards.`,
          ar: `عشاء ملكي ساحر تحت النجوم في واحة صحراوية خاصة ومنعزلة. يشمل طاهٍ شخصي حائز على تصنيف 5 نجوم، عازفة هارب حية، وحراسة أمنية خاصة.`
        },
        priceUSD: 850,
        icon: 'Utensils',
        reason: {
          en: `Perfect for your itinerary, this customized dinner offers the pinnacle of Bespoke Egyptian Gastronomy.`,
          ar: `مناسب تمامًا لبرنامجك السياحي، يقدم هذا العشاء المخصص قمة فن الطهي المصري الراقي والمصمم لك خصيصًا.`
        }
      },
      {
        id: 'addon-felucca',
        title: {
          en: 'Heritage Nile Yacht Sunset Sail with Caviar & Champagne',
          ar: 'إبحار خاص لليخوت النيلية عند الغروب مع الكافيار والشراب الفاخر'
        },
        description: {
          en: `Glide gracefully down the Nile on a private teak sailboat. Savor select Iranian Ossetra caviar and premium vintage champagne poured by your private onboard steward.`,
          ar: `أبحر برقة في النيل على متن قارب شراعي خاص من خشب الساج. تذوق الكافيار الإيراني الفاخر والشراب الفاخر مع خدمة خادم خاص على متن القارب.`
        },
        priceUSD: 450,
        icon: 'Ship',
        reason: {
          en: `A perfect enhancement to your voyage, providing peaceful, high-end maritime relaxation with elite catering.`,
          ar: `ترقية مثالية لرحلتك، تمنحك استرخاءً بحريًا هادئًا وراقيًا مع خدمات ضيافة من النخبة.`
        }
      }
    ];

    // Pick 2 recommendations based on tour type or booking history
    let recommended: any[] = [];
    if (booking.tourId === 'tour-1') {
      recommended = [ruleBasedUpgrades[0], ruleBasedUpgrades[1]]; // Helicopter + Sphinx
    } else if (booking.tourId === 'tour-2') {
      recommended = [ruleBasedUpgrades[2], ruleBasedUpgrades[3]]; // Dining + Felucca
    } else {
      recommended = [ruleBasedUpgrades[0], ruleBasedUpgrades[2]]; // Helicopter + Dining
    }

    const ai = getAI();
    if (!ai) {
      // Return beautiful, personalized rule-based upgrades
      // Tailor the reason to include previous booking titles if history exists!
      if (historyBookings.length > 0) {
        const prevTitle = historyBookings[0].tourTitle.en;
        recommended = recommended.map(item => ({
          ...item,
          reason: {
            en: `Because you previously enjoyed the "${prevTitle}", we recommend this ultra-luxury addition for your new expedition.`,
            ar: `نظراً لتجربتك الرائعة السابقة في "${historyBookings[0].tourTitle.ar || prevTitle}"، نوصي بهذه الترقية الفاخرة لرحلتك الجديدة.`
          }
        }));
      }
      return res.json(recommended);
    }

    try {
      // Build a premium prompt for Gemini to dynamically customize these luxury add-ons!
      const historyContext = historyBookings.length > 0
        ? `Customer has previously booked these tours: ${historyBookings.map(b => `"${b.tourTitle.en}" (Status: ${b.status}, total spent: $${b.totalAmountUSD})`).join(', ')}.`
        : `Customer is a new VIP guest registering high-end interest.`;

      const prompt = `Booking Details:
- Tour ID: ${booking.tourId}
- Tour Title: "${tourTitle}"
- Destination: "${booking.pickupHotel}" (staying at room ${booking.roomNumber || 'VIP suite'})
- Date of travel: ${booking.date}
- Customer Name: "${booking.customerName}"
- Nationality: "${booking.customerNationality}"
- Total Travelers: ${booking.travelerCount}

Customer Profile & Booking History:
${historyContext}
Prefers premium services.

Please generate exactly 2 highly customized, personalized "Luxury Add-ons" tailored specifically to this customer.
Ensure your response is valid JSON only, following the schema. No markdown formatting codeblocks (like \`\`\`json), no introductory text.

JSON Schema:
[
  {
    "id": "unique-id-string",
    "title": { "en": "English Upgrade Title", "ar": "Arabic Upgrade Title" },
    "description": { "en": "English detailed, luxury-focused description", "ar": "Arabic detailed description" },
    "priceUSD": 450,
    "icon": "Helicopter",
    "reason": { "en": "Why suggested, mentioning their history/preferences", "ar": "Arabic explanation why" }
  }
]`;

      const systemInstruction = 
        "You are the Chief Experience Architect at MAS Agency, specializing in ultra-luxury custom upgrades. " +
        "Suggest actual bespoke upgrades like Private Helicopters, VIP Sphinx access between the paws, Sunset Dunes Bedouin Dining, " +
        "Heritage Nile yachts, or personal Egyptologist scholars. " +
        "Praise the user's booking history subtly, explaining why they will love this specific upgrade. " +
        "Output MUST be valid JSON, conforming perfectly to the schema. Do not include markdown codeblocks, prefixing words, or suffixing comments.";

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text.trim());
      if (Array.isArray(parsed) && parsed.length >= 2) {
        return res.json(parsed.slice(0, 2));
      }
      throw new Error("Invalid output format from Gemini");
    } catch (err: any) {
      console.warn('Gemini custom recommendations failed, falling back to ruled upgrades:', err);
      // Fallback
      if (historyBookings.length > 0) {
        const prevTitle = historyBookings[0].tourTitle.en;
        recommended = recommended.map(item => ({
          ...item,
          reason: {
            en: `Based on your premium preferences and having previously experienced the "${prevTitle}", we curate this elite addition.`,
            ar: `نظراً لتجربتك الرائعة السابقة في "${historyBookings[0].tourTitle.ar || prevTitle}"، نوصي بهذه الترقية الفاخرة لرحلتك الجديدة.`
          }
        }));
      }
      res.json(recommended);
    }
  });

  // Upgrade booking with a specific personalized add-on
  app.post('/api/bookings/:id/upgrade', (req, res) => {
    const db = getDB();
    const index = db.bookings.findIndex(b => b.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const { addonId, title, priceUSD, icon } = req.body;
    if (!addonId || !title || !priceUSD) {
      return res.status(400).json({ error: 'Missing upgrade details' });
    }

    const booking = db.bookings[index];
    
    // Check if already upgraded to prevent double charges
    if (booking.luxuryAddon && booking.luxuryAddon.id === addonId) {
      return res.status(400).json({ error: 'This upgrade has already been successfully integrated.' });
    }

    // Apply upgrade
    booking.luxuryAddon = { id: addonId, title, priceUSD, icon };
    booking.totalAmountUSD += priceUSD;
    if (booking.paymentStatus === 'paid') {
      booking.amountPaidUSD += priceUSD;
    }

    // Append to special requests for logs visibility
    const enTitle = title.en;
    booking.specialRequests = booking.specialRequests 
      ? `${booking.specialRequests} | Added Luxury Upgrade: ${enTitle} (+$${priceUSD})`
      : `Added Luxury Upgrade: ${enTitle} (+$${priceUSD})`;

    // Update CRM profile spent
    const customer = db.crm.find(c => c.email.toLowerCase() === booking.customerEmail.toLowerCase());
    if (customer) {
      if (booking.paymentStatus === 'paid') {
        customer.totalSpentUSD += priceUSD;
      }
      
      // Dispatch custom VIP upgrade WhatsApp message
      customer.whatsappHistory.push({
        sender: 'system',
        message: `👑 *MAS Sovereign Upgrade:* We are honored to confirm that the *${enTitle}* upgrade is secured for your reservation *${booking.id}*! Your premium schedule has been updated with our operations team.`,
        timestamp: new Date().toISOString()
      });
    }

    saveDB(db);
    const clientIp = (req.headers['x-forwarded-for'] as string || req.ip || req.socket.remoteAddress || '').split(',')[0].trim();
    const userAgentHeader = req.headers['user-agent'] || '';
    logAudit('BOOKING_UPGRADED', 'Guest Client / Recommendation Engine', `Upgraded booking ${booking.id} with ${enTitle} (+$${priceUSD})`, clientIp, userAgentHeader);

    res.json(booking);
  });

  // 4. Reviews API
  app.get('/api/reviews', (req, res) => {
    const db = getDB();
    res.json(db.reviews);
  });

  app.post('/api/reviews', (req, res) => {
    const db = getDB();
    const { tourId, customerName, rating, comment, language } = req.body;

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      tourId,
      customerName,
      rating: parseFloat(rating) || 5,
      comment,
      language: language || 'en',
      date: new Date().toISOString().split('T')[0]
    };

    db.reviews.unshift(newReview);

    // Recompute Tour Rating
    const tourIndex = db.tours.findIndex(t => t.id === tourId);
    if (tourIndex !== -1) {
      const tourReviews = db.reviews.filter(r => r.tourId === tourId);
      const totalRating = tourReviews.reduce((sum, r) => sum + r.rating, 0);
      db.tours[tourIndex].reviewCount = tourReviews.length;
      db.tours[tourIndex].rating = parseFloat((totalRating / tourReviews.length).toFixed(2));
    }

    saveDB(db);
    logAudit('REVIEW_SUBMITTED', 'Guest Client', `Review created by ${customerName} for tour: ${tourId}`);
    res.status(201).json(newReview);
  });

  // 4b. Notifications & Real-Time Alerts API
  app.get('/api/admin/notifications', requireClearance(['Sovereign Admin', 'Operations Manager', 'Guest Relations Coordinator']), (req, res) => {
    const db = getDB();
    res.json(db.notifications || []);
  });

  app.post('/api/admin/notifications/:id/read', requireClearance(['Sovereign Admin', 'Operations Manager', 'Guest Relations Coordinator']), (req, res) => {
    const db = getDB();
    db.notifications = db.notifications || [];
    const notif = db.notifications.find(n => n.id === req.params.id);
    if (notif) {
      notif.read = true;
      saveDB(db);
    }
    res.json({ success: true, notifications: db.notifications });
  });

  app.post('/api/admin/notifications/mark-all-read', requireClearance(['Sovereign Admin', 'Operations Manager', 'Guest Relations Coordinator']), (req, res) => {
    const db = getDB();
    db.notifications = db.notifications || [];
    db.notifications.forEach(n => { n.read = true; });
    saveDB(db);
    res.json({ success: true, notifications: db.notifications });
  });

  app.delete('/api/admin/notifications', requireClearance(['Sovereign Admin']), (req, res) => {
    const db = getDB();
    db.notifications = [];
    saveDB(db);
    res.json({ success: true, notifications: [] });
  });

  app.get('/api/admin/notifications-stream', requireClearance(['Sovereign Admin', 'Operations Manager', 'Guest Relations Coordinator']), (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    // Send initial greeting ping
    res.write(`data: ${JSON.stringify({ type: 'PING', timestamp: new Date().toISOString() })}\n\n`);

    const client = { id: Date.now(), res };
    sseClients.push(client);

    const intervalId = setInterval(() => {
      try {
        res.write(`data: ${JSON.stringify({ type: 'HEARTBEAT' })}\n\n`);
      } catch (err) {
        // connection closed
      }
    }, 30000);

    req.on('close', () => {
      clearInterval(intervalId);
      sseClients = sseClients.filter(c => c.id !== client.id);
    });
  });

  // 5. Blogs API
  app.get('/api/blogs', (req, res) => {
    const db = getDB();
    res.json(db.blogs);
  });

  app.post('/api/blogs', (req, res) => {
    const db = getDB();
    const newBlog: Blog = {
      ...req.body,
      id: `blog-${Date.now()}`,
      slug: req.body.slug || req.body.title.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      date: new Date().toISOString().split('T')[0]
    };
    db.blogs.unshift(newBlog);
    saveDB(db);
    logAudit('BLOG_CREATED', 'Content Editor', `Published article: ${newBlog.title.en}`);
    res.status(201).json(newBlog);
  });

  app.put('/api/blogs/:id', (req, res) => {
    const db = getDB();
    const index = db.blogs.findIndex(b => b.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    const updated = { ...db.blogs[index], ...req.body };
    db.blogs[index] = updated;
    saveDB(db);
    logAudit('BLOG_UPDATED', 'Content Editor', `Updated article: ${updated.title.en}`);
    res.json(updated);
  });

  app.delete('/api/blogs/:id', (req, res) => {
    const db = getDB();
    const index = db.blogs.findIndex(b => b.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    const title = db.blogs[index].title.en;
    db.blogs.splice(index, 1);
    saveDB(db);
    logAudit('BLOG_DELETED', 'Content Editor', `Deleted article: ${title}`);
    res.json({ success: true });
  });

  // 6. Coupons API
  app.get('/api/coupons', requireClearance(['Sovereign Admin', 'Operations Manager']), (req, res) => {
    const db = getDB();
    res.json(db.coupons);
  });

  app.post('/api/coupons', requireClearance(['Sovereign Admin', 'Operations Manager']), (req, res) => {
    const db = getDB();
    const newCoupon: Coupon = {
      code: req.body.code.toUpperCase(),
      discountPercent: parseInt(req.body.discountPercent) || 10,
      validUntil: req.body.validUntil || '2026-12-31',
      active: true
    };
    db.coupons.unshift(newCoupon);
    saveDB(db);
    logAudit('COUPON_CREATED', 'Marketing Team', `Created promotion coupon: ${newCoupon.code} (${newCoupon.discountPercent}% off)`);
    res.status(201).json(newCoupon);
  });

  app.put('/api/coupons/:code', requireClearance(['Sovereign Admin', 'Operations Manager']), (req, res) => {
    const db = getDB();
    const index = db.coupons.findIndex(c => c.code.toUpperCase() === req.params.code.toUpperCase());
    if (index === -1) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    const updated = { ...db.coupons[index], ...req.body };
    db.coupons[index] = updated;
    saveDB(db);
    logAudit('COUPON_UPDATED', 'Marketing Team', `Updated promotion coupon: ${updated.code}`);
    res.json(updated);
  });

  app.delete('/api/coupons/:code', requireClearance(['Sovereign Admin']), (req, res) => {
    const db = getDB();
    const index = db.coupons.findIndex(c => c.code.toUpperCase() === req.params.code.toUpperCase());
    if (index === -1) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    const code = db.coupons[index].code;
    db.coupons.splice(index, 1);
    saveDB(db);
    logAudit('COUPON_DELETED', 'Marketing Team', `Deleted coupon code: ${code}`);
    res.json({ success: true });
  });

  app.post('/api/coupons/verify', (req, res) => {
    const db = getDB();
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ valid: false, message: 'Missing coupon code' });
    }
    const coupon = db.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
    if (!coupon) {
      return res.json({ valid: false, message: 'Invalid or inactive promotional coupon code.' });
    }
    res.json({ valid: true, discountPercent: coupon.discountPercent });
  });

  // Secure Administrative Passcode Verification
  app.post('/api/admin/verify-passcode', (req, res) => {
    const { tier, pin } = req.body;
    if (!tier || !pin) {
      return res.status(400).json({ success: false, message: 'Missing tier or passcode.' });
    }

    const adminPin = process.env.ADMIN_PIN || '8899';
    const operationsPin = process.env.OPERATIONS_PIN || '4455';
    const crmPin = process.env.CRM_PIN || '2233';

    let expectedPin = '';
    let titleEn = '';

    if (tier === 'admin') {
      expectedPin = adminPin;
      titleEn = 'Sovereign Admin';
    } else if (tier === 'operations') {
      expectedPin = operationsPin;
      titleEn = 'Operations Manager';
    } else if (tier === 'crm') {
      expectedPin = crmPin;
      titleEn = 'Guest Relations Coordinator';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid clearance tier.' });
    }

    if (pin === expectedPin) {
      logAudit('ADMIN_AUTH_SUCCESS', 'Sovereign Gate', `Clearance Level granted for role: ${titleEn}`);
      
      // Generate secure session token
      const sessionToken = crypto.randomBytes(32).toString('hex');
      activeSessions.set(sessionToken, {
        tier: titleEn,
        createdAt: Date.now()
      });

      // Set cookie in response
      res.cookie('mas_session_token', sessionToken, {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: false, // Allow client to read/verify if needed, but sent automatically
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
      });

      res.json({ success: true, tier: titleEn });
    } else {
      logAudit('ADMIN_AUTH_FAILURE', 'Sovereign Gate', `Failed security verification attempt for role tier: ${tier}`);
      res.status(401).json({ success: false, message: 'Invalid access credentials.' });
    }
  });

  // Validate session endpoint
  app.get('/api/admin/validate-session', (req, res) => {
    const sessionToken = getCookie(req, 'mas_session_token');
    if (!sessionToken) {
      return res.json({ valid: false });
    }
    const session = activeSessions.get(sessionToken);
    if (!session) {
      return res.json({ valid: false });
    }
    res.json({ valid: true, tier: session.tier });
  });

  // Admin Logout endpoint
  app.post('/api/admin/logout', (req, res) => {
    const sessionToken = getCookie(req, 'mas_session_token');
    if (sessionToken) {
      activeSessions.delete(sessionToken);
    }
    res.clearCookie('mas_session_token', { path: '/' });
    res.json({ success: true });
  });

  // ----------------------------------------------------
  // Customer Auth & Account Management APIs
  // ----------------------------------------------------
  
  // Register Customer
  app.post('/api/auth/register', (req, res) => {
    try {
      const db = getDB();
      const { name, email, phone, nationality, language, password, securityQuestion, securityAnswer, biography } = req.body;
      
      if (!name || !email || !password || !securityQuestion || !securityAnswer) {
        return res.status(400).json({ success: false, message: 'Missing required registration parameters.' });
      }

      const existingUser = db.users?.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'A user with this email address already exists.' });
      }

      // Add to users
      const newUser = {
        name,
        email: email.toLowerCase(),
        phone: phone || '',
        nationality: nationality || 'Egyptian',
        language: language || 'en',
        passwordHash: password,
        securityQuestion,
        securityAnswer: securityAnswer.toLowerCase().trim(),
        biography: biography || '',
        createdAt: new Date().toISOString()
      };
      
      if (!db.users) db.users = [];
      db.users.push(newUser);

      // Check or create matching CustomerCRM profile so existing crm mechanics work flawlessly
      let crmProfile = db.crm.find(c => c.email.toLowerCase() === email.toLowerCase());
      if (!crmProfile) {
        crmProfile = {
          email: email.toLowerCase(),
          name,
          phone: phone || '',
          nationality: nationality || 'Egyptian',
          language: language || 'en',
          tags: ['Registered User'],
          notes: 'Customer registered through Sovereign Portal.',
          whatsappHistory: [],
          supportHistory: [],
          totalSpentUSD: 0,
          createdAt: new Date().toISOString()
        };
        db.crm.push(crmProfile);
      } else {
        // Update phone and other fields on existing crm profile to match registration
        crmProfile.name = name;
        if (phone) crmProfile.phone = phone;
        if (nationality) crmProfile.nationality = nationality;
        if (language) crmProfile.language = language;
      }

      saveDB(db);
      logAudit('CUSTOMER_REGISTER', email, `Customer registered: ${name}`);

      // Generate session
      const sessionToken = crypto.randomBytes(32).toString('hex');
      activeCustomerSessions.set(sessionToken, {
        email: email.toLowerCase(),
        createdAt: Date.now()
      });

      res.cookie('mas_customer_token', sessionToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: false, // client can read to track login status
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
      });

      res.json({
        success: true,
        user: {
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          nationality: newUser.nationality,
          language: newUser.language,
          biography: newUser.biography
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Internal server error during registration.' });
    }
  });

  // Login Customer
  app.post('/api/auth/login', (req, res) => {
    try {
      const db = getDB();
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      }

      const user = db.users?.find(u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email address or password.' });
      }

      logAudit('CUSTOMER_LOGIN_SUCCESS', email, `Customer logged in: ${user.name}`);

      // Generate session
      const sessionToken = crypto.randomBytes(32).toString('hex');
      activeCustomerSessions.set(sessionToken, {
        email: user.email,
        createdAt: Date.now()
      });

      res.cookie('mas_customer_token', sessionToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: false,
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
      });

      res.json({
        success: true,
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          nationality: user.nationality,
          language: user.language,
          biography: user.biography
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Internal server error during login.' });
    }
  });

  // Validate Customer Session
  app.get('/api/auth/validate-session', (req, res) => {
    const sessionToken = getCookie(req, 'mas_customer_token');
    if (!sessionToken) {
      return res.json({ valid: false });
    }
    const session = activeCustomerSessions.get(sessionToken);
    if (!session) {
      return res.json({ valid: false });
    }
    const db = getDB();
    const user = db.users?.find(u => u.email.toLowerCase() === session.email.toLowerCase());
    if (!user) {
      return res.json({ valid: false });
    }
    res.json({
      valid: true,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        nationality: user.nationality,
        language: user.language,
        biography: user.biography
      }
    });
  });

  // Get Security Question (for reset password help)
  app.get('/api/auth/security-question', (req, res) => {
    const email = req.query.email as string;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please specify an email address.' });
    }
    const db = getDB();
    const user = db.users?.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered account found with this email address.' });
    }
    res.json({ success: true, securityQuestion: user.securityQuestion });
  });

  // Reset Password via Security Question Verification
  app.post('/api/auth/reset-password', (req, res) => {
    try {
      const db = getDB();
      const { email, securityAnswer, newPassword } = req.body;
      
      if (!email || !securityAnswer || !newPassword) {
        return res.status(400).json({ success: false, message: 'Missing parameters for password reset.' });
      }

      const user = db.users?.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(404).json({ success: false, message: 'Account not found.' });
      }

      if (user.securityAnswer.toLowerCase().trim() !== securityAnswer.toLowerCase().trim()) {
        return res.status(400).json({ success: false, message: 'Incorrect security answer.' });
      }

      user.passwordHash = newPassword;
      saveDB(db);
      logAudit('CUSTOMER_PASSWORD_RESET', email, 'Password reset successful via security question verification');
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Internal server error during password reset.' });
    }
  });

  // Update Profile Details
  app.put('/api/auth/profile', (req, res) => {
    try {
      const sessionToken = getCookie(req, 'mas_customer_token');
      if (!sessionToken) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
      }
      const session = activeCustomerSessions.get(sessionToken);
      if (!session) {
        return res.status(401).json({ success: false, message: 'Session expired or invalid.' });
      }

      const db = getDB();
      const user = db.users?.find(u => u.email.toLowerCase() === session.email.toLowerCase());
      if (!user) {
        return res.status(404).json({ success: false, message: 'Account details not found.' });
      }

      const { name, phone, nationality, language, biography } = req.body;
      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (nationality !== undefined) user.nationality = nationality;
      if (language !== undefined) user.language = language;
      if (biography !== undefined) user.biography = biography;

      // Sync with matching CustomerCRM profile
      const crmProfile = db.crm.find(c => c.email.toLowerCase() === user.email.toLowerCase());
      if (crmProfile) {
        if (name) crmProfile.name = name;
        if (phone !== undefined) crmProfile.phone = phone;
        if (nationality !== undefined) crmProfile.nationality = nationality;
        if (language !== undefined) crmProfile.language = language;
      }

      saveDB(db);
      logAudit('CUSTOMER_PROFILE_UPDATE', user.email, 'Profile details updated');

      res.json({
        success: true,
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          nationality: user.nationality,
          language: user.language,
          biography: user.biography
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error updating profile details.' });
    }
  });

  // Logout Customer
  app.post('/api/auth/logout', (req, res) => {
    const sessionToken = getCookie(req, 'mas_customer_token');
    if (sessionToken) {
      activeCustomerSessions.delete(sessionToken);
    }
    res.clearCookie('mas_customer_token', { path: '/' });
    res.json({ success: true });
  });

  // 7. CRM CRM CRUD
  app.get('/api/crm', requireClearance(['Sovereign Admin', 'Guest Relations Coordinator']), (req, res) => {
    const db = getDB();
    res.json(db.crm);
  });

  app.post('/api/crm', requireClearance(['Sovereign Admin', 'Guest Relations Coordinator']), (req, res) => {
    const db = getDB();
    const { email, name, phone, nationality, language, tags, notes } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }
    const exists = db.crm.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(400).json({ error: 'CRM profile with this email already exists' });
    }

    const newCustomer: CustomerCRM = {
      email,
      name,
      phone: phone || '',
      nationality: nationality || 'Egypt',
      language: language || 'en',
      tags: tags || ['VIP'],
      notes: notes || '',
      whatsappHistory: [
        { sender: 'system', message: `Welcome ${name} to MAS Agency. Your VIP CRM profile has been manually registered.`, timestamp: new Date().toISOString() }
      ],
      supportHistory: [
        { sender: 'support', message: `Hello ${name}! Welcome to MAS VIP Concierge. How may we assist you?`, timestamp: new Date().toISOString() }
      ],
      totalSpentUSD: 0,
      createdAt: new Date().toISOString()
    };

    db.crm.push(newCustomer);
    saveDB(db);
    logAudit('CRM_PROFILE_CREATED', 'CRM Executive', `Manually created CRM profile for: ${email}`);
    res.status(201).json(newCustomer);
  });

  app.put('/api/crm/:email', requireClearance(['Sovereign Admin', 'Guest Relations Coordinator']), (req, res) => {
    const db = getDB();
    const customer = db.crm.find(c => c.email.toLowerCase() === req.params.email.toLowerCase());
    if (!customer) {
      return res.status(404).json({ error: 'CRM profile not found' });
    }
    if (req.body.name !== undefined) customer.name = req.body.name;
    if (req.body.phone !== undefined) customer.phone = req.body.phone;
    if (req.body.nationality !== undefined) customer.nationality = req.body.nationality;
    if (req.body.language !== undefined) customer.language = req.body.language;
    if (req.body.tags !== undefined) customer.tags = req.body.tags;
    if (req.body.notes !== undefined) customer.notes = req.body.notes;
    saveDB(db);
    logAudit('CRM_PROFILE_UPDATED', 'CRM Executive', `Updated customer profile notes/tags/details for: ${customer.email}`);
    res.json(customer);
  });

  app.delete('/api/crm/:email', requireClearance(['Sovereign Admin']), (req, res) => {
    const db = getDB();
    const index = db.crm.findIndex(c => c.email.toLowerCase() === req.params.email.toLowerCase());
    if (index === -1) {
      return res.status(404).json({ error: 'CRM profile not found' });
    }
    const email = db.crm[index].email;
    db.crm.splice(index, 1);
    saveDB(db);
    logAudit('CRM_PROFILE_DELETED', 'CRM Executive', `Deleted CRM profile for: ${email}`);
    res.json({ success: true });
  });

  // 8. Custom Chatbot Messages (WhatsApp / Support) via CRM Console
  app.post('/api/crm/:email/whatsapp', requireClearance(['Sovereign Admin', 'Guest Relations Coordinator']), (req, res) => {
    const db = getDB();
    const customer = db.crm.find(c => c.email.toLowerCase() === req.params.email.toLowerCase());
    if (!customer) {
      return res.status(404).json({ error: 'CRM profile not found' });
    }
    const { message } = req.body;
    const newMessage = {
      sender: 'system' as const,
      message,
      timestamp: new Date().toISOString()
    };
    customer.whatsappHistory.push(newMessage);
    saveDB(db);
    logAudit('WHATSAPP_SENT_MANUAL', 'Admin CRM', `Sent manual WhatsApp to ${customer.name}: ${message.slice(0, 50)}...`);
    res.json(customer.whatsappHistory);
  });

  app.post('/api/crm/:email/support', requireClearance(['Sovereign Admin', 'Guest Relations Coordinator']), (req, res) => {
    const db = getDB();
    const customer = db.crm.find(c => c.email.toLowerCase() === req.params.email.toLowerCase());
    if (!customer) {
      return res.status(404).json({ error: 'CRM profile not found' });
    }
    const { message } = req.body;
    const newMessage = {
      sender: 'support' as const,
      message,
      timestamp: new Date().toISOString()
    };
    customer.supportHistory.push(newMessage);
    saveDB(db);
    logAudit('SUPPORT_REPLY_SENT', 'Support Agent', `Replied to customer support query for: ${customer.email}`);
    res.json(customer.supportHistory);
  });

  // 8.5. Support Tickets & WhatsApp Automation APIs
  app.get('/api/tickets', requireClearance(['Sovereign Admin', 'Guest Relations Coordinator']), (req, res) => {
    const db = getDB();
    res.json(db.tickets || []);
  });

  app.post('/api/tickets', (req, res) => {
    const db = getDB();
    const { customerEmail, customerName, subject, category, priority, initialMessage } = req.body;
    
    const ticketId = `TCK-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTicket = {
      id: ticketId,
      customerEmail,
      customerName,
      subject,
      category: category || 'Other',
      status: 'open' as const,
      priority: priority || 'medium',
      createdAt: new Date().toISOString(),
      messages: initialMessage ? [
        {
          id: `msg-${Date.now()}`,
          sender: 'customer' as const,
          message: initialMessage,
          timestamp: new Date().toISOString()
        }
      ] : []
    };

    if (!db.tickets) db.tickets = [];
    db.tickets.unshift(newTicket);
    saveDB(db);
    logAudit('SUPPORT_TICKET_CREATED', 'System CRM / Guest', `Created ticket ${ticketId} for ${customerName}`);
    res.status(201).json(newTicket);
  });

  app.get('/api/tickets/customer/:email', (req, res) => {
    const db = getDB();
    const email = req.params.email;
    const customerTickets = (db.tickets || []).filter(
      (t: any) => t.customerEmail?.toLowerCase() === email.toLowerCase()
    );
    res.json(customerTickets);
  });

  app.post('/api/tickets/:id/customer-message', (req, res) => {
    const db = getDB();
    const ticket = db.tickets?.find(t => t.id === req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const { message } = req.body;
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer' as const,
      message,
      timestamp: new Date().toISOString()
    };
    ticket.messages.push(newMessage);
    saveDB(db);
    logAudit('SUPPORT_TICKET_REPLY', 'Guest Client', `Added guest reply to ticket ${ticket.id}`);
    res.json(ticket);
  });

  app.put('/api/tickets/:id', requireClearance(['Sovereign Admin', 'Guest Relations Coordinator']), (req, res) => {
    const db = getDB();
    const ticket = db.tickets?.find(t => t.id === req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (req.body.status) ticket.status = req.body.status;
    if (req.body.priority) ticket.priority = req.body.priority;
    if (req.body.messages) ticket.messages = req.body.messages;

    saveDB(db);
    logAudit('SUPPORT_TICKET_UPDATED', 'Admin CRM', `Updated ticket status/priority for ${ticket.id}`);
    res.json(ticket);
  });

  app.post('/api/tickets/:id/message', requireClearance(['Sovereign Admin', 'Guest Relations Coordinator']), (req, res) => {
    const db = getDB();
    const ticket = db.tickets?.find(t => t.id === req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const { sender, message } = req.body;
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender,
      message,
      timestamp: new Date().toISOString()
    };
    ticket.messages.push(newMessage);
    saveDB(db);
    logAudit('SUPPORT_TICKET_REPLY', sender === 'customer' ? 'Guest Client' : 'Support Agent', `Added reply to ticket ${ticket.id}`);
    res.json(ticket);
  });

  app.delete('/api/tickets/:id', requireClearance(['Sovereign Admin']), (req, res) => {
    const db = getDB();
    if (!db.tickets) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    const index = db.tickets.findIndex(t => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    const id = db.tickets[index].id;
    db.tickets.splice(index, 1);
    saveDB(db);
    logAudit('SUPPORT_TICKET_DELETED', 'Admin CRM', `Deleted support ticket: ${id}`);
    res.json({ success: true });
  });

  app.post('/api/audit-logs', (req, res) => {
    const { action, user, details } = req.body;
    logAudit(action || 'CLIENT_ACTION', user || 'Client User', details || '');
    res.json({ success: true });
  });

  // Disaster Recovery Encrypted Backups API
  app.get('/api/admin/backups', requireClearance(['Sovereign Admin']), (req, res) => {
    try {
      const backups = listBackups();
      res.json(backups);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve backups list.', details: err.message });
    }
  });

  app.post('/api/admin/backups/create', requireClearance(['Sovereign Admin']), (req, res) => {
    try {
      const { type } = req.body;
      const meta = createBackup(type === 'Auto' ? 'Auto' : 'Manual');
      res.status(201).json(meta);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create database snapshot.', details: err.message });
    }
  });

  app.post('/api/admin/backups/restore', requireClearance(['Sovereign Admin']), (req, res) => {
    try {
      const { filename } = req.body;
      if (!filename) {
        return res.status(400).json({ error: 'Filename is required for restore operations.' });
      }
      restoreBackup(filename);
      res.json({ success: true, message: `System state successfully restored from ${filename}.` });
    } catch (err: any) {
      res.status(500).json({ error: 'Restore operation failed.', details: err.message });
    }
  });

  app.post('/api/admin/backups/import', requireClearance(['Sovereign Admin']), (req, res) => {
    try {
      const { bookings, reviews, tours, blogs, coupons, crm, tickets, whatsappTemplates } = req.body;
      if (!bookings || !reviews) {
        return res.status(400).json({ error: 'Invalid backup file structure: Core collections "bookings" or "reviews" are missing.' });
      }
      const db = getDB();
      db.bookings = bookings;
      db.reviews = reviews;
      if (tours && Array.isArray(tours)) db.tours = tours;
      if (blogs && Array.isArray(blogs)) db.blogs = blogs;
      if (coupons && Array.isArray(coupons)) db.coupons = coupons;
      if (crm && Array.isArray(crm)) db.crm = crm;
      if (tickets && Array.isArray(tickets)) db.tickets = tickets;
      if (whatsappTemplates && Array.isArray(whatsappTemplates)) db.whatsappTemplates = whatsappTemplates;
      saveDB(db);
      logAudit('DISASTER_RECOVERY_IMPORTED', 'Admin Manager', `Manually imported/restored custom JSON database. Bookings: ${bookings.length}, Reviews: ${reviews.length}`);
      res.json({ success: true, message: 'Database state successfully imported and written to master ledger.' });
    } catch (err: any) {
      res.status(500).json({ error: 'Database state import failed.', details: err.message });
    }
  });

  // Dynamic Luxury Service Agreement PDF generator
  app.get('/api/bookings/:id/agreement', (req, res) => {
    const db = getDB();
    const booking = db.bookings.find(b => b.id === req.params.id);
    if (!booking) {
      return res.status(404).send('<h1>Luxury Service Agreement not found</h1>');
    }
    const tour = db.tours.find(t => t.id === booking.tourId);

    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      info: {
        Title: `Luxury Service Agreement - ${booking.id}`,
        Author: 'Meryet Amen Sovereignty (MAS)',
        Subject: 'Executive Private Expedition Charter',
      }
    });

    // Set response headers to trigger direct PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Luxury_Service_Agreement_${booking.id}.pdf"`);

    doc.pipe(res);

    // Decorative Top Border (Gold)
    doc.rect(0, 0, 595, 15).fill('#d97706');

    // Header Logo & Branding
    doc.fillColor('#0f172a')
       .font('Helvetica-Bold')
       .fontSize(18)
       .text('MERYET AMEN SOVEREIGNTY', 50, 45);
    
    doc.fillColor('#d97706')
       .font('Helvetica-Bold')
       .fontSize(8)
       .text('PRIVATE & BESPOKE SOVEREIGN EXPEDITIONS', 50, 65);

    // Reference ID on the top right
    doc.fillColor('#64748b')
       .font('Helvetica')
       .fontSize(9)
       .text('AGREEMENT REF:', 400, 45, { align: 'right' });
    
    doc.fillColor('#0f172a')
       .font('Helvetica-Bold')
       .fontSize(14)
       .text(`LSA-${booking.id}`, 400, 58, { align: 'right' });

    // Decorative line separator
    doc.strokeColor('#e2e8f0')
       .lineWidth(1)
       .moveTo(50, 85)
       .lineTo(545, 85)
       .stroke();

    // Main Document Title
    doc.fillColor('#0f172a')
       .font('Helvetica-Bold')
       .fontSize(22)
       .text('LUXURY SERVICE AGREEMENT', 50, 105, { align: 'center' });
    
    doc.fillColor('#64748b')
       .font('Helvetica-Oblique')
       .fontSize(10)
       .text('This Executive Service Charter establishes binding specifications and high-hospitality covenants.', 50, 132, { align: 'center' });

    // SECTION 1: CONTRACTING PARTIES
    doc.strokeColor('#d97706')
       .lineWidth(1.5)
       .moveTo(50, 160)
       .lineTo(545, 160)
       .stroke();

    doc.fillColor('#0f172a')
       .font('Helvetica-Bold')
       .fontSize(12)
       .text('1. CONTRACTING PARTIES & CONTACTS', 50, 175);

    // Grid for Parties
    doc.fillColor('#64748b').font('Helvetica').fontSize(9).text('SERVICE PROVIDER:', 50, 200);
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(11).text('MAS Luxury Travel Services Ltd.', 50, 212);
    doc.fillColor('#475569').font('Helvetica').fontSize(9).text('Royal Citadel Executive Suite, Cairo, Egypt\nSupport: +20 100 000 0000 | concierge@mas.travel', 50, 226);

    doc.fillColor('#64748b').font('Helvetica').fontSize(9).text('VIP CUSTOMER:', 300, 200);
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(11).text(booking.customerName, 300, 212);
    doc.fillColor('#475569').font('Helvetica').fontSize(9).text(`Nationality: ${booking.customerNationality || 'Global'}\nEmail: ${booking.customerEmail}\nPhone: ${booking.customerPhone || 'N/A'}`, 300, 226);

    // SECTION 2: CHARTER SPECIFICATIONS
    doc.strokeColor('#e2e8f0')
       .lineWidth(1)
       .moveTo(50, 275)
       .lineTo(545, 275)
       .stroke();

    doc.fillColor('#0f172a')
       .font('Helvetica-Bold')
       .fontSize(12)
       .text('2. PRIVATE EXPEDITION SPECIFICATIONS', 50, 290);

    // Box for Charter Details
    doc.rect(50, 310, 495, 120).fill('#f8fafc');
    doc.rect(50, 310, 495, 120).stroke('#e2e8f0');

    doc.fillColor('#475569').font('Helvetica').fontSize(9);
    
    doc.text('Chartered Tour:', 65, 325);
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(11).text(tour ? tour.title.en : booking.tourTitle.en, 180, 325);

    doc.fillColor('#475569').font('Helvetica').fontSize(9).text('Expedition Date:', 65, 345);
    const dateFormatted = new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10).text(dateFormatted, 180, 345);

    doc.fillColor('#475569').font('Helvetica').fontSize(9).text('Elite Guest Count:', 65, 365);
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10).text(`${booking.travelerCount} Guest(s) (VIP Manifest Registered)`, 180, 365);

    doc.fillColor('#475569').font('Helvetica').fontSize(9).text('Primary Fleet Pick-up:', 65, 385);
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10).text(`${booking.pickupHotel || 'Luxury Designated'} (Room: ${booking.roomNumber || 'VIP Suite'})`, 180, 385);

    doc.fillColor('#475569').font('Helvetica').fontSize(9).text('Special Requests:', 65, 405);
    doc.fillColor('#475569').font('Helvetica-Oblique').fontSize(9.5).text(booking.specialRequests || 'None specified. Bespoke culinary & pacing optimized automatically.', 180, 405, { width: 340 });

    // SECTION 3: FINANCIAL RECONCILIATION
    doc.fillColor('#0f172a')
       .font('Helvetica-Bold')
       .fontSize(12)
       .text('3. FINANCIAL CHARTER RECONCILIATION', 50, 450);

    const baseCost = tour ? tour.priceUSD * booking.travelerCount : booking.totalAmountUSD;
    const extraCost = booking.totalAmountUSD - baseCost > 0 ? booking.totalAmountUSD - baseCost : 0;

    // Financial lines
    doc.font('Helvetica').fontSize(9).fillColor('#475569');
    doc.text('Sovereign Base Rate (Private Escort & Permits Included):', 50, 475);
    doc.font('Helvetica-Bold').fillColor('#0f172a').text(`$${baseCost.toLocaleString()}.00 USD`, 400, 475, { align: 'right' });

    if (extraCost > 0) {
      doc.font('Helvetica').fillColor('#475569').text('Elite Custom Enhancements & Photographers:', 50, 492);
      doc.font('Helvetica-Bold').fillColor('#0f172a').text(`$${extraCost.toLocaleString()}.00 USD`, 400, 492, { align: 'right' });
    }

    doc.strokeColor('#cbd5e1')
       .lineWidth(1)
       .moveTo(50, 510)
       .lineTo(545, 510)
       .stroke();

    doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a').text('Total Capital Investment (Sovereign Charter):', 50, 520);
    doc.fontSize(12).fillColor('#d97706').text(`$${booking.totalAmountUSD.toLocaleString()}.00 USD`, 400, 520, { align: 'right' });

    doc.font('Helvetica').fontSize(8.5).fillColor('#64748b');
    doc.text(`Payment Status: ${booking.paymentStatus.toUpperCase()} (via ${booking.paymentMethod}) | Digital Ledger Stamp: ${booking.qrCode}`, 50, 540);

    // SECTION 4: BINDING COVENANTS
    doc.strokeColor('#e2e8f0')
       .lineWidth(1)
       .moveTo(50, 560)
       .lineTo(545, 560)
       .stroke();

    doc.fillColor('#0f172a')
       .font('Helvetica-Bold')
       .fontSize(10)
       .text('4. QUALITY COVENANTS & SERVICE ASSURANCE', 50, 575);

    doc.fillColor('#64748b').font('Helvetica').fontSize(7.5);
    const covenantText = 
      "• PRIVATE FLEET ASSURANCE: MAS agrees to supply a customized, secure Mercedes-Benz private vehicle manned by a certified professional executive chauffeur.\n" +
      "• ESCORT EXCLUSIVITY: A dedicated scholarly Egyptologist or certified private historian will accompany the contracting party throughout the tour.\n" +
      "• FORCE MAJEURE & SECURE ENTRIES: All priority skip-the-line admissions and private reservation slots are preemptively secured and bound to this registration.\n" +
      "• EXECUTION CONSENT: The client agrees that checking out and appending their digital signature constitutes a binding agreement to the tour parameters, cancellation frameworks, and high-hospitality protocols of MAS Sovereignty.";
    doc.text(covenantText, 50, 592, { width: 495, lineGap: 2 });

    // SECTION 5: SIGNATURES
    doc.strokeColor('#cbd5e1')
       .lineWidth(1)
       .moveTo(50, 655)
       .lineTo(545, 655)
       .stroke();

    // Representative Column (MAS)
    doc.fillColor('#64748b').font('Helvetica').fontSize(8).text('ISSUING AUTHORITY (MAS)', 50, 670);
    doc.fillColor('#475569').font('Helvetica-Bold').fontSize(9.5).text('Meryet Amen Sovereignty Committee', 50, 682);
    // Draw a digital stamp/seal
    doc.strokeColor('#d97706').lineWidth(0.8).rect(50, 700, 110, 45).stroke();
    doc.fillColor('#d97706').font('Helvetica-Bold').fontSize(8).text('MAS CONCIERGE\nOFFICIALLY\nRELEASED', 60, 710, { align: 'center', width: 90 });

    // Client Signature Column
    doc.fillColor('#64748b').font('Helvetica').fontSize(8).text('CLIENT DIGITAL EXECUTION', 320, 670);
    doc.fillColor('#475569').font('Helvetica-Bold').fontSize(9.5).text(booking.customerName, 320, 682);

    if (booking.signatureUrl) {
      try {
        const base64Data = booking.signatureUrl.replace(/^data:image\/\w+;base64,/, "");
        const signatureBuffer = Buffer.from(base64Data, 'base64');
        doc.image(signatureBuffer, 320, 695, { width: 140, height: 45 });
        
        doc.fillColor('#64748b')
           .font('Helvetica-Oblique')
           .fontSize(7)
           .text(`Electronically Authenticated: ${new Date(booking.createdAt || booking.date).toUTCString()}`, 320, 745);
      } catch (err) {
        doc.fillColor('#d97706')
           .font('Helvetica-Bold')
           .fontSize(10)
           .text('DIGITALLY SIGNED & VERIFIED', 320, 710);
      }
    } else {
      // Draw a line for signature placeholder
      doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(320, 725).lineTo(470, 725).stroke();
      doc.fillColor('#64748b').font('Helvetica-Oblique').fontSize(8).text('Digitally Confirmed on Checkout', 320, 730);
    }

    doc.end();
  });

  // Automated Formal Itinerary PDF generator
  app.get('/api/bookings/:id/pdf', (req, res) => {
    const db = getDB();
    const booking = db.bookings.find(b => b.id === req.params.id);
    if (!booking) {
      return res.status(404).send('<h1>Reservation not found</h1>');
    }
    const tour = db.tours.find(t => t.id === booking.tourId);
    
    const hotelStr = booking.pickupHotel;
    const roomStr = booking.roomNumber ? ` (Room ${booking.roomNumber})` : '';
    const dateStr = new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const itineraryHtml = tour && tour.itinerary ? tour.itinerary.map(item => `
      <div style="margin-bottom: 20px; border-left: 3px solid #d97706; padding-left: 16px;">
        <h3 style="margin: 0 0 6px 0; font-size: 15px; color: #1e293b; text-transform: uppercase; font-family: sans-serif; font-weight: 800;">Day ${item.day}: ${item.title.en}</h3>
        <p style="margin: 0; font-size: 12.5px; color: #475569; line-height: 1.6; font-family: sans-serif;">${item.description.en}</p>
      </div>
    `).join('') : '<p>Custom bespoke itinerary curated dynamically.</p>';

    const extrasList = booking.totalAmountUSD > (tour ? tour.priceUSD * booking.travelerCount : 0)
      ? `<p style="margin: 4px 0; font-size: 12.5px; color: #475569; font-family: sans-serif;">Includes select royal enhancements and photographers.</p>`
      : '';

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>MAS Agency Official Itinerary - ${booking.id}</title>
        <meta charset="utf-8">
        <style>
          @media print {
            body { background: white; color: black; padding: 0; margin: 0; }
            .no-print { display: none; }
            .container { border: none !important; box-shadow: none !important; padding: 0 !important; }
          }
          body { font-family: system-ui, -apple-system, sans-serif; background: #fafafa; padding: 40px; color: #0f172a; }
          .container { max-width: 800px; margin: 0 auto; background: white; border: 1px solid #e2e8f0; padding: 48px; border-radius: 12px; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.05); position: relative; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-end; }
          .logo { font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #0f172a; }
          .tagline { font-size: 10px; color: #d97706; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin-top: 2px; }
          .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
          .meta-box h4 { margin: 0 0 6px 0; font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; font-weight: 800; }
          .meta-box p { margin: 0; font-size: 13.5px; font-weight: 700; color: #0f172a; }
          .itinerary-section { margin-top: 36px; }
          .footer { margin-top: 48px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5; }
          .print-btn { background: #d97706; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; transition: background 0.2s; }
          .print-btn:hover { background: #b45309; }
        </style>
      </head>
      <body>
        <div class="no-print" style="max-width: 800px; margin: 0 auto 20px auto; display: flex; justify-content: space-between; align-items: center;">
          <button onclick="window.close()" class="print-btn" style="background: #475569;">Close Window</button>
          <button onclick="window.print()" class="print-btn">Print / Save as PDF</button>
        </div>
        <div class="container">
          <div style="position: absolute; top: 48px; right: 48px; text-align: right;">
            <div style="font-size: 10px; font-weight: 800; color: #64748b; letter-spacing: 1px;">CONFIRMATION PASS</div>
            <div style="font-size: 20px; font-weight: 900; color: #d97706; margin-top: 4px; font-family: monospace;">${booking.id}</div>
          </div>
          <div class="header">
            <div>
              <div class="logo">MAS Agency</div>
              <div class="tagline">Sovereign Luxury & Elite Expeditions</div>
            </div>
            <div style="text-align: right; font-size: 12px; color: #64748b; padding-bottom: 4px;">
              Date Issued: ${new Date(booking.createdAt).toLocaleDateString()}
            </div>
          </div>
          
          <div class="meta-grid">
            <div class="meta-box">
              <h4>Distinguished Guest</h4>
              <p>${booking.customerName}</p>
              <p style="font-size:12px; color:#475569; font-weight:normal; margin-top:4px;">${booking.customerEmail} | ${booking.customerPhone}</p>
            </div>
            <div class="meta-box" style="text-align: right;">
              <h4>Expedition Date</h4>
              <p>${dateStr}</p>
            </div>
          </div>

          <div class="meta-grid" style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #f1f5f9;">
            <div class="meta-box">
              <h4>Expedition Selected</h4>
              <p style="color: #d97706;">${tour ? tour.title.en : booking.tourTitle.en}</p>
              <p style="font-size:12px; color:#475569; font-weight:normal; margin-top:4px;">Travelers: ${booking.travelerCount} Guest(s)</p>
            </div>
            <div class="meta-box" style="text-align: right;">
              <h4>Chauffeur Pickup Info</h4>
              <p>${hotelStr}${roomStr}</p>
              <p style="font-size:12px; color:#475569; font-weight:normal; margin-top:4px;">Transport: Mercedes-Benz V-Class Private Chauffeur</p>
            </div>
          </div>

          <div class="itinerary-section">
            <h2 style="font-size: 16px; font-weight: 900; text-transform: uppercase; margin-bottom: 20px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; letter-spacing: 0.5px;">CURATED EXPEDITION ITINERARY</h2>
            ${itineraryHtml}
          </div>

          <div style="margin-top: 36px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <h4 style="margin: 0 0 6px 0; font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; font-weight: 800;">Financial Settlement Summary</h4>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
              <div>
                <p style="margin: 0; font-size: 14px; font-weight: bold; color: #0f172a;">Total Investment: $${booking.totalAmountUSD.toLocaleString()}</p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #10b981; font-weight: bold;">Status: ${booking.paymentStatus.toUpperCase()} via ${booking.paymentMethod}</p>
                ${extrasList}
              </div>
              <div style="text-align: right; font-size: 11px; font-family: monospace; color: #64748b; border: 1px dashed #cbd5e1; padding: 8px 12px; border-radius: 4px; background: #f8fafc;">
                QR CREDENTIAL ENCODED<br/>
                ${booking.qrCode}
              </div>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0 0 6px 0; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a;">MAS Agency Cairo Sovereign Office</p>
            <p style="margin: 0;">This document serves as an official confirmation of reservation and voucher credentials.<br/>Produced dynamically by MAS CRM Notification Service.</p>
          </div>
        </div>
      </body>
      </html>
    `);
  });

  // Official Tax Invoice PDF generator
  app.get('/api/bookings/:id/invoice', (req, res) => {
    const db = getDB();
    const booking = db.bookings.find(b => b.id === req.params.id);
    if (!booking) {
      return res.status(404).send('<h1>Invoice not found</h1>');
    }
    const tour = db.tours.find(t => t.id === booking.tourId);

    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      info: {
        Title: `Tax Invoice - ${booking.id}`,
        Author: 'Meryet Amen Sovereignty (MAS)',
        Subject: 'Official Sovereign Tax Invoice',
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Invoice_${booking.id}.pdf"`);

    doc.pipe(res);

    // Decorative Top Border (Gold)
    doc.rect(0, 0, 595, 15).fill('#d97706');

    // Header Logo & Branding
    doc.fillColor('#0f172a')
       .font('Helvetica-Bold')
       .fontSize(18)
       .text('MERYET AMEN SOVEREIGNTY', 50, 45);
    
    doc.fillColor('#d97706')
       .font('Helvetica-Bold')
       .fontSize(8)
       .text('PRIVATE & BESPOKE SOVEREIGN EXPEDITIONS', 50, 65);

    // Reference ID on the top right
    doc.fillColor('#64748b')
       .font('Helvetica')
       .fontSize(9)
       .text('OFFICIAL TAX INVOICE', 400, 45, { align: 'right' });
    
    doc.fillColor('#0f172a')
       .font('Helvetica-Bold')
       .fontSize(13)
       .text(`INV-${booking.id}`, 400, 58, { align: 'right' });

    // Decorative line separator
    doc.strokeColor('#e2e8f0')
       .lineWidth(1)
       .moveTo(50, 85)
       .lineTo(545, 85)
       .stroke();

    // SECTION 1: BILLED TO & TRANSACTION METADATA
    doc.fillColor('#64748b')
       .font('Helvetica-Bold')
       .fontSize(8.5)
       .text('BILLED TO (DISTINGUISHED GUEST):', 50, 105);

    doc.fillColor('#0f172a')
       .font('Helvetica-Bold')
       .fontSize(11)
       .text(booking.customerName, 50, 120);

    doc.fillColor('#475569')
       .font('Helvetica')
       .fontSize(9.5)
       .text(`Nationality: ${booking.customerNationality || 'Global'}\nEmail: ${booking.customerEmail}\nPhone: ${booking.customerPhone || 'N/A'}`, 50, 134, { lineGap: 3 });

    // Right Column: Invoice / Transaction details
    doc.fillColor('#64748b')
       .font('Helvetica-Bold')
       .fontSize(8.5)
       .text('TRANSACTION SUMMARY:', 320, 105);

    const isPaid = booking.paymentStatus === 'paid' || booking.paymentStatus === 'deposit';
    doc.fillColor(isPaid ? '#10b981' : '#f59e0b')
       .font('Helvetica-Bold')
       .fontSize(11)
       .text(isPaid ? 'PAID IN FULL' : 'PENDING PAYMENT', 320, 120);

    doc.fillColor('#475569')
       .font('Helvetica')
       .fontSize(9.5)
       .text(`Date Issued: ${new Date(booking.createdAt || booking.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\nPayment Method: ${booking.paymentMethod}\nLedger Stamp: ${booking.qrCode}`, 320, 134, { lineGap: 3 });

    // SECTION 2: CHARTER SPECIFICATIONS
    doc.strokeColor('#e2e8f0')
       .lineWidth(1)
       .moveTo(50, 205)
       .lineTo(545, 205)
       .stroke();

    doc.fillColor('#0f172a')
       .font('Helvetica-Bold')
       .fontSize(10)
       .text('CHARTERED EXPEDITION SPECIFICATIONS', 50, 220);

    // Box for details
    doc.rect(50, 235, 495, 75).fill('#f8fafc');
    doc.rect(50, 235, 495, 75).stroke('#e2e8f0');

    doc.fillColor('#475569').font('Helvetica').fontSize(9);
    
    doc.text('Selected Expedition:', 65, 248);
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10).text(tour ? tour.title.en : booking.tourTitle.en, 180, 248);

    doc.fillColor('#475569').font('Helvetica').fontSize(9).text('Departure Date:', 65, 268);
    const dateFormatted = new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9.5).text(dateFormatted, 180, 268);

    doc.fillColor('#475569').font('Helvetica').fontSize(9).text('Private Fleet Pick-up:', 65, 288);
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9.5).text(`${booking.pickupHotel || 'Luxury Designated'} (Room: ${booking.roomNumber || 'VIP Suite'})`, 180, 288);

    // SECTION 3: FINANCIAL ITEMIZED BREAKDOWN
    doc.fillColor('#0f172a')
       .font('Helvetica-Bold')
       .fontSize(10)
       .text('FINANCIAL ITEMIZED RECONCILIATION', 50, 335);

    // Table Columns Header
    doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(8.5);
    doc.text('DESCRIPTION', 50, 355);
    doc.text('RATE', 320, 355, { align: 'right', width: 60 });
    doc.text('QTY', 390, 355, { align: 'right', width: 40 });
    doc.text('TOTAL', 460, 355, { align: 'right', width: 85 });

    doc.strokeColor('#cbd5e1')
       .lineWidth(1)
       .moveTo(50, 370)
       .lineTo(545, 370)
       .stroke();

    let currentY = 380;
    
    // Line Item 1: Base Seat Reservation
    const seatRate = tour ? tour.priceUSD : (booking.totalAmountUSD / booking.travelerCount);
    const baseTotal = seatRate * booking.travelerCount;
    
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9);
    doc.text('Base Seat Reservation', 50, currentY);
    doc.fillColor('#64748b').font('Helvetica').fontSize(8)
       .text('(Includes certified Egyptologist escort, luxury permits & entrance tickets)', 50, currentY + 11);
    
    doc.fillColor('#0f172a').font('Helvetica').fontSize(9);
    doc.text(`$${seatRate.toLocaleString()}.00`, 320, currentY, { align: 'right', width: 60 });
    doc.text(`${booking.travelerCount}`, 390, currentY, { align: 'right', width: 40 });
    doc.text(`$${baseTotal.toLocaleString()}.00`, 460, currentY, { align: 'right', width: 85 });

    currentY += 32;

    // Line Item 2: Luxury Addon (if any)
    let addonTotal = 0;
    if (booking.luxuryAddon) {
      addonTotal = booking.luxuryAddon.priceUSD;
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9);
      doc.text(`Luxury Upgrade: ${booking.luxuryAddon.title.en}`, 50, currentY);
      doc.fillColor('#64748b').font('Helvetica').fontSize(8)
         .text('(Premium custom enhancement integrated into main charter)', 50, currentY + 11);
      
      doc.fillColor('#0f172a').font('Helvetica').fontSize(9);
      doc.text(`$${addonTotal.toLocaleString()}.00`, 320, currentY, { align: 'right', width: 60 });
      doc.text('1', 390, currentY, { align: 'right', width: 40 });
      doc.text(`$${addonTotal.toLocaleString()}.00`, 460, currentY, { align: 'right', width: 85 });
      
      currentY += 32;
    }

    doc.strokeColor('#cbd5e1')
       .lineWidth(1)
       .moveTo(50, currentY)
       .lineTo(545, currentY)
       .stroke();

    currentY += 10;

    // Calculations for taxes and service fees included
    const expectedTotal = baseTotal + addonTotal;
    const actualTotal = booking.totalAmountUSD;
    const discountUSD = Math.max(0, expectedTotal - actualTotal);

    // Calculate Taxes & Fees included in actual total
    // 10% VAT and 5% Service Fee (total 15% inclusive)
    const taxUSD = actualTotal * 0.10;
    const serviceFeeUSD = actualTotal * 0.05;
    const preTaxSubtotal = actualTotal - taxUSD - serviceFeeUSD;

    // Draw the financial breakdown
    doc.font('Helvetica').fontSize(9.5).fillColor('#475569');
    
    // Pre-tax Subtotal
    doc.text('Itemized Net Subtotal (Excl. Taxes):', 230, currentY);
    doc.font('Helvetica-Bold').fillColor('#0f172a').text(`$${preTaxSubtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD`, 420, currentY, { align: 'right', width: 125 });
    
    currentY += 18;

    // Service Fee
    doc.font('Helvetica').fillColor('#475569').text('Concierge Service Fee (5% Included):', 230, currentY);
    doc.font('Helvetica-Bold').fillColor('#0f172a').text(`$${serviceFeeUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD`, 420, currentY, { align: 'right', width: 125 });

    currentY += 18;

    // Value Added Tax
    doc.font('Helvetica').fillColor('#475569').text('Value Added Tax (10% VAT Included):', 230, currentY);
    doc.font('Helvetica-Bold').fillColor('#0f172a').text(`$${taxUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD`, 420, currentY, { align: 'right', width: 125 });

    currentY += 18;

    // Discount if any
    if (discountUSD > 0) {
      doc.font('Helvetica').fillColor('#d97706').text('Promotional VIP Discount:', 230, currentY);
      doc.font('Helvetica-Bold').fillColor('#d97706').text(`-$${discountUSD.toLocaleString()}.00 USD`, 420, currentY, { align: 'right', width: 125 });
      currentY += 18;
    }

    // Divider
    doc.strokeColor('#cbd5e1')
       .lineWidth(1)
       .moveTo(230, currentY + 4)
       .lineTo(545, currentY + 4)
       .stroke();

    currentY += 12;

    // Grand Total USD
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a').text('GRAND TOTAL AMOUNT (USD):', 210, currentY);
    doc.fontSize(12).fillColor('#d97706').text(`$${actualTotal.toLocaleString()}.00 USD`, 420, currentY, { align: 'right', width: 125 });

    currentY += 20;

    // Currency conversion if not USD
    if (booking.currencyUsed && booking.currencyUsed !== 'USD') {
      const cur = currentCurrencies.find((c: any) => c.code === booking.currencyUsed);
      if (cur) {
        const rate = cur.rateToUSD || 1;
        const symbol = cur.symbol || cur.code;
        const converted = actualTotal * rate;
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#475569').text(`Equivalent in ${booking.currencyUsed}:`, 210, currentY);
        doc.fontSize(10).fillColor('#d97706').text(`${symbol}${converted.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ${booking.currencyUsed}`, 420, currentY, { align: 'right', width: 125 });
        currentY += 18;
      }
    }

    // SECTION 4: STAMP AND SIGNATURES (moved down dynamically)
    const stampY = Math.max(595, currentY + 30);

    doc.strokeColor('#e2e8f0')
       .lineWidth(1)
       .moveTo(50, stampY)
       .lineTo(545, stampY)
       .stroke();

    doc.fillColor('#64748b')
       .font('Helvetica-Bold')
       .fontSize(8)
       .text('ISSUING AUTHORITY & DIGITAL VERIFICATION', 50, stampY + 12);

    // Left Column: official release stamp
    doc.strokeColor('#d97706').lineWidth(0.8).rect(50, stampY + 28, 120, 50).stroke();
    doc.fillColor('#d97706').font('Helvetica-Bold').fontSize(8.5).text('MAS CONCIERGE\nFINANCE TEAM\nPAID & RELEASED', 50, stampY + 36, { align: 'center', width: 120 });

    // Right Column: Client Electronic Confirmation
    doc.fillColor('#64748b').font('Helvetica').fontSize(8).text('CLIENT DIGITAL SIGNATURE', 320, stampY + 12);
    doc.fillColor('#475569').font('Helvetica-Bold').fontSize(9.5).text(booking.customerName, 320, stampY + 25);

    if (booking.signatureUrl) {
      try {
        const base64Data = booking.signatureUrl.replace(/^data:image\/\w+;base64,/, "");
        const signatureBuffer = Buffer.from(base64Data, 'base64');
        doc.image(signatureBuffer, 320, stampY + 38, { width: 130, height: 35 });
        
        doc.fillColor('#64748b')
           .font('Helvetica-Oblique')
           .fontSize(7)
           .text(`Electronically Signed: ${new Date(booking.createdAt || booking.date).toUTCString()}`, 320, stampY + 76);
      } catch (err) {
        doc.fillColor('#d97706')
           .font('Helvetica-Bold')
           .fontSize(9)
           .text('DIGITALLY SIGNED & VERIFIED', 320, stampY + 45);
      }
    } else {
      doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(320, stampY + 50).lineTo(470, stampY + 50).stroke();
      doc.fillColor('#64748b').font('Helvetica-Oblique').fontSize(8).text('Verified Secure Checkout', 320, stampY + 55);
    }

    // Footer at the bottom
    doc.fillColor('#94a3b8')
       .font('Helvetica')
       .fontSize(7.5)
       .text('Meryet Amen Sovereignty (MAS) Ltd. is registered with the Ministry of Tourism under licence 8899-VIP.\nAll transactions are subject to standard premium concierge charter frameworks and regulatory local tax schedules.', 50, 770, { align: 'center', width: 495 });

    doc.end();
  });

  // Bulk WhatsApp Blast API
  app.post('/api/crm/whatsapp-blast', (req, res) => {
    const db = getDB();
    const { segment, templateText } = req.body;
    if (!templateText) {
      return res.status(400).json({ error: 'Template text is required' });
    }

    // Filter customers by segment tag
    const targetCustomers = db.crm.filter(customer => {
      if (segment === 'all') return true;
      return customer.tags && customer.tags.includes(segment);
    });

    if (targetCustomers.length === 0) {
      return res.status(400).json({ error: 'No customers found in selected segment.' });
    }

    let sentCount = 0;
    targetCustomers.forEach(customer => {
      // Find guest's bookings (if any) to substitute booking specific tags
      const guestBookings = db.bookings.filter(b => b.customerEmail.toLowerCase() === customer.email.toLowerCase());
      const latestBooking = guestBookings.length > 0 ? guestBookings[0] : null;

      let msg = templateText
        .replace(/{customer_name}/g, customer.name)
        .replace(/{customer_email}/g, customer.email)
        .replace(/{customer_phone}/g, customer.phone || 'N/A');

      if (latestBooking) {
        msg = msg
          .replace(/{booking_id}/g, latestBooking.id)
          .replace(/{tour_name}/g, latestBooking.tourTitle.en)
          .replace(/{date}/g, latestBooking.date)
          .replace(/{pickup_hotel}/g, latestBooking.pickupHotel)
          .replace(/{qr_code}/g, latestBooking.qrCode);
      } else {
        msg = msg
          .replace(/{booking_id}/g, 'N/A')
          .replace(/{tour_name}/g, 'your upcoming tour')
          .replace(/{date}/g, 'selected date')
          .replace(/{pickup_hotel}/g, 'hotel lobby')
          .replace(/{qr_code}/g, 'MAS-QR-VOUCHER');
      }

      if (!customer.whatsappHistory) {
        customer.whatsappHistory = [];
      }

      customer.whatsappHistory.push({
        sender: 'system',
        message: msg,
        timestamp: new Date().toISOString()
      });
      sentCount++;
    });

    saveDB(db);
    logAudit('WHATSAPP_BULK_BLAST', 'Admin Marketing', `Dispatched bulk WhatsApp broadcast of template text to ${sentCount} premium guests under segment "${segment}".`);
    res.json({ success: true, sentCount });
  });

  // Single Transactional WhatsApp Template Dispatcher
  app.post('/api/whatsapp/send-template', (req, res) => {
    const { bookingId, templateId } = req.body;
    if (!bookingId || !templateId) {
      return res.status(400).json({ error: 'bookingId and templateId are required' });
    }

    const db = getDB();
    const booking = db.bookings.find(b => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking record not found' });
    }

    const template = db.whatsappTemplates?.find(t => t.id === templateId);
    if (!template) {
      return res.status(404).json({ error: 'WhatsApp template not found' });
    }

    let text = template.templateText;
    text = text.replace(/{customer_name}/g, booking.customerName);
    text = text.replace(/{booking_id}/g, booking.id);
    const tTitle = typeof booking.tourTitle === 'string'
      ? booking.tourTitle
      : (booking.tourTitle.en || '');
    text = text.replace(/{tour_name}/g, tTitle);
    text = text.replace(/{date}/g, booking.date);
    text = text.replace(/{pickup_hotel}/g, booking.pickupHotel);
    text = text.replace(/{qr_code}/g, booking.qrCode);
    text = text.replace(/{driver_name}/g, booking.driverName || 'Sherif El Masry');
    text = text.replace(/{guide_name}/g, booking.guideName || 'Dr. Zahi');

    const customer = db.crm.find(c => c.email.toLowerCase() === booking.customerEmail.toLowerCase());
    if (customer) {
      if (!customer.whatsappHistory) {
        customer.whatsappHistory = [];
      }
      customer.whatsappHistory.push({
        sender: 'system',
        message: text,
        timestamp: new Date().toISOString()
      });
      saveDB(db);
      logAudit('WHATSAPP_AUTO_DISPATCH', 'Automation Engine', `Manually triggered alert "${template.name}" for ${booking.id}`);
      return res.json({ success: true, message: text });
    }

    res.status(404).json({ error: 'CRM profile not found' });
  });

  app.get('/api/whatsapp-templates', requireClearance(['Sovereign Admin', 'Operations Manager', 'Guest Relations Coordinator']), (req, res) => {
    const db = getDB();
    res.json(db.whatsappTemplates || []);
  });

  app.put('/api/whatsapp-templates/:id', requireClearance(['Sovereign Admin', 'Operations Manager']), (req, res) => {
    const db = getDB();
    const template = db.whatsappTemplates?.find(t => t.id === req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (req.body.templateText) template.templateText = req.body.templateText;
    if (req.body.active !== undefined) template.active = req.body.active;

    saveDB(db);
    logAudit('WHATSAPP_TEMPLATE_UPDATED', 'Marketing Admin', `Updated template text for ${template.name}`);
    res.json(template);
  });

  // AI Reply Generator for Tickets using Google Gemini
  app.post('/api/tickets/:id/ai-reply', async (req, res) => {
    const db = getDB();
    const ticket = db.tickets?.find(t => t.id === req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ai = getAI();
    if (!ai) {
      const simulatedReplies = [
        `Dear ${ticket.customerName},\n\nThank you for reaching out to the MAS Agency Sovereign Suite. Regarding your inquiry on "${ticket.subject}", we are pleased to inform you that our luxury logistics team is actively coordinating your request to ensure your total peace of mind.\n\nWe will update you with further details momentarily.\n\nWith exquisite regard,\nYour MAS Personal Concierge Butler`,
        `Distinguished Guest,\n\nWe appreciate your communication regarding your ${ticket.category} inquiry. At MAS Agency, we hold our service standard to the highest degree. Your request is being personally managed by our director of operations to guarantee absolute satisfaction.\n\nSincerely,\nMAS Elite Support Division`
      ];
      const selected = simulatedReplies[Math.floor(Math.random() * simulatedReplies.length)];
      return res.json({ reply: selected });
    }

    try {
      const chatHistory = ticket.messages.map(m => `${m.sender === 'customer' ? 'Guest' : 'Agent'}: "${m.message}"`).join('\n');
      const systemInstruction = 
        "You are the Chief Concierge officer at MAS Agency, " +
        "a world-class ultra-luxury bespoke travel provider in Egypt. " +
        "We cater to royal families, corporate executives, and high-net-worth VIPs. " +
        "Your responses are exceptionally warm, elite, sophisticated, and helpful. " +
        "Address the user by name with respect (e.g., Dear Guest Name, Distinguished Traveler). " +
        "Offer real solutions, explain how our personal butlers, Mercedes V-Class transfers, " +
        "and premium tour curators handle details, and keep the tone pristine and professional. " +
        "Return the reply as plain text with line breaks (no markdown symbols except simple bolding).";

      const prompt = `Ticket Subject: "${ticket.subject}"\n` +
        `Ticket Category: "${ticket.category}"\n` +
        `Conversation History:\n${chatHistory}\n\n` +
        `Draft the absolute finest, elite, custom response answering the customer's query.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: { systemInstruction }
      });

      res.json({ reply: response.text });
    } catch (err: any) {
      console.error('Gemini error during ticket AI reply:', err);
      res.status(500).json({ error: 'AI generation failed', details: err.message });
    }
  });

  // 9. Analytics Engine
  app.get('/api/analytics', requireClearance(['Sovereign Admin', 'Operations Manager', 'Guest Relations Coordinator']), (req, res) => {
    const db = getDB();
    
    // Total Revenue
    const totalRevenue = db.bookings.reduce((sum, b) => b.paymentStatus === 'paid' ? sum + b.totalAmountUSD : sum, 0);
    // Profit (Simulate 35% net margin)
    const totalProfit = parseFloat((totalRevenue * 0.35).toFixed(2));
    
    // Revenue by Tour
    const revenueByTour = db.tours.map(t => {
      const bookings = db.bookings.filter(b => b.tourId === t.id && b.paymentStatus === 'paid');
      const revenue = bookings.reduce((sum, b) => sum + b.totalAmountUSD, 0);
      return {
        name: t.title.en,
        bookings: bookings.length,
        revenue
      };
    });

    // Bookings by Country
    const bookingsByCountry: Record<string, number> = {};
    db.bookings.forEach(b => {
      bookingsByCountry[b.customerNationality] = (bookingsByCountry[b.customerNationality] || 0) + 1;
    });
    const countriesData = Object.entries(bookingsByCountry).map(([country, count]) => ({
      country,
      count
    }));

    // Driver loads
    const driverLoad: Record<string, number> = {};
    db.bookings.forEach(b => {
      if (b.driverName) {
        driverLoad[b.driverName] = (driverLoad[b.driverName] || 0) + 1;
      }
    });
    const driversData = Object.entries(driverLoad).map(([name, load]) => ({ name, load }));

    // Guide loads
    const guideLoad: Record<string, number> = {};
    db.bookings.forEach(b => {
      if (b.guideName) {
        guideLoad[b.guideName] = (guideLoad[b.guideName] || 0) + 1;
      }
    });
    const guidesData = Object.entries(guideLoad).map(([name, load]) => ({ name, load }));

    res.json({
      summary: {
        revenue: totalRevenue,
        profit: totalProfit,
        bookingsCount: db.bookings.length,
        customerCount: db.crm.length,
        averageRating: parseFloat((db.reviews.reduce((sum, r) => sum + r.rating, 0) / (db.reviews.length || 1)).toFixed(2))
      },
      revenueByTour,
      countriesData,
      driversData,
      guidesData,
      auditLogs: db.auditLogs
    });
  });

  app.post('/api/audit-logs', (req, res) => {
    const { action, user, details } = req.body;
    if (!action || !details) {
      return res.status(400).json({ error: 'Missing action or details' });
    }
    const clientIp = (req.headers['x-forwarded-for'] as string || req.ip || req.socket.remoteAddress || '').split(',')[0].trim();
    const userAgentHeader = req.headers['user-agent'] || '';
    logAudit(action, user || 'Admin Manager', details, clientIp, userAgentHeader);
    res.json({ success: true });
  });

  // 10. AI Concierge Bot (Google Gemini)
  app.post('/api/ai/chat', async (req, res) => {
    const { message, history } = req.body;
    const ai = getAI();

    if (!ai) {
      // Simulate highly elegant concierge fallback responses if Gemini key is missing
      const fallbackReplies = [
        "Good day, distinguished traveler. Your request has been logged in our luxury CRM. Our personal travel coordinators are assigning a dedicated steward who will respond to you immediately on WhatsApp.",
        "A fascinating question! To ensure you receive the ultimate standard of service, our head Egyptologist Dr. Zahi is crafting a bespoke response. A notification will arrive shortly.",
        "Excellent choice. Our premium Mercedes V-Class fleet is fully customized for maximal comfort, featuring private Wi-Fi and gourmet refreshments. Would you like us to proceed with booking?",
      ];
      const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      return res.json({ reply: randomReply });
    }

    try {
      // System instructions enforcing royal concierge persona
      const systemInstruction = 
        "You are 'Zephyr', the personal digital concierge butler of MAS Agency, " +
        "a world-class enterprise SaaS luxury travel platform in Egypt and the Middle East " +
        "competing with Aman Resorts, GetYourGuide, and luxury yacht charters. " +
        "You converse with exquisite politeness, intelligence, and grace. " +
        "Always recommend our private excursions: (1) Private VIP Pyramids & Sphinx Royal Expedition ($450 per traveler, includes skip-the-line entrance to burial chambers, lunch, and Mercedes V-Class), " +
        "(2) Luxury Nile Dahabiya Royal Cruise ($1200, boutique 5-suite traditional sailing, high tea, Valley of Kings tombs included), " +
        "and (3) VIP Sharm El Sheikh Private Yacht Charter ($950, lobster lunch, marine biologist, Ras Mohammed snorkeling). " +
        "Answer the user's travel inquiries, quote pricing, explain luxury elements of our service " +
        "(chilled towels, personal travel butler, private Egyptologists, premium chauffeur, gourmet catering), " +
        "and always guide them towards booking with us. Respond beautifully and concisely.";

      // Build clean contents list with full multi-turn history
      const contents = [];
      if (history && Array.isArray(history)) {
        for (const turn of history.slice(-10)) {
          contents.push({
            role: turn.role === 'user' || turn.sender === 'user' ? 'user' : 'model',
            parts: [{ text: turn.parts?.[0]?.text || turn.text || '' }]
          });
        }
      }
      
      // Ensure the last message is added if not already present
      const lastInHistory = contents[contents.length - 1];
      if (!lastInHistory || lastInHistory.role !== 'user' || lastInHistory.parts?.[0]?.text !== message) {
        contents.push({
          role: 'user',
          parts: [{ text: message }]
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: 'Concierge is currently attending other VIP guests. Falling back shortly.', details: error.message });
    }
  });

  // 10.4. AI Personalized Recommendations
  app.post('/api/ai/recommend', async (req, res) => {
    const { bookingHistory, userPreferences, lang } = req.body;
    const ai = getAI();

    let historyDesc = "First-time voyager.";
    if (bookingHistory && bookingHistory.length > 0) {
      historyDesc = bookingHistory.map((b: any) => `- Booked: ${b.tourName || b.tourId} (Status: ${b.status || 'confirmed'})`).join('\n');
    }

    const prefName = userPreferences?.name || 'Honored Guest';
    const prefNationality = userPreferences?.nationality || 'Global Citizen';
    const prefLanguage = userPreferences?.language || 'en';
    const prefBiography = userPreferences?.biography || 'Lover of exquisite travel';

    if (!ai) {
      const fallbackRec = lang === 'ar'
        ? `أهلاً بك يا سيدي الكريم ${prefName}. بناءً على حجزك الموقر لـ (${bookingHistory?.length || 0} رحلات)، نوصيك بتجربة عشاء اليخت الخاص وقت الغروب في النيل لمزيد من الفخامة والخصوصية.`
        : `Welcome back, distinguished traveler ${prefName}. Based on your magnificent travel ledger with us, we highly recommend our Private Sharm El Sheikh Yacht Charter or Luxury Nile Dahabiya Royal Cruise for your next royal excursion.`;
      return res.json({ recommendation: fallbackRec });
    }

    try {
      const systemInstruction = 
        "You are 'Zephyr', the ultra-elite personal digital concierge of MAS Agency. " +
        "We are a world-class luxury boutique travel provider. " +
        "Your task is to analyze the user's details and booking history, and generate a bespoke, highly personalized tour recommendation " +
        "crafted specifically for them. Highlight how the recommendations connect to their status and past adventures. " +
        "Speak in an incredibly respectful, warm, and elite royal concierge tone. " +
        "Do not use markdown symbols or emojis. Keep it to 2-3 short, magnificent sentences. " +
        `Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

      const prompt = `User Profile:\n` +
        `- Name: ${prefName}\n` +
        `- Nationality: ${prefNationality}\n` +
        `- Language preference: ${prefLanguage}\n` +
        `- Biography/Interests: ${prefBiography}\n\n` +
        `Booking History:\n${historyDesc}\n\n` +
        `Please draft the finest personalized luxury travel recommendation.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ recommendation: response.text });
    } catch (error: any) {
      console.error('Gemini Recommendation Error:', error);
      res.status(500).json({ error: 'Concierge recommendation failed', details: error.message });
    }
  });

  // 10.5. AI Text-To-Speech (Gemini TTS)
  app.post('/api/ai/tts', async (req, res) => {
    const { text } = req.body;
    const ai = getAI();

    if (!ai) {
      return res.json({ simulated: true });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: `Say in an extremely polite, warm, luxurious, and supportive digital butler voice: ${text}` }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' },
            }
          }
        }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        res.json({ audio: base64Audio });
      } else {
        res.json({ simulated: true });
      }
    } catch (error: any) {
      console.error('Gemini TTS Error:', error);
      res.json({ simulated: true });
    }
  });

  // 11. AI Generator (Tour description/blog generator)
  app.post('/api/ai/describe', async (req, res) => {
    const { type, keywords } = req.body;
    const ai = getAI();

    if (!ai) {
      return res.json({
        content: `[Simulated Luxury Description] Discover the magic of ${keywords || 'the Middle East'} under the ultimate guidance of MAS Agency. Savor private gourmet meals, stay in elite boutique resorts, and travel in our custom Mercedes-Benz fleet with professional chauffeurs. Experience the absolute zenith of travel refinement.`
      });
    }

    try {
      const prompt = `Write a breathtaking, luxury-oriented, captivating ${type} about: "${keywords}". ` +
        `Focus on sensory details, exclusivity, elite service (Mercedes transport, private chefs, skip-the-line VIP entry), and unforgettable memories. ` +
        `Keep the tone elegant, refined, and highly persuasive.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: "You are the Head Luxury Copywriter for MAS Agency. Your prose must feel like a premium brochure for Aman Resorts or Apple."
        }
      });

      res.json({ content: response.text });
    } catch (error: any) {
      console.error('Gemini API error during content generation:', error);
      res.status(500).json({ error: 'AI Content Generation Failed', details: error.message });
    }
  });

  // 12. AI Review Summarizer
  app.post('/api/ai/summarize-reviews', async (req, res) => {
    const { tourId } = req.body;
    const db = getDB();
    const tourReviews = db.reviews.filter(r => r.tourId === tourId);

    if (tourReviews.length === 0) {
      return res.json({ summary: 'No reviews found to summarize yet.' });
    }

    const ai = getAI();
    if (!ai) {
      return res.json({
        summary: 'Clients consistently praise the impeccable punctuality of our private chauffeurs, the deep academic expertise of our Egyptologists, and the unparalleled freshness of our on-board gourmet catering.'
      });
    }

    try {
      const reviewsText = tourReviews.map(r => `[Rating: ${r.rating}* - ${r.customerName}]: ${r.comment}`).join('\n');
      const prompt = `Synthesize the following customer reviews for our luxury excursion into a beautiful 2-sentence summary highlight for our executive brochure:\n\n${reviewsText}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: "You are a professional hospitality analyst summarizing travel client satisfaction feedback."
        }
      });

      res.json({ summary: response.text });
    } catch (error: any) {
      console.error('Gemini API error summarizing reviews:', error);
      res.status(500).json({ error: 'AI Review Summary Failed', details: error.message });
    }
  });


  // ----------------------------------------------------
  // Production Readiness: Sitemap & Web Vitals Metrics
  // ----------------------------------------------------

  // 13. Dynamic sitemap.xml for search engines
  app.get('/sitemap.xml', (req, res) => {
    try {
      const db = getDB();
      const tours = db.tours || [];
      const host = process.env.APP_URL || `https://${req.headers.host || 'egypt-luxury-tours.com'}`;
      
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      
      // Homepage
      xml += `  <url>\n`;
      xml += `    <loc>${host}/</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>1.0</priority>\n`;
      xml += `  </url>\n`;

      // Active Tours
      tours.forEach((tour: any) => {
        xml += `  <url>\n`;
        xml += `    <loc>${host}/?tour=${tour.id}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      });

      xml += `</urlset>\n`;

      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      console.error('[SITEMAP] Error generating dynamic sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // 14. Performance Vitals collector for production monitoring
  app.post('/api/metrics', (req, res) => {
    try {
      const { metric, url } = req.body;
      if (metric) {
        console.log(`[PERF METRIC] ${metric.name}: ${metric.value.toFixed(2)} ms/score (${metric.rating.toUpperCase()}) on URL: ${url}`);
        if (metric.rating === 'poor') {
          logAudit('PERFORMANCE_WARN', 'Sovereign Monitor', `Web Vital Anomaly detected [${metric.name}]: score is ${metric.value.toFixed(2)} (POOR) on view ${url}`);
        }
      }
      res.json({ success: true });
    } catch (e: any) {
      console.error('[PERF METRIC ERROR] Logging failed:', e);
      res.status(500).json({ error: 'Failed to record diagnostic telemetry' });
    }
  });


  // ----------------------------------------------------
  // Vite Integration & Static Asset Serving
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Pre-generate sitemap.xml on boot
  try {
    const fs = await import('fs');
    const db = getDB();
    const tours = db.tours || [];
    const host = process.env.APP_URL || 'https://egypt-luxury-tours.com';
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url>\n    <loc>${host}/</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    tours.forEach((tour: any) => {
      xml += `  <url>\n    <loc>${host}/?tour=${tour.id}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });
    xml += `</urlset>\n`;

    const publicDir = path.join(process.cwd(), 'public');
    if (fs.existsSync(publicDir)) {
      fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
      console.log('[BOOT] Pre-generated public/sitemap.xml');
    }
    const distDir = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml, 'utf8');
      console.log('[BOOT] Pre-generated dist/sitemap.xml');
    }
  } catch (err) {
    console.warn('[BOOT] Static sitemap pre-generation bypassed:', err);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MAS AGENCY SERVING] Server fully operational at http://localhost:${PORT}`);
    // Boot up the daily disaster recovery backup scheduler
    initDailyBackupScheduler();
  });
}

startServer().catch((err) => {
  console.error('[CRITICAL] Server failed to start:', err);
});
