// controllers/UserController.js
const mongoose = require('mongoose');
const User = require('../models/User');
const { sendPartnerStatusEmail } = require('../utils/emailSender');
const { generateAndUploadQR } = require('../utils/cloudinaryUtils');

// === FUNCIÓN AUXILIAR PARA NO REPETIR CÓDIGO ===
const getSafeUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  profileImage: user.profileImage || null,
  qrCode: user.qrCode || null,
  isPartner: user.isPartner || false,
  isAdmin: user.isAdmin || false,
  isSecretaria: user.isSecretaria || false,
  isMedico: user.isMedico || false,
  isPaciente: user.isPaciente || false,
  isPending: user.isPending || false
});

// GET todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('partnerData');
    
    // Convertir a objeto seguro (opcional, pero recomendado)
    const safeUsers = users.map(getSafeUserResponse);
    res.status(200).json(safeUsers);
  } catch (err) {
    console.error('Error getAllUsers:', err);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

// GET un usuario por ID (CRÍTICO: este se usa en login, perfil, etc.)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('partnerData');

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.status(200).json({
      user: getSafeUserResponse(user)  // ← AHORA DEVUELVE TODO
    });
  } catch (err) {
    console.error('Error getUserById:', err);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

// GET buscar usuarios
const searchUsers = async (req, res) => {
  const { q } = req.query;
  try {
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ]
    }).select('-password');

    const safeUsers = users.map(getSafeUserResponse);
    res.status(200).json(safeUsers);
  } catch (err) {
    console.error('Error searchUsers:', err);
    res.status(500).json({ error: 'Error al buscar usuarios', details: err.message });
  }
};

// PUT actualizar datos del usuario (name, email)
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (req.user._id.toString() !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'No autorizado para editar este usuario' });
    }

    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }

    const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
    if (emailExists) {
      return res.status(400).json({ error: 'El email ya está en uso' });
    }

    user.name = name;
    user.email = email;

    // Generar QR si no existe
    if (!user.qrCode) {
      try {
        const qrCodeUrl = await generateAndUploadQR(user._id, {
          name: user.name,
          email: user.email
        });
        user.qrCode = qrCodeUrl;
      } catch (qrError) {
        console.error('Error generando QR en updateUser:', qrError);
      }
    }

    await user.save();

    res.status(200).json({
      message: 'Usuario actualizado correctamente',
      user: getSafeUserResponse(user)
    });
  } catch (err) {
    console.error('Error updateUser:', err);
    res.status(500).json({
      error: 'Error al actualizar usuario',
      details: err.message
    });
  }
};

// PATCH toggle isPartner
const updatePartnerStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID de usuario no válido' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const wasPartner = user.isPartner;
    user.isPartner = !user.isPartner;
    await user.save();

    // Email (mantenido como estaba)
    if ((!wasPartner && user.isPartner) || (wasPartner && !user.isPartner)) {
      try {
        await sendPartnerStatusEmail(user, user.isPartner);
      } catch (emailError) {
        console.error('Error enviando email de partner:', emailError);
      }
    }

    res.status(200).json({
      message: `El usuario ahora ${user.isPartner ? 'es' : 'no es'} partner.`,
      user: getSafeUserResponse(user)  // ← COMPLETO
    });
  } catch (err) {
    console.error('Error updatePartnerStatus:', err);
    res.status(500).json({
      error: 'Error al actualizar isPartner',
      details: err.message
    });
  }
};

// PATCH toggle isAdmin
const updateAdminStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    user.isAdmin = !user.isAdmin;
    await user.save();

    res.status(200).json({
      message: `El usuario ahora ${user.isAdmin ? 'es' : 'no es'} admin.`,
      user: getSafeUserResponse(user)
    });
  } catch (err) {
    console.error('Error updateAdminStatus:', err);
    res.status(500).json({ error: 'Error al actualizar isAdmin', details: err.message });
  }
};

// PATCH toggle isPending
const updatePendingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    user.isPending = !user.isPending;
    await user.save();

    res.status(200).json({
      message: `El usuario ahora ${user.isPending ? 'está' : 'no está'} pendiente.`,
      user: getSafeUserResponse(user)
    });
  } catch (err) {
    console.error('Error updatePendingStatus:', err);
    res.status(500).json({ error: 'Error al actualizar isPending', details: err.message });
  }
};

// PATCH toggle isSecretaria
const isSecretariaStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    user.isSecretaria = !user.isSecretaria;
    await user.save();

    res.status(200).json({
      message: `El usuario ahora ${user.isSecretaria ? 'es' : 'no es'} secretaria.`,
      user: getSafeUserResponse(user)
    });
  } catch (err) {
    console.error('Error isSecretariaStatus:', err);
    res.status(500).json({ error: 'Error al actualizar isSecretaria', details: err.message });
  }
};

// PATCH toggle isMedico
const updateMedicoStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID de usuario no válido' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    user.isMedico = !user.isMedico;
    await user.save();

    res.status(200).json({
      message: `El usuario ahora ${user.isMedico ? 'es' : 'no es'} médico.`,
      user: getSafeUserResponse(user)
    });
  } catch (err) {
    console.error('Error updateMedicoStatus:', err);
    res.status(500).json({
      error: 'Error al actualizar isMedico',
      details: err.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  updateAdminStatus,
  updatePartnerStatus,
  updatePendingStatus,
  isSecretariaStatus,
  updateMedicoStatus,
  searchUsers,
};