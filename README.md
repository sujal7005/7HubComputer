# 7Hub Computer

A full-stack MERN (MongoDB, Express.js, React, Node.js) ecommerce website specializing in computer hardware, custom PC builds, and accessories. Built with modern web technologies to provide a seamless shopping experience for tech enthusiasts and professionals.

## 🚀 Features

- **User Authentication**: Secure login/signup with JWT, social login (Google, Facebook, Twitter)
- **Product Catalog**: Comprehensive catalog of pre-built PCs, custom PC builders, laptops, mini PCs, displays, and accessories
- **Custom PC Builder**: Interactive tool to build custom PCs with real-time pricing
- **Shopping Cart & Checkout**: Persistent cart with Stripe, Razorpay, and Paytm payment integrations
- **Admin Panel**: Dashboard for managing products, orders, users, and analytics
- **AI Assistant**: Integrated OpenAI-powered chatbot for product recommendations and support
- **Search & Filters**: Advanced search functionality with filters and sorting
- **Responsive Design**: Mobile-first design using Tailwind CSS and Framer Motion animations
- **Real-time Features**: Socket.io for live chat and notifications
- **Order Management**: Complete order tracking and history
- **Discount System**: Coupon codes and promotional discounts
- **File Uploads**: Image uploads for products and user profiles
- **Email Notifications**: Automated emails for orders and account activities
- **Analytics Dashboard**: Sales graphs and performance metrics

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern JavaScript library for building user interfaces
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for React
- **React Router** - Declarative routing for React
- **Axios** - HTTP client for API requests
- **Stripe Elements** - Payment form components
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Passport.js** - Authentication middleware
- **Stripe** - Payment processing
- **Razorpay & Paytm** - Indian payment gateways
- **OpenAI API** - AI-powered features
- **Socket.io** - Real-time bidirectional communication
- **Nodemailer** - Email sending
- **Multer** - File upload handling

### DevOps & Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing
- **Nodemon** - Development server auto-restart

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance like MongoDB Atlas)
- **npm** or **yarn** package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/7hub-computer.git
   cd 7hub-computer
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**

   Create `.env` files in both `server` and `client` directories.

   **Server `.env`:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/7hubcomputer
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret
   RAZORPAY_KEY_ID=your_razorpay_key
   PAYTM_MID=your_paytm_mid
   OPENAI_API_KEY=your_openai_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   TWITTER_CONSUMER_KEY=your_twitter_key
   TWITTER_CONSUMER_SECRET=your_twitter_secret
   ```

   **Client `.env`:**
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   VITE_RAZORPAY_KEY_ID=your_razorpay_key
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_FACEBOOK_APP_ID=your_facebook_app_id
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on your system.

6. **Run the application**

   **Start the server:**
   ```bash
   cd server
   npm run dev
   ```

   **Start the client (in a new terminal):**
   ```bash
   cd client
   npm run dev
   ```

7. **Access the application**
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📖 Usage

### For Customers
- Browse products by category (Pre-built PCs, Custom PCs, Laptops, etc.)
- Use the custom PC builder to create personalized configurations
- Add items to cart and proceed to checkout
- Multiple payment options (Stripe, Razorpay, Paytm)
- Track orders and view purchase history
- Contact support through live chat or contact form

### For Admins
- Access admin panel at `/admin`
- Manage products, categories, and inventory
- View sales analytics and reports
- Process orders and manage users
- Configure discount codes and promotions

## 🔌 API Documentation

The API follows RESTful conventions and is documented with the following endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product (Admin)
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart/:id` - Remove item from cart

For complete API documentation, refer to the Postman collection or Swagger docs.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- **Project Link**: [https://github.com/sujal7005/7hub-computer](https://github.com/sujal7005/7hub-computer)
- **Email**: sujal0705gupta@gmail.com

## 🙏 Acknowledgments

- Icons by [Font Awesome](https://fontawesome.com/)
- UI Components inspired by modern ecommerce platforms
- Special thanks to the open-source community

---

**Note**: This is a demo project. For production use, ensure proper security measures, environment variable management, and database backups.
