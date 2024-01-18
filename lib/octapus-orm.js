/**
 * Octapus ORM wrapper
 */

const {Sequelize,DataType}=require("sequelize")

class Database{
    constructor(databaseUrl){
        this.sequelize=new Sequelize(databaseUrl,{
            logging:false,
        })
        this.models={};

    }

    // defining the model of the database

    defineModel(modelName,attribute,options={}){
        const model=this.sequelize.define(modelName,attribute,options)
        this.models[modelName]=model;
        return model;
    }


     // sync model with database
    async syncModels(){
        await this.sequelize.sync();
    }

    // delete records
   

    // create a record in the specified model

    async createRecord(modelName,data){
        const model=this.models[modelName];
        return model.create(data);

    }
   

    async getAllRecord(modelName){
        const model=this.models[modelName];
        return model.findAll();

    }

    // more methods to be added

    async closeConnection(){
        await this.sequelize.close();
    }
}


module.exports=Database;