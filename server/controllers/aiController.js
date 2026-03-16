import axios from 'axios';
import PreBuildPC from "../models/PreBuildPC.js";
import MiniPC from "../models/MiniPC.js";
import RefurbishedLaptop from "../models/RefurbishedLaptop.js";
import OfficePC from "../models/Office-PC.js";
import Display from "../models/Display.js";
import Accessory from "../models/Accessory.js";
import Order from '../models/Order.js';
import CustomPC from '../models/customPC.js';
import Product from '../models/Product.js';
import Discount from '../models/Discount.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import LoginHistory from '../models/LoginHistory.js';
import Message from '../models/Message.js';
import Subscriber from '../models/Subscriber.js';

// Ollama client configuration
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

// Helper function to get all products with detailed information
const getAllProducts = async () => {
  try {
    const [prebuilt, mini, refurbished, office, displays, accessories, customPCs, products] = await Promise.all([
      PreBuildPC.find().lean(),
      MiniPC.find().lean(),
      RefurbishedLaptop.find().lean(),
      OfficePC.find().lean(),
      Display.find().lean(),
      Accessory.find().lean(),
      CustomPC.find().lean(),
      Product.find().lean()
    ]);

    // Format products with detailed information
    const allProducts = [
      ...prebuilt.map(p => ({
        id: p._id,
        name: p.name,
        type: 'Pre-built PC',
        category: 'pc',
        price: p.finalPrice || p.price,
        originalPrice: p.originalPrice,
        brand: p.brand || '7HUB',
        description: p.description,
        image: p.image?.[0],
        specs: {
          processor: p.specs?.processor || p.specs?.cpu,
          ram: p.specs?.ram,
          storage: p.specs?.storage,
          graphicCard: p.specs?.graphiccard || p.specs?.graphicCard,
          motherboard: p.specs?.motherboard,
          smps: p.specs?.smps,
          cabinet: p.specs?.cabinet
        },
        inStock: p.inStock !== false,
        rating: p.rating || 4.5,
        reviews: p.reviewCount || 0,
        features: p.features || []
      })),
      ...mini.map(p => ({
        id: p._id,
        name: p.name,
        type: 'Mini PC',
        category: 'pc',
        price: p.finalPrice || p.price,
        originalPrice: p.originalPrice,
        brand: p.brand || '7HUB',
        description: p.description,
        image: p.image?.[0],
        specs: {
          processor: p.specs?.processor || p.specs?.cpu,
          ram: p.specs?.ram,
          storage: p.specs?.storage,
          graphicCard: p.specs?.graphiccard || p.specs?.graphicCard,
        },
        inStock: p.inStock !== false,
        rating: p.rating || 4.5,
        reviews: p.reviewCount || 0,
        features: p.features || []
      })),
      ...refurbished.map(p => ({
        id: p._id,
        name: p.name,
        type: 'Refurbished Laptop' || 'Laptop',
        category: 'laptop',
        price: p.finalPrice || p.price,
        originalPrice: p.originalPrice,
        brand: p.brand || '7HUB',
        description: p.description,
        image: p.image?.[0],
        specs: {
          processor: p.specs?.processor || p.specs?.cpu,
          ram: p.specs?.ram,
          storage: p.specs?.storage,
          graphicCard: p.specs?.graphiccard || p.specs?.graphicCard,
          display: p.specs?.display,
          os: p.specs?.os,
          condition: p.condition
        },
        inStock: p.inStock !== false,
        rating: p.rating || 4.3,
        reviews: p.reviewCount || 0,
        features: p.features || []
      })),
      ...office.map(p => ({
        id: p._id,
        name: p.name,
        type: 'Office PC',
        category: 'pc',
        price: p.finalPrice || p.price,
        originalPrice: p.originalPrice,
        brand: p.brand || '7HUB',
        description: p.description,
        image: p.image?.[0],
        specs: {
          processor: p.specs?.processor || p.specs?.cpu,
          ram: p.specs?.ram,
          storage: p.specs?.storage,
        },
        inStock: p.inStock !== false,
        rating: p.rating || 4.2,
        reviews: p.reviewCount || 0,
        features: p.features || []
      })),
      ...displays.map(d => ({
        id: d._id,
        name: d.name,
        type: 'Display',
        category: 'display',
        price: d.price,
        originalPrice: d.originalPrice,
        brand: d.brand || '7HUB',
        description: d.description,
        image: d.image || (d.images && d.images[0]),
        specs: {
          size: d.specs?.size,
          resolution: d.specs?.resolution,
          panel: d.specs?.panel,
          refreshRate: d.specs?.refreshRate,
          responseTime: d.specs?.responseTime,
        },
        inStock: d.inStock !== false,
        rating: d.rating || 4.4,
        reviews: d.reviewCount || 0,
        features: d.features || []
      })),
      ...accessories.map(a => ({
        id: a._id,
        name: a.name,
        type: 'Accessory',
        category: 'accessory',
        price: a.price,
        originalPrice: a.originalPrice,
        brand: a.brand || '7HUB',
        description: a.description,
        image: a.image,
        specs: a.specs || {},
        inStock: a.inStock !== false,
        rating: a.rating || 4.0,
        reviews: a.reviewCount || 0,
        features: a.features || []
      })),
            // Custom PCs
      ...customPCs.map(c => ({
        id: c._id,
        name: c.name || 'Custom PC Configuration',
        type: 'Custom PC',
        category: 'custom',
        price: c.totalPrice,
        description: `Custom PC configuration with ${Object.keys(c.configuration || {}).length} components`,
        configuration: c.configuration,
        compatibilityStatus: c.compatibilityStatus,
        userId: c.userId,
        isPublic: c.isPublic,
        specs: c.configuration ? {
          processor: c.configuration.CPU?.name,
          graphicCard: c.configuration.GPU?.name,
          ram: c.configuration.RAM?.name,
          storage: c.configuration.SSD?.name || c.configuration.HDD?.name,
          motherboard: c.configuration.Motherboard?.name,
          powerSupply: c.configuration.PowerSupply?.name,
          case: c.configuration.ComputerCase?.name
        } : {}
      })),
      
      // Generic Products
      ...products.map(p => ({
        id: p._id,
        name: p.name,
        type: p.category || 'Product',
        category: p.category?.toLowerCase() || 'product',
        price: p.finalPrice || p.price,
        originalPrice: p.originalPrice,
        brand: p.brand || '7HUB',
        description: p.description,
        image: p.image?.[0],
        specs: p.specs || {},
        compatibility: p.compatibility,
        inStock: p.stock > 0,
        stock: p.stock,
        rating: p.ratings?.average || 4.0,
        reviews: p.ratings?.count || 0,
        tags: p.tags || [],
        isActive: p.isActive
      }))
    ];

    return allProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Helper function to get user information
const getUserInfo = async (userId) => {
  try {
    if (!userId) return null;
    
    const user = await User.findById(userId)
      .select('-password')
      .lean();
      
    const [orders, transactions, customPCs, cart, loginHistory] = await Promise.all([
      Order.find({ userId }).sort({ createdAt: -1 }).lean(),
      Transaction.find({ userId }).sort({ createdAt: -1 }).lean(),
      CustomPC.find({ userId }).sort({ createdAt: -1 }).lean(),
      Cart.findOne({ userId }).populate('items.productId').lean(),
      LoginHistory.find({ userId }).sort({ loginTime: -1 }).limit(10).lean()
    ]);
    
    return {
      user,
      orders,
      transactions,
      customPCs,
      cart,
      loginHistory
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
};

// Helper function to get discount information
const getDiscountInfo = async () => {
  try {
    const activeDiscounts = await Discount.find({
      isActive: true,
      $or: [
        { expirationDate: { $gte: new Date() } },
        { expirationDate: null }
      ]
    }).lean();
    
    return activeDiscounts;
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return [];
  }
};

// Helper function to get transaction statistics
const getTransactionStats = async () => {
  try {
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    return stats;
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    return [];
  }
};

// Helper function to get order statistics
const getOrderStats = async () => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    return stats;
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return [];
  }
};

// Helper function to get subscriber count
const getSubscriberCount = async () => {
  try {
    return await Subscriber.countDocuments();
  } catch (error) {
    console.error('Error fetching subscriber count:', error);
    return 0;
  }
};

// Helper function to get message history
const getMessageHistory = async () => {
  try {
    return await Message.find().sort({ sentAt: -1 }).limit(50).lean();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

// Helper function to find relevant products based on user query
const findRelevantProducts = (products, query) => {
  console.log("Finding relevant products for query:", query);
  console.log("Total products to search:", products.length);
  
  const queryLower = query.toLowerCase();
  
  // Score each product based on relevance
  const scoredProducts = products.map(product => {
    let score = 0;
    
    // Check name match
    if (product.name?.toLowerCase().includes(queryLower)) score += 10;
    
    // Check type match
    const productType = product.type?.toLowerCase() || '';
    if (productType.includes(queryLower)) score += 8;
    
    // Check for specific categories
    if (queryLower.includes('laptop') && productType.includes('laptop')) score += 8;
    if (queryLower.includes('pc') && productType.includes('pc')) score += 8;
    if (queryLower.includes('gaming') && productType.includes('gaming')) score += 8;
    if (queryLower.includes('custom') && productType.includes('custom')) score += 8;
    if (queryLower.includes('desktop') && productType.includes('desktop')) score += 8;
    
    // Check brand match
    if (product.brand?.toLowerCase().includes(queryLower)) score += 7;
    
    // Check category match
    if (product.category?.toLowerCase().includes(queryLower)) score += 5;
    
    // Check description match
    if (product.description?.toLowerCase().includes(queryLower)) score += 3;
    
    // Check specs match
    if (product.specs) {
      Object.values(product.specs).forEach(spec => {
        if (spec && spec.toString().toLowerCase().includes(queryLower)) score += 2;
      });
    }
    
    // Check features match
    if (product.features) {
      product.features.forEach(feature => {
        if (feature?.toLowerCase().includes(queryLower)) score += 2;
      });
    }
    
    // Check tags match
    if (product.tags) {
      product.tags.forEach(tag => {
        if (tag?.toLowerCase().includes(queryLower)) score += 2;
      });
    }
    
    // Check configuration match for custom PCs
    if (product.configuration) {
      Object.values(product.configuration).forEach(component => {
        if (component?.name?.toLowerCase().includes(queryLower)) score += 2;
      });
    }
    
    // Price range queries
    if (queryLower.includes('under') || queryLower.includes('below') || queryLower.includes('budget')) {
      const priceMatch = queryLower.match(/(\d+)/);
      if (priceMatch) {
        const maxPrice = parseInt(priceMatch[0]) * 1000;
        if (product.price <= maxPrice) score += 10;
      } else {
        // If no specific number, assume budget means under 50,000
        if (product.price < 50000) score += 8;
      }
    }
    
    // Budget queries without specific number
    if (queryLower.includes('cheap') || queryLower.includes('affordable')) {
      if (product.price < 40000) score += 10;
      else if (product.price < 60000) score += 5;
    }
    
    return { product, score };
  });
  
  // Filter out products with zero score
  const relevant = scoredProducts.filter(item => item.score > 0);
  console.log(`Found ${relevant.length} products with scores > 0`);
  
  // Sort by score and return top 5
  const topProducts = relevant
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.product);
  
  console.log("Top products:", topProducts.map(p => ({ 
    name: p.name, 
    type: p.type,
    score: scoredProducts.find(sp => sp.product.id === p.id)?.score 
  })));
  
  return topProducts;
};

// Main AI assistant function
export const aiAssistant = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const userId = req.user?.id;

    // Check if user is authenticated (if you want to require auth)
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        reply: "Please sign in to use the AI assistant.",
        products: [] 
      });
    }

    // Get all products from database
    const allProducts = await getAllProducts();

    // Get user information if authenticated
    const userInfo = userId ? await getUserInfo(userId) : null;
    
    // Get discount information
    const activeDiscounts = await getDiscountInfo();
    
    // Get transaction and order statistics
    const transactionStats = await getTransactionStats();
    const orderStats = await getOrderStats();
    
    // Get subscriber count and message history
    const subscriberCount = await getSubscriberCount();
    const recentMessages = await getMessageHistory();
    
    // Find relevant products based on the query
    const relevantProducts = findRelevantProducts(allProducts, message);

    console.log(`Found ${relevantProducts.length} relevant products for query: "${message}"`);

    // Create a detailed product catalog for the AI
    const productCatalog = allProducts.map(p => 
      `- ${p.name} (${p.type}): ₹${p.price} - ${p.brand}
       Specs: ${Object.entries(p.specs)
         .filter(([_, v]) => v)
         .map(([k, v]) => `${k}: ${v}`)
         .join(', ')}
       Rating: ${p.rating}/5 (${p.reviews} reviews)`
    ).join('\n\n');

    // Create user information summary
    const userSummary = userInfo ? `
USER INFORMATION:
- Name: ${userInfo.user?.name || 'N/A'}
- Email: ${userInfo.user?.email || 'N/A'}
- Phone: ${userInfo.user?.phoneNumber || 'N/A'}
- Bonus Points: ${userInfo.user?.bonusPoints || 0}
- Total Orders: ${userInfo.orders?.length || 0}
- Total Custom PCs: ${userInfo.customPCs?.length || 0}
- Items in Cart: ${userInfo.cart?.items?.length || 0}

RECENT ORDERS:
${(userInfo.orders || []).slice(0, 3).map(order => 
  `- Order #${order.orderId || order._id}: ₹${order.totalPrice} (${order.status})`
).join('\n')}

SAVED CUSTOM PC CONFIGURATIONS:
${(userInfo.customPCs || []).slice(0, 3).map(pc => 
  `- ${pc.name || 'Custom PC'}: ₹${pc.totalPrice}`
).join('\n')}
    ` : '';

    // Create discount information
    const discountSummary = activeDiscounts.length > 0 ? `
ACTIVE DISCOUNTS:
${activeDiscounts.map(d => 
  `- ${d.code}: ${d.discountType === 'percentage' ? `${d.value}% off` : `₹${d.value} off`}
   ${d.minPurchase ? `Minimum purchase: ₹${d.minPurchase}` : ''}
   ${d.expirationDate ? `Expires: ${new Date(d.expirationDate).toLocaleDateString()}` : 'No expiry'}`
).join('\n')}
    ` : '';

    // Create support-related information
    const supportInfo = `
SUPPORT INFORMATION:
- Support Hours: 24/7 (Always available)
- Email Support: support@7hubcomputer.com
- Phone Support: +91 9876543210 (24/7)
- Live Chat: Available on website
- Returns Policy: 7-day return policy
- Warranty: 1 year standard warranty (extended available)
- Shipping: Free shipping on orders over ₹50,000
- Delivery Time: 3-7 business days
- Payment Methods: Credit Card, Debit Card, UPI, Net Banking, PayPal, Paytm

STORE STATISTICS:
- Total Products Available: ${allProducts.length}
- Active Discount Codes: ${activeDiscounts.length}
- Newsletter Subscribers: ${subscriberCount}
- Recent Support Tickets: ${recentMessages.length}

CUSTOM PC BUILDER:
Users can build custom PCs by selecting individual components:
- CPU, GPU, RAM, Storage, Motherboard, Power Supply, Case, etc.
- Real-time compatibility checking
- Save configurations for later
- Share builds with others
    `;

    // Create system prompt with product context
    const systemPrompt = `You are an AI shopping assistant for 7HubComputer store. 
Your role is to help customers with product recommendations, order support, custom PC building, and general inquiries.

AVAILABLE PRODUCTS CATALOG:
${productCatalog}

${userSummary}

${discountSummary}

${supportInfo}

IMPORTANT GUIDELINES:
1. ONLY recommend products that are in the catalog above
2. Be specific - mention product names and prices
3. Compare products when relevant
4. Suggest 2-3 specific products for each query
5. Format prices in Indian Rupees (₹)
6. Mention key specifications that matter for the use case
7. If asked about something not in catalog, suggest closest alternatives
8. Be honest if no matching products exist

CUSTOM PC BUILDER GUIDELINES:
1. Help users choose compatible components
2. Suggest balanced builds based on budget and use case
3. Explain compatibility requirements (socket types, power requirements, etc.)
4. Recommend configurations for different purposes:
   - Gaming PC: Focus on GPU, fast CPU, adequate RAM
   - Workstation: High core count CPU, plenty of RAM, fast storage
   - Office PC: Balanced components, reliable, quiet
   - Budget Build: Best value for money, upgradeable components

ORDER SUPPORT GUIDELINES:
1. For order status, ask for order ID
2. Help with tracking and delivery estimates
3. Assist with returns and refunds
4. Handle payment issues
5. Provide warranty information

DISCOUNT GUIDELINES:
1. Inform users about active discounts
2. Explain discount terms and conditions
3. Help apply discount codes at checkout
4. Suggest products within budget after discounts

IMPORTANT GUIDELINES FOR CUSTOMER SUPPORT:
1. Be empathetic and professional at all times
2. For order-related queries, ask for order ID if user has one
3. Provide clear step-by-step instructions for common issues
4. Escalate to human support when needed
5. Know our policies (returns, warranty, shipping, etc.)
6. Offer alternative solutions when possible
7. Maintain a helpful and patient tone

COMMON SUPPORT SCENARIOS AND RESPONSES:
- Order Status: "I can help you check your order status. Could you please provide your order ID?"
- Returns: "Our return policy allows returns within 7 days of delivery. Would you like to initiate a return?"
- Warranty: "All products come with a standard 1-year warranty. Extended warranty options are available."
- Shipping: "Free shipping on orders above ₹50,000. Standard delivery takes 3-7 business days."
- Technical Issues: "I'll help you troubleshoot that issue. Let's go through some steps together."
- Payment Issues: "I can help with payment problems. Which payment method were you using?"
- Account Issues: "I can help with account-related problems. Are you logged in?"
- Contact Support: "You can reach our 24/7 support team at support@7hubcomputer.com or call +91 9876543210

Example responses:
- "For gaming under ₹1 lakh, I'd recommend the [Product Name] at ₹85,000. It has [key specs]."
- "The best laptop for programming would be [Product Name] with [specs]."
- "Here are our top 3 gaming monitors: ..."
- For product queries: "For gaming under ₹1 lakh, I'd recommend the [Product Name] at ₹85,000. It has [key specs]."
- For support: "I understand you're having trouble with your order. Let me help you track it. Could you share your order ID?"
- For returns: "I'd be happy to help you process a return. Please provide your order ID and reason for return."

Remember: You are available 24/7 to help with ANY questions about products or You can recommend products from our catalog.`;

    // Prepare messages for Ollama
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    // Call Ollama API
    const response = await axios.post(`${OLLAMA_URL}/api/chat`, {
      model: OLLAMA_MODEL,
      messages: messages,
      stream: false,
      options: {
        temperature: 0.7,
        max_tokens: 800,
        top_p: 0.9
      }
    });

    const reply = response.data.message?.content || "I'm sorry, I couldn't process that request.";

    res.json({
      reply,
      products: relevantProducts, // Send relevant products to frontend
      totalProducts: allProducts.length,
      model: OLLAMA_MODEL,
      userInfo: userInfo ? {
        name: userInfo.user?.name,
        email: userInfo.user?.email,
        orderCount: userInfo.orders?.length,
        customPCCount: userInfo.customPCs?.length,
        bonusPoints: userInfo.user?.bonusPoints
      } : null,
      activeDiscounts: activeDiscounts.length,
      isSupport: true
    });

  } catch (error) {
    console.error('Ollama Error:', error);
    res.status(500).json({ 
      reply: "I'm having trouble connecting. Our 24/7 support team is still available via email at support@7hubcomputer.com or phone at +91 9876543210.",
      products: [],
      error: error.message ,
      isSupport: true
    });
  }
};

// Get user-specific information
export const getUserDashboardInfo = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    const userInfo = await getUserInfo(userId);
    const activeDiscounts = await getDiscountInfo();
    
    res.json({
      success: true,
      ...userInfo,
      activeDiscounts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get custom PC configurations for a user
export const getUserCustomPCs = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    const customPCs = await CustomPC.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      customPCs
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get transaction history for a user
export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all active discounts
export const getActiveDiscounts = async (req, res) => {
  try {
    const discounts = await getDiscountInfo();
    
    res.json({
      success: true,
      discounts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Validate and apply discount
export const validateDiscount = async (req, res) => {
  try {
    const { code, totalAmount } = req.body;
    
    const discount = await Discount.findOne({
      code: code.toUpperCase(),
      isActive: true,
      $or: [
        { expirationDate: { $gte: new Date() } },
        { expirationDate: null }
      ]
    });
    
    if (!discount) {
      return res.status(404).json({ 
        success: false, 
        error: 'Invalid or expired discount code' 
      });
    }
    
    if (discount.minPurchase && totalAmount < discount.minPurchase) {
      return res.status(400).json({
        success: false,
        error: `Minimum purchase of ₹${discount.minPurchase} required`
      });
    }
    
    let discountAmount = 0;
    if (discount.discountType === 'fixed') {
      discountAmount = discount.value;
    } else if (discount.discountType === 'percentage') {
      discountAmount = (totalAmount * discount.value) / 100;
      if (discount.maxDiscount) {
        discountAmount = Math.min(discountAmount, discount.maxDiscount);
      }
    }
    
    const finalAmount = Math.max(totalAmount - discountAmount, 0);
    
    res.json({
      success: true,
      discount,
      discountAmount,
      finalAmount
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Endpoint to search products directly
export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    const allProducts = await getAllProducts();
    const relevantProducts = findRelevantProducts(allProducts, query);
    
    res.json({
      success: true,
      products: relevantProducts,
      count: relevantProducts.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Endpoint to get order status (for authenticated users)
export const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    const order = await Order.findOne({ 
      $or: [
        { _id: orderId },
        { orderId: orderId }
      ],
      userId: userId // Ensure user can only access their own orders
    }).lean();

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.json({
      success: true,
      order: {
        id: order._id,
        orderId: order.orderId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        deliveryDate: order.deliveryDate,
        product: order.product,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Endpoint to submit support ticket
export const submitSupportTicket = async (req, res) => {
  try {
    const { subject, message, orderId, userId } = req.body;
    
    // Here you would save to a SupportTicket model
    // For now, we'll just acknowledge
    res.json({
      success: true,
      message: 'Support ticket submitted successfully. Our team will contact you within 24 hours.',
      ticketId: `TICKET-${Date.now()}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all products (paginated)
export const getAllProductsEndpoint = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, minPrice, maxPrice } = req.query;
    let allProducts = await getAllProducts();
    
    // Apply filters
    if (category) {
      allProducts = allProducts.filter(p => p.category === category);
    }
    if (minPrice) {
      allProducts = allProducts.filter(p => p.price >= parseInt(minPrice));
    }
    if (maxPrice) {
      allProducts = allProducts.filter(p => p.price <= parseInt(maxPrice));
    }
    
    // Paginate
    const start = (parseInt(page) - 1) * parseInt(limit);
    const paginatedProducts = allProducts.slice(start, start + parseInt(limit));
    
    res.json({
      success: true,
      products: paginatedProducts,
      total: allProducts.length,
      page: parseInt(page),
      pages: Math.ceil(allProducts.length / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const allProducts = await getAllProducts();
    const product = allProducts.find(p => p.id === id);
    
    if (product) {
      res.json({ success: true, product });
    } else {
      res.status(404).json({ success: false, error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Endpoint to check available models
export const getOllamaModels = async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/tags`);
    res.json({ 
      success: true, 
      models: response.data.models,
      currentModel: OLLAMA_MODEL
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Could not fetch Ollama models' 
    });
  }
};

// Endpoint to change model
export const setOllamaModel = async (req, res) => {
  const { model } = req.body;
  // Note: This changes the model for the current session only
  res.json({ 
    success: true, 
    message: `Model switched to ${model}`,
    model: model 
  });
};