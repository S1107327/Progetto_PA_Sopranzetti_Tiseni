import { SignProcess } from "./signProcessDAO"
import { sequelize } from "../../connection"
import { Association, DataTypes, HasManyAddAssociationMixin, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin, HasManyHasAssociationMixin } from "sequelize"
import { Document } from "./documentDAO"
import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare codice_fiscale: string;
    declare email_address: string;
    declare numero_token: number;
    declare challenging_string: string;
    declare challenging_code_one: number;
    declare challenging_code_two: number;
    declare expiration: EpochTimeStamp;
    // Declaring model associations
    /*
    public getSignProcess!: HasManyGetAssociationsMixin<SignProcess>; 
    public addSignProcess!: HasManyAddAssociationMixin<SignProcess, [string, number]>;
    public hasSignProcess!: HasManyHasAssociationMixin<SignProcess, [string, number]>;
    public countSignProcess!: HasManyCountAssociationsMixin;
    public createSignProcess!: HasManyCreateAssociationMixin<SignProcess>;
    public readonly signProcesses?: SignProcess[];
    */

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
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,

        // If don't want createdAt
        createdAt: false,

        // If don't want updatedAt
        updatedAt: false,
})

User.hasMany(SignProcess,{
    foreignKey: 'codice_fiscale_firmatario'
})

User.hasMany(Document,{
    foreignKey: 'codice_fiscale_richiedente'
})
