// controllers/userProfileController.js
const User = require('../models/User');
const {
  uploadToCloudinary,
  deleteFromCloudinary,
  generateAndUploadQR
} = require('../utils/cloudinaryUtils');

// Función auxiliar para no repetir código
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

// ==================== ACTUALIZAR FOTO DE PERFIL ====================
const updateProfileImage = async (req, res) => {
  try {
    const userId = req.params.id;

    // Verificar permisos
    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'No autorizado para editar este perfil' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log('📁 Procesando imagen para usuario:', userId, {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // ✅ CORREGIDO: Subir desde buffer en lugar de req.file.path
    const uploadResult = await uploadToCloudinary(
      req.file.buffer, // ← Usar buffer en lugar de file.path
      'profiles',
      req.file.originalname
    );

    // Eliminar imagen anterior si existe
    if (user.profileImage) {
      await deleteFromCloudinary(user.profileImage);
    }

    // Actualizar usuario
    user.profileImage = uploadResult.secure_url;
    await user.save();

    res.status(200).json({
      message: 'Foto de perfil actualizada correctamente',
      user: getSafeUserResponse(user)
    });
  } catch (error) {
    console.error('Error en updateProfileImage:', error);
    res.status(500).json({
      error: 'Error al actualizar foto de perfil',
      details: error.message
    });
  }
};

// ==================== ELIMINAR FOTO DE PERFIL ====================
const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (user.profileImage) {
      await deleteFromCloudinary(user.profileImage);
      user.profileImage = null;
      await user.save();
    }

    res.status(200).json({
      message: 'Foto de perfil eliminada correctamente',
      user: getSafeUserResponse(user)
    });
  } catch (error) {
    console.error('Error en deleteProfileImage:', error);
    res.status(500).json({
      error: 'Error al eliminar foto de perfil',
      details: error.message
    });
  }
};

// ==================== GENERAR / REGENERAR QR ====================
const generateUserQR = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Eliminar QR anterior si existe
    if (user.qrCode) {
      await deleteFromCloudinary(user.qrCode);
    }

    // Generar y subir nuevo QR
    const qrCodeUrl = await generateAndUploadQR(userId, {
      name: user.name,
      email: user.email
    });

    user.qrCode = qrCodeUrl;
    await user.save();

    res.status(200).json({
      message: 'QR generado correctamente',
      user: getSafeUserResponse(user)
    });
  } catch (error) {
    console.error('Error en generateUserQR:', error);
    res.status(500).json({
      error: 'Error generando QR',
      details: error.message
    });
  }
};

// ==================== OBTENER QR (y generar si no existe) ====================
const getUserQR = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si no tiene QR → generarlo automáticamente
    if (!user.qrCode) {
      const qrCodeUrl = await generateAndUploadQR(userId, {
        name: user.name,
        email: user.email
      });
      user.qrCode = qrCodeUrl;
      await user.save();
    }

    res.status(200).json({
      qrCode: user.qrCode,
      user: getSafeUserResponse(user)
    });
  } catch (error) {
    console.error('Error en getUserQR:', error);
    res.status(500).json({
      error: 'Error al obtener QR',
      details: error.message
    });
  }
};

// ==================== ACTUALIZAR USUARIO + GENERAR QR SI FALTA ====================
const updateUserWithQR = async (req, res) => {
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
        console.error('Error generando QR al actualizar usuario:', qrError);
        // No romper todo si falla el QR
      }
    }

    await user.save();

    res.status(200).json({
      message: 'Usuario actualizado correctamente',
      user: getSafeUserResponse(user)
    });
  } catch (err) {
    console.error('Error en updateUserWithQR:', err);
    res.status(500).json({
      error: 'Error al actualizar usuario',
      details: err.message
    });
  }
};

module.exports = {
  updateProfileImage,
  deleteProfileImage,
  generateUserQR,
  getUserQR,
  updateUserWithQR
};