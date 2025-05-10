import Heading from "@/components/Heading";
import MyRoomCard from "@/components/MyRoomCard";
import getMyRooms from "@/app/actions/getMyRooms";

const MyRoomsPage = async () => {
    const rooms = await getMyRooms();

    console.log('rooms',rooms)
    return  ( <>
        <Heading title = "My Room" />
        { rooms.length > 0 ? (
            rooms.map((room) => <MyRoomCard key={room.$id} room={room}/>)
        ) : (
            <p>You have no room listings</p>
        ) }
     </>
     )  
}
 
export default MyRoomsPage;