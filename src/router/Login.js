const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require("dotenv").config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// LOGIN CORREGIDO (con foto y QR)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }); // SIN .select('-password')
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Credenciales inválidas.' });

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage || null,
      qrCode: user.qrCode || null,
      isAdmin: user.isAdmin || false,
      isSecretaria: user.isSecretaria || false,
      isMedico: user.isMedico || false,
      isPartner: user.isPartner || false,
      isPaciente: user.isPaciente || false,
      isPending: user.isPending || false,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login exitoso',
      token,
      user: payload
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ruta para renovar token
router.post('/renew-token', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    // Verificar token (ignorando expiración)
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    
    // Verificar si el usuario existe
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // Crear nuevo payload (igual que en login)
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage || null,
      qrCode: user.qrCode || null,
      isAdmin: user.isAdmin || false,
      isSecretaria: user.isSecretaria || false,
      isMedico: user.isMedico || false,
      isPartner: user.isPartner || false,
      isPaciente: user.isPaciente || false,
      isPending: user.isPending || false,
    };

    // Generar nuevo token (7 días más)
    const newToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Token renovado exitosamente',
      token: newToken,
      user: payload
    });

  } catch (error) {
    console.error('Error renovando token:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    
    res.status(500).json({ message: 'Error del servidor al renovar token' });
  }
});

module.exports = router;