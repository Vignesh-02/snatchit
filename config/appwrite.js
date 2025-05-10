import { Client, Databases, Account, Storage  } from 'node-appwrite';


//Admin Client
const createAdminClient = async() => {
    const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)    // api endpoint
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)            // project id
    .setKey(process.env.NEXT_APPWRITE_KEY);

    // console.log('client deets', client)
    return {
        // we are returning an instance of the account
        get account() {
            return new Account(client)
        },
        get databases() {
            return new Databases(client)
        },
        get storage() {
            return new Storage(client)
        },
    };
};


const createSessionClient = async(session) => {
    const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)    // api endpoint
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT);            // project id

    if (session){
        client.setSession(session);
    }

    return {
        // we are returning an instance of the account
        get account() {
            return new Account(client)
        },
        get databases() {
            return new Databases(client)
        }
    };
};

export {createAdminClient, createSessionClient};