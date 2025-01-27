import React, { useRef, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { sendDeviceInfo, sendLocationInfo } from './utils/deviceInfo.jsx';
import Header from './components/Header';
import Footer from './components/Footer';
import SignIn from './components/SignIn';
import Profile from './components/Profile';
import PageTransition from './components/PageTransition';
import Cart from './components/Cart';
import Home from './pages/Home';
import PreBuiltPCs from './pages/PreBuiltPCs';
import ProductDetails from './components/ProductDetails';
import CustomPC from './pages/CustomPC';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/privacy';
import Terms from './pages/terms';
import Faq from './pages/faq.jsx';
import Support from './pages/Support.jsx';
import SearchResults from './pages/SearchResults';
import Laptop from './pages/Laptop.jsx';
import MiniPC from './pages/MiniPCs.jsx';
import AllInOnePCs from './pages/AllInOnePCs.jsx';
import Payment from './components/Payment.jsx';
import Cookies from './components/CookieConsent.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import './App.css';

const App = () => {
  useEffect(() => {
    sendDeviceInfo();
    sendLocationInfo();
  }, []);
  const location = useLocation();
  const nodeRef = useRef(null);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Header />
      <Cookies />
      <main className="container mx-auto py-8 px-4 mt-20">
        <div ref={nodeRef}>
          <PageTransition in={true} nodeRef={nodeRef}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path='/admin' element={<AdminPanel />} />
              <Route path='/signin' element={<SignIn />} />
              <Route path='/profile' element={<Profile />} />
              <Route path='/cart' element={<Cart />} />
              <Route path="/prebuilt" element={<PreBuiltPCs />} />
              <Route path="/mini-pcs" element={<MiniPC />} />
              <Route path="/mini-pcs/:id" element={<ProductDetails />} />
              <Route path="/all-in-one-pcs" element={<AllInOnePCs />} />
              <Route path="/pc/:id" element={<ProductDetails />} />
              <Route path="/refurbished/:id" element={<ProductDetails />} />
              <Route path='/payment' element={<Payment />} />
              <Route path='/laptops' element={<Laptop />} />
              <Route path="/custom" element={<CustomPC />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path='/privacy' element={<Privacy />} />
              <Route path='/terms' element={<Terms />} />
              <Route path='/faq' element={<Faq />} />
              <Route path='/support' element={<Support />} />
              <Route path="/search" element={<SearchResults />} />
            </Routes>
          </PageTransition>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;