import { Router } from "express";
import User from "../models/User.js";
import Order from '../models/Order.js';
import Address from '../models/Address.js';
import Transaction from '../models/Transaction.js';
import orderController from '../controllers/orderController.js';

const router = Router();

router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:userId/orders', async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ date: -1 });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/orders/generate-invoice-pdf/:id', orderController.generateInvoicePDF);

router.get('/:userId/addresses', async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.params.userId });
        res.json(addresses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/orders/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId).populate('product');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/:userId/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.params.userId });
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update User Details
router.put('/update-user', async (req, res) => {
    try {
        const { userId, name, phoneNumber } = req.body;
        if (!userId) return res.status(400).json({ message: 'UserId is required' });

        const user = await User.findByIdAndUpdate(
            userId,
            { name, phoneNumber },
            { new: true } // Return the updated user
        );

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/update-user', async (req, res) => {

    try {
        const { userId, name, phoneNumber } = req.body;
        if (!userId) return res.status(400).json({ message: 'UserId is required' });

        const user = await User.findByIdAndUpdate(
            userId,
            { name, phoneNumber },
            { new: true } // Return the updated user
        );

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:userId/add-address', async (req, res) => {
    const { line1, line2, city, state, zip } = req.body;
    const userId = req.params.userId;
    try {
        const newAddress = new Address({
            userId,
            line1,
            line2,
            city,
            state,
            zip,
        });

        await newAddress.save();
        res.json({ success: true, address: newAddress });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:userId/remove-address/:addressId', async (req, res) => {
    const { userId, addressId } = req.params;

    try {
        // Find the user
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });


        if (!Array.isArray(user.addresses)) {
            user.addresses = []; // Initialize as empty array if not already an array
        }

        // Find the address to remove
        const address = await Address.findById(addressId);
        if (!address) return res.status(404).json({ message: 'Address not found' });

        // Remove the address from user's address array
        user.addresses = user.addresses.filter((addr) => addr.toString() !== addressId);
        await user.save();

        // Delete the address from the Address collection
        await address.deleteOne();

        res.json({ success: true, message: 'Address removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:userId/update-address/:addressId', async (req, res) => {
    const { userId, addressId } = req.params;
    const { line1, line2, city, state, zip } = req.body;

    try {
        // Find the user
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Find the address to update
        const address = await Address.findById(addressId);
        if (!address) return res.status(404).json({ message: 'Address not found' });

        // Update the address
        address.line1 = line1 || address.line1;
        address.line2 = line2 || address.line2;
        address.city = city || address.city;
        address.state = state || address.state;
        address.zip = zip || address.zip;

        // Save the updated address
        await address.save();

        // Return the updated address
        res.json({ success: true, address });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/orders/:orderId/cancel', async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.status === 'Cancelled') {
            return res.json({ success: false, message: 'Order is already cancelled' });
        }

        const user = await User.findById(order.userId);
        if (user) {
            const bonusPointsToRemove = order.product.bonuses || 0; // Get bonus points from the order

            if (user.bonusPoints && user.bonusPoints >= bonusPointsToRemove) {
                user.bonusPoints -= bonusPointsToRemove; // Remove the bonus points
                await user.save();
                console.log(`✅ Removed ${bonusPointsToRemove} bonus points from user ${user._id}`);
            } else {
                console.warn(`⚠️ User ${user._id} does not have enough bonus points to deduct`);
            }
        }

        order.status = 'Cancelled';
        await order.save();

        res.json({ success: true, message: 'Order cancelled successfully', order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// router.post('/update-order/:orderId', async (req, res) => {
//     const { orderId } = req.params;
//     const { status } = req.body;

//     try {
//         const order = await Order.findById(orderId);
//         if (!order) return res.status(404).json({ message: "Order not found" });

//         const user = await User.findById(order.userId);
//         if (!user) return res.status(404).json({ message: "User not found" });

//         console.log(`Before update: User bonuses = ${user.bonuses}, Order bonus = ${order.bonusPoints}`);

//         if (order.status !== "delivered" && status === "delivered") {
//             // If order is newly marked as delivered, add bonus points
//             user.bonuses += order.bonusPoints;
//             console.log(`Added ${order.bonusPoints} points`);
//         } else if (order.status === "delivered" && status === "canceled") {
//             // If order was delivered and is now canceled, remove bonus points
//             user.bonuses -= order.bonusPoints;
//             console.log(`Removed ${order.bonusPoints} points`);
//         }

//         order.status = status;
//         await order.save();
//         await user.save();

//         console.log(`After update: User bonuses = ${user.bonuses}`);

//         res.json({ message: "Order updated", userBonuses: user.bonuses });
//     } catch (error) {
//         res.status(500).json({ message: "Server error", error });
//     }
// });

export default router;