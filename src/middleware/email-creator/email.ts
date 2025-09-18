import nodemailer from 'nodemailer';

export async function CreateEmailBody(email: string, token: string) {
  
   let resetLink = undefined;

   if (process.env.NODE_ENV === 'production') {
 
    resetLink = 'https://dmcoffers-client.pages.dev/reset-password';
    
  }
 else {
    resetLink = `http://localhost:4200/reset-password`;
  }
  

  console.log(`Entrando a sendResetPass con ${email} y ${token}`);

  const trasporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const info = await trasporter.sendMail({
    from: `"DMCOFFERS" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Recuperar contraseña',
    html: `<h3>Recupera tu contraseña</h3><br><p>Su token es: ${token}</p><p>Haz click en el siguient enlace:</p> <a href="${resetLink}">${resetLink}</a><p>Este enlace expirará en una hora</p>`,
  });
  try {
    console.log('Mensaje enviado: %s', info.messageId);
    console.log('Vista previa: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error al enviar el correo electrónico de recuperación:', error);
  }
}