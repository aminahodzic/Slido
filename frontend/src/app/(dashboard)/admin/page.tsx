import UserCards from "@/components/UserCard";
import UserList from "@/components/UserList";
import Predavaci from "@/components/Predavaci";
import MyProfile from "@/components/MyProfile";
import ZabranjeneRijeci from "@/components/ZabranjeneRijeci";

const AdminPage = () => {
  return (
    <div className="flex flex-col w-screen h-screen p-4 gap-4 min-w-[320px] flex-wrap-nowrap">
      {/* Gornji dio sa UserCards */}
      <UserCards />

      {/* Donji dio sa DataGrid-om */}
      <div className="flex-1 w-full min-w-[320px]">
        <UserList />
        <div id="my-profile"> {/* Dodaj ID za navigaciju */}
          <MyProfile />
        </div>
        <Predavaci/>
        <ZabranjeneRijeci/>
      </div>
    </div>
  );
};

export default AdminPage;
