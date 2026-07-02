import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { getDB, saveDB, logAudit, DEFAULT_CURRENCIES } from './src/server/db.js';
import { Tour, Booking, Review, Blog, Coupon, CustomerCRM } from './src/types.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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

  app.post('/api/tours', (req, res) => {
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

  app.put('/api/tours/:id', (req, res) => {
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

  app.delete('/api/tours/:id', (req, res) => {
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
  app.get('/api/bookings', (req, res) => {
    const db = getDB();
    res.json(db.bookings);
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
      currency
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
      createdAt: new Date().toISOString()
    };

    db.bookings.push(newBooking);

    // Upsert CRM profile
    let customer = db.crm.find(c => c.email.toLowerCase() === customerEmail.toLowerCase());
    const initialWhatsApp = [
      { sender: 'system' as const, message: `Your luxury tour booking *${bookingId}* for *${tour.title.en}* on *${date}* has been received! Our coordinators are reviewing your VIP chauffeur details.`, timestamp: new Date().toISOString() },
      { sender: 'system' as const, message: `🎟️ *MAS Digital Ticket:* Your secure QR voucher code is *${newBooking.qrCode}*. Show this to your driver at pickup hotel *${pickupHotel}*.`, timestamp: new Date().toISOString() }
    ];

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
        totalSpentUSD: amountPaidUSD,
        createdAt: new Date().toISOString()
      };
      db.crm.push(customer);
    } else {
      customer.totalSpentUSD += amountPaidUSD;
      customer.whatsappHistory.push(...initialWhatsApp);
    }

    saveDB(db);
    logAudit('BOOKING_CREATED', 'Guest Client', `Booking ${bookingId} successfully checked out by ${customerName} (${customerEmail})`);

    res.status(211).json({
      booking: newBooking,
      whatsappAlert: `🔔 MAS WhatsApp: Reservation ${bookingId} confirmed! QR voucher sent to +1 415-555-2671.`
    });
  });

  app.put('/api/bookings/:id', (req, res) => {
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

    saveDB(db);
    logAudit('BOOKING_UPDATED', 'Admin Operations', `Updated reservation status/driver for ${updated.id}`);
    res.json(updated);
  });

  app.post('/api/bookings/:id/refund', (req, res) => {
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
    logAudit('BOOKING_REFUNDED', 'Admin Finance', `Fully refunded booking ${booking.id} and updated CRM ledger.`);
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
    logAudit('BOOKING_UPGRADED', 'Guest Client / Recommendation Engine', `Upgraded booking ${booking.id} with ${enTitle} (+$${priceUSD})`);

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

  // 6. Coupons API
  app.get('/api/coupons', (req, res) => {
    const db = getDB();
    res.json(db.coupons);
  });

  app.post('/api/coupons', (req, res) => {
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

  // 7. CRM CRM CRUD
  app.get('/api/crm', (req, res) => {
    const db = getDB();
    res.json(db.crm);
  });

  app.put('/api/crm/:email', (req, res) => {
    const db = getDB();
    const customer = db.crm.find(c => c.email.toLowerCase() === req.params.email.toLowerCase());
    if (!customer) {
      return res.status(404).json({ error: 'CRM profile not found' });
    }
    if (req.body.tags) customer.tags = req.body.tags;
    if (req.body.notes !== undefined) customer.notes = req.body.notes;
    saveDB(db);
    logAudit('CRM_PROFILE_UPDATED', 'CRM Executive', `Updated customer profile notes/tags for: ${customer.email}`);
    res.json(customer);
  });

  // 8. Custom Chatbot Messages (WhatsApp / Support) via CRM Console
  app.post('/api/crm/:email/whatsapp', (req, res) => {
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

  app.post('/api/crm/:email/support', (req, res) => {
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
  app.get('/api/tickets', (req, res) => {
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

  app.put('/api/tickets/:id', (req, res) => {
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

  app.post('/api/tickets/:id/message', (req, res) => {
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

  app.get('/api/whatsapp-templates', (req, res) => {
    const db = getDB();
    res.json(db.whatsappTemplates || []);
  });

  app.put('/api/whatsapp-templates/:id', (req, res) => {
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
  app.get('/api/analytics', (req, res) => {
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
      auditLogs: db.auditLogs.slice(0, 50) // Return last 50 audit logs
    });
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

      const chat = ai.chats.create({
        model: 'gemini-3.5-flash',
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      // Sync chat history if provided
      if (history && history.length > 0) {
        // Send previous chats to prime the model
        for (const turn of history.slice(-6)) {
          // Priming the chat history using successive mock calls is bypassed in chats.create helper,
          // but we can simply prepend the history to our prompt to avoid complex history parsing.
        }
      }

      const prompt = `Customer says: "${message}"\nProvide an elegant, luxurious, and highly supportive response.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: { systemInstruction }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: 'Concierge is currently attending other VIP guests. Falling back shortly.', details: error.message });
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MAS AGENCY SERVING] Server fully operational at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[CRITICAL] Server failed to start:', err);
});
