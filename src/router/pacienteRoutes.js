const express = require('express');
const router = express.Router();
const {
  createPaciente,
  getAllPacientes,
  getPacienteById,
  updatePaciente,
  updateDatosClinicos,
  updateReprocannStatus,
  getMiPerfil,
  getMiPerfilPaciente,
  agregarConsultaHistorial,
  actualizarConsultaHistorial,
  getHistorialConsultas,
  // Nuevos métodos para documentos
  updateDocumentosDNI,
  agregarArchivoReprocann,
  eliminarArchivoReprocann,
  agregarRecetaAntigua,
  eliminarRecetaAntigua,
  getDocumentosPaciente
} = require('../controllers/PacienteController');

const { 
  authenticate, 
  isAdmin, 
  isMedico, 
  isPaciente, 
  isAdminOrMedico 
} = require('../middlewares/authMiddleware');

// 📌 Crear paciente
router.post('/', authenticate, isMedico, createPaciente);

// 📌 Obtener perfil del paciente logueado (antes de las rutas dinámicas)
router.get('/mi-perfil', authenticate, getMiPerfilPaciente);

// =============================================
// 📌 RUTAS PARA DOCUMENTOS (NUEVAS)
// =============================================

// 📌 Actualizar documentos de DNI (paciente, médico o admin)
router.put('/:id/documentos-dni', authenticate, updateDocumentosDNI);

// 📌 Archivos REPROCANN
router.post('/:id/reprocann/archivos', authenticate, agregarArchivoReprocann);
router.delete('/:id/reprocann/archivos/:archivoId', authenticate, eliminarArchivoReprocann);

// 📌 Recetas antiguas
router.post('/:id/recetas-antiguas', authenticate, agregarRecetaAntigua);
router.delete('/:id/recetas-antiguas/:recetaId', authenticate, eliminarRecetaAntigua);

// 📌 Obtener todos los documentos del paciente
router.get('/:id/documentos', authenticate, getDocumentosPaciente);

// =============================================
// 📌 RUTAS EXISTENTES
// =============================================

// 📌 Actualizar evaluación médica de un paciente (solo médicos)
router.put('/medico/:id', authenticate, isMedico, updateDatosClinicos);

// 📌 Actualizar estado REPROCANN (médico o admin)
router.put('/:id/reprocann', authenticate, isAdminOrMedico, updateReprocannStatus);

// 📌 Historial de consultas
router.post('/:id/historial', authenticate, isAdminOrMedico, agregarConsultaHistorial);
router.put('/historial/:consultaId', authenticate, isAdminOrMedico, actualizarConsultaHistorial);
router.get('/:id/historial', authenticate, isAdminOrMedico, getHistorialConsultas);

// 📌 Obtener todos los pacientes (admin, partner o médico)
router.get('/', authenticate, getAllPacientes);

// 📌 Obtener un paciente por ID
router.get('/:id', authenticate, getPacienteById);

// 📌 Actualizar paciente
router.put('/:id', authenticate, updatePaciente);

module.exports = router;