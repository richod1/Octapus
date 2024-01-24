// mongo db class wrapper
const {MongoClient}=require("mongodb")

class MongoWrapper{
    constructor(connectionUrl,dbName){
        this.connectionUrl=connectionUrl;
        this.dbName=dbName;
        this.client=new MOngoClient(connectionUrl,{useNewUrlParser:true,useUnifiedTopology:true});
        this.db=null;

    };

    async connect(){
        try{
            await this.client.connect();
            this.db=this.client.db(this.dbName);
            console.log('Connected to MongoD    b Successfully')

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

    async insertOne(collectionName,document){
        try{
            const result=await this.db.collection(collectionName).insertOne(document);
            return result.ops[0];

        }catch(err){
            console.error(`Error inserting document into ${collectionName}`,err);
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

    // add more day manipulation functions
}

module.exports=MongoWrapper;