'use server'
import { createSessionClient  } from "@/config/appwrite"
import { cookies } from "next/headers"

async function destroySession() {
    //Retrieve the session cookie

    const sessionCookie = cookies().get('appwrite-session')

    if (!sessionCookie){
        return {
            error: 'No session cookie found'
        }
    }

    try{
        const { account } = await createSessionClient(sessionCookie.value)

        //Delete current session
        // console.log('acccount', account)
        await account.deleteSession('current');

        // Clear session cookie
        cookies().delete('appwrite-session');

        return {
            success: true,
        };
    } catch(error){
        console.log(error)
        return{
            error: "error deleting session cookie"
        }
    }
    
}

export default destroySession