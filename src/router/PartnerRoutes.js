const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Asegúrate de importar el modelo User
const {
  createPartner,
  getAllPartners,
  getPartnerById,
  getPartnerByUserId,
  getMyPartnerData,
  updatePartner,
  deletePartner,
} = require('../controllers/PartnerController');
const { authenticate, isAdmin, isAdminOrSecretaria } = require('../middlewares/authMiddleware');

// Crear un nuevo partner (accesible para todos los autenticados)
router.post('/createPartner', authenticate, createPartner);

// Obtener todos los partners (solo admin)
router.get('/getAllPartners', authenticate, isAdmin, getAllPartners);

// Obtener un partner por ID (solo admin)
router.get('/getPartnerById/:id', authenticate, isAdmin, getPartnerById);

// Obtener partner por userId (accesible para admin y secretarias)
router.get('/user/getPartnerByUserId/:userId', authenticate, isAdminOrSecretaria, getPartnerByUserId);

// Obtener MIS datos de partner (accesible para el usuario autenticado)
router.get('/my-partner-data', authenticate, getMyPartnerData);

// Actualizar partner (accesible para todos los autenticados)
router.put('/updatePartner/:id', authenticate, updatePartner);

// Eliminar partner (solo admin)
router.delete('/deletePartner/:id', authenticate, isAdmin, deletePartner);

// ✅ ENDPOINT PÚBLICO PARA CREDENCIAL - SIN AUTENTICACIÓN
router.get('/public/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params;
    
    console.log('🔍 Buscando socio público con ID:', partnerId);
    
    // ✅ CORREGIDO: Hacer populate del partnerData
    const user = await User.findById(partnerId)
      .populate('partnerData')
      .select('name profileImage isPartner isMedico isSecretaria isAdmin createdAt partnerData')
      .lean();
    
    if (!user) {
      console.log('❌ Usuario no encontrado:', partnerId);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // ✅ VERIFICAR SI TIENE PARTNER DATA
    if (!user.partnerData) {
      console.log('❌ Usuario no tiene datos de partner:', partnerId);
      return res.status(403).json({ error: 'No tiene credencial de socio' });
    }

    // ✅ EXTRAER DATOS DEL PARTNER
    const partnerInfo = user.partnerData || {};
    
    // ✅ CORREGIDO: user._id.toString() en lugar de user._id.slice()
    const userData = {
      _id: user._id,
      name: user.name,
      profileImage: user.profileImage,
      isPartner: user.isPartner,
      isMedico: user.isMedico,
      isSecretaria: user.isSecretaria,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      // Datos del partner
      dni: partnerInfo.dni || 'No registrado',
      phone: partnerInfo.phone || 'No registrado',
      adress: partnerInfo.adress || 'No registrada',
      reprocann: partnerInfo.reprocann || false,
      // ✅ CORREGIDO: Convertir ObjectId a String
      membershipNumber: `JAM-${user._id.toString().slice(-6).toUpperCase()}`,
      approvalStatus: user.isPartner ? 'APROBADO' : 'PENDIENTE'
    };

    console.log('✅ Usuario encontrado:', userData.name);
    console.log('📋 Estado de socio:', userData.approvalStatus);
    console.log('📋 Membership Number:', userData.membershipNumber);
    
    res.json(userData);
  } catch (error) {
    console.error('❌ Error en credencial pública:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Test email endpoint (mantener como está)
router.post('/test-email', async (req, res) => {
  try {
    const { email, name } = req.body;

    const testUser = {
      _id: '68dc5ceaafc2bcf60ba74664',
      name: name || 'Administrador',
      email: email || 'jcanepa.web@gmail.com'
    };

    console.log('🧪 TEST: Iniciando prueba de email...');
    console.log('📧 Datos de prueba:', testUser);

    const { sendPartnerRequestEmail } = require('../utils/emailJSSender');
    const result = await sendPartnerRequestEmail(testUser);

    res.status(200).json({
      message: 'Prueba de email completada',
      success: result.success,
      messageId: result.messageId,
      error: result.error
    });
  } catch (error) {
    console.error('❌ Error en prueba de email:', error);
    res.status(500).json({
      error: 'Error en prueba de email',
      details: error.message
    });
  }
});

module.exports = router;