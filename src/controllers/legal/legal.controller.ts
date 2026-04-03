import { controller, httpGet } from 'inversify-express-utils';
import { Request, Response } from 'express';

@controller('/api/legal')
export class LegalController {

  @httpGet('/privacidad')
  public privacyPolicy(_req: Request, res: Response) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Política de Privacidad – LINKED</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; line-height: 1.7; }
    h1 { color: #111; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    h2 { color: #222; margin-top: 32px; }
    p, li { margin-bottom: 10px; }
    ul { padding-left: 20px; }
    .date { color: #888; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>Política de Privacidad</h1>
  <p class="date">Última actualización: abril de 2025</p>

  <p>
    LINKED ("la Aplicación", "nosotros") es una plataforma de gestión de estudios de tatuajes que permite
    a tatuadores administrar su portfolio, agenda y reservas, y a los clientes descubrir artistas y reservar turnos.
    Esta Política de Privacidad describe cómo recopilamos, usamos y protegemos tu información personal.
  </p>

  <h2>1. Información que recopilamos</h2>
  <ul>
    <li><strong>Datos de registro:</strong> nombre, dirección de correo electrónico y contraseña al crear una cuenta.</li>
    <li><strong>Datos de perfil:</strong> fotografías de portafolio, descripción profesional y especialidades (para tatuadores).</li>
    <li><strong>Datos de reservas:</strong> fecha, hora y detalles de los turnos solicitados o gestionados.</li>
    <li><strong>Datos de Instagram:</strong> si vinculás tu cuenta de Instagram, accedemos a tu identificador de usuario de Instagram y a las publicaciones de tu perfil profesional (imágenes y metadatos) con el único fin de importarlas a tu portfolio en LINKED. No almacenamos contraseñas de Instagram.</li>
  </ul>

  <h2>2. Cómo usamos tu información</h2>
  <ul>
    <li>Permitir el registro, inicio de sesión y gestión de tu cuenta.</li>
    <li>Mostrar el portfolio de tatuadores a los clientes.</li>
    <li>Gestionar la agenda y las reservas de turnos.</li>
    <li>Importar publicaciones de Instagram al portfolio, previa autorización explícita del usuario.</li>
    <li>Enviar notificaciones relacionadas con tus reservas o tu cuenta (por correo electrónico).</li>
  </ul>

  <h2>3. Compartición de datos con terceros</h2>
  <p>
    No vendemos ni cedemos tus datos personales a terceros con fines comerciales. Únicamente compartimos
    información con:
  </p>
  <ul>
    <li><strong>Meta Platforms (Instagram/Facebook):</strong> para autenticar la vinculación de cuentas de Instagram mediante OAuth. Consulta la <a href="https://www.facebook.com/policy.php" target="_blank">Política de Privacidad de Meta</a>.</li>
    <li><strong>Proveedores de infraestructura:</strong> servidores de hosting y base de datos necesarios para el funcionamiento de la aplicación.</li>
  </ul>

  <h2>4. Almacenamiento y seguridad</h2>
  <p>
    Los datos se almacenan en servidores seguros. Los tokens de acceso de Instagram se guardan
    de forma cifrada y tienen una vigencia de aproximadamente 60 días, tras los cuales deben renovarse.
    Aplicamos medidas técnicas y organizativas para proteger tu información contra accesos no autorizados.
  </p>

  <h2>5. Tus derechos</h2>
  <p>Podés ejercer los siguientes derechos en cualquier momento:</p>
  <ul>
    <li><strong>Acceso:</strong> solicitar una copia de los datos que tenemos sobre vos.</li>
    <li><strong>Rectificación:</strong> corregir datos inexactos desde tu perfil.</li>
    <li><strong>Eliminación:</strong> solicitar la eliminación de tu cuenta y tus datos.</li>
    <li><strong>Desvinculación de Instagram:</strong> podés revocar el acceso a tu cuenta de Instagram en cualquier momento desde la sección de configuración de tu perfil.</li>
  </ul>

  <h2>6. Datos de menores</h2>
  <p>
    LINKED no está dirigida a menores de 13 años. No recopilamos intencionalmente datos de menores.
  </p>

  <h2>7. Cambios a esta política</h2>
  <p>
    Podemos actualizar esta Política de Privacidad ocasionalmente. Notificaremos los cambios relevantes
    por correo electrónico o mediante un aviso en la aplicación.
  </p>

  <h2>8. Contacto</h2>
  <p>
    Para consultas relacionadas con la privacidad de tus datos, podés contactarnos en:
    <strong>privacidad@linked-app.com</strong>
  </p>
</body>
</html>`);
  }

  @httpGet('/terminos')
  public termsOfService(_req: Request, res: Response) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Términos de Servicio – LINKED</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; line-height: 1.7; }
    h1 { color: #111; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    h2 { color: #222; margin-top: 32px; }
    p, li { margin-bottom: 10px; }
    ul { padding-left: 20px; }
    .date { color: #888; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>Términos de Servicio</h1>
  <p class="date">Última actualización: abril de 2025</p>

  <p>
    Al utilizar LINKED aceptás los siguientes términos y condiciones. Si no estás de acuerdo,
    por favor no uses la aplicación.
  </p>

  <h2>1. Descripción del servicio</h2>
  <p>
    LINKED es una plataforma digital que conecta a tatuadores con clientes, permitiendo la gestión
    de portfolios, agendas y reservas de turnos. También ofrece integración opcional con Instagram
    para importar publicaciones al portfolio profesional.
  </p>

  <h2>2. Uso aceptable</h2>
  <p>Al usar LINKED te comprometés a:</p>
  <ul>
    <li>Proporcionar información veraz y actualizada al registrarte.</li>
    <li>No subir contenido ilegal, ofensivo, o que infrinja derechos de terceros.</li>
    <li>No intentar acceder a cuentas o datos que no te pertenecen.</li>
    <li>No usar la plataforma para actividades fraudulentas o spam.</li>
  </ul>

  <h2>3. Cuentas de usuario</h2>
  <p>
    Sos responsable de mantener la confidencialidad de tus credenciales de acceso.
    LINKED no se responsabiliza por accesos no autorizados derivados del uso indebido de tu contraseña.
    Podés eliminar tu cuenta en cualquier momento desde la configuración de tu perfil.
  </p>

  <h2>4. Contenido del usuario</h2>
  <p>
    Las imágenes y descripciones que subís a LINKED son de tu propiedad. Al subirlas nos otorgás
    una licencia limitada para mostrarlas dentro de la plataforma. No reclamamos propiedad sobre
    tu contenido.
  </p>
  <p>
    Para el contenido importado desde Instagram, la propiedad y los derechos siguen correspondiendo
    al titular de la cuenta de Instagram conforme a los términos de Meta.
  </p>

  <h2>5. Integración con Instagram</h2>
  <p>
    La vinculación con Instagram es completamente opcional. Al autorizar la integración:
  </p>
  <ul>
    <li>Otorgás a LINKED permiso para leer tus publicaciones profesionales de Instagram.</li>
    <li>Podés revocar este permiso en cualquier momento desde tu perfil en LINKED o desde la configuración de tu cuenta de Instagram.</li>
    <li>El uso de los datos de Instagram está sujeto además a los <a href="https://www.facebook.com/terms" target="_blank">Términos de Servicio de Meta</a>.</li>
  </ul>

  <h2>6. Reservas y turnos</h2>
  <p>
    LINKED facilita la comunicación entre tatuadores y clientes, pero no es parte de los acuerdos
    comerciales entre ellos. Cualquier disputa relacionada con un servicio de tatuaje debe resolverse
    directamente entre las partes involucradas.
  </p>

  <h2>7. Limitación de responsabilidad</h2>
  <p>
    LINKED se provee "tal como está". No garantizamos disponibilidad continua del servicio.
    No somos responsables por daños derivados del uso o la imposibilidad de uso de la plataforma,
    ni por el contenido publicado por los usuarios.
  </p>

  <h2>8. Modificaciones</h2>
  <p>
    Podemos modificar estos Términos en cualquier momento. Los cambios sustanciales serán notificados
    con al menos 15 días de anticipación por correo electrónico o mediante un aviso en la aplicación.
    El uso continuado de LINKED implica la aceptación de los nuevos términos.
  </p>

  <h2>9. Ley aplicable</h2>
  <p>
    Estos Términos se rigen por las leyes de la República Argentina.
    Cualquier disputa será sometida a la jurisdicción de los tribunales competentes.
  </p>

  <h2>10. Contacto</h2>
  <p>
    Para consultas sobre estos Términos podés escribirnos a:
    <strong>legal@linked-app.com</strong>
  </p>
</body>
</html>`);
  }

  @httpGet('/datadeletion')
  public dataDeletion(_req: Request, res: Response) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Eliminación de Datos – LINKED</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; line-height: 1.7; }
    h1 { color: #111; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    h2 { color: #222; margin-top: 32px; }
    p, li { margin-bottom: 10px; }
    ul { padding-left: 20px; }
    .date { color: #888; font-size: 0.9em; }
    .highlight { background: #f5f5f5; border-left: 4px solid #555; padding: 12px 16px; margin: 20px 0; border-radius: 2px; }
  </style>
</head>
<body>
  <h1>Instrucciones de Eliminación de Datos</h1>
  <p class="date">Última actualización: abril de 2025</p>

  <p>
    Si utilizaste tu cuenta de Instagram para conectarte con LINKED, podés solicitar la eliminación
    de todos los datos asociados a esa conexión siguiendo los pasos indicados a continuación.
  </p>

  <h2>Opción 1 — Desde la aplicación LINKED (recomendado)</h2>
  <ol>
    <li>Iniciá sesión en LINKED con tu cuenta.</li>
    <li>Dirigite a <strong>Mi perfil → Información personal</strong>.</li>
    <li>En la sección <strong>Instagram</strong>, hacé clic en <strong>Desvincular cuenta</strong>.</li>
    <li>Para eliminar tu cuenta completa y todos tus datos, contactanos al correo indicado al final de esta página.</li>
  </ol>

  <h2>Opción 2 — Desde la configuración de Meta</h2>
  <ol>
    <li>Ingresá a <a href="https://www.facebook.com/settings?tab=applications" target="_blank">facebook.com/settings → Aplicaciones y sitios web</a>.</li>
    <li>Buscá <strong>LINKED</strong> en la lista de aplicaciones conectadas.</li>
    <li>Hacé clic en <strong>Eliminar</strong> y confirmá la acción.</li>
    <li>Esto revoca el acceso de LINKED a tu cuenta de Instagram. Para solicitar además la eliminación de los datos ya almacenados, escribinos al correo indicado al final.</li>
  </ol>

  <h2>Qué datos eliminamos</h2>
  <div class="highlight">
    <p>Al procesar tu solicitud de eliminación eliminamos:</p>
    <ul>
      <li>El token de acceso de Instagram asociado a tu cuenta.</li>
      <li>Tu identificador de usuario de Instagram almacenado en nuestros servidores.</li>
      <li>Las publicaciones de Instagram importadas a tu portfolio en LINKED (trabajos sincronizados).</li>
    </ul>
  </div>

  <h2>Solicitar eliminación por correo</h2>
  <p>
    Si preferís solicitar la eliminación directamente, enviá un correo a
    <strong>privacidad@linked-app.com</strong> con el asunto
    <em>"Solicitud de eliminación de datos"</em> e indicá el correo electrónico
    asociado a tu cuenta de LINKED. Procesamos las solicitudes en un plazo máximo de <strong>30 días</strong>.
  </p>
</body>
</html>`);
  }
}
