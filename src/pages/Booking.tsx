import LicenseScanner from "../components/LicenseScanner.jsx"
import BookingForm from "../components/BookingForm.tsx";
import {useState, useEffect} from "react";
import {useUser} from "./context/UserContext.tsx";
import { useSafeSettings } from "./hooks/useSafeSettings.ts";
import type{FormData, ScanData} from "../helpers/fillIdDataPdf.ts"
import PopUp from "../components/PopUp.tsx";
import type{PopUpProps} from "../components/PopUp.tsx";

export default function Booking() {
  const [formData, setFormData] = useState<FormData>({});
  const [scanData, setScanData] = useState<ScanData>({});
  const [built, setBuilt] = useState(false);
  const [notif, setNotif] = useState<PopUpProps | null>(null)
  const {user} = useUser();

  function buildForm(data: ScanData) {
    if (!user) return;
    setScanData(data);
    const deputyName = `${user.lastName}, ${user.firstName[0]}`;
    const badge = user.badge;
    const form: FormData = {
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      middleName: data.middleName ?? "",
      dob: data.dob ?? "",
      hairColor: data.hairColor ?? "",
      weight: data.weight ?? "",
      height: data.height ?? "",
      eyeColor: data.eyeColor ?? "",
      sex: data.sex ?? "",
      race: data.race ?? "",
      oln: data.licenseNumber ?? "",
      street: data.street ?? "",
      city: data.city ?? "",
      state: data.state ?? "",
      zip: data.zip ?? "",
      arrestingAgency: "PSO",
      incidentNumber: "",
      loa: "",
      arrestDate: "",
      arrestTime: "",
      social: "",
      phoneNumber: "",
      victimNotif: false,
      accident: false,
      accidentType: "",
      medicallyClear: false,
      uof: false,
      uofType: "",
      arrestingOfficer: deputyName,
      arrestingOfficerAgency: "PSO",
      arrestingOfficerBadge: badge,
      transportingOfficer: "",
      transportingOfficerAgency: "",
      transportingOfficerBadge: "",
      intakeDeputy: "",
      intakeDeputyBadge: "",
      charge: Array.from({ length: 6 }, () => ({
        charge: "",
        chargeType: "",
        chargeNum: "",
      }))
      } 
    
    setFormData(form);
    setBuilt(true);
    
  }

  function closePopup() {
    setNotif(null);
  }

  function createPopup(success: boolean){
    const message: PopUpProps = success ?  {
      title: "Success",
      message: "Forms completed and send",
      location: "top-center",
      onClose: closePopup,
      timer: 3,
    } : {
        title: "Oops!",
        message: "Something went wrong, try again.",
        location: "top-center",
        onClose: closePopup,
        timer: 3,
      }

    setNotif(message);

  }
  
 
  
  return (
    <div className="relative w-full min-h-dvh lg:h-full p-2 lg:p-4">
    {notif && <PopUp title={notif.title} message={notif.message} location={notif.location} onClose={notif.onClose} timer={notif.timer} />}
    {!built ? <LicenseScanner handleSubmit={buildForm} /> : <BookingForm formState={formData} setFormState={setFormData} createNotif={createPopup} setBuild={setBuilt} />}
    </div>)
}








