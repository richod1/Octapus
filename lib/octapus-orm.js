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

    // defining the model of the database.io

    defineModel(modelName,attribute,options={}){
        const model=this.sequelize.define(
            modelName,
            attribute,
            Object.assign({
                validate:{
                    nameValidation(value){
                        if(!value){
                            throw new Error("Name cannot be null:Check for null value!")
                        }

                        if(value.length<3){
                            throw new Error("Name must be at least 3 character long")
                        }
                    }
                }
            }),
            options
            )
        this.models[modelName]=model;
        return model;
    }


     // sync model with database
    async syncModels(){
        await this.sequelize.sync();
    }

    // delete records

    async deleteRecord(modelName,id){
        const model=this.models[modelName];
        const record=await model.findByPk(id);

        if(record){
            return record.destroy();
        }
        return null;
    }

    // delete all records
    async deleteAllRecords(modelName){
        const model=this.models[modelName];

        return model.destroy({
            where:{},
            trancate:true,
        })

    }


    // create a record in the specified model
    async getRecordById(modelName,id){
        const model=this.models[modelName]
        return model.findByPk(id);
    }

    async createRecord(modelName,data){
        const model=this.models[modelName];
        try{
            return await model.create(data);

        }catch(err){
            console.log(`Validation Error ${err.message}`)
            throw err;

        }

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