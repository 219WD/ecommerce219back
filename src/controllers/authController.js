const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { sendPasswordResetRequestEmail, sendPasswordResetConfirmationEmail } = require('../utils/emailSender');
const { JWT_SECRET, FRONTEND_URL } = process.env;

const requestResetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validar variables críticas
    if (!JWT_SECRET || !FRONTEND_URL || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ 
        message: 'Si el email existe, se ha enviado un enlace para restablecer la contraseña.' 
      });
    }

    // Crear token con expiración de 1 hora
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '8h' });

    // Enviar correo con el enlace de restablecimiento
    const emailResult = await sendPasswordResetRequestEmail(user, token);
    
    if (!emailResult.success) {
    }

    res.status(200).json({ 
      message: 'Si el email existe, se ha enviado un enlace para restablecer la contraseña.' 
    });

  } catch (error) {
    if (error.code === 'EAUTH') {
      return res.status(500).json({ error: 'Error de autenticación del email' });
    }
    
    res.status(500).json({ error: 'Error al solicitar restablecimiento de contraseña.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    const { userId } = decoded;

    // Buscar al usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Enviar correo confirmando el cambio
    const emailResult = await sendPasswordResetConfirmationEmail(user);

    res.status(200).json({ message: 'Contraseña cambiada exitosamente' });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }
    res.status(500).json({ error: 'Error al restablecer contraseña.' });
  }
};

module.exports = {
  requestResetPassword,
  resetPassword
};