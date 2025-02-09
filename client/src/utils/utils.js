// utils.js
export const generateInvoice = (order) => {
    const orderDetails = `
      <h1>Invoice</h1>
      <p><strong>Invoice Number:</strong> ${order._id}</p>
      <p><strong>Order Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
      <p><strong>Delivery Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString()}</p>
      
      <h2>Customer Information</h2>
      <p><strong>Name:</strong> ${order.userDetails.name}</p>
      <p><strong>Email:</strong> ${order.userDetails.email}</p>
      <p><strong>Phone:</strong> ${order.userDetails.phoneNumber}</p>
      <p><strong>Address:</strong> ${`${order.userDetails.address.line1}, ${order.userDetails.address.line2}, ${order.userDetails.address.city}, ${order.userDetails.address.state}, ${order.userDetails.address.zip}`}</p>
      
      <h2>Product Details</h2>
      <ul>
        <li><strong>Product Name:</strong> ${order.product.name}</li>
        <li><strong>Price:</strong> ₹${order.product.finalPrice}</li>
        <li><strong>Quantity:</strong> ${order.product.quantity}</li>
      </ul>
      
      <h2>Payment Information</h2>
      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      <p><strong>Total Price:</strong> ₹${order.product.finalPrice * order.product.quantity}</p>
      
      <h2>Status</h2>
      <p><strong>Order Status:</strong> ${order.status}</p>
    `;

    return orderDetails;
};  