const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado: token no enviado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password -__v');

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // CAMBIO CLAVE: NO pases el documento crudo
    // En su lugar, construye un objeto limpio con TODOS los campos que el frontend necesita
    req.user = {
      _id: user._id,
      name: user.name || '',
      email: user.email,
      profileImage: user.profileImage || null,     // AÑADIDO
      qrCode: user.qrCode || null,                 // AÑADIDO
      isAdmin: user.isAdmin || false,
      isSecretaria: user.isSecretaria || false,
      isMedico: user.isMedico || false,
      isPartner: user.isPartner || false,
      isPaciente: user.isPaciente || false,
      isPending: user.isPending || false,
    };

    next();
  } catch (err) {
    console.error('Error en authenticate:', err);
    
    // **IMPORTANTE: Diferencia entre token expirado y token inválido**
    if (err.name === 'TokenExpiredError') {
      // **ESTO ES LO QUE BUSCA fetchWithInterceptor**
      return res.status(401).json({ 
        error: 'Token expirado. Por favor, renueva tu sesión.' 
        // Añade "expirado" que es lo que busca fetchWithInterceptor
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido o malformado. Por favor, inicia sesión nuevamente.' 
      });
    }
    
    // Para cualquier otro error
    res.status(401).json({ 
      error: 'Error de autenticación. Por favor, inicia sesión nuevamente.' 
    });
  }
};

// El resto queda exactamente igual
const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Acceso denegado: solo para administradores' });
  }
  next();
};

const isMedico = (req, res, next) => {
  if (!req.user.isMedico) {
    return res.status(403).json({ error: 'Acceso denegado: solo para médicos' });
  }
  next();
};

const isPaciente = (req, res, next) => {
  if (!req.user.isPaciente) {
    return res.status(403).json({ error: 'Acceso denegado: solo para pacientes' });
  }
  next();
};

const isSecretaria = (req, res, next) => {
  if (!req.user.isSecretaria) {
    return res.status(403).json({ error: 'Acceso denegado: solo para secretarias' });
  }
  next();
};

const isPartner = (req, res, next) => {
  if (!req.user.isPartner) {
    return res.status(403).json({ error: 'Acceso denegado: solo para partners' });
  }
  next();
};

const isPacienteWithProfile = async (req, res, next) => {
  try {
    if (!req.user.isPaciente) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado: solo para pacientes',
        code: 'NOT_PATIENT'
      });
    }
    const Paciente = require('../models/Paciente');
    const paciente = await Paciente.findOne({ userId: req.user._id });
   
    if (!paciente) {
      return res.status(403).json({
        success: false,
        error: 'Debes completar tu perfil de paciente antes de realizar esta acción',
        code: 'INCOMPLETE_PROFILE',
        requiredFields: ['fullName', 'fechaDeNacimiento', 'antecedentes']
      });
    }
    req.paciente = paciente;
    next();
  } catch (err) {
    console.error('Error en isPacienteWithProfile:', err);
    res.status(500).json({
      success: false,
      error: 'Error al verificar perfil de paciente',
      code: 'PROFILE_CHECK_ERROR'
    });
  }
};

const isAdminOrMedico = (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isMedico) {
    return res.status(403).json({
      error: 'Acceso denegado: solo para administradores o médicos'
    });
  }
  next();
};

const isAdminOrSecretaria = (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isSecretaria) {
    return res.status(403).json({
      error: 'Acceso denegado: solo para administradores o secretarias'
    });
  }
  next();
};

const isAdminOrMedicoOrSecretaria = (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isMedico && !req.user.isSecretaria) {
    return res.status(403).json({
      error: 'Acceso denegado: solo para administradores, médicos o secretarias'
    });
  }
  next();
};

const isMedicoOrSecretaria = (req, res, next) => {
  if (!req.user.isMedico && !req.user.isSecretaria) {
    return res.status(403).json({
      error: 'Acceso denegado: solo para médicos o secretarias'
    });
  }
  next();
};

module.exports = {
  authenticate,
  isAdmin,
  isMedico,
  isPaciente,
  isSecretaria,
  isPartner,
  isPacienteWithProfile,
  isAdminOrMedico,
  isAdminOrSecretaria,
  isMedicoOrSecretaria,
  isAdminOrMedicoOrSecretaria
};