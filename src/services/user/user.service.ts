// user.service.ts
import { UserRepository } from '../../repositories/usuarios/user.dao.js';
import { User } from '../../models/usuarios/user.entity.js';
import { UserAuth } from '../../models/usuarios/user-auth.entity.js';
import { IUserService } from '../interfaces/user/IUserService.js';
import { ValidationError } from '../../middleware/errorHandler/validationError.js';
import { AuthenticationError } from '../../middleware/errorHandler/authenticationError.js';
import { UserDto } from '../../models-dto/usuarios/user-dto.entity.js';
import { inject, injectable } from 'inversify';
import { IPasswordService } from '../interfaces/auth/IPasswordService.js';
import { PasswordService } from '../auth/password.service.js';
import { UserRolAplService } from './user-rol-apl.service.js';
import { IUserRolAplService } from '../interfaces/user/IUserRolAplService.js';
import { IUserRepository } from '../../repositories/interfaces/user/IUserRepository.js';
import { CreateEmailBody } from '../../middleware/email-creator/email.js';
import { UserMapper } from '../../mappers/user/user.mapper.js';
import fs from 'fs'; 
import path from 'path'; 
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

@injectable()
export class UserService implements IUserService {
  private _userRepository: IUserRepository;
  private _passwordService: IPasswordService;
  private _userRolAplService: IUserRolAplService;
  private _userMapper: UserMapper;

  constructor(
    @inject(UserRepository) userRepository: IUserRepository,
    @inject(PasswordService) passwordService: IPasswordService,
    @inject(UserRolAplService) userRolAplService: IUserRolAplService,
    @inject(UserMapper) userMapper: UserMapper,
  ) {
    this._userRepository = userRepository;
    this._passwordService = passwordService;
    this._userRolAplService = userRolAplService;
    this._userMapper = userMapper;
  }


  async sendResetPass(email: string, token: string): Promise<void> {

    await CreateEmailBody(email, token);

    return await this._userRepository.sendResetPassword(email, token);
  }

  async findByResetToken(token: string): Promise<User | null> {
    return await this._userRepository.findOneby(token);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this._userRepository.findByEmail(email);
    return user === null ? undefined : user;
  }

  async updatePassword(userid: number, newPassword: string): Promise<void> {

    const user = await this._userRepository.findOne(userid);

    if (!user) throw new Error('Usuario no encontrado');

    if (!user.userauth) {
      throw new Error('La información de autenticación del usuario no está disponible');
    }

    newPassword = (await this._passwordService.validatePassword(newPassword))
      ? await this._passwordService.hashPassword(newPassword)
      : (() => { throw new ValidationError('La Contraseña es inválida'); })();

    await this._userRepository.updatePass(userid, newPassword);
  }

  async findAll(): Promise<UserDto[]> {
    const usersList = await this._userRepository.findAll();

    let userOutPutList: UserDto[] = [];

    if (!usersList || usersList.length === 0) return userOutPutList;

    userOutPutList = await Promise.all(
      usersList.map(async (user) => {
        const userRolAplList = (await user.userRolApl)?.map((c) => c);
        const currentRol = await this._userRolAplService.SearchUserCurrentRol(
          userRolAplList!
        );

        const userOutput = await this._userMapper.convertToDto(user, currentRol!);
        return userOutput;
      })
    );

    return userOutPutList;
  }

  async findOne(id: number): Promise<UserDto | undefined> {
    const user = await this._userRepository.findOne(id);
    if (!user) return undefined;
    const userRolAplList = (await user.userRolApl)?.map((c) => c);
    const currentRol = await this._userRolAplService.SearchUserCurrentRol(
      userRolAplList!
    );

    if (!currentRol) return undefined;

    const userOutput = await this._userMapper.convertToDto(user, currentRol);

    return userOutput;
  }

  async create(newUser: UserDto): Promise<UserDto> {
    if (!newUser || !newUser.username) {
      throw new ValidationError('Usuario no posee userName', 404);
    }
    const userExisted = await this.findByUserName(newUser.username);

    if (userExisted) {
      throw new AuthenticationError('El Usuario ya existe', 409);
    }

    const userToCreate = await this._userMapper.convertDtoToEntity(newUser, this._passwordService);

    const userCreated = await this._userRepository.registerUser(userToCreate);

    const rolAsigned = await this._userRolAplService.AsignRolUser(userCreated, newUser.idRolApl !== undefined ? String(newUser.idRolApl) : undefined);

    const userOutput = await this._userMapper.convertToDto(userCreated, rolAsigned!);

    return userOutput;
  }

  async update(id: number, userChanges: Partial<User>): Promise<User> {
    const oldUser = await this._userRepository.findOne(id);
    if (!oldUser) {
      throw new ValidationError('Usuario no encontrado', 404);
    }

    // Prepara el payload parcial para la actualización
    const updatePayload: Partial<User> = await this._userMapper.convertToEntityOnUpdate(id, userChanges as User, oldUser);

    // Guarda los paths de las fotos ANTES de actualizar
    const oldPhotoPath = oldUser.profile_photo;
    const newPhotoPath = updatePayload.profile_photo;

    // Ejecuta la actualización en la base de datos
    await this._userRepository.update(id, updatePayload);


    // Lógica para borrar foto antigua 
    if (oldPhotoPath && newPhotoPath && oldPhotoPath !== newPhotoPath && oldPhotoPath.startsWith('/uploads/users/')) {

    // 1. Obtenemos la ruta raíz del proyecto subiendo 3 niveles desde __dirname
    const projectRoot = path.join(__dirname, '../../..');

    // 2. Extraemos la parte relativa de oldPhotoPath (quitamos el '/' inicial)
    // Ejemplo: '/uploads/users/foto.png' -> 'uploads/users/foto.png'
    const relativeImagePath = oldPhotoPath.substring(1);

    // 3. Unimos la raíz con la ruta relativa de la imagen
    const fullPath = path.join(projectRoot, relativeImagePath);

    console.log(`RUTA CALCULADA para borrar: ${fullPath}`); // Verifica que esta ruta sea correcta!

    // Intenta borrar el archivo
    fs.unlink(fullPath, (err) => {
        if (err) {
            // Manejo de errores más detallado
            if (err.code === 'ENOENT') {
                console.warn('La foto de perfil antigua no se encontró para borrar:', fullPath);
            } else {
                console.error('Error al borrar la foto de perfil antigua:', err);
            }
        } else {
            console.log('Foto de perfil antigua borrada:', oldPhotoPath);
        }
    });
  }

    // Vuelve a buscar el usuario actualizado para devolverlo completo
    const userOutput = await this._userRepository.findOne(id);
    if (!userOutput) {
        throw new Error('No se pudo recuperar el usuario después de actualizar');
    }

    return userOutput; // Devuelve la entidad User completa y actualizada
    // const rol = await this._userRolAplService.SearchUserCurrentRol(await userOutput.userRolApl);
    // return this._userMapper.convertToDto(userOutput, rol!);
  }

  async delete(id: number): Promise<User | undefined> {
    return this._userRepository.delete(id);
  }

  async findByUserName(userName: string): Promise<User | undefined> {
    return this._userRepository.findByUserName(userName);
  }

  async userNameAlreadyExist(newUserName: string): Promise<boolean> {
    const user = await this.findByUserName(newUserName);

    let isUserNameOcuped = user !== undefined ? true : false;

    return isUserNameOcuped;
  }

  async updateUserByAdmin(id: number, userChanges: Partial<User>): Promise<User | undefined> {

    const oldUser = await this._userRepository.findOne(id);
    if (!oldUser) {
      throw new ValidationError('Usuario no encontrado', 404);
    }

    const updatePayload: Partial<User> = await this._userMapper.convertToEntityOnUpdate(id, userChanges as User, oldUser);

const oldPhotoPath = oldUser.profile_photo;
    const newPhotoPath = updatePayload.profile_photo;

    await this._userRepository.update(id, updatePayload);


     if (oldPhotoPath && newPhotoPath && oldPhotoPath !== newPhotoPath && oldPhotoPath.startsWith('/uploads/users/')) {

    // 1. Obtenemos la ruta raíz del proyecto subiendo 3 niveles desde __dirname
    const projectRoot = path.join(__dirname, '../../..');

    // 2. Extraemos la parte relativa de oldPhotoPath (quitamos el '/' inicial)
    // Ejemplo: '/uploads/users/foto.png' -> 'uploads/users/foto.png'
    const relativeImagePath = oldPhotoPath.substring(1);

    // 3. Unimos la raíz con la ruta relativa de la imagen
    const fullPath = path.join(projectRoot, relativeImagePath);

    console.log(`RUTA CALCULADA para borrar: ${fullPath}`); // Verifica que esta ruta sea correcta!

    // Intenta borrar el archivo
    fs.unlink(fullPath, (err) => {
        if (err) {
            // Manejo de errores más detallado
            if (err.code === 'ENOENT') {
                console.warn('La foto de perfil antigua no se encontró para borrar:', fullPath);
            } else {
                console.error('Error al borrar la foto de perfil antigua:', err);
            }
        } else {
            console.log('Foto de perfil antigua borrada:', oldPhotoPath);
        }
    });
  }

    const userUpdated = await this._userRepository.findOne(id);
   

    return userUpdated; 

    // const rol = await this._userRolAplService.SearchUserCurrentRol(await userUpdated.userRolApl);
    // return this._userMapper.convertToDto(userUpdated, rol!);
  }
  

  async findAllTatuadores(): Promise<UserDto[]> {
    // 1. Llama al nuevo método del repositorio
    const usersList = await this._userRepository.findAllTatuadoresConEspecialidades();

    let userOutPutList: UserDto[] = [];

    if (!usersList || usersList.length === 0) return userOutPutList;

    // 2. Reutilizamos la misma lógica de mapeo que ya tenías en findAll
    userOutPutList = await Promise.all(
      usersList.map(async (user) => {
        // Gracias a la consulta, user.userRolApl ya viene cargado (no es N+1)
        const userRolAplList = (await user.userRolApl)?.map((c) => c);
        
        const currentRol = await this._userRolAplService.SearchUserCurrentRol(
          userRolAplList!
        );

        // El mapper debería tomar user.especialidades (que ya viene cargado)
        // y convertirlo en parte del DTO.
        const userOutput = await this._userMapper.convertToDto(user, currentRol!);
        return userOutput;
      })
    );

    return userOutPutList;
  }

}


