import { injectable } from "inversify";
import pool from "../../config/pg-database/db.js";
import { errorEnumSideMenu } from "../../middleware/errorHandler/constants/errorConstants.js";
import { DatabaseErrorCustom } from "../../middleware/errorHandler/dataBaseError.js";
import { SweItemMenu } from "../../models/sweitemmenu/sweitemmenu.entity.js";
import { IBaseRepository } from "../interfaces/IBaseRepository.js";

@injectable()
export class SideMenuRepository implements IBaseRepository<SweItemMenu> {

    async findAll() {
        try {
            const result = await pool.query('SELECT * FROM swe_itemmenu si ORDER BY si.ordernumber ASC')
            return result.rows;
        } catch (error) {
            console.error(errorEnumSideMenu.sideMenuNotFounded, error);
            throw new DatabaseErrorCustom(errorEnumSideMenu.sideMenuNotFounded, 500);
        }
    }

    async findOne(id: number): Promise<SweItemMenu | undefined> {
        try {
            const result = await pool.query('SELECT * FROM swe_itemmenu si WHERE si.id = $1', [id]);
            if (result.rows.length > 0) {
                const sweItemMenu = result.rows[0] as SweItemMenu;
                return sweItemMenu;
            } else {
                return undefined;
            }
        } catch (error) {
            console.error(errorEnumSideMenu.sideMenuIndicatedNotFound, error);
            throw new DatabaseErrorCustom(errorEnumSideMenu.sideMenuIndicatedNotFound, 500);
        }
    }

    async create(sweItemMenu: SweItemMenu) {
        const { creationuser, creationtimestamp } = sweItemMenu;
        const query =
            `INSERT INTO swe_itemmenu
                (creationuser, creationtimestamp) 
                VALUES ($1, $2) 
                RETURNING *;`;
        const values = [creationuser, creationtimestamp];

        const client = await pool.connect();

        try {
            // Iniciar una transacción
            await client.query('BEGIN');

            const result = await client.query(query, values);

            // Hacer commit de la transacción
            await client.query('COMMIT');

            return result.rows[0];
        } catch (error) {
            // Hacer rollback de la transacción en caso de error
            await client.query('ROLLBACK');
            console.error(errorEnumSideMenu.sideMenuNotCreated, error);
            throw new DatabaseErrorCustom(errorEnumSideMenu.sideMenuNotCreated, 500);
        } finally {
            // Liberar el cliente de nuevo al pool
            client.release();
        }
    }

    async update(id: number, sweItemMenu: SweItemMenu) {
        //arma la query de actualizcion
        const query =
            `UPDATE swe_itemmenu si
                SET
                    modificationuser = current_user,
                    modificationtimestamp = current_timestamp,
                WHERE st.id = $2
                RETURNING *;`;
        const values = [status, id];

        const client = await pool.connect();

        try {
            await client.query('BEGIN');
            const result = await client.query(query, values);
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(errorEnumSideMenu.sideMenuNotUpdated, error);
            throw new DatabaseErrorCustom(errorEnumSideMenu.sideMenuNotUpdated, 500);
        } finally {
            client.release();
        }
    }

    async delete(id: number): Promise<SweItemMenu | undefined> {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Ejecutar la query de Delete
            const result = await client.query("DELETE FROM swe_itemmenu si WHERE si.id = $1 RETURNING *", [id]);
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(errorEnumSideMenu.sideMenuNotDeleted, error);
            throw new DatabaseErrorCustom(errorEnumSideMenu.sideMenuNotDeleted, 500);
        } finally {
            client.release();
        }
    }
}