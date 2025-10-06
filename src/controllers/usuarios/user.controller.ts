import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../services/user/user.service.js';
import { IUserService } from '../../services/interfaces/user/IUserService.js';
import { inject } from 'inversify';
import { controller, httpDelete, httpGet, httpPost, httpPut } from 'inversify-express-utils';
import { validateInputData } from '../../middleware/validation/validation-middleware.js';
import { createUserValidationRules, deleteUserValidationRules, forgotPasswordValidationRules, getAllUserRolsValidationRules, getUserValidationRules, resetPasswordValidationRules, updateUserByAdminValidationRules, updateUserValidationRules } from '../../middleware/validation/validations-rules/user-validations.js';
import { authenticateToken, authorizeRol } from '../../middleware/auth/authToken.js';
import { OkNegotiatedContentResult } from 'inversify-express-utils/lib/results/OkNegotiatedContentResult.js';
import { JsonResult } from 'inversify-express-utils/lib/results/JsonResult.js';
import { AuthCryptography } from '../../middleware/auth/authCryptography.js';
import { IUserRolAplService } from '../../services/interfaces/user/IUserRolAplService.js';
import { UserRolAplService } from '../../services/user/user-rol-apl.service.js';
import { ValidationError } from '../../middleware/errorHandler/validationError.js';

@controller('/api/users')
export class UserController {
    private _userService: IUserService;
    private _userRolAplService: IUserRolAplService;

    authCryptography: AuthCryptography = new AuthCryptography();



    constructor(
        @inject(UserService) userService: IUserService,
        @inject(UserRolAplService) userRolAplService: IUserRolAplService,
    ) {
        this._userService = userService;
        this._userRolAplService = userRolAplService;
    }

    @httpGet('/findall')
    public async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this._userService.findAll();
            if (users.length > 0) {
                res.status(200).json(users);
                //new OkNegotiatedContentResult(users);
            } else {
                return new JsonResult({ message: 'No se han encontrado usuarios' }, 404);
            }
        } catch (error) {
            next(error);
        }
    };

    @httpGet('/getAllRoles', authenticateToken, authorizeRol('Administrador'))
    public async getAllRoles(req: Request, res: Response, next: NextFunction) {
        try {
            const roles = await this._userRolAplService.getRoles();

            if (roles) {
                res.status(200).json(roles);
            } else {
                res.status(404).json({ message: 'No existen roles cargados' });
            }
        } catch (error) {
            next(error);
        }
    };

    @httpGet('/:id', validateInputData(getUserValidationRules))
    public async findOne(req: Request, res: Response, next: NextFunction) {
        const id = parseInt(req.params.id, 10);

        try {
            const user = await this._userService.findOne(id);
            if (user) {
                res.status(200).json(user);
            } else {
                res.status(404).json({ message: 'Usuario no encontrado' });
            }
        } catch (error) {
            next(error);
        }
    };

    @httpPost('/register', validateInputData(createUserValidationRules))
    public async create(req: Request, res: Response, next: NextFunction) {

        const newUser = { //req.body solamente
            idUser: undefined,
            idRolApl: req.body.idRolApl,
            rolDesc: undefined,
            email: req.body.email, //Agregado
            realname: req.body.realname,
            surname: req.body.surname,
            username: req.body.username,
            birth_date: req.body.birth_date,
            creationuser: req.body.creationuser,
            creationtimestamp: undefined,
            password: this.authCryptography.decrypt(req.body.password),
            status: req.body.status,
            delete_date: req.body.delete_date,
            modificationuser: undefined,
            modificationtimestamp: undefined,
        };

        try {
            const createdUser = await this._userService.create(newUser);
            res.status(201).json(createdUser);
        } catch (error) {
            next(error);
        }
    };

    @httpPut('/:id', authenticateToken, validateInputData(updateUserValidationRules))
    public async update(req: Request, res: Response, next: NextFunction) {

        const id = parseInt(req.params.id, 10);
        const userUpdates = req.body;

        try {
            const updatedUser = await this._userService.update(id, userUpdates);
            if (updatedUser) {
                res.status(200).json(updatedUser);
            } else {
                res.status(404).json({ message: 'Usuario no encontrado' });
            }
        } catch (error) {
            next(error);
        }
    };

    //Nuevo método para restablecer la contraseña
    @httpPost('/forgot-password', validateInputData(forgotPasswordValidationRules))
    public async forgotPassword(req: Request, res: Response, next: NextFunction) {

        const { email } = req.body;
        try {
            //Busca el usuario por el email
            const user = await this._userService.findByEmail(email);

            if (user) {
                //Genero un token aleatorio
                const crypto = await import('crypto');
                const token = crypto.randomBytes(32).toString('hex');
                const expires = new Date(Date.now() + 60 * 60 * 1000);

                user.resetPasswordToken = token;
                user.resetPasswordExpires = expires;


                if (!user.id) {
                    throw new ValidationError('Usuario no tiene un ID válido');
                }

                await this._userService.update(user.id, user);

                if (!user.email) {
                    throw new ValidationError('Usuario no tiene un email válido');
                }

                await this._userService.sendResetPass(user.email, token);
            }
            return res.json({ message: "Si existe, se envio un correo electrónico de recuperación" });
        } catch (error) {
            next(error);
        }
    }

    @httpPost('/reset-password', validateInputData(resetPasswordValidationRules))
    public async resetPass(req: Request, res: Response, next: NextFunction) {

        const token = req.body.token;
        const newPassword = this.authCryptography.decrypt(req.body.newPassword)

        try {
            const user = await this._userService.findByResetToken(token);

            if (!user) {
                throw new ValidationError('Token invalido o expirado');
            }

            if (user.id === undefined) {
                throw new ValidationError('Usuario no tiene un ID válido');
            }
            await this._userService.updatePassword(user.id, newPassword);

            return res.json({ message: 'Contraseña actualizada correctamente' });
        } catch (error) {
            next(error);
        }
    }

    @httpDelete('/:id', authenticateToken, validateInputData(deleteUserValidationRules))
    public async remove(req: Request, res: Response, next: NextFunction) {

        const id = parseInt(req.params.id, 10);

        try {
            const deletedUser = await this._userService.delete(id);
            if (deletedUser) {
                res.status(200).json(deletedUser);
            } else {
                res.status(404).json({ message: 'Usuario no encontrado' });
            }
        } catch (error) {
            next(error);
        }
    };

    @httpPut('/updateUser/:id', authenticateToken, validateInputData(updateUserByAdminValidationRules))
    public async updateUserByAdmin(req: Request, res: Response, next: NextFunction) {

        const id = parseInt(req.params.id, 10);
        const userUpdates = req.body;

        try {
            const updatedUser = await this._userService.updateUserByAdmin(id, userUpdates);
            if (updatedUser) {
                res.status(200).json(updatedUser);
            } else {
                res.status(404).json({ message: 'Usuario no encontrado' });
            }
        } catch (error) {
            next(error);
        }
    };

    @httpGet('/getUserRolsByIdUser/:idUser', validateInputData(getAllUserRolsValidationRules))
    public async getAllUserRoles(req: Request, res: Response, next: NextFunction) {
        const idUser = parseInt(req.params.idUser, 10);

        try {
            const userRols = await this._userRolAplService.getAllUserRols(idUser);
            if (userRols) {
                res.status(200).json(userRols);
            } else {
                res.status(404).json({ message: 'Usuario inexistente o sin roles asignados' });
            }
        } catch (error) {
            next(error);
        }
    };

    @httpPut('/:id/roles', authenticateToken, authorizeRol('Administrador'))
    public async updateUserRoles(req: Request, res: Response, next: NextFunction) {
        const id = parseInt(req.params.id, 10);
        const roleIds: number[] = req.body.roleIds;

        try {
            const updatedRoles = await this._userRolAplService.updateUserRoles(
                id,
                roleIds,
                'Administrador'
            );
            res.status(200).json(updatedRoles);
        } catch (error) {
            next(error);
        }

    }


}