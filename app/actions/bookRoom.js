'use server';

import { createSessionClient  } from "@/config/appwrite";
import { cookies } from "next/headers";
import { ID  } from "node-appwrite";
import { redirect } from "next/navigation";
import checkAuth from "./checkAuth";
import { revalidatePath } from "next/cache";
import checkRoomAvailability from "./checkRoomAvailability";



// if we add a new room, we want that new room to be displayed
// for this reason, we use revalidatepath
async function  bookRoom(previousState, formData) {
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
                error: 'You must be logged in to book a room'
            }
        }

        // Extract date and time from the formData
        const checkInDate = formData.get('check_in_date')
        const checkOutDate = formData.get('check_out_date')
        const checkInTime = formData.get('check_in_time')
        const checkOutTime = formData.get('check_out_time')
        const roomId = formData.get('room_id')

        // Combine the date and time to ISO 8601 format
        const checkInDateTime = `${checkInDate}T${checkInTime}`;
        const checkOutDateTime = `${checkOutDate}T${checkOutTime}`;

        // Check if room is available
        const isAvailable = await checkRoomAvailability(roomId, 
            checkInDateTime, checkOutDateTime);

        if(!isAvailable){
            return{
                error: 'This room is already booked for the selected time'
            }
        }

        const bookingData = {
            check_in: checkInDateTime,
            check_out: checkOutDateTime,
            user_id: user.id,
            room_id: roomId
        }

        // create booking
        const newBooking = await databases.createDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
            ID.unique(),
            bookingData
        );

        // Revalidate cache
        revalidatePath('/bookings', 'layout');

        return{
            success: true
        }


    }
    catch(error){
        console.log('Failed to get book rooms', error);
        return{
            error: 'Oops, something went wrong while booking the room'
        } 
    }
}

export default bookRoom;