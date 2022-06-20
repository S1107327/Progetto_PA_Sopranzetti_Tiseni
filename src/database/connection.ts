import { Sequelize, ConnectionError, ConnectionTimedOutError, TimeoutError } from "sequelize";

/**
 * Istanza di connessione al database tramite Sequelize
 */
export const sequelize = new Sequelize('progettopa', 'postgres', 'postgres',{
  host: 'dbpa',
  dialect: 'postgres',
  retry: {
    match:[
      ConnectionError,
      ConnectionTimedOutError,
      TimeoutError,
    ],
    max: 3
  }
})

