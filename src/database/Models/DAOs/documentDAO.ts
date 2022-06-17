import { SignProcess } from "./signProcessDAO"
import { User } from "./userDAO"
import { Association, DataTypes, HasManyAddAssociationMixin, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin, HasManyHasAssociationMixin, NonAttribute } from "sequelize";
import { sequelize } from "../../connection"
import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export class Document extends Model<InferAttributes<Document>, InferCreationAttributes<Document>> {
    declare id: CreationOptional<number>;
    declare codice_fiscale_richiedente: string;
    declare numero_firmatari: number;
    declare nome_documento: string;
    declare hash_documento: string;
    declare stato_firma: boolean;
    declare created_at: CreationOptional<Date>;
    declare SignProcesses: NonAttribute<SignProcess[]>;

    public static associations: {
        signProcesses: Association<Document, SignProcess>;
    }
} 

Document.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    codice_fiscale_richiedente: {
        type: DataTypes.CHAR(16),
        allowNull: false
    },
    numero_firmatari: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nome_documento: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    hash_documento: {
        type: DataTypes.STRING(256),
        unique: true,
        allowNull: false
    },
    stato_firma: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    created_at:{
        type:DataTypes.DATE,
        allowNull: false
    }
},{
    sequelize,
    tableName: 'documenti',
    createdAt: 'created_at',
    updatedAt: false
})

Document.hasMany(SignProcess,{
    foreignKey: 'id_documento'
})