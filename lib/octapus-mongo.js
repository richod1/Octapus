// mongo db class wrapper
const {MongoClient,ObjectId}=require("mongodb")

class MongoWrapper{
    constructor(connectionUrl,dbName){
        this.connectionUrl=connectionUrl;
        this.dbName=dbName;
        this.client=new MongoClient(connectionUrl,{useNewUrlParser:true,useUnifiedTopology:true});
        this.db=null;

    };

    async connect(){
        try{
            await this.client.connect();
            this.db=this.client.db(this.dbName);
            console.log('Connected to MongoDb Successfully')

        }catch(err){
            console.log('Error connecting to MongoDb :',err);
            throw err;

        }
    }

    async disconnect(){
        try{
            await this.client.close();
            console.log('Disconnected from the MongoDb');

        }catch(err){
            console.error('Error disconnecting from MOngoDb :',err);
            throw err;

        }
    }

    // define schema model
    defineModel(collectionName,schema){
        return this.db.collection(collectionName,schema);
    }

    async insertOne(collectionName,document){
        try{
            const result=await this.db.collection(collectionName).insertOne(document);
            return result.ops[0];

        }catch(err){
            console.error(`Error inserting document into ${collectionName}`,err);
            throw err;
        }

    }

    // insert many operations
    async insertMany(collectionName,documents){
        try{
            const result=await this.db.collection(collectionName).insertMany(documents);
            return result.insertedIds;

        }catch(err){
            console.error(`Error inserting documents into ${collectionName}`,err);
            throw err;

        }

    }

    // find operation
    async find(collectionName,query={},options={}){
        try{
            const result=await this.db.collection(collectionName).find(query,options).toArray();
            return result;

        }catch(err){
            console.error(`Failed to find ${collectionName}`,err);
            throw err;
        }

    }

    async findOne(collectionName,query){
        try{
            return await this.db.collection(collectionName).findOne(query);

        }catch(err){
            console.error(`Error finding document in ${collectionName} :`,err);
            throw err;
        }
    }

    // update operations
    async update(collectionName,query,update,options={}){
        try{
            const result=await this.db.collection(collectionName).update(query,update,options);
            return result.modifiedCount;

        }catch(err){
            console.error(`Error updating ${collectionName}`,err);
            throw err;
        }

    }

    // update One operations
    async updateOne(collectionName,filter,update,options={}){
        try{
            const result=await this.db.collection(collectionName).updateOne(filter,update,options);
            return result.modifiedCount;

        }catch(err){
            console.error(`Error updateing One ${collectionName}`,err);
            throw err;
        }
    }
}

module.exports=MongoWrapper;