import { Router } from "express";
import axios from 'axios';
import User from "../models/User.js";
import Order from "../models/Order.js";
import moment from "moment";
import PaytmChecksum from "paytmchecksum";
import Razorpay from 'razorpay';
import crypto from 'crypto';
const router = Router();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API = process.env.PAYPAL_API || 'https://api-m.sandbox.paypal.com'; // Use sandbox for testing

// Paytm Configuration
const PAYTM_MERCHANT_ID = process.env.PAYTM_MERCHANT_ID;
const PAYTM_MERCHANT_KEY = process.env.PAYTM_MERCHANT_KEY;
const PAYTM_WEBSITE = process.env.PAYTM_WEBSITE || 'WEBSTAGING';
const PAYTM_CHANNEL_ID = process.env.PAYTM_CHANNEL_ID || 'WEB';
const PAYTM_INDUSTRY_TYPE = process.env.PAYTM_INDUSTRY_TYPE || 'Retail';
const PAYTM_URL = process.env.PAYTM_URL || 'https://securegw-stage.paytm.in/order/process';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Get PayPal Access Token
const getPayPalAccessToken = async () => {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
    
    const response = await axios.post(
      `${PAYPAL_API}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    console.error("❌ Failed to fetch PayPal Access Token:", error.response?.data || error.message);
    throw new Error("Unable to authenticate with PayPal.");
  }
};

// Create PayPal Order
router.post('/create-paypal-order', async (req, res) => {
  try {
    const { orderDetails } = req.body;
    
    // Validate input
    if (!orderDetails || !orderDetails.product) {
      return res.status(400).json({ error: 'Invalid order details' });
    }

    // Calculate total amount
    const totalAmount = orderDetails.totalPrice || 
                       orderDetails.product.price * orderDetails.quantity;

    // Get access token
    const accessToken = await getPayPalAccessToken();

    // Create PayPal order
    const paypalResponse = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: totalAmount.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: totalAmount.toFixed(2)
                }
              }
            },
            description: orderDetails.product.name,
            custom_id: orderDetails.userDetails.userId,
            invoice_id: `INV-${Date.now()}`
          }
        ],
        application_context: {
          brand_name: '7HubComputer',
          landing_page: 'BILLING',
          shipping_preference: 'SET_PROVIDED_ADDRESS',
          user_action: 'PAY_NOW',
          return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success`,
          cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel`
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': `ORDER-${Date.now()}`
        }
      }
    );

    console.log('✅ PayPal order created:', paypalResponse.data.id);

    // Save order to database with pending status
    const orderId = `PAYPAL-${Date.now()}`;
    const today = moment().startOf('day');
    const deliveryDate = today.add(2, 'days').toDate();

    const newOrder = new Order({
      ...orderDetails,
      userId: orderDetails.userDetails.userId,
      paymentMethod: 'PayPal',
      paymentStatus: 'Pending',
      paypalOrderId: paypalResponse.data.id,
      deliveryDate,
      totalPrice: totalAmount,
      orderId
    });
    
    await newOrder.save();
    console.log('✅ Order saved with ID:', orderId);

    // Return approval URL to frontend
    const approvalUrl = paypalResponse.data.links.find(link => link.rel === 'approve').href;

    res.json({
      success: true,
      orderId: paypalResponse.data.id,
      approvalUrl,
      paypalResponse: paypalResponse.data
    });

  } catch (error) {
    console.error("❌ PayPal Order Creation Error:", error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to create PayPal order',
      details: error.response?.data || error.message 
    });
  }
});

// Capture PayPal Payment
router.post('/capture-paypal-order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Get access token
    const accessToken = await getPayPalAccessToken();

    // Capture the payment
    const captureResponse = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ PayPal payment captured:', captureResponse.data);

    // Find and update order in database
    const order = await Order.findOne({ paypalOrderId: orderId });
    
    if (order) {
      order.paymentStatus = 'Success';
      order.paypalCaptureId = captureResponse.data.purchase_units[0].payments.captures[0].id;
      await order.save();

      // Add bonus points
      const bonusPoints = Math.floor(order.totalPrice / 1000);
      if (bonusPoints > 0) {
        await User.findByIdAndUpdate(order.userId, {
          $inc: { bonusPoints }
        });
      }
    }

    res.json({
      success: true,
      message: 'Payment captured successfully',
      captureData: captureResponse.data
    });

  } catch (error) {
    console.error("❌ PayPal Capture Error:", error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to capture PayPal payment',
      details: error.response?.data || error.message 
    });
  }
});

// Verify PayPal Webhook (for payment notifications)
router.post('/paypal-webhook', async (req, res) => {
  try {
    const webhookEvent = req.body;
    
    // Verify webhook signature (implement proper verification in production)
    console.log('📨 PayPal webhook received:', webhookEvent.event_type);

    if (webhookEvent.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const paypalOrderId = webhookEvent.resource.supplementary_data.related_ids.order_id;
      
      // Update order status
      await Order.findOneAndUpdate(
        { paypalOrderId },
        { paymentStatus: 'Success' }
      );
      
      console.log(`✅ Order ${paypalOrderId} marked as successful via webhook`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Handle Cash on Delivery
const saveOrder = async (orderDetails, paymentMethod, res) => {
  try {
    console.log("Received orderDetails:", orderDetails); // Debugging
    // Simulate saving order in the database

    if (!orderDetails || !orderDetails.userDetails || !orderDetails.product) {
      return res.status(400).json({ error: 'Invalid order details' });
    }

    // Ensure userId exists
    const userId = orderDetails.userDetails.userId || orderDetails.userDetails._id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const today = moment().startOf('day'); // Use moment.js for date handling
    const deliveryDate = today.add(1, 'days'); // Set delivery date to the next day

    // ✅ Ensure `bonuses` is always treated as a number
    const totalBonusPoints = Number(orderDetails.product.bonuses || 0);

    // 🔥 **Calculate totalPrice from product.finalPrice**
    const totalPrice = orderDetails.totalPrice || orderDetails.product.finalPrice * orderDetails.quantity;
    
    if (typeof totalPrice === "undefined") {
      return res.status(400).json({ error: 'Total price is required but was not provided' });
    }

    const newOrder = new Order({
      ...orderDetails,
      userId: orderDetails.userDetails.userId,
      totalPrice,
      paymentMethod, // Set the payment method as COD
      deliveryDate: deliveryDate.toDate(), // Convert moment object to Date
    });

    // console.log(newOrder);
    await newOrder.save();

    // ✅ Update user's bonus points if valid
    if (!isNaN(totalBonusPoints) && totalBonusPoints > 0) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $inc: { bonusPoints: totalBonusPoints } },  // Increment user bonus points
        { new: true }
      );

      if (updatedUser) {
        console.log(`✅ Added ${totalBonusPoints} bonus points to user ${userId}`);
      } else {
        console.error("❌ User not found for bonus points update");
      }
    } else {
      console.warn("⚠️ No valid bonus points to add.");
    }

    res.json({
      message: `Order confirmed with ${paymentMethod}.`,
      bonusPointsAdded: totalBonusPoints,
    });
  } catch (error) {
    console.error(`Error processing ${paymentMethod} order:`, error.message);
    res.status(500).json({ error: `Failed to ${paymentMethod} order` });
  }
};

// Cash on Delivery
router.post('/cash-on-delivery', (req, res) => {
  const { orderDetails } = req.body;
  saveOrder(orderDetails, 'Cash on Delivery', res);
});

// Credit Card/Debit Card
router.post('/credit-card', async (req, res) => {
  const { orderDetails } = req.body;
  // For Razorpay, we'll create an order and redirect to checkout
  try {
    const response = await axios.post('http://localhost:4000/api/create-razorpay-order', {
      orderDetails
    });
    res.json(response.data);
  } catch (error) {
    console.error("Credit Card Error:", error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Google Pay
router.post('/google-pay', async (req, res) => {
  const { orderDetails } = req.body;
  // Google Pay also goes through Razorpay
  try {
    const response = await axios.post('http://localhost:4000/api/create-razorpay-order', {
      orderDetails
    });
    res.json(response.data);
  } catch (error) {
    console.error("Google Pay Error:", error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Phone Pay
router.post('/phone-pay', async (req, res) => {
  const { orderDetails } = req.body;
  // PhonePe also goes through Razorpay
  try {
    const response = await axios.post('http://localhost:4000/api/create-razorpay-order', {
      orderDetails
    });
    res.json(response.data);
  } catch (error) {
    console.error("PhonePe Error:", error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Paytm
router.post('/paytm', async (req, res) => {
  const { orderDetails } = req.body;
  
  // Validate input
  if (!orderDetails || !orderDetails.product) {
    return res.status(400).json({ error: 'Invalid order details' });
  }

  try {
    const orderId = `ORDER-${Date.now()}`;
    const customerId = orderDetails.userDetails.userId || `CUST-${Date.now()}`;
    const txnAmount = orderDetails.totalPrice || orderDetails.product.price * orderDetails.quantity;

    // Prepare parameters for Paytm request
    const params = {
      MID: PAYTM_MERCHANT_ID,
      ORDER_ID: orderId,
      CUST_ID: customerId,
      TXN_AMOUNT: txnAmount.toString(),
      CHANNEL_ID: PAYTM_CHANNEL_ID,
      WEBSITE: PAYTM_WEBSITE,
      INDUSTRY_TYPE_ID: PAYTM_INDUSTRY_TYPE,
      CALLBACK_URL: `${process.env.PAYTM_CALLBACK_URL || 'http://localhost:4000'}/api/paytm/callback`,
    };

    // Add optional fields if available
    if (orderDetails.userDetails.phoneNumber) {
      params.MOBILE_NO = orderDetails.userDetails.phoneNumber;
    }
    if (orderDetails.userDetails.email) {
      params.EMAIL = orderDetails.userDetails.email;
    }

    console.log('Paytm params:', params);

    // Generate checksum
    const checksum = await PaytmChecksum.generateSignature(params, PAYTM_MERCHANT_KEY);
    params.CHECKSUMHASH = checksum;

    // Save order to database
    const today = moment().startOf('day');
    const deliveryDate = today.add(1, 'days');

    const newOrder = new Order({
      ...orderDetails,
      userId: orderDetails.userDetails.userId,
      paymentMethod: 'Paytm',
      paymentStatus: 'Pending',
      deliveryDate: deliveryDate.toDate(),
      orderId,
      totalPrice: txnAmount
    });
    
    await newOrder.save();
    console.log('Order saved with ID:', orderId);

    // Return Paytm transaction data
    res.json({
      success: true,
      message: "Redirecting to Paytm for payment",
      paytmParams: params,
      paytmUrl: process.env.PAYTM_URL || 'https://securegw-stage.paytm.in/order/process',
      orderId: orderId
    });

  } catch (error) {
    console.error("Paytm Payment Error:", error);
    res.status(500).json({ 
      error: 'Failed to process Paytm payment', 
      details: error.message 
    });
  }
});

// Paytm Callback
router.post('/paytm/callback', async (req, res) => {
  const paytmResponse = req.body;

  // Log the incoming response to check its structure
  console.log('Paytm response received:', paytmResponse);

  // Check if response exists
  if (!paytmResponse || Object.keys(paytmResponse).length === 0) {
    console.error('Empty Paytm response received');
    return res.status(400).json({ error: 'Empty Paytm response' });
  }

  const orderId = paytmResponse.ORDERID;
  const txnStatus = paytmResponse.STATUS;
  const checksumHash = paytmResponse.CHECKSUMHASH;

  // Verify required fields
  if (!orderId) {
    console.error('Missing ORDERID in Paytm response');
    return res.status(400).json({ error: 'Missing ORDERID in response' });
  }

  try {
    // Verify checksum if present
    if (checksumHash && PAYTM_MERCHANT_KEY) {
      const isChecksumValid = PaytmChecksum.verifySignature(paytmResponse, PAYTM_MERCHANT_KEY, checksumHash);
      if (!isChecksumValid) {
        console.error('Checksum validation failed');
        return res.status(400).json({ error: 'Checksum validation failed' });
      }
    }

    // Find the order
    const order = await Order.findOne({ orderId });
    if (!order) {
      console.error('Order not found:', orderId);
      return res.status(404).json({ error: 'Order not found' });
    }

    // Safely check transaction status
    let paymentStatus = 'Failed';
    let message = 'Payment Failed';

    if (txnStatus) {
      const statusLower = txnStatus.toString().toLowerCase();
      if (statusLower === 'txnsuccess' || statusLower === 'success') {
        paymentStatus = 'Success';
        message = 'Payment Successful';
        
        // Update order with transaction details
        order.paymentStatus = 'Success';
        order.txnId = paytmResponse.TXNID || paytmResponse.TXN_ID || `TXN-${Date.now()}`;
        order.paymentDetails = {
          bankName: paytmResponse.BANKNAME,
          paymentMode: paytmResponse.PAYMENTMODE,
          txnDate: paytmResponse.TXNDATE,
          gatewayName: paytmResponse.GATEWAYNAME
        };
      } else if (statusLower === 'pending') {
        paymentStatus = 'Pending';
        message = 'Payment Pending';
        order.paymentStatus = 'Pending';
      }
    }

    await order.save();

    // Redirect based on payment status
    if (paymentStatus === 'Success') {
      // Redirect to success page or profile
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile?payment=success`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment?status=failed`);
    }

  } catch (error) {
    console.error("Error processing Paytm callback:", error);
    res.status(500).json({ error: 'Failed to process Paytm callback' });
  }
});

// Net Banking
router.post('/net-banking', async (req, res) => {
  const { orderDetails } = req.body;
  // Net Banking also goes through Razorpay
  try {
    const response = await axios.post('http://localhost:4000/api/create-razorpay-order', {
      orderDetails
    });
    res.json(response.data);
  } catch (error) {
    console.error("Net Banking Error:", error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// ==================== RAZORPAY INTEGRATION ====================

// Create Razorpay Order
router.post('/create-razorpay-order', async (req, res) => {
  try {
    const { orderDetails } = req.body;
    
    if (!orderDetails || !orderDetails.product) {
      return res.status(400).json({ error: 'Invalid order details' });
    }
    
    const amount = orderDetails.totalPrice || 
    orderDetails.product.finalPrice * orderDetails.quantity;
    
    // Convert to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(amount * 100);
    
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
      notes: {
        productId: orderDetails.product._id,
        userId: orderDetails.userDetails.userId,
        productName: orderDetails.product.name
      }
    };
    
    const razorpayOrder = await razorpay.orders.create(options);
    
    // Save order to database with pending status
    const orderId = `RZP-${Date.now()}`;
    const today = moment().startOf('day');
    const deliveryDate = today.add(2, 'days').toDate();
    
    const newOrder = new Order({
      ...orderDetails,
      userId: orderDetails.userDetails.userId,
      paymentMethod: 'Razorpay',
      paymentStatus: 'Pending',
      razorpayOrderId: razorpayOrder.id,
      deliveryDate,
      totalPrice: amount,
      orderId
    });
    
    await newOrder.save();
    
    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: orderId
    });
    
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
});

// Verify Razorpay Payment
router.post('/verify-razorpay-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails
    } = req.body;
    
    // Generate signature for verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');
    
    // Verify signature
    if (expectedSignature === razorpay_signature) {
      // Payment successful, update order
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      
      if (order) {
        order.paymentStatus = 'Success';
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        await order.save();
        
        // Add bonus points
        const bonusPoints = Math.floor(order.totalPrice / 1000);
        if (bonusPoints > 0) {
          await User.findByIdAndUpdate(order.userId, {
            $inc: { bonusPoints }
          });
        }
      }
      
      res.json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      // Payment failed
      await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { paymentStatus: 'Failed' }
      );
      
      res.status(400).json({
        success: false,
        error: 'Invalid signature'
      });
    }
  } catch (error) {
    console.error("Razorpay Verification Error:", error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Razorpay Webhook
router.post('/razorpay-webhook', async (req, res) => {
  try {
    const webhookBody = req.body;
    const webhookSignature = req.headers['x-razorpay-signature'];
    
    // Verify webhook signature
    const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(webhookBody))
    .digest('hex');
    
    if (expectedSignature !== webhookSignature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
    
    const event = webhookBody.event;
    const payment = webhookBody.payload.payment.entity;
    
    if (event === 'payment.captured') {
      const razorpayOrderId = payment.order_id;
      
      await Order.findOneAndUpdate(
        { razorpayOrderId },
        { 
          paymentStatus: 'Success',
          razorpayPaymentId: payment.id
        }
      );
      
      console.log(`✅ Order ${razorpayOrderId} marked as successful via webhook`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;