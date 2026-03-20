const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const server = express();

// Importación de rutas
const RegisterRouter = require("./router/Register");
const LoginRouter = require("./router/Login");
const Mercado_Pago_Router = require("./router/Mercado_Pago_Router");
const PartnerRouter = require("./router/PartnerRoutes");
const UserRouter = require("./router/UserRoutes");
const cartRouter = require("./router/cartRoutes");
const productRoutes = require("./router/productRoutes");
const AntecedentesRoutes = require("./router/antecedentesRoutes");
const EspecialistaRoutes = require("./router/especialistaRoutes");
const PacienteRoutes = require("./router/pacienteRoutes");
const TurnoRoutes = require("./router/turnoRoutes");
const authRouter = require("./router/authRoutes");

const { sendReporteFacturacionEmail } = require("./utils/emailSender");

// 🔒 CONFIGURACIÓN DE RATE LIMITING
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Demasiadas solicitudes desde esta IP, intenta nuevamente en 15 minutos" },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Demasiados intentos de autenticación, intenta nuevamente en 15 minutos" },
  standardHeaders: true,
});

const criticalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Límite de solicitudes alcanzado para este endpoint" },
  standardHeaders: true,
});

// Función para conectar a MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    console.log("🟢 Ya conectado a MongoDB Atlas");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      dbName: "nombreDeTuDB",
    });
    console.log("🟢 Conectado a MongoDB Atlas");
  } catch (err) {
    console.error("❌ Error al conectar con MongoDB:", err.message);
    throw err;
  }
};

// ✅ 1️⃣ CORS PRIMERO — antes de todo, incluso antes del rate limiter
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://jamrockclub.com.ar",
    ];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
server.use(cors(corsOptions));

// ✅ 2️⃣ Luego el resto de middlewares
server.use(express.json());

// ✅ 3️⃣ Middleware de conexión DB
server.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: "No se pudo conectar a la base de datos" });
  }
});

// ✅ 4️⃣ Rate limiters después de CORS
server.use(generalLimiter);

server.use("/register", authLimiter);
server.use("/login", authLimiter);
server.use("/auth", authLimiter);
server.use("/Mercado_Pago", criticalLimiter);
server.use("/email/enviar-reporte", criticalLimiter);

// Rutas
server.use("/Mercado_Pago", Mercado_Pago_Router);
server.use("/register", RegisterRouter);
server.use("/login", LoginRouter);
server.use("/auth", authRouter);
server.use("/partners", PartnerRouter);
server.use("/users", UserRouter);
server.use("/cart", cartRouter);
server.use("/products", productRoutes);
server.use("/antecedentes", AntecedentesRoutes);
server.use("/especialistas", EspecialistaRoutes);
server.use("/pacientes", PacienteRoutes);
server.use("/turnos", TurnoRoutes);

// Ruta de email
server.post("/email/enviar-reporte", async (req, res) => {
  try {
    console.log('📧 RUTA /email/enviar-reporte ACCEDIDA');
    
    const { reporte, periodo, asunto, destinatario } = req.body;
    
    console.log('📧 Datos recibidos en servidor:', {
      periodo,
      tieneReporte: !!reporte,
      ventasTotales: reporte?.ventasTotales
    });

    const resultado = await sendReporteFacturacionEmail(reporte, destinatario);

    if (resultado.success) {
      res.json({
        success: true,
        message: resultado.message,
        messageId: resultado.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: resultado.message,
        error: resultado.error
      });
    }

  } catch (error) {
    console.error('❌ Error en ruta /email/enviar-reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = server;