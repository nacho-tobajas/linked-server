import { SupportTicket } from "../../models/support-ticket/support-ticket.entity.js";
import pool from '../../config/pg-database/db.js';
import { DatabaseErrorCustom } from '../../middleware/errorHandler/dataBaseError.js';
import { errorEnumSupportTicket } from '../../middleware/errorHandler/constants/errorConstants.js';
import { IBaseRepository } from "../interfaces/IBaseRepository.js";



export class SupportTicketRepository implements IBaseRepository<SupportTicket>{

    async findAll() {
        try {
            const result = await pool.query('SELECT * FROM hd_support_ticket st ORDER BY st.id ASC')
            return result.rows;
        } catch (error) {
            console.error(errorEnumSupportTicket.ticketsNotFounded, error);
            throw new DatabaseErrorCustom(errorEnumSupportTicket.ticketsNotFounded, 500);
        }
    }

    async findOne(id: number): Promise<SupportTicket | undefined> {
        try {
            const result = await pool.query('SELECT * FROM hd_support_ticket st WHERE st.id = $1', [id]);
            if (result.rows.length > 0) {
                const supportTicket = result.rows[0] as SupportTicket;
                return supportTicket;
            } else {
                return undefined;
            }
        } catch (error) {
            console.error(errorEnumSupportTicket.ticketIndicatedNotFound, error);
            throw new DatabaseErrorCustom(errorEnumSupportTicket.ticketIndicatedNotFound, 500);
        }
    }

    async create(supportTicket: SupportTicket) {
        const { creationuser, creationtimestamp, status } = supportTicket;
        const query =
            `INSERT INTO hd_support_ticket
                (creationuser, creationtimestamp, status) 
                VALUES ($1, $2, $3) 
                RETURNING *;`;
        const values = [creationuser, creationtimestamp, status];

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
            console.error(errorEnumSupportTicket.ticketNotCreated, error);
            throw new DatabaseErrorCustom(errorEnumSupportTicket.ticketNotCreated, 500);
        } finally {
            // Liberar el cliente de nuevo al pool
            client.release();
        }
    }

    async update(id: number, supportTicket: SupportTicket) {
        const { status } = supportTicket;
        //arma la query de actualizcion
        const query =
            `UPDATE hd_support_ticket st
                SET
                    status = $1,
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
            console.error(errorEnumSupportTicket.ticketNotUpdated, error);
            throw new DatabaseErrorCustom(errorEnumSupportTicket.ticketNotUpdated, 500);
        } finally {
            client.release();
        }
    }

    async delete(id: number): Promise<SupportTicket | undefined> {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Ejecutar la query de Delete
            const result = await client.query("DELETE FROM hd_support_ticket st WHERE st.id = $1 RETURNING *", [id]);
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(errorEnumSupportTicket.ticketNotDeleted, error);
            throw new DatabaseErrorCustom(errorEnumSupportTicket.ticketNotDeleted, 500);
        } finally {
            client.release();
        }
    }
}