'use server';

import { createSessionClient  } from "@/config/appwrite";
import { cookies } from "next/headers";
import { Query  } from "node-appwrite";
import { redirect } from "next/navigation";
import { DateTime } from "luxon";
import { PT_Mono } from "next/font/google";


// Convert a date string to a Luxon Datetime object in utc
function toUTCDateTime(dateString){
    return DateTime.fromISO(dateString, {zone: 'utc'}).toUTC();
}

// check for overlapping date ranges
// IF IT IS TRUE THEN THERE IS AN OVERLAP
function dateRangesOverlap(checkInA, checkOutA, checkInB, checkOutB){
    return checkInA < checkOutB && checkOutA > checkOutB
}

// if checkInA > checkoutB, then it is not an issue and user can book 

// B is the one already there in the booking
// A is the one the user is about to book
// A - 1PM
// A - 3PM

// B - 2PM
// B - 5PM

// if we add a new room, we want that new room to be displayed
// for this reason, we use revalidatepath
async function  checkRoomAvailability(roomId, checkIn, checkOut) {
    const sessionCookie = cookies().get('appwrite-session');

    if(!sessionCookie){
        redirect('/login');
    }
     
    try{
        // getting the database function
        const { databases } = await createSessionClient(sessionCookie.value);

        const checkInDateTime = toUTCDateTime(checkIn);
        const checkOutDateTime = toUTCDateTime(checkOut);

        // Fetch all bookings for a giver room
        const { documents: bookings } = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE, process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS, 
            [Query.equal('room_id', roomId)]  
        );

        // loop over the bookings and check for overlaps
        for (const booking of bookings){

            // these are the dates in the database already
            const bookingCheckInDateTime = toUTCDateTime(booking.check_in)
            const bookingCheckOutDateTime = toUTCDateTime(booking.check_out)

            if(dateRangesOverlap(
                checkInDateTime,
                checkOutDateTime,
                bookingCheckInDateTime,
                bookingCheckOutDateTime
            )){
                return false; // Overlap found, do not book
            }

        }
    
       // No overlap found
       return true;
    }
    catch(error){
        console.log('Failed to check availability', error);
        return {
            error: 'Failed to check availability'
        } 
    }
}

export default checkRoomAvailability;