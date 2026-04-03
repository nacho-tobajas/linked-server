import { Container } from 'inversify';
import { UserService } from '../../services/user/user.service.js';
import { AuthService } from '../../services/auth/auth.service.js';
import { UserAuthRepository } from '../../repositories/usuarios/user-auth.dao.js';
import { AuthController } from '../../controllers/auth/auth.controller.js';
import { UserController } from '../../controllers/usuarios/user.controller.js';
import { IUserService } from '../../services/interfaces/user/IUserService.js';
import { IAuthService } from '../../services/interfaces/auth/IAuthService.js';
import { IPasswordService } from '../../services/interfaces/auth/IPasswordService.js';
import { PasswordService } from '../../services/auth/password.service.js';
import { IUserRolAplService } from '../../services/interfaces/user/IUserRolAplService.js';
import { UserRolAplService } from '../../services/user/user-rol-apl.service.js';
import { UserRepository } from '../../repositories/usuarios/user.dao.js';
import { UserRolRepository } from '../../repositories/usuarios/user-rol-apl.dao.js';
import { TrabajosRepository } from '../../repositories/trabajos/trabajos.dao.js';
import { TrabajosService } from '../../services/trabajos/trabajos.service.js';

import { RolAplRepository } from '../../repositories/rol/rol-apl.dao.js';
import { SweItemMenuController } from '../../controllers/sweitemmenu/sweitemmenu.controller.js';
import { SideMenuRepository } from '../../repositories/sweitemmenu/sweitemmenu.repository.js';
import { ISweItemMenuService } from '../../services/interfaces/sweitemmenu/ISweItemMenu.js';
import { SweItemMenuService } from '../../services/sweitemmenu/sweitemmenu.service.js';
import { IUserRepository } from '../../repositories/interfaces/user/IUserRepository.js';
import { IUserAuthRepository } from '../../repositories/interfaces/user/IUserAuthRepository.js';

import { UserMapper } from '../../mappers/user/user.mapper.js';
import { EspecialidadesController } from '../../controllers/especialidades/especialidades.controller.js';
import { EspecialidadesRepository } from '../../repositories/especialidades/especialidades.dao.js';
import { IEspecialidadesService } from '../../services/interfaces/especialidades/IEspecialidades.service.js';
import { EspecialidadesService } from '../../services/especialidades/especialidades.service.js';
import { UserEspecialidadController } from '../../controllers/usuarios/user-especialidad.controller.js';
import { UserEspecialidadService } from '../../services/user/user-especialidad.service.js';
import { AgendaController } from '../../controllers/agenda/agenda.controller.js';
import { IAgendaService } from '../../services/interfaces/agenda/IAgenda.service.js';
import { AgendaService } from '../../services/agenda/agenda.service.js';
import { HorarioHabitualRepository } from '../../repositories/agenda/horario-habitual.dao.js';
import { TurnoTatuadorRepository } from '../../repositories/agenda/turno-tatuador.dao.js';
import { ITurnoTatuadorRepository } from '../../repositories/interfaces/ITurnoTatuadorRepository.js';
import { TurnosController } from '../../controllers/agenda/turnos.controller.js';
import { TurnosService } from '../../services/agenda/turno.service.js';
import { ITurnosService } from '../../services/interfaces/agenda/ITurno.service.js';
import { TrabajosController } from '../../controllers/trabajos/trabajos.controller.js';
import { InstagramController } from '../../controllers/instagram/instagram.controller.js';
import { LegalController } from '../../controllers/legal/legal.controller.js';
import { InstagramService } from '../../services/instagram/instagram.service.js';
import { InstagramRepository } from '../../repositories/instagram/instagram.dao.js';

// Crear un nuevo contenedor de Inversify
const container = new Container({ defaultScope: 'Singleton' });

// Controladores
container.bind<AuthController>(AuthController).toSelf();
container.bind<UserController>(UserController).toSelf();
container.bind<SweItemMenuController>(SweItemMenuController).toSelf();
container.bind<EspecialidadesController>(EspecialidadesController).toSelf();
container.bind<UserEspecialidadController>(UserEspecialidadController).toSelf();
container.bind<AgendaController>(AgendaController).toSelf();
container.bind<TurnosController>(TurnosController).toSelf();
container.bind<TrabajosController>(TrabajosController).toSelf();
container.bind<InstagramController>(InstagramController).toSelf();
container.bind<LegalController>(LegalController).toSelf();

// Repositorios
container.bind<UserRolRepository>(UserRolRepository).toSelf();
container.bind<RolAplRepository>(RolAplRepository).toSelf();
container.bind<SideMenuRepository>(SideMenuRepository).toSelf();
container.bind<EspecialidadesRepository>(EspecialidadesRepository).toSelf();
container.bind<HorarioHabitualRepository>(HorarioHabitualRepository).toSelf();
container.bind<ITurnoTatuadorRepository>(TurnoTatuadorRepository).toSelf();
container.bind<TrabajosRepository>(TrabajosRepository).toSelf();
container.bind<InstagramRepository>(InstagramRepository).toSelf();

// Interfaces
container.bind<IAuthService>(AuthService).to(AuthService);
container.bind<IUserService>(UserService).to(UserService);
container.bind<IPasswordService>(PasswordService).to(PasswordService);
container.bind<IUserRolAplService>(UserRolAplService).to(UserRolAplService);
container.bind<ISweItemMenuService>(SweItemMenuService).to(SweItemMenuService);
container.bind<IUserRepository>(UserRepository).to(UserRepository);
container.bind<IUserAuthRepository>(UserAuthRepository).to(UserAuthRepository);
container.bind<IEspecialidadesService>(EspecialidadesService).to(EspecialidadesService);
container.bind<UserEspecialidadService>(UserEspecialidadService).to(UserEspecialidadService);
container.bind<IAgendaService>(AgendaService).to(AgendaService);
container.bind<ITurnosService>(TurnosService).to(TurnosService);
container.bind<TrabajosService>(TrabajosService).to(TrabajosService);
container.bind<InstagramService>(InstagramService).to(InstagramService);

//mappers
container.bind<UserMapper>(UserMapper).toSelf();


export { container };
