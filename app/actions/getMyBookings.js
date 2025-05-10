'use server';

import { createSessionClient  } from "@/config/appwrite";
import { cookies } from "next/headers";
import { Query  } from "node-appwrite";
import { redirect } from "next/navigation";
import checkAuth from "./checkAuth";



// if we add a new room, we want that new room to be displayed
// for this reason, we use revalidatepath
async function  getMyBookings() {
    const sessionCookie = cookies().get('appwrite-session');

    if(!sessionCookie){
        redirect('/login');
    }
    
    try{
        // getting the database function
        const { databases } = await createSessionClient(sessionCookie.value);

        // get user's id
        const { user } = await checkAuth();

        if(!user){
            return{
                error: 'You must be logged in to view bookings'
            }
        }

        
        // Fetch users bookings
        const { documents: bookings } = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE, process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS, 
            [Query.equal('user_id', user.id)]  
        );
    
        // console.log('rooms', rooms);

    // Revalidate the cache for this path
    return bookings;
    }
    catch(error){
        console.log('Failed to get user rooms', error);
        return{
            error: 'Failed to get bookings'
        } 
    }
}

export default getMyBookings;