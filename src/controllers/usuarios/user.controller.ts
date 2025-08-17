import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../services/user/user.service.js';
import { IUserService } from '../../services/interfaces/user/IUserService.js';
import { inject } from 'inversify';
import { controller, httpDelete, httpGet, httpPost, httpPut } from 'inversify-express-utils';
import { validateInputData } from '../../middleware/validation/validation-middleware.js';
import { createUserValidationRules, deleteUserValidationRules, getAllUserRolsValidationRules, getUserValidationRules, updateUserByAdminValidationRules, updateUserValidationRules } from '../../middleware/validation/validations-rules/user-validations.js';
import { authenticateToken, authorizeRol } from '../../middleware/auth/authToken.js';
import { AuthCryptography } from '../../middleware/auth/authCryptography.js';
import { UserRolAplService } from '../../services/user/user-rol-apl.service.js';
import { IUserRolAplService } from '../../services/interfaces/user/IUserRolAplService.js';

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
            } else {
               return  res.status(404).json({ message: 'No se han encontrado usuarios' });
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
        console.log(req.body);

        const newUser = req.body;
        newUser.password = this.authCryptography.decrypt(newUser.password);

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

    @httpPut('/updateUser/:id', authenticateToken, validateInputData(updateUserByAdminValidationRules), authorizeRol('admin'))
    public async updateUserByAdmin(req: Request, res: Response, next: NextFunction) {

        const id = parseInt(req.params.id, 10);
        const userUpdates = req.body;

        try {
            const updatedUser = await this._userService.updateUserByAdmin(id, userUpdates, userUpdates.rolDescription);
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
    @httpPut('/:id/roles', authenticateToken, authorizeRol('admin'))
    public async updateUserRoles(req: Request, res: Response, next: NextFunction) {
        const id = parseInt(req.params.id, 10);
        const roleIds: number[] = req.body.roleIds;

        try {
            const updatedRoles = await this._userRolAplService.updateUserRoles(
                id,
                roleIds,
                'admin'
            );
            res.status(200).json(updatedRoles);
        } catch (error) {
            next(error);
        }

    }
}