import React, { useRef, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { sendDeviceInfo, sendLocationInfo } from './utils/deviceInfo.jsx';
import Header from './components/Header';
import Footer from './components/Footer';
import Cookies from './components/CookieConsent.jsx';
import PageTransition from './components/PageTransition';
import './App.css';

const SignIn = lazy(() => import('./components/SignIn'));
const Profile = lazy(() => import('./components/Profile'));
const Cart = lazy(() => import('./components/Cart'));
const Home = lazy(() => import('./pages/Home'));
const PreBuiltPCs = lazy(() => import('./pages/PreBuiltPCs'));
const ProductDetails = lazy(() => import('./components/ProductDetails'));
const CustomPC = lazy(() => import('./pages/CustomPC'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/privacy'));
const Terms = lazy(() => import('./pages/terms'));
const Faq = lazy(() => import('./pages/faq'));
const Support = lazy(() => import('./pages/Support'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const Laptop = lazy(() => import('./pages/Laptop'));
const MiniPC = lazy(() => import('./pages/MiniPCs'));
const AllInOnePCs = lazy(() => import('./pages/AllInOnePCs'));
const Payment = lazy(() => import('./components/Payment'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));

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
            <Suspense fallback={
              <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-lg text-gray-600 font-medium">Loading, please wait...</p>
                </div>
              </div>
            }>
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
            </Suspense>
          </PageTransition>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;