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
import { RolAplRepository } from '../../repositories/rol/rol-apl.dao.js';
import { SweItemMenuController } from '../../controllers/sweitemmenu/sweitemmenu.controller.js';
import { SideMenuRepository } from '../../repositories/sweitemmenu/sweitemmenu.repository.js';
import { ISweItemMenuService } from '../../services/interfaces/sweitemmenu/ISweItemMenu.js';
import { SweItemMenuService } from '../../services/sweitemmenu/sweitemmenu.service.js';

// Crear un nuevo contenedor de Inversify
const container = new Container({ defaultScope: 'Singleton' });

// Controladores
container.bind<AuthController>(AuthController).toSelf();
container.bind<UserController>(UserController).toSelf();
container.bind<SweItemMenuController>(SweItemMenuController).toSelf();

// Repositorios
container.bind<UserAuthRepository>(UserAuthRepository).toSelf();
container.bind<UserRepository>(UserRepository).toSelf();
container.bind<UserRolRepository>(UserRolRepository).toSelf();
container.bind<RolAplRepository>(RolAplRepository).toSelf();
container.bind<SideMenuRepository>(SideMenuRepository).toSelf();

// Interfaces
container.bind<IAuthService>(AuthService).to(AuthService);
container.bind<IUserService>(UserService).to(UserService);
container.bind<IPasswordService>(PasswordService).to(PasswordService);
container.bind<IUserRolAplService>(UserRolAplService).to(UserRolAplService);
container.bind<ISweItemMenuService>(SweItemMenuService).to(SweItemMenuService);
export { container };
