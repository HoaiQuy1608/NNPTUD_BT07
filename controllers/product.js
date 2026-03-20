const Product = require('../schemas/product'); 
const Inventory = require('../schemas/inventory');

module.exports = {
    createProduct: async function(req, res) {
        try {
            const newProduct = new Product(req.body);
            await newProduct.save();
            const newInventory = new Inventory({
                product: newProduct._id,
                stock: 0,
                reserved: 0,
                soldCount: 0
            });
            await newInventory.save();

            res.status(201).send({
                message: "Tạo sản phẩm và kho thành công",
                product: newProduct,
                inventory: newInventory
            });
        } catch (error) {
            res.status(400).send({ error: error.message });
        }
    },
    
    // ... các hàm khác
}