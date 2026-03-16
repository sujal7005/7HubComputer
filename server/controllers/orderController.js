import Order from '../models/Order.js';
import PDFDocument from 'pdfkit';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const generateInvoicePDF = async (req, res) => {
    const orderId = req.params.id; // Order ID from the request params

    // Get the current directory of this script
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Validate the orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid Order ID' });
    }

    try {
        // Fetch the order details from the database and populate user details and address
        const order = await Order.findById(orderId).populate('userId');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Create a new PDF document
        const doc = new PDFDocument({ margin: 50 });

        // Pipe the PDF into a response so it can be downloaded
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${order._id}_invoice.pdf`);

        doc.pipe(res); // Pipe the output to the response

        // Define the correct absolute path
        const logoPath = path.resolve(__dirname, '..', 'assets', 'logo.jpg');

        // Debugging: Check if the file exists before using it
        if (!fs.existsSync(logoPath)) {
            console.error("🚨 ERROR: File not found at:", logoPath);
        } else {
            console.log("✅ File found at:", logoPath);
        }

        // Add a header with a logo and company name
        doc.image(logoPath, 50, 45, { width: 50 }) // Replace with your logo path
            .fillColor('#444444')
            .fontSize(20)
            .text('7HubComputer', 110, 57)
            .fontSize(10)
            .text('123 Main Street', 200, 65, { align: 'right' })
            .text('City, State, ZIP Code', 200, 80, { align: 'right' })
            .moveDown();

        // Add invoice title
        doc.fontSize(16)
            .fillColor('#000000')
            .text('Invoice', 50, 120);

        // Add invoice details
        doc.fontSize(10)
            .fillColor('#444444')
            .text(`Invoice Number: ${order._id}`, 50, 150)
            .text(`Order Date: ${new Date(order.date).toLocaleDateString()}`, 50, 165)
            .text(`Delivery Date: ${new Date(order.deliveryDate).toLocaleDateString()}`, 50, 180)
            .moveDown();

        // Add customer information
        doc.fontSize(12)
            .fillColor('#000000')
            .text('Customer Information:', 50, 210);

        doc.fontSize(10)
            .fillColor('#444444')
            .text(`Name: ${order.userId.name}`, 50, 230)
            .text(`Email: ${order.userId.email}`, 50, 245)
            .text(`Phone: ${order.userId.phoneNumber}`, 50, 260);

        if (order.userId.address) {
            const address = order.userId.address;
            doc.text(`Address: ${address.line1}, ${address.line2}, ${address.city}, ${address.state}, ${address.zip}`, 50, 275);
        } else {
            doc.text('Address: N/A', 50, 275);
        }

        // Add payment and status information
        doc.fontSize(12)
            .fillColor('#000000')
            .text('Payment & Status:', 300, 210);

        doc.fontSize(10)
            .fillColor('#444444')
            .text(`Payment Method: ${order.paymentMethod}`, 300, 230)
            .text(`Status: ${order.status}`, 300, 245)
            .moveDown();

        // Add product table
        doc.fontSize(12)
            .fillColor('#000000')
            .text('Product Name', 50, 320)
            .text('Price', 300, 320, { align: 'center' })
            .text('Quantity', 400, 320, { align: 'center' })
            .text('Total', 500, 320, { align: 'right' });

        let yPosition = 340;
        const products = Array.isArray(order.product) ? order.product : [order.product];
        console.log("Products:", products);

        products.forEach((product) => {
            const totalPrice = product.finalPrice * product.quantity;

            doc.fontSize(10)
                .fillColor('#444444')
                .text(product.name, 50, yPosition)
                .text(`₹${product.finalPrice}`, 300, yPosition, { align: 'center' })
                .text((product.quantity || '1'), 400, yPosition, { align: 'center' })
                .text(`₹${totalPrice}`, 500, yPosition, { align: 'right' });

                yPosition += doc.currentLineHeight() + 5;
        });

        // Ensure enough space before "Total Price"
        yPosition += 20;

        // Add total price
        const totalAmount = products.reduce((acc, product) => acc + product.finalPrice * product.quantity, 0);

        doc.fontSize(12)
            .fillColor('#000000')
            .text('Total Price:', 400, yPosition, { align: 'center' })
            .text(`₹${totalAmount}`, 500, yPosition, { align: 'right' });

        // Finalize the PDF
        doc.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating invoice PDF' });
    }
};

export default { generateInvoicePDF };