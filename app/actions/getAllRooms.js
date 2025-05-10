'use server';

import { createAdminClient  } from "@/config/appwrite";
import { revalidatePath  } from "next/cache";
import { redirect } from "next/navigation";




// if we add a new room, we want that new room to be displayed
// for this reason, we use revalidatepath
async function  getAllRooms() {
    try{
        // getting the database function
        const { databases } = await createAdminClient();

        // Fetch rooms
        const { documents: rooms } = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE, process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS 
        );
    
        // console.log('rooms', rooms);

    // Revalidate the cache for this path
    revalidatePath('/', 'layout');
    return rooms;
    }
    catch(error){
        console.log('Failed to get rooms', error);
        redirect('/error'); 
    }
}

export default getAllRooms;