'use server';

import { createSessionClient  } from "@/config/appwrite";
import { cookies } from "next/headers";
import { Query  } from "node-appwrite";
import { redirect } from "next/navigation";




// if we add a new room, we want that new room to be displayed
// for this reason, we use revalidatepath
async function  getMyRooms() {
    const sessionCookie = cookies().get('appwrite-session');

    if(!sessionCookie){
        redirect('/login');
    }
     
    try{
        // getting the database function
        const { account, databases } = await createSessionClient(sessionCookie.value);

        // get user's id
        const user = await account.get();

        const userId = user.$id;

        console.log('user', user)


        
        // Fetch rooms created by the current logged in user
        const { documents: rooms } = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE, process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS, 
            [Query.equal('user_id', userId)]  
        );
    
        // console.log('rooms', rooms);

    // Revalidate the cache for this path
    return rooms;
    }
    catch(error){
        console.log('Failed to get user rooms', error);
        redirect('/error'); 
    }
}

export default getMyRooms;