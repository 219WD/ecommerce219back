const transporter = require('../config/nodemailer');

const sendPartnerRequestEmail = async (user) => {
  try {
    const mailOptions = {
      from: `"Jamrock Club" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '✅ Solicitud de Partner Recibida - Jamrock Club',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 10px;">¡Solicitud Recibida!</h2>
            <p style="font-size: 16px; color: #666;">
              Hola <strong>${user.name}</strong>, hemos recibido tu solicitud para convertirte en Partner.
            </p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">📋 Detalles de la Solicitud</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Solicitante:</strong></td>
                <td style="padding: 8px 0;">${user.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                <td style="padding: 8px 0;">${user.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>ID de Solicitud:</strong></td>
                <td style="padding: 8px 0;">${user._id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Fecha:</strong></td>
                <td style="padding: 8px 0;">${new Date().toLocaleDateString('es-AR')}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #e8f4fd; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h4 style="color: #1565c0; margin-top: 0;">⏳ Proceso de Revisión</h4>
            <p style="margin: 5px 0; color: #1565c0;">
              • Tu solicitud está ahora en revisión<br>
              • Analizaremos tu perfil y requisitos<br>
              • Te notificaremos por email una vez procesada<br>
              • Tiempo estimado: 2-5 días hábiles
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'https://tujamrock.com'}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
               Ir a Jamrock Club
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 14px;">
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p>¡Saludos cordiales!<br><strong>El equipo de Jamrock Club</strong></p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    return { success: false, error: error.message };
  }
};

const sendPartnerStatusEmail = async (user, isApproved) => {
  try {
    const mailOptions = {
      from: `"Jamrock Club" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: isApproved
        ? '🎉 ¡Felicidades! Eres ahora Partner oficial de Jamrock'
        : 'ℹ️ Estado de Partner Actualizado - Jamrock Club',
      html: isApproved
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #333; margin-bottom: 10px;">¡Bienvenido a la Familia Jamrock!</h2>
              <p style="font-size: 16px; color: #666;">
                Hola <strong>${user.name}</strong>, nos complace informarte que tu solicitud ha sido <strong>aprobada</strong>.
              </p>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">✅ Solicitud Aprobada</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Partner:</strong></td>
                  <td style="padding: 8px 0;">${user.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Estado:</strong></td>
                  <td style="padding: 8px 0; color: #2e7d32; font-weight: bold;">✅ Aprobado</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Fecha:</strong></td>
                  <td style="padding: 8px 0;">${new Date().toLocaleDateString('es-AR')}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <h4 style="color: #2e7d32; margin-top: 0;">🎯 Beneficios de Partner</h4>
              <p style="margin: 5px 0; color: #2e7d32;">
                • Acceso exclusivo a la plataforma Partner<br>
                • Descuentos y promociones especiales<br>
                • Contenido premium y recursos<br>
                • Soporte prioritario
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'https://tujamrock.com'}" 
                 style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
                 Acceder a la Plataforma
              </a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 14px;">
              <p>Ahora eres oficialmente un Partner y parte de nuestro exclusivo Club.</p>
              <p>¡Saludos cordiales!<br><strong>El equipo de Jamrock Club</strong></p>
            </div>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #333; margin-bottom: 10px;">Actualización de Estado</h2>
              <p style="font-size: 16px; color: #666;">
                Hola <strong>${user.name}</strong>, te informamos sobre una actualización en tu estado de Partner.
              </p>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">ℹ️ Cambio de Estado</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Usuario:</strong></td>
                  <td style="padding: 8px 0;">${user.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Estado:</strong></td>
                  <td style="padding: 8px 0; color: #f44336; font-weight: bold;">❌ Revocado</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Fecha:</strong></td>
                  <td style="padding: 8px 0;">${new Date().toLocaleDateString('es-AR')}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #ffebee; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <h4 style="color: #c62828; margin-top: 0;">📢 Información Importante</h4>
              <p style="margin: 5px 0; color: #c62828;">
                • Tu estado de Partner en Jamrock ha sido actualizado<br>
                • Ya no tienes acceso privilegiado como socio del Club<br>
                • Los beneficios exclusivos han sido suspendidos
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'https://tujamrock.com'}" 
                 style="background-color: #757575; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
                 Visitar Jamrock Club
              </a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 14px;">
              <p>Si crees que esto es un error, por favor contacta con nosotros.</p>
              <p>¡Saludos cordiales!<br><strong>El equipo de Jamrock Club</strong></p>
            </div>
          </div>
        `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    return { success: false, error: error.message };
  }
};

const sendPasswordResetRequestEmail = async (user, token) => {
  try {
    const resetPasswordLink = `${process.env.FRONTEND_URL || 'https://tujamrock.com'}/reset-password/${token}`;

    const mailOptions = {
      from: `"Jamrock Club" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔐 Restablecimiento de Contraseña - Jamrock Club',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 10px;">Restablecer Contraseña</h2>
            <p style="font-size: 16px; color: #666;">
              Hola <strong>${user.name}</strong>, hemos recibido una solicitud para restablecer tu contraseña.
            </p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">🔑 Solicitud de Restablecimiento</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Usuario:</strong></td>
                <td style="padding: 8px 0;">${user.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                <td style="padding: 8px 0;">${user.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Solicitado:</strong></td>
                <td style="padding: 8px 0;">${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h4 style="color: #1565c0; margin-top: 0;">⚠️ Enlace de Seguridad</h4>
            <p style="margin: 5px 0; color: #1565c0;">
              • Este enlace es personal e intransferible<br>
              • Expirará automáticamente en 1 hora<br>
              • No lo compartas con nadie
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${resetPasswordLink}" 
               style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 16px;">
               🔓 Restablecer Contraseña
            </a>
          </div>

          <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 6px;">
            <h4 style="color: #856404; margin-top: 0; margin-bottom: 10px;">📝 Si el botón no funciona</h4>
            <p style="margin: 0; color: #856404; font-size: 14px; word-break: break-all;">
              Copia y pega este enlace en tu navegador:<br>
              <strong>${resetPasswordLink}</strong>
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 14px;">
            <p><strong>¿No solicitaste este cambio?</strong><br>
            Si no realizaste esta solicitud, puedes ignorar este mensaje. Tu contraseña permanecerá sin cambios.</p>
            <p>¡Saludos cordiales!<br><strong>El equipo de Jamrock Club</strong></p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    return { success: false, error: error.message };
  }
};

const sendPasswordResetConfirmationEmail = async (user) => {
  try {
    const mailOptions = {
      from: `"Jamrock Club" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '✅ Contraseña Actualizada - Jamrock Club',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 10px;">Contraseña Actualizada</h2>
            <p style="font-size: 16px; color: #666;">
              Hola <strong>${user.name}</strong>, tu contraseña ha sido actualizada exitosamente.
            </p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">✅ Cambio Confirmado</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Usuario:</strong></td>
                <td style="padding: 8px 0;">${user.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                <td style="padding: 8px 0;">${user.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Estado:</strong></td>
                <td style="padding: 8px 0; color: #2e7d32; font-weight: bold;">✅ Contraseña Actualizada</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Fecha:</strong></td>
                <td style="padding: 8px 0;">${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h4 style="color: #2e7d32; margin-top: 0;">🔒 Seguridad de tu Cuenta</h4>
            <p style="margin: 5px 0; color: #2e7d32;">
              • Tu nueva contraseña ha sido establecida correctamente<br>
              • Puedes iniciar sesión con tus nuevas credenciales<br>
              • Recomendamos usar contraseñas seguras y únicas
            </p>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h4 style="color: #856404; margin-top: 0;">⚠️ ¿No reconoces esta actividad?</h4>
            <p style="margin: 5px 0; color: #856404;">
              Si no realizaste este cambio, por favor:<br>
              • Contacta a soporte inmediatamente<br>
              • Revisa la seguridad de tu cuenta<br>
              • Considera cambiar tu contraseña nuevamente
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'https://tujamrock.com'}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
               Acceder a mi Cuenta
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 14px;">
            <p>Para mayor seguridad, mantén tu contraseña en un lugar seguro.</p>
            <p>¡Saludos cordiales!<br><strong>El equipo de Jamrock Club</strong></p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    return { success: false, error: error.message };
  }
};

// En services/NodemailerSender.js - Agregar esta función
const sendTurnoStatusEmail = async (turno, estadoAnterior, nuevoEstado) => {
  try {
    // Determinar el asunto y mensaje según el estado
    let subject, message, title;

    if (nuevoEstado === 'confirmado') {
      subject = '✅ Tu turno ha sido confirmado - Jamrock Club';
      title = '¡Turno Confirmado!';
      message = 'Nos complace informarte que tu turno ha sido <strong>confirmado</strong> por el especialista.';
    } else if (nuevoEstado === 'cancelado') {
      subject = '❌ Tu turno ha sido cancelado - Jamrock Club';
      title = 'Turno Cancelado';
      message = 'Te informamos que tu turno ha sido <strong>cancelado</strong> por el especialista.';
    } else {
      return { success: true, skipped: true };
    }

    // ✅ CORRECCIÓN: Aplicar el MISMO ajuste de zona horaria que en createTurno
    const fechaTurno = new Date(turno.fecha);

    // ✅ APLICAR EL MISMO AJUSTE QUE EN CREATE_TURNO
    // En createTurno haces: fechaTurno.setMinutes(fechaTurno.getMinutes() - offset)
    // Donde offset = fechaTurno.getTimezoneOffset()
    // Para revertir ese ajuste y mostrar la hora correcta, debemos SUMAR el offset
    const offset = fechaTurno.getTimezoneOffset();
    fechaTurno.setMinutes(fechaTurno.getMinutes() + offset);

    // Formatear fecha y hora CORREGIDA
    const fechaFormateada = fechaTurno.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const horaFormateada = fechaTurno.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const mailOptions = {
      from: `"Jamrock Club" <${process.env.EMAIL_USER}>`,
      to: turno.userId.email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 10px;">${title}</h2>
            <div style="font-size: 16px; color: #666;">
              ${message}
            </div>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">📋 Información del Turno</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Paciente:</strong></td>
                <td style="padding: 8px 0;">${turno.pacienteId.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Fecha:</strong></td>
                <td style="padding: 8px 0;">${fechaFormateada}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Hora:</strong></td>
                <td style="padding: 8px 0;">${horaFormateada} hs</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Especialista:</strong></td>
                <td style="padding: 8px 0;">${turno.especialistaId.userId.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Especialidad:</strong></td>
                <td style="padding: 8px 0;">${turno.especialistaId.especialidad}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Motivo:</strong></td>
                <td style="padding: 8px 0;">${turno.motivo}</td>
              </tr>
              ${turno.notas ? `
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Notas:</strong></td>
                <td style="padding: 8px 0;">${turno.notas}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          ${nuevoEstado === 'confirmado' ? `
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h4 style="color: #2e7d32; margin-top: 0;">💡 Recordatorio importante</h4>
            <p style="margin: 5px 0; color: #2e7d32;">
              • Llegá 15 minutos antes de tu turno<br>
              • Traé tu documentación médica si es necesario<br>
              • Recordá que podés cancelar o modificar tu turno con 24hs de anticipación
            </p>
          </div>
          ` : ''}

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'https://tujamrock.com'}/turnos/paciente" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
               Ver mis turnos
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 14px;">
            <p>Si tenés alguna duda, no dudes en contactarnos.</p>
            <p>¡Saludos cordiales!<br><strong>El equipo de Jamrock Club</strong></p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Email para Pedido Confirmado (Estado: pendiente/pagado)
const sendPedidoConfirmadoEmail = async (cart, user) => {
  try {
    const mailOptions = {
      from: `"Jamrock Club" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '✅ Pedido Confirmado - Jamrock Club',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 10px;">¡Pedido Confirmado!</h2>
            <p style="font-size: 16px; color: #666;">
              Hola <strong>${user.name}</strong>, tu pedido ha sido recibido exitosamente.
            </p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">📦 Resumen del Pedido</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;"><strong>N° de Pedido:</strong></td>
                <td style="padding: 8px 0;">${cart._id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Fecha:</strong></td>
                <td style="padding: 8px 0;">${new Date(cart.createdAt).toLocaleDateString('es-AR')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Total:</strong></td>
                <td style="padding: 8px 0; font-weight: bold;">$${cart.totalAmount}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Método de Pago:</strong></td>
                <td style="padding: 8px 0; text-transform: capitalize;">${cart.paymentMethod}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Entrega:</strong></td>
                <td style="padding: 8px 0; text-transform: capitalize;">${cart.deliveryMethod}</td>
              </tr>
            </table>

            ${cart.deliveryMethod === 'envio' ? `
            <div style="margin-top: 15px; padding: 15px; background-color: #e8f4fd; border-radius: 4px;">
              <h4 style="margin: 0 0 10px 0; color: #1565c0;">🚚 Información de Envío</h4>
              <p style="margin: 5px 0;"><strong>Dirección:</strong> ${cart.shippingAddress.address}</p>
              <p style="margin: 5px 0;"><strong>Contacto:</strong> ${cart.shippingAddress.name} - ${cart.shippingAddress.phone}</p>
            </div>
            ` : `
            <div style="margin-top: 15px; padding: 15px; background-color: #e8f5e8; border-radius: 4px;">
              <h4 style="margin: 0 0 10px 0; color: #2e7d32;">🏪 Retiro en Local</h4>
              <p style="margin: 5px 0;">Podrás retirar tu pedido en nuestro local.</p>
              <p style="margin: 5px 0;"><strong>Horario:</strong> Lunes a Viernes de 9:00 a 18:00</p>
            </div>
            `}
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h4 style="color: #856404; margin-top: 0;">📋 Próximos Pasos</h4>
            <p style="margin: 5px 0; color: #856404;">
              ${cart.paymentMethod === 'transferencia' ?
          '• Subí tu comprobante de transferencia para acelerar el proceso<br>' :
          '• Tu pago ha sido confirmado<br>'
        }
              • Te notificaremos cuando tu pedido esté en preparación<br>
              • ${cart.deliveryMethod === 'envio' ? 'Coordinaremos el envío' : 'Podrás retirarlo'} cuando esté listo
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'https://tujamrock.com'}/estadoDelEnvio" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
               Seguir mi Pedido
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 14px;">
            <p>¿Tienes preguntas? Contáctanos en ${process.env.EMAIL_USER}</p>
            <p>¡Gracias por confiar en nosotros!<br><strong>El equipo de Jamrock Club</strong></p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Email para Pago Confirmado
const sendPagoConfirmadoEmail = async (cart, user) => {
  try {
    const mailOptions = {
      from: `"Jamrock Club" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '✅ Pago Confirmado - Jamrock Club',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 10px;">¡Pago Verificado Exitosamente!</h2>
            <p style="font-size: 16px; color: #666;">
              Hola <strong>${user.name}</strong>, hemos confirmado tu pago.
            </p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">💳 Confirmación de Pago</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;"><strong>N° de Pedido:</strong></td>
                <td style="padding: 8px 0;">${cart._id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Monto:</strong></td>
                <td style="padding: 8px 0; font-weight: bold;">$${cart.totalAmount}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Método:</strong></td>
                <td style="padding: 8px 0; text-transform: capitalize;">${cart.paymentMethod}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Estado:</strong></td>
                <td style="padding: 8px 0; color: #2e7d32; font-weight: bold;">✅ Verificado</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h4 style="color: #2e7d32; margin-top: 0;">🚀 Próximo Paso</h4>
            <p style="margin: 5px 0; color: #2e7d32;">
              Tu pedido ha pasado a <strong>preparación</strong>. 
              ${cart.deliveryMethod === 'envio' ?
          'Te notificaremos cuando sea enviado.' :
          'Te avisaremos cuando esté listo para retirar.'
        }
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'https://tujamrock.com'}/estadoDelEnvio" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
               Ver Estado del Pedido
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 14px;">
            <p>¡Gracias por tu compra!<br><strong>El equipo de Jamrock Club</strong></p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Email para En Preparación
const sendEnPreparacionEmail = async (cart, user) => {
  try {
    const mensajeEntrega = cart.deliveryMethod === 'envio'
      ? 'Estamos preparando tu pedido para envío.'
      : 'Estamos preparando tu pedido. Podrás pasar a retirarlo cuando esté listo.';

    const mailOptions = {
      from: `"Jamrock Club" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '👨‍🍳 Pedido en Preparación - Jamrock Club',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 10px;">¡Pedido en Preparación!</h2>
            <p style="font-size: 16px; color: #666;">
              Hola <strong>${user.name}</strong>, ${mensajeEntrega.toLowerCase()}
            </p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">📦 Detalles del Pedido</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;"><strong>N° de Pedido:</strong></td>
                <td style="padding: 8px 0;">${cart._id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Estado:</strong></td>
                <td style="padding: 8px 0; color: #ff9800; font-weight: bold;">👨‍🍳 En Preparación</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Entrega:</strong></td>
                <td style="padding: 8px 0; text-transform: capitalize;">${cart.deliveryMethod}</td>
              </tr>
            </table>

            ${cart.deliveryMethod === 'retiro' ? `
            <div style="margin-top: 15px; padding: 15px; background-color: #e8f5e8; border-radius: 4px;">
              <h4 style="margin: 0 0 10px 0; color: #2e7d32;">🏪 Retiro en Local</h4>
              <p style="margin: 5px 0;"><strong>Horario de retiro:</strong> Lunes a Viernes de 9:00 a 18:00</p>
              <p style="margin: 5px 0;">Te enviaremos un aviso cuando tu pedido esté listo para retirar.</p>
            </div>
            ` : ''}
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h4 style="color: #856404; margin-top: 0;">⏱️ Tiempo Estimado</h4>
            <p style="margin: 5px 0; color: #856404;">
              • Preparación: 24-48 horas<br>
              ${cart.deliveryMethod === 'envio' ?
          '• Envío: 2-5 días hábiles<br>' :
          '• Retiro: Inmediato después de la preparación<br>'
        }
              • Te notificaremos en cada paso
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'https://tujamrock.com'}/estadoDelEnvio" 
               style="background-color: #ff9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
               Seguir mi Pedido
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 14px;">
            <p>¿Consultas? Escríbenos a ${process.env.EMAIL_USER}</p>
            <p>¡Estamos trabajando en tu pedido!<br><strong>El equipo de Jamrock Club</strong></p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Email para Entregado
const sendPedidoEntregadoEmail = async (cart, user) => {
  try {
    const mailOptions = {
      from: `"Jamrock Club" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🎉 ¡Pedido Entregado! - Jamrock Club',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 10px;">¡Pedido Entregado!</h2>
            <p style="font-size: 16px; color: #666;">
              Hola <strong>${user.name}</strong>, tu pedido ha sido ${cart.deliveryMethod === 'envio' ? 'entregado' : 'retirado'} exitosamente.
            </p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">✅ Resumen Final</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;"><strong>N° de Pedido:</strong></td>
                <td style="padding: 8px 0;">${cart._id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Estado:</strong></td>
                <td style="padding: 8px 0; color: #4CAF50; font-weight: bold;">🎉 Entregado</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Fecha:</strong></td>
                <td style="padding: 8px 0;">${new Date().toLocaleDateString('es-AR')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Método:</strong></td>
                <td style="padding: 8px 0; text-transform: capitalize;">${cart.deliveryMethod}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h4 style="color: #2e7d32; margin-top: 0;">⭐ ¡Tu Opinión Importa!</h4>
            <p style="margin: 5px 0; color: #2e7d32;">
              Ayuda a otros compradores calificando los productos que recibiste.<br>
              Tu experiencia nos ayuda a mejorar.
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'https://tujamrock.com'}/estadoDelEnvio" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; margin: 5px;">
               Calificar Productos
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 14px;">
            <p>¿Necesitas ayuda con tu pedido? Contáctanos.</p>
            <p>¡Gracias por elegirnos!<br><strong>El equipo de Jamrock Club</strong></p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 🆕 NUEVA FUNCIÓN: Envío de Reporte de Facturación
const sendReporteFacturacionEmail = async (reporte, destinatario = null) => {
  try {
    console.log('📧 [EmailSender] Preparando email de reporte...');

    // Si no se especifica destinatario, usar el email del admin o uno por defecto
    const emailDestino = destinatario || process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    if (!emailDestino) {
      throw new Error('No se ha especificado un destinatario para el email');
    }

    console.log('📧 [EmailSender] Destinatario:', emailDestino);

    const mailOptions = {
      from: `"219Meds - Sistema de Facturación" <${process.env.EMAIL_USER}>`,
      to: emailDestino,
      subject: `📊 Reporte de Facturación - ${reporte.periodo} - 219Meds`,
      html: generarHTMLReporte(reporte),
      attachments: [
        {
          filename: `reporte-facturacion-${new Date().toISOString().split('T')[0]}.json`,
          content: JSON.stringify(reporte, null, 2),
          contentType: 'application/json'
        }
      ]
    };

    console.log('📧 [EmailSender] Enviando email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ [EmailSender] Email enviado a ${emailDestino}, MessageID: ${info.messageId}`);
    return { 
      success: true, 
      messageId: info.messageId,
      message: 'Reporte enviado exitosamente por email'
    };

  } catch (error) {
    console.error('❌ [EmailSender] Error enviando email:', error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Genera el HTML para el email del reporte
 */
const generarHTMLReporte = (reporte) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 10px; background: white;">
      <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px;">
        <h1 style="color: white; margin: 0 0 10px 0; font-size: 28px;">📊 Reporte de Facturación</h1>
        <p style="font-size: 16px; margin: 5px 0; opacity: 0.9;">Período: ${reporte.periodo}</p>
        <p style="font-size: 14px; margin: 0; opacity: 0.8;">Generado: ${new Date(reporte.fechaGeneracion).toLocaleString('es-AR')}</p>
      </div>
      
      <!-- Resumen Ejecutivo -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 20px;">📈 Resumen Ejecutivo</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px;">
          <div style="background: #ecf0f1; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #27ae60;">
            <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 14px;">Ventas Totales</h3>
            <p style="font-size: 24px; font-weight: bold; color: #27ae60; margin: 0;">$${reporte.ventasTotales?.toFixed(2) || '0.00'}</p>
          </div>
          <div style="background: #ecf0f1; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #3498db;">
            <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 14px;">Total Turnos</h3>
            <p style="font-size: 24px; font-weight: bold; color: #3498db; margin: 0;">${reporte.analisisTurnos?.total || 0}</p>
          </div>
          <div style="background: #ecf0f1; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #e74c3c;">
            <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 14px;">Total Pedidos</h3>
            <p style="font-size: 24px; font-weight: bold; color: #e74c3c; margin: 0;">${reporte.analisisPedidos?.total || 0}</p>
          </div>
        </div>
      </div>

      <!-- Información adicional simplificada -->
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin-top: 20px;">
        <p style="margin: 0; color: #7f8c8d; font-size: 14px;">
          Reporte generado automáticamente por el Sistema de Facturación 219Meds
        </p>
        <p style="margin: 10px 0 0 0; color: #7f8c8d; font-size: 12px;">
          Consulta el archivo JSON adjunto para el análisis completo y detallado
        </p>
      </div>
    </div>
  `;
};

module.exports = {
  sendPartnerRequestEmail,
  sendPartnerStatusEmail,
  sendPasswordResetRequestEmail,
  sendPasswordResetConfirmationEmail,
  sendTurnoStatusEmail,
  sendPedidoConfirmadoEmail,
  sendPagoConfirmadoEmail,
  sendEnPreparacionEmail,
  sendPedidoEntregadoEmail,
  sendReporteFacturacionEmail,
};