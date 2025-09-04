import Predavanje from "@/components/Predavanje";
import Menu from "@/components/Menu";
import UploadCover from "@/components/UploadCover";
import PredavanjeList from "@/components/PredavanjeList";
import SkrivenaPitanjaList from "@/components/SkrivenaPitanjaList";
import SvaPitanja from "@/components/SvaPitanja";
import StatistikaPitanja from "@/components/StatistikaPitanja";
import PosaljiSvima from "@/components/PosaljiSvima";

const PredavacPage =() =>{
    return(
        <div>
        <Predavanje/>
        <UploadCover/>
        <PredavanjeList/>
        <SkrivenaPitanjaList />
        <SvaPitanja />
        <StatistikaPitanja/>
        <PosaljiSvima/>
     
        </div>
    )
}
export default PredavacPage;
