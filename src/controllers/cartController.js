const Cart = require("../models/Cart");
const Product = require("../models/Product");
const {
  sendPedidoConfirmadoEmail,
  sendPagoConfirmadoEmail,
  sendEnPreparacionEmail,
  sendPedidoEntregadoEmail
} = require('../utils/emailSender');
const User = require('../models/User');

// 👉 Obtener todos los carritos
const getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find()
      .populate("items.productId")
      .populate("userId", "name");
    res.status(200).json(carts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👉 Obtener el último carrito de un usuario
const getLastCartByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId && !req.user.isAdmin && !req.user.isSecretaria) {
      return res.status(403).json({ message: "No tienes permisos para ver este carrito" });
    }

    const lastCart = await Cart.findOne({ userId })
      .sort({ createdAt: -1 })
      .populate("items.productId")
      .populate("userId", "name");

    if (!lastCart) return res.status(404).json({ message: "El usuario no tiene carritos" });

    // ✅ Limpiar items huérfanos antes de devolver
    const hadOrphans = lastCart.items.some(item => item.productId === null);
    if (hadOrphans) {
      lastCart.items = lastCart.items.filter(item => item.productId !== null);
      await lastCart.save();
    }

    res.status(200).json(lastCart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👉 Agregar un producto al carrito
const addToCart = async (req, res) => {
  try {
    const { userId, items, paymentMethod, deliveryMethod, shippingAddress } = req.body;

    if (req.user._id.toString() !== userId && !req.user.isAdmin && !req.user.isSecretaria) {
      return res.status(403).json({ message: "No puedes agregar productos al carrito de otro usuario" });
    }

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ message: "Faltan datos del carrito" });
    }

    const lastCart = await Cart.findOne({ userId }).sort({ createdAt: -1 });

    let totalAmount = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Producto no encontrado: ${item.productId}` });
      }
      if (item.quantity > product.stock) {
        return res.status(400).json({ message: `Stock insuficiente para ${product.title}` });
      }
      totalAmount += product.price * item.quantity;
    }

    // ✅ Crear nuevo carrito si no hay ninguno O si el último ya fue procesado
    // "inicializado" es el ÚNICO estado donde se puede seguir agregando productos
    const estadosQueCierranCarrito = ["pagado", "pendiente", "preparacion", "entregado", "cancelado"];
    
    if (!lastCart || estadosQueCierranCarrito.includes(lastCart.status)) {
      const newCart = new Cart({
        userId,
        items,
        paymentMethod: paymentMethod || "efectivo",
        deliveryMethod: deliveryMethod || "retiro",
        shippingAddress: shippingAddress || {
          name: "Usuario Nuevo",
          address: "Sin dirección",
          phone: "0000000000"
        },
        totalAmount,
        status: "inicializado"
      });

      await newCart.save();
      return res.status(201).json(newCart);
    }

    // Solo llegamos acá si el carrito está en "inicializado"
    // ✅ Limpiar items huérfanos antes de modificar
    lastCart.items = lastCart.items.filter(item => item.productId !== null);

    for (const item of items) {
      const index = lastCart.items.findIndex(i => i.productId.toString() === item.productId);
      if (index !== -1) {
        lastCart.items[index].quantity += item.quantity;
      } else {
        lastCart.items.push(item);
      }
    }

    // ✅ Recalcular total limpio
    let newTotal = 0;
    for (const item of lastCart.items) {
      const product = await Product.findById(item.productId);
      if (product) newTotal += product.price * item.quantity;
    }
    lastCart.totalAmount = newTotal;

    await lastCart.save();
    return res.status(200).json(lastCart);
  } catch (err) {
    console.error("Error en addToCart:", err);
    res.status(500).json({ message: err.message });
  }
};

// 👉 Obtener el carrito de un usuario
const getCartByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId && !req.user.isAdmin && !req.user.isSecretaria) {
      return res.status(403).json({ message: "No tienes permisos para ver este carrito" });
    }

    const cart = await Cart.find({ userId })
      .populate("items.productId")
      .populate("userId", "name");

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👉 Actualizar productos en el carrito
const updateCartItems = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { productId, action } = req.body;

    const cart = await Cart.findById(cartId);
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

    if (req.user._id.toString() !== cart.userId.toString() && !req.user.isAdmin && !req.user.isSecretaria) {
      return res.status(403).json({ message: "No tienes permisos para modificar este carrito" });
    }

    // ✅ Bloquear modificaciones en carritos ya procesados
    const estadosBloqueados = ["pendiente", "pagado", "preparacion", "entregado", "cancelado"];
    if (estadosBloqueados.includes(cart.status)) {
      return res.status(400).json({ 
        message: `No se puede modificar un carrito en estado "${cart.status}"` 
      });
    }

    // ✅ Limpiar items huérfanos antes de operar
    cart.items = cart.items.filter(item => item.productId !== null);

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex === -1 && action === 'add') {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Producto no encontrado" });
      cart.items.push({ productId, quantity: 1 });

    } else if (itemIndex !== -1) {
      const item = cart.items[itemIndex];

      if (action === 'add') {
        // ✅ Validar stock antes de agregar
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Producto no encontrado" });
        if (item.quantity + 1 > product.stock) {
          return res.status(400).json({ message: `Stock insuficiente para ${product.title}` });
        }
        item.quantity += 1;

      } else if (action === 'subtract') {
        item.quantity -= 1;
        if (item.quantity <= 0) cart.items.splice(itemIndex, 1);

      } else if (action === 'remove') {
        cart.items.splice(itemIndex, 1);
      }
    } else {
      return res.status(400).json({ message: "Producto no existe en el carrito" });
    }

    // ✅ Recalcular total
    let totalAmount = 0;
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (product) totalAmount += item.quantity * product.price;
    }
    cart.totalAmount = totalAmount;

    await cart.save();
    res.status(200).json({ message: "Carrito actualizado", cart });

  } catch (err) {
    console.error("Error en updateCartItems:", err);
    res.status(500).json({ message: err.message });
  }
};

// 👉 Confirmar compra (checkout)
const checkoutCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { paymentMethod, deliveryMethod, shippingAddress, customerInfo, receiptUrl } = req.body;

    const cart = await Cart.findById(cartId).populate("items.productId");
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

    if (req.user._id.toString() !== cart.userId.toString() && !req.user.isAdmin && !req.user.isSecretaria) {
      return res.status(403).json({ message: "No puedes confirmar la compra de otro usuario" });
    }

    if (["pagado", "preparacion", "entregado", "cancelado"].includes(cart.status)) {
      return res.status(400).json({ message: "Carrito ya procesado" });
    }

    // ✅ Filtrar items huérfanos antes del checkout
    cart.items = cart.items.filter(item => item.productId !== null);

    for (const item of cart.items) {
      const product = item.productId;
      if (!product) continue;
      if (item.quantity > product.stock) {
        return res.status(400).json({
          message: `Stock insuficiente para ${product.title}. Disponible: ${product.stock}, solicitado: ${item.quantity}`
        });
      }
    }

    for (const item of cart.items) {
      const product = item.productId;
      if (!product) continue;
      product.stock -= item.quantity;
      await product.save();
    }

    cart.paymentMethod = paymentMethod;
    cart.deliveryMethod = deliveryMethod;
    cart.shippingAddress = {
      name: customerInfo?.name || shippingAddress?.name || cart.shippingAddress.name,
      address: customerInfo?.address || shippingAddress?.address || cart.shippingAddress.address,
      phone: customerInfo?.phone || shippingAddress?.phone || cart.shippingAddress.phone,
    };

    if (receiptUrl) cart.receiptUrl = receiptUrl;

    cart.status = paymentMethod === 'transferencia' ? 'pendiente' : 'pagado';

    await cart.save();

    try {
      const user = await User.findById(cart.userId);
      await sendPedidoConfirmadoEmail(cart, user);
    } catch (emailError) {
      console.error('❌ Error enviando email de confirmación:', emailError);
    }

    return res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error del servidor al procesar checkout", error: err.message });
  }
};

// 👉 Actualizar estado del carrito
const updateCartStatus = async (req, res) => {
  const { cartId } = req.params;
  const { status } = req.body;

  const validStatuses = ["pendiente", "pagado", "preparacion", "cancelado", "entregado"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Estado inválido" });
  }

  try {
    const cart = await Cart.findById(cartId).populate('userId').populate('items.productId');
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

    if (status === "preparacion" && !["pagado", "pendiente"].includes(cart.status)) {
      return res.status(400).json({ message: "Solo se puede pasar a preparación si el pedido está pagado o pendiente" });
    }

    // ✅ Evitar cancelar algo que ya fue entregado
    if (status === "cancelado" && cart.status === "entregado") {
      return res.status(400).json({ message: "No se puede cancelar un pedido ya entregado" });
    }

    const estadoAnterior = cart.status;
    cart.status = status;
    await cart.save();

    // ✅ Restaurar stock al cancelar
    // Solo si el carrito estaba en un estado donde el stock ya fue descontado
    // (pendiente, pagado, preparacion)
    const estadosConStockDescontado = ["pendiente", "pagado", "preparacion"];
    if (status === "cancelado" && estadosConStockDescontado.includes(estadoAnterior)) {
      console.log(`🔄 Restaurando stock por cancelación del carrito ${cartId}`);
      
      for (const item of cart.items) {
        const product = item.productId; // ya está populado
        if (!product) continue;

        product.stock += item.quantity;

        // ✅ Reactivar producto si quedó inactivo por falta de stock
        if (!product.isActive && product.stock > 0) {
          product.isActive = true;
        }

        await product.save();
        console.log(`✅ Stock restaurado: ${product.title} +${item.quantity} (ahora: ${product.stock})`);
      }
    }

    const updatedCart = await Cart.findById(cartId)
      .populate("items.productId")
      .populate("userId", "name email");

    try {
      const user = await User.findById(cart.userId._id || cart.userId);
      if (status !== estadoAnterior) {
        switch (status) {
          case 'pendiente':
          case 'pagado':
            await sendPedidoConfirmadoEmail(updatedCart, user);
            break;
          case 'preparacion':
            await sendEnPreparacionEmail(updatedCart, user);
            break;
          case 'entregado':
            await sendPedidoEntregadoEmail(updatedCart, user);
            break;
        }
        if (status === 'pagado' && estadoAnterior === 'pendiente') {
          await sendPagoConfirmadoEmail(updatedCart, user);
        }
      }
    } catch (emailError) {
      console.error('❌ Error enviando email:', emailError);
    }

    res.status(200).json(updatedCart);
  } catch (error) {
    console.error('Error en updateCartStatus:', error);
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

// 👉 Rating desde carrito
const addCartProductRating = async (req, res) => {
  const { cartId, productId } = req.params;
  const { stars, comment } = req.body;

  try {
    const cart = await Cart.findById(cartId);
    const product = await Product.findById(productId);

    if (!cart || !product) {
      return res.status(404).json({ message: 'Producto o carrito no encontrado' });
    }

    if (req.user._id.toString() !== cart.userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'No autorizado a calificar este carrito' });
    }

    if (cart.status !== 'entregado') {
      return res.status(400).json({ message: 'Solo puedes calificar productos de carritos entregados' });
    }

    await product.addCartRating(cartId, stars, comment);

    const existingIndex = cart.ratings.findIndex(r => r.productId.toString() === productId);
    if (existingIndex !== -1) {
      cart.ratings[existingIndex] = { productId, stars, comment, ratedAt: new Date() };
    } else {
      cart.ratings.push({ productId, stars, comment, ratedAt: new Date() });
    }
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Calificación guardada',
      productUpdate: {
        rating: product.rating,
        numReviews: product.numReviews
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al calificar', error: error.message });
  }
};

module.exports = {
  getAllCarts,
  getLastCartByUser,
  addToCart,
  getCartByUser,
  updateCartItems,
  checkoutCart,
  updateCartStatus,
  addCartProductRating
};