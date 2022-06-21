import { SignProcess } from "./signProcessDAO";
import { sequelize } from "../../connection";
import { Association, DataTypes, NonAttribute } from "sequelize";
import { Document } from "./documentDAO";
import { Model, InferAttributes, InferCreationAttributes } from 'sequelize';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare codice_fiscale: string;
    declare email_address: string;
    declare numero_token: number;
    declare challenging_string: string;
    declare challenging_code_one: number;
    declare challenging_code_two: number;
    declare expiration: Date;
    declare Documents: NonAttribute<Document[]>;
    declare SignProcesses: NonAttribute<SignProcess[]>;

    public static associations: {
        signProcesses: Association<User, SignProcess>;
        documents: Association<User, Document>;
    }
} 

User.init({
        codice_fiscale: {
            type: DataTypes.CHAR(16),
            primaryKey: true
        },
        email_address:{
            type: DataTypes.STRING(50),
            unique:true,
            allowNull:false 
        },
        numero_token:{
            type: DataTypes.INTEGER,
            allowNull:false 
        },
        challenging_string:{
            type: DataTypes.CHAR(32),
            allowNull:false 
        },
        challenging_code_one:{
            type: DataTypes.INTEGER,
            allowNull:true 
        },
        challenging_code_two:{
            type: DataTypes.INTEGER,
            allowNull:true 
        },
        expiration:{
            type: DataTypes.DATE,
            allowNull:true
        }
    },
    {
        sequelize,
        tableName: 'utenti',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
});

User.hasMany(SignProcess,{
    foreignKey: 'codice_fiscale_firmatario'
});

User.hasMany(Document,{
    foreignKey: 'codice_fiscale_richiedente'
});