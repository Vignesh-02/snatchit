// creating middleware using Next.js
import { NextResponse } from "next/server";
import checkAuth from "./app/actions/checkAuth";

export async function middleware(request) {
    const {isAuthenticated} = await checkAuth();

    // if you are not authenticated go to login
    if (!isAuthenticated){
        return NextResponse.redirect(new URL('/login',request.url))
    }


    return NextResponse.next();
}


// This middleware will only run for /login now
export const config = {
    matcher: ['/bookings', '/rooms/add', '/rooms/my'],
}