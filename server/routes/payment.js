import { Router } from "express";
import axios from 'axios';
import User from "../models/User.js";
import Order from "../models/Order.js";
import moment from "moment";
import PaytmChecksum from "paytmchecksum";
const router = Router();

const getPayPalAccessToken = async () => {
  const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
  const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

  try {
    const response = await axios.post(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64')}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Failed to fetch PayPal Access Token:", error.message);
    throw new Error("Unable to authenticate with PayPal.");
  }
};

// Paytm Configuration (replace with your Paytm credentials)
const PAYTM_MERCHANT_KEY = process.env.PAYTM_MERCHANT_KEY;
const PAYTM_MERCHANT_ID = process.env.PAYTM_MERCHANT_ID;
const PAYTM_WEBSITE = 'WEBSTAGING';  // Use 'WEBPROD' in production
const PAYTM_CHANNEL_ID = 'WEB';
const PAYTM_INDUSTRY_TYPE = 'Retail';

const generatePaytmChecksum = (params) => {
  return PaytmChecksum.generateSignature(params, PAYTM_MERCHANT_KEY);
};

// Handle Cash on Delivery
const saveOrder = async (orderDetails, paymentMethod, res) => {
  try {
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

    const newOrder = new Order({
      ...orderDetails,
      userId: orderDetails.userDetails.userId,
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

// PayPal
router.post('/create-paypal-order', async (req, res) => {
  const { orderDetails } = req.body;
  if (!orderDetails || !orderDetails.product || isNaN(orderDetails.product.price)) {
    return res.status(400).json({ error: 'Invalid product details or price.' });
  }

  try {
    const PAYPAL_ACCESS_TOKEN = await getPayPalAccessToken();
    const conversionRate = 0.012;
    const formattedPrice = (orderDetails.product.price * conversionRate).toFixed(2);
    // Simulate interaction with PayPal API
    const paymentResponse = await axios.post(
      'https://api-m.sandbox.paypal.com/v2/checkout/orders',
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: formattedPrice,
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${PAYPAL_ACCESS_TOKEN}`,
        },
      }
    );
    console.log('PayPal request payload:', {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'INR',
            value: formattedPrice,
          },
        },
      ],
    });

    console.log('PayPal response:', paymentResponse.data);

    if (paymentResponse.status === 201) {
      saveOrder(orderDetails, 'PayPal', res);
    } else {
      res.status(400).json({ error: 'PayPal payment failed.' });
    }
  } catch (error) {
    if (error.response) {
      console.error('PayPal API error details:', error.response.data);
    }
    console.error('PayPal payment error:', error.message);
    res.status(500).json({ error: 'Failed to process PayPal payment.', details: error.response?.data });
  }
});

// Credit Card/Debit Card
router.post('/credit-card', (req, res) => {
  const { orderDetails } = req.body;
  saveOrder(orderDetails, 'Credit Card/Debit Card', res);
});

// Google Pay
router.post('/google-pay', (req, res) => {
  const { orderDetails } = req.body;
  saveOrder(orderDetails, 'Google Pay', res);
});

// Phone Pay
router.post('/phone-pay', (req, res) => {
  const { orderDetails } = req.body;
  saveOrder(orderDetails, 'Phone Pay', res);
});

// Paytm
router.post('/paytm', async (req, res) => {
  const { orderDetails } = req.body;
  if (!orderDetails || !orderDetails.product || isNaN(orderDetails.product.price)) {
    return res.status(400).json({ error: 'Invalid product details or price.' });
  }

  const orderId = `ORDER-${Date.now()}`;
  const customerId = orderDetails.userDetails.userId;
  const txnAmount = orderDetails.product.price;

  // Prepare parameters for Paytm request
  const params = {
    MID: PAYTM_MERCHANT_ID,
    ORDER_ID: orderId,
    CUST_ID: customerId,
    TXN_AMOUNT: txnAmount,
    CHANNEL_ID: PAYTM_CHANNEL_ID,
    WEBSITE: PAYTM_WEBSITE,
    INDUSTRY_TYPE_ID: PAYTM_INDUSTRY_TYPE,
    PAYMENT_MODE_ONLY: 'YES',
    CALLBACK_URL: `${process.env.PAYTM_CALLBACK_URL}/paytm/callback`,
    MOBILE_NO: orderDetails.userDetails.phone, // Optional: Add the user's phone number
    EMAIL: orderDetails.userDetails.email, // Optional: Add the user's email
  };

  try {
    // Generate checksum for the payment request
    const checksum = await generatePaytmChecksum(params);

    // Add checksum to the params
    params.CHECKSUMHASH = checksum;

    // Save the order details in the database
    const today = moment().startOf('day');
    const deliveryDate = today.add(1, 'days');

    const newOrder = new Order({
      ...orderDetails,
      userId: orderDetails.userDetails.userId,
      paymentMethod: 'Paytm',
      deliveryDate: deliveryDate.toDate(),
      orderId,
    });
    await newOrder.save();

    // Send the response back with Paytm redirect URL
    const paytmTransactionData = {
      ...params,
      CHECKSUMHASH: checksum,
    };

    res.json({
      paytmTransactionData,
      message: "Order confirmed. Redirecting to Paytm for payment."
    });
  } catch (error) {
    console.error("Paytm Payment Error:", error.message);
    res.status(500).json({ error: 'Failed to process Paytm payment.', details: error.message });
  }
});

router.post('/paytm/callback', async (req, res) => {
  const paytmResponse = req.body;

  // Log the incoming response to check its structure
  console.log('Paytm response:', paytmResponse);

  // Verify the checksum sent by Paytm
  const checksumHash = paytmResponse.CHECKSUMHASH;

  // Verify that the response contains the expected fields
  if (!paytmResponse.ORDERID || !paytmResponse.STATUS || !paytmResponse.TXNAMOUNT) {
    return res.status(400).json({ error: 'Invalid Paytm response, missing required fields.' });
  }

  const isChecksumValid = PaytmChecksum.verifySignature(paytmResponse, PAYTM_MERCHANT_KEY, checksumHash);

  if (!isChecksumValid) {
    return res.status(400).json({ error: 'Checksum validation failed.' });
  }

  const orderId = paytmResponse.ORDERID;
  const txnStatus = paytmResponse.STATUS;
  const txnAmount = paytmResponse.TXNAMOUNT;

  try {
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Check if txnStatus is a valid string and then use toLowerCase()
    if (txnStatus && typeof txnStatus === 'string' && txnStatus.toLowerCase() === 'txnsuccess') {
      order.paymentStatus = 'Success';
      order.txnId = paytmResponse.TXNID; // Save the Paytm transaction ID
      await order.save();

      res.json({ message: 'Payment Successful', order });
    } else {
      order.paymentStatus = 'Failed';
      await order.save();

      res.status(400).json({ message: 'Payment Failed', order });
    }
  } catch (error) {
    console.error("Error processing Paytm callback:", error.message);
    res.status(500).json({ error: 'Failed to process Paytm callback.', details: error.message });
  }
});

// Net Banking
router.post('/net-banking', (req, res) => {
  const { orderDetails } = req.body;
  saveOrder(orderDetails, 'Net Banking', res);
});
export default router;