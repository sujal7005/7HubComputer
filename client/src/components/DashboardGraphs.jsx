import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from "recharts";

const DashboardGraphs = () => {
    const [salesData, setSalesData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const salesResponse = await fetch("http://localhost:4000/api/admin/sales");
                const salesJson = await salesResponse.json();
                console.log(salesJson);
                setSalesData(salesJson.salesByMonth || []);

                const categoryResponse = await fetch("http://localhost:4000/api/admin/categories");
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
            <div className="bg-gray-800 p-6 rounded-md shadow-md">
                <h2 className="text-xl font-bold text-white mb-4">Sales Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                        <XAxis dataKey="month" stroke="#ccc" />
                        <YAxis stroke="#ccc" />
                        <Tooltip />
                        <Legend />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="sales" stroke="#82ca9d" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-gray-800 p-6 rounded-md shadow-md">
                <h2 className="text-xl font-bold text-white mb-4">Category Sales</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData}>
                        <XAxis dataKey="category" stroke="#ccc" />
                        <YAxis stroke="#ccc" />
                        <Tooltip />
                        <Legend />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Bar dataKey="totalSales" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DashboardGraphs;