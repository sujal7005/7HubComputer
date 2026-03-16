import { Link } from "react-router-dom";
import { FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

// Checkpoints Data
const checkpoints = [
  {
    title: "Hardware Inspection",
    description:
      "We inspect every hardware component to ensure it meets industry standards and is free of defects. This includes checking the motherboard, CPU, GPU, RAM, storage, and power supply for any potential issues.",
    image: "/images/hardware-inspection.jpg",
  },
  {
    title: "Software & OS Check",
    description:
      "All necessary drivers, operating system updates, and essential software are pre-installed and tested for stability, ensuring a seamless user experience right out of the box.",
    image: "/images/software-check.jpg",
  },
  {
    title: "Performance Benchmarking",
    description:
      "We run a series of benchmark tests to measure system performance, stress-test the CPU and GPU, and ensure that the system operates at peak efficiency.",
    image: "/images/performance-benchmark.jpg",
  },
  {
    title: "Cooling System Analysis",
    description:
      "Proper cooling is essential for long-term performance. We analyze the airflow, test fan speeds, and measure CPU/GPU temperatures under load to prevent overheating.",
    image: "/images/cooling-system.jpg",
  },
  {
    title: "Storage & Memory Testing",
    description:
      "We check the read/write speeds of storage drives and conduct RAM stability tests to ensure fast, error-free operation under various workloads.",
    image: "/images/storage-memory.jpg",
  },
  {
    title: "Connectivity & Ports Check",
    description:
      "Every USB port, HDMI, Ethernet, Bluetooth, and Wi-Fi module is tested for functionality, ensuring seamless connectivity.",
    image: "/images/connectivity-ports.jpg",
  },
  {
    title: "Final Quality Assurance",
    description:
      "Before shipping, we perform a final round of checks, ensuring all components function perfectly and the system meets our high-quality standards.",
    image: "/images/quality-assurance.jpg",
  },
];

const HubComputerDetails = () => {
  return (
    <div className="bg-white pt-24 md:pt-28 pb-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="border-b-2 border-black pb-8 mb-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4">
            Why Choose 7HubComputer?
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our 7-step quality assurance process ensures every system meets the highest standards of performance and reliability.
          </p>
        </div>

        {/* Checkpoints Grid */}
        <div className="space-y-16">
          {checkpoints.map((checkpoint, index) => (
            <div
              key={index}
              className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-12 ${
                index % 2 === 0 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Image Section */}
              <div className="lg:w-1/2">
                <div className="border-4 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
                  <img
                    src={checkpoint.image}
                    alt={checkpoint.title}
                    className="w-full h-64 md:h-80 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x600?text=Image+Coming+Soon';
                    }}
                  />
                </div>
              </div>

              {/* Text Section */}
              <div className="lg:w-1/2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg border-2 border-black">
                    {index + 1}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-black">
                    {checkpoint.title}
                  </h2>
                </div>
                
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {checkpoint.description}
                </p>

                <div className="flex items-center gap-2 text-gray-600">
                  <FaCheckCircle className="text-green-600" />
                  <span className="text-sm font-medium">Quality checked and verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <div className="border-2 border-black p-6 text-center bg-gray-50">
            <p className="text-4xl font-bold text-black mb-2">7</p>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">Quality Checks</p>
          </div>
          <div className="border-2 border-black p-6 text-center bg-gray-50">
            <p className="text-4xl font-bold text-black mb-2">100%</p>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">Tested Systems</p>
          </div>
          <div className="border-2 border-black p-6 text-center bg-gray-50">
            <p className="text-4xl font-bold text-black mb-2">24/7</p>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">Support</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="border-4 border-black bg-white p-12 mt-16 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Ready to Experience the 7Hub Difference?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Browse our collection of pre-built and custom systems, all backed by our 7-step quality assurance process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/prebuilt"
              className="px-8 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors border-2 border-black inline-block"
            >
              VIEW PRE-BUILT PCs
            </Link>
            <Link
              to="/custom"
              className="px-8 py-3 bg-white text-black font-medium hover:bg-gray-100 transition-colors border-2 border-black inline-block"
            >
              BUILD YOUR OWN
            </Link>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-black border-b-2 border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors"
          >
            <FaArrowLeft /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HubComputerDetails;