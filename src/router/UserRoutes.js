const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  updateAdminStatus,
  updatePartnerStatus,
  updatePendingStatus,
  isSecretariaStatus,
  updateMedicoStatus,
  toggleMedico,
  searchUsers,
} = require('../controllers/UserController');

// Importar los nuevos controladores para imagen y QR
const {
  updateProfileImage,
  deleteProfileImage,
  generateUserQR,
  getUserQR,
} = require('../controllers/userProfileController');

const { authenticate, isAdmin, isAdminOrSecretaria, isAdminOrMedicoOrSecretaria } = require('../middlewares/authMiddleware');
const { upload, processUpload } = require('../middlewares/uploadMiddleware'); // ✅ Cambiar cleanupTempFiles por processUpload

// === RUTAS EXISTENTES (las que ya tenías) ===

// Obtener todos los usuarios (accesible para admin y secretarias)
router.get('/getUsers', authenticate, isAdminOrMedicoOrSecretaria, getAllUsers);

// Obtener un usuario por ID (accesible para admin y secretarias)
router.get('/getUser/:id', authenticate, isAdminOrMedicoOrSecretaria, getUserById);

// Buscar usuarios por nombre o email (accesible para admin y secretarias)
router.get('/search', authenticate, isAdminOrMedicoOrSecretaria, searchUsers);

// Actualizar datos del usuario (name, email) (accesible para el usuario autenticado)
router.put('/updateUser/:id', authenticate, updateUser);

// Actualizar isPartner (accesible para admin y secretarias)
router.patch('/togglePartner/:id', authenticate, isAdminOrSecretaria, updatePartnerStatus);

// Actualizar isAdmin (solo admin)
router.patch('/isAdmin/:id', authenticate, isAdmin, updateAdminStatus);

// Actualizar isSecretaria (solo admin)
router.patch('/isSecretaria/:id', authenticate, isAdmin, isSecretariaStatus);

// Actualizar isMedico (solo admin)
router.patch('/toggleMedico/:id', authenticate, isAdmin, updateMedicoStatus);

// Actualizar isPending (solo admin)
router.patch('/isPending/:id', authenticate, isAdmin, updatePendingStatus);

// === NUEVAS RUTAS PARA FOTO DE PERFIL Y QR ===

// ✅ ACTUALIZADO: Cambiar cleanupTempFiles por processUpload
router.put('/updateProfileImage/:id', authenticate, upload.single('profileImage'), processUpload, updateProfileImage);

// Eliminar foto de perfil (usuario autenticado o admin)
router.delete('/deleteProfileImage/:id', authenticate, deleteProfileImage);

// Obtener QR del usuario (usuario autenticado o admin)
router.get('/getQR/:id', authenticate, getUserQR);

// Generar QR para usuario (usuario autenticado o admin)
router.post('/generateQR/:id', authenticate, generateUserQR);

module.exports = router;