import { sequelize } from "../../connection"
import { Document } from "./documentDAO"
import { User } from "./userDAO"
import { Association, DataTypes } from "sequelize";
import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export class SignProcess extends Model<InferAttributes<SignProcess>, InferCreationAttributes<SignProcess>> {
    declare codice_fiscale_firmatario: string;
    declare id_documento: number
    declare stato: boolean;
    
    public static associations: {
        signProcesses: Association<SignProcess, User>;
        user: Association<SignProcess, Document>;
    }
} 

SignProcess.init({
    codice_fiscale_firmatario: {
        type: DataTypes.CHAR(16),
        primaryKey: true
    },
    id_documento: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    stato: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
},{
    sequelize,
    tableName: "processifirma",
    timestamps: false,
    createdAt: false,
    updatedAt: false,
})
