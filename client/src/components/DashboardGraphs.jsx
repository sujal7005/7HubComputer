import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from "recharts";

const DashboardGraphs = () => {
    const [salesData, setSalesData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const BASE_URL = `http://${window.location.hostname}:4000`;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const salesResponse = await fetch(`${BASE_URL}/api/admin/sales`);
                const salesJson = await salesResponse.json();
                console.log(salesJson);
                setSalesData(salesJson.salesByMonth || []);

                const categoryResponse = await fetch(`${BASE_URL}/api/admin/categories`);
                const categoryJson = await categoryResponse.json();
                setCategoryData(categoryJson.map(item => ({ category: item._id, totalSales: item.totalSales })));

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Sales Trend Chart */}
            <div className="bg-white border-4 border-black p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-xl font-bold text-black mb-4 border-b-2 border-black pb-2">Sales Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                        <XAxis 
                            dataKey="month" 
                            stroke="#000000" 
                            tick={{ fill: '#000000', fontSize: 12 }}
                        />
                        <YAxis 
                            stroke="#000000" 
                            tick={{ fill: '#000000', fontSize: 12 }}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#FFFFFF', 
                                border: '2px solid #000000',
                                borderRadius: '0',
                                color: '#000000'
                            }}
                            labelStyle={{ color: '#000000', fontWeight: 'bold' }}
                        />
                        <Legend 
                            wrapperStyle={{ color: '#000000' }}
                        />
                        <CartesianGrid strokeDasharray="3 3" stroke="#CCCCCC" />
                        <Line 
                            type="monotone" 
                            dataKey="sales" 
                            stroke="#16a34a" 
                            strokeWidth={2}
                            dot={{ fill: '#16a34a', stroke: '#000000', strokeWidth: 1, r: 4 }}
                            activeDot={{ r: 6, fill: '#16a34a', stroke: '#000000', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Category Sales Chart */}
            <div className="bg-white border-4 border-black p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-xl font-bold text-black mb-4 border-b-2 border-black pb-2">Category Sales</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData}>
                        <XAxis 
                            dataKey="category" 
                            stroke="#000000" 
                            tick={{ fill: '#000000', fontSize: 12 }}
                        />
                        <YAxis 
                            stroke="#000000" 
                            tick={{ fill: '#000000', fontSize: 12 }}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#FFFFFF', 
                                border: '2px solid #000000',
                                borderRadius: '0',
                                color: '#000000'
                            }}
                            labelStyle={{ color: '#000000', fontWeight: 'bold' }}
                        />
                        <Legend 
                            wrapperStyle={{ color: '#000000' }}
                        />
                        <CartesianGrid strokeDasharray="3 3" stroke="#CCCCCC" />
                        <Bar 
                            dataKey="totalSales" 
                            fill="#8884d8" 
                            stroke="#000000"
                            strokeWidth={1}
                            radius={[0, 0, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Optional: Add a summary section */}
            <div className="md:col-span-2 bg-white border-4 border-black p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center border-2 border-black p-4">
                        <p className="text-sm text-gray-600 uppercase tracking-wider">Total Sales</p>
                        <p className="text-2xl font-bold text-black">
                            ₹{salesData.reduce((sum, item) => sum + (item.sales || 0), 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="text-center border-2 border-black p-4">
                        <p className="text-sm text-gray-600 uppercase tracking-wider">Categories</p>
                        <p className="text-2xl font-bold text-black">{categoryData.length}</p>
                    </div>
                    <div className="text-center border-2 border-black p-4">
                        <p className="text-sm text-gray-600 uppercase tracking-wider">Avg Monthly Sales</p>
                        <p className="text-2xl font-bold text-black">
                            ₹{salesData.length ? (salesData.reduce((sum, item) => sum + (item.sales || 0), 0) / salesData.length).toFixed(0).toLocaleString() : 0}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardGraphs;