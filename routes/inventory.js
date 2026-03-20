var express = require('express');
var router = express.Router();
const Inventory = require('../schemas/inventory');

// 1. Get all (có join với product)
router.get('/', async function (req, res, next) {
    try {
        let result = await Inventory.find({}).populate('product');
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// 2. Get inventory by ID (có join với product)
router.get('/:id', async function (req, res, next) {
    try {
        let result = await Inventory.findById(req.params.id).populate('product');
        if (!result) return res.status(404).send({ message: "Không tìm thấy kho" });
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// 3. Add_stock: Tăng stock
router.post('/add_stock', async function (req, res, next) {
    try {
        const { product, quantity } = req.body;
        let result = await Inventory.findOneAndUpdate(
            { product: product },
            { $inc: { stock: quantity } },
            { new: true }
        );
        res.status(200).send(result);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// 4. Remove_stock: Giảm stock
router.post('/remove_stock', async function (req, res, next) {
    try {
        const { product, quantity } = req.body;
        
        // Cần kiểm tra xem kho có đủ hàng để trừ không
        let inv = await Inventory.findOne({ product: product });
        if (inv.stock < quantity) {
            return res.status(400).send({ message: "Không đủ số lượng trong kho" });
        }

        let result = await Inventory.findOneAndUpdate(
            { product: product },
            { $inc: { stock: -quantity } },
            { new: true }
        );
        res.status(200).send(result);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// 5. Reservation: Giảm stock và tăng reserved
router.post('/reservation', async function (req, res, next) {
    try {
        const { product, quantity } = req.body;

        let inv = await Inventory.findOne({ product: product });
        if (inv.stock < quantity) {
            return res.status(400).send({ message: "Không đủ số lượng trong kho để đặt" });
        }

        let result = await Inventory.findOneAndUpdate(
            { product: product },
            { $inc: { stock: -quantity, reserved: quantity } },
            { new: true }
        );
        res.status(200).send(result);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// 6. Sold: Giảm reservation và tăng soldCount
router.post('/sold', async function (req, res, next) {
    try {
        const { product, quantity } = req.body;

        let inv = await Inventory.findOne({ product: product });
        if (inv.reserved < quantity) {
            return res.status(400).send({ message: "Số lượng bán vượt quá số lượng đã đặt (reserved)" });
        }

        let result = await Inventory.findOneAndUpdate(
            { product: product },
            { $inc: { reserved: -quantity, soldCount: quantity } },
            { new: true }
        );
        res.status(200).send(result);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;