import { useBreakpoint } from "../pages/hooks/useBreakpoint.ts";
import Button from "./Button.jsx";
import {useState, useEffect, useRef} from "react";
import {useUser} from "../pages/context/UserContext.tsx"
import {useSafeSettings} from "../pages/hooks/useSafeSettings.ts"
import type{ScanData, FormData} from "../../functions/src/pdf/fillIdDataPdf.ts"
import {motion, LayoutGroup, AnimatePresence} from "motion/react";
import chargeCodes from "../data/ocga.json";
import type{PopUpProps} from "./PopUp.tsx";
import PopUp from "./PopUp.tsx";
export type ChargeCode = {charge: string, ocga: string};
import { getFunctions, httpsCallable } from "firebase/functions";
const functions = getFunctions(undefined, "us-central1");
const sendBookingPacket = httpsCallable(functions, "sendBookingPacket");
export type ServerUser = {firstName: string, lastName: string, badge: string};
export type BookingProps = { formState: FormData; setFormState: React.Dispatch<React.SetStateAction<FormData>>; setBuild: React.Dispatch<React.SetStateAction<boolean>>; createNotif: (res: boolean) => void; }



type ConfirmState = {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
};




export default function BookingForm({formState, setFormState, setBuild, createNotif}: BookingProps){ 
  const [chargeQuery, setChargeQuery] = useState<string[]>(Array(6).fill(""));
  const [chargeOptions, setChargeOptions] = useState<ChargeCode[][]>(Array(6).fill([]));
  const [chargeOpen, setChargeOpen] = useState<boolean[]>(Array(6).fill(false));
  const [submitting, setSubmitting] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const {primaryAccent, secondaryAccent} = useSafeSettings();
  const {user} = useUser();
  const inputStyle = "border-2 border-zinc-500 text-zinc-200 w-full  text-md 2xl:text-base bg-zinc-900 rounded-md 2xl:rounded-lg py-1 px-1.5 2xl:py-2 2xl:px-3 focus:border-[var(--accent)] focus:outline-none focus:ring-1 2xl:focus:ring-2 [--tw-ring-color:var(--accent)] focus:shadow-[0_0_10px_1px_var(--accent)] 2xl:focus:shadow-[0_0_15px_2px_var(--accent)]";
  const inputStyleXl = "border-2 border-zinc-500 text-zinc-200 w-full col-span-3 text-md 2xl:text-base bg-zinc-900 rounded-md 2xl:rounded-lg py-1 px-1.5 2xl:py-2 2xl:px-3 focus:border-[var(--accent)] focus:outline-none focus:ring-1 2xl:focus:ring-2 [--tw-ring-color:var(--accent)] focus:shadow-[0_0_10px_1px_var(--accent)] 2xl:focus:shadow-[0_0_15px_2px_var(--accent)]";
  const inputStyleLg =  "border-2 border-zinc-500 text-zinc-200 w-full col-span-2 text-md 2xl:text-base bg-zinc-900 rounded-md 2xl:rounded-lg py-1 px-1.5 2xl:py-2 2xl:px-3 focus:border-[var(--accent)] focus:outline-none focus:ring-1 2xl:focus:ring-2 [--tw-ring-color:var(--accent)] focus:shadow-[0_0_10px_1px_var(--accent)] 2xl:focus:shadow-[0_0_15px_2px_var(--accent)]";
  const inputStyle2xl = "border-2 border-zinc-500 text-zinc-200 w-full col-span-2 lg:col-span-4 text-md 2xl:text-base bg-zinc-900 rounded-md 2xl:rounded-lg py-1 px-1.5 2xl:py-2 2xl:px-3 focus:border-[var(--accent)] focus:outline-none focus:ring-1 2xl:focus:ring-2 [--tw-ring-color:var(--accent)] focus:shadow-[0_0_10px_1px_var(--accent)] 2xl:focus:shadow-[0_0_15px_2px_var(--accent)]";
  const allCharges = chargeCodes as ChargeCode[];
  const {lgUp} = useBreakpoint();
  function handleInput(e: React.ChangeEvent<HTMLInputElement> ) { const {name, value} = e.target; setFormState((prev) => ({...prev, [name]: value})); }

  const norm = (s: string) => (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const normOcga = (s: string) => (s ?? "").toLowerCase().replace(/\s+/g, "");

 
  function searchChargeCodes(
    allCharges: ChargeCode[],
    query: string,
    limit = 12
  ) {
    const raw = query.trim();

    if (!raw) return [];

    const qName = norm(raw);
    const qOcga = normOcga(raw);

    return allCharges
      .map((c) => {
        const name = norm(c.charge);

        const ocga = normOcga(c.ocga);

        let score = 0;
        if (ocga === qOcga) score += 1000;
        else if (ocga.startsWith(qOcga)) score += 700;
        else if (ocga.includes(qOcga)) score += 400;
        if (name.startsWith(qName)) score += 250;
        else if (name.includes(qName)) score += 150;
        return { c, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => x.c);
  }

  function handleChargeText(index: number, value: string) {
    setChargeQuery((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    const opts = searchChargeCodes(allCharges, value, 15);
    setChargeOptions((prev) => {
      const next = [...prev];
      next[index] = opts;
      return next;
    });
    setChargeOpen((prev) => {
      const next = [...prev];
      next[index] = value.trim().length > 0 && opts.length > 0;
      return next;
    });
    setFormState((prev) => {
      const nextCharges = [...prev.charge];
      nextCharges[index] = { ...nextCharges[index], charge: value };
      return { ...prev, charge: nextCharges };
    });
  }

  function handleChargeField(
    index: number,
    field: "chargeType" | "chargeNum",
    value: string
  ) {
    setFormState((prev) => {
      const nextCharges = [...prev.charge];
      nextCharges[index] = { ...nextCharges[index], [field]: value };
      return { ...prev, charge: nextCharges };
    });
  }

  function selectCharge(index: number, selected: ChargeCode) {
    const combined = `${selected.charge} ${selected.ocga}`;
    setFormState((prev) => {
      const nextCharges = [...prev.charge];
      nextCharges[index] = { ...nextCharges[index], charge: combined };
      return { ...prev, charge: nextCharges };
    });
    setChargeQuery((prev) => {
      const next = [...prev];
      next[index] = combined;
      return next;
    });
    setChargeOpen((prev) => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  }
    
  function handleCheckbox(e: React.ChangeEvent<HTMLInputElement>){
    const {name, checked} = e.target;
    setFormState((prev) => ({...prev, [name]: checked}));
  }



  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault?.();
    if (submitting) return;

    setConfirm({
      title: "Ready to send?",
      message: "Make sure everything is correct before sending.",
      confirmText: "Send",
      cancelText: "Cancel",
      onConfirm: () => doSubmit(),
    });
  }

  async function doSubmit() {
    // close modal immediately so it feels responsive
    setConfirm(null);

    if (!user) {
      console.error("No user in context");
      return;
    }

    setSubmitting(true);

    const u = {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      badge: user.badge ?? "",
    };

    try {
      const resp = await sendBookingPacket({
        emails: ["intake@pickensgasheriff.com", user.email],
        formData: formState,
        u,
      });

      console.log("sendBookingPacket ok:", resp.data);

      setFormState({} as FormData);
      setBuild(false);
      createNotif(true);
    } catch (err) {
      console.error("sendBookingPacket failed:", err);
      createNotif(false);
      // allow retry
      setSubmitting(false);
    }
  }
  
 
  

  
   

  return(
    <motion.div id="panel" style={{borderColor: primaryAccent}} className="relative w-full h-full overflow-auto p-2 lg:p-4 flex items-center justify-center border rounded-lg">
      
        <AnimatePresence>
          {confirm && (
            <motion.div
              className="absolute inset-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* backdrop */}
              <motion.button
                type="button"
                className="absolute inset-0 w-full min-h-screen bg-black/60"
                aria-label="Close dialog"
                onClick={() => setConfirm(null)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              {/* dialog */}
              <motion.div
                style={{ borderColor: primaryAccent }}
                className="relative w-[92%] max-w-lg rounded-xl border bg-zinc-950 p-4 shadow-2xl"
                initial={{ scale: 0.96, y: 10, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.98, y: 8, opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <div className="text-zinc-100 text-lg font-semibold">
                  {confirm.title}
                </div>

                {confirm.message && (
                  <div className="mt-2 text-sm text-zinc-300">
                    {confirm.message}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    text={confirm.cancelText ?? "Cancel"}
                    color={`${secondaryAccent}90`}
                    action={() => setConfirm(null)}
                  />
                  <Button
                    type="button"
                    text={submitting ? "Sending..." : (confirm.confirmText ?? "Send")}
                    disabled={submitting}
                    color={primaryAccent}
                    action={confirm.onConfirm}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      <LayoutGroup>
      <motion.form className="lg:w-2/3 w-full min-h-dvh lg:h-full  grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
        <div className=" flex items-center justify-center text-2xl text-zinc-200 lg:pt-8 font-semibold">Pre-Bookin</div>
        <motion.div className="grid grid-cols-2 lg:grid-cols-4 h-full gap-2">
          <motion.input value={formState.arrestingAgency} placeholder="Arresting Agency" name="arrestingAgency" onChange={handleInput} className={inputStyle} />
          <motion.input value={formState.incidentNumber} placeholder="Incident Number" name="incidentNumber" onChange={handleInput} className={inputStyle} />
          <div className="flex items-center col-span-2 w-full justify-center gap-2">
            <div className="flex flex-col lg:flex-row items-center justify-center w-full gap-1">
              <div className="font-semibold">Date:</div>
              <motion.input type="date" value={formState.arrestDate} placeholder="Arrest Date" name="arrestDate" onChange={handleInput} className={inputStyle} />
            </div>
            <div className="flex flex-col lg:flex-row items-center jusitfy-center w-full gap-1">
              <div className="font-semibold">Time:</div>
              <motion.input type="time" step={60} value={formState.arrestTime} placeholder="Arrest Time" name="arrestTime" onChange={handleInput} className={inputStyle} />
            </div>
          </div>
          <motion.input value={formState.loa} placeholder="Location of Arrest" name="loa" onChange={handleInput} className={inputStyle2xl} />
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 w-full gap-2">
          <motion.input value={formState.lastName} placeholder="Inmate Last Name" name="lastName" onChange={handleInput} className={inputStyle} />
          <motion.input value={formState.firstName} placeholder="Inmate First Name" name="firstName" onChange={handleInput} className={inputStyle} />
          <motion.input value={formState.middleName} placeholder="Inmate Middle Name" name="middleName" onChange={handleInput} className={inputStyle} />
          <motion.input value={formState.race} placeholder="Race" name="race" onChange={handleInput} className={inputStyle} />
          <motion.input value={formState.sex} placeholder="Sex" name="sex" onChange={handleInput} className={inputStyle} />
          <motion.input value={formState.height} placeholder="Height" name="height" onChange={handleInput} className={inputStyle} />
          <motion.input value={formState.weight} placeholder="Weight" name="weight" onChange={handleInput} className={inputStyle} />
          <motion.input value={formState.hairColor} placeholder="Hair Color" name="hairColor" onChange={handleInput} className={inputStyle} />
          <motion.input value={formState.eyeColor} placeholder="Eye Color" name="eyeColor" onChange={handleInput} className={inputStyle} />
          <motion.input value={formState.dob} placeholder="DOB" name="dob" onChange={handleInput} className={inputStyle} />
          <motion.input value={formState.social} placeholder="SSN" name="social" onChange={handleInput} className={inputStyle} />
          <motion.input value={formState.oln} placeholder="OLN" name="oln" onChange={handleInput} className={inputStyle} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          <motion.input value={formState.street} placeholder="Street" name="street" onChange={handleInput} className={inputStyleLg} />
          <motion.input value={formState.city} placeholder="City" name="city" onChange={handleInput} className={inputStyle} />
          <motion.input value={formState.state} placeholder="State" name="state" onChange={handleInput} className={inputStyle} />
          <motion.input value={formState.zip} placeholder="Zipcode" name="zip" onChange={handleInput} className={inputStyle} />
          <motion.input value={formState.phoneNumber} placeholder="Phone Number" name="phoneNumber" onChange={handleInput} className={inputStyle} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 w-full">
          <CheckboxCard
            primaryAccent={primaryAccent}
            label="Victim Notification"
            danger
            name="victimNotif"
            checked={!!formState.victimNotif}
            onChange={handleCheckbox}
          />

          <CheckboxCard
            primaryAccent={primaryAccent}
            label="Inmate has been in accident"
            name="accident"
            dange={false}
            checked={!!formState.accident}
            onChange={handleCheckbox}
          />

          <CheckboxCard
            primaryAccent={primaryAccent}
            label="Use of Force used during arrest?"
            name="uof"
              danger={false}
            checked={!!formState.uof}
            onChange={handleCheckbox}
          />

          <CheckboxCard
            primaryAccent={primaryAccent}
            label="Is inmate suicidal?"
            name="suicide"
            danger={false}
            checked={!!formState.suicide}
            onChange={handleCheckbox}
          />

          <CheckboxCard
            primaryAccent={primaryAccent}
            label="Cleared by medical professional?"
            name="medicallyClear"
            danger={false}
            checked={!!formState.medicallyClear}
            onChange={handleCheckbox}
          />
        </div>
          <AnimatePresence mode="wait" initial={false}>
        {(!!formState.accident || !!formState.uof) && <motion.div key="extra-fields" layout initial={{ opacity: 0, height: 0, y: -6 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0, y: -6 }} transition={{ duration: 0.18, ease: "easeOut" }} className="flex lg:flex-row flex-col items-center justify-center gap-2">
          <AnimatePresence mode="popLayout" initial={false}>
          {!!formState.accident && (
            <motion.input
              key="accidentType"
              layout
              initial={{ opacity: 0, x: -12, y: -4 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: -12, y: -4 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className={inputStyle}
              value={formState.accidentType}
              placeholder="Type of accident"
              name="accidentType"
              onChange={handleInput}
            />
          )}
          {!!formState.uof && (
            <motion.input
              key="uofType"
              layout
              initial={{ opacity: 0, x: 12, y: -4 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 12, y: -4 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className={inputStyle}
              value={formState.uofType}
              placeholder="Type of force used"
              name="uofType"
              onChange={handleInput}
            />
          )}
        </AnimatePresence>        
              
        </motion.div>}
        </AnimatePresence>
        <motion.div layout className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.input value={formState.arrestingOfficer} placeholder="Arresting Officer" name="arrestingOfficer" onChange={handleInput} className={lgUp ? inputStyle : inputStyleLg} />
          <motion.input value={formState.arrestingOfficerBadge} placeholder="Badge" name="arrestingOfficerBadge" onChange={handleInput} className={inputStyle} />
          <motion.input value={formState.arrestingOfficerAgency} placeholder="Agency" name="arrestingOfficerAgency" onChange={handleInput} className={inputStyle} />
          <motion.input value={formState.transportingOfficer} placeholder="Transporting Officer (If different from arresting)" name="transportingOfficer" onChange={handleInput} className={lgUp ? inputStyle : inputStyleLg} />
          <motion.input value={formState.transportingOfficerBadge} placeholder="Badge" name="transportingOfficerBadge" onChange={handleInput} className={inputStyle} />
          <motion.input value={formState.transportingOfficerAgency} placeholder="Agency" name="transportingOfficerAgency" onChange={handleInput} className={inputStyle} />
        </motion.div>

        {Array.from({length: 6}).map((_, i) => (
          <motion.div layout key={i} style={{borderColor: primaryAccent}} className="grid border rounded-md p-2 grid-cols-2 lg:grid-cols-5 gap-2 relative">
            <div className="col-span-2 lg:col-span-3 relative">
              <input value={chargeQuery[i] ?? formState?.charge?.[i]?.charge ?? ""} placeholder="Charge / OCGA" onChange={(e) => handleChargeText(i, e.target.value)} onFocus={() => { const q = chargeQuery[i] ?? formState?.charge?.[i]?.charge ?? ""; const opts = searchChargeCodes(allCharges, q, 15); setChargeOptions((p) => { const n = [...p]; n[i] = opts; return n; }); setChargeOpen((p) => { const n = [...p]; n[i] = q.trim().length > 0 && opts.length > 0; return n; }); }} onBlur={() => { setTimeout(() => { setChargeOpen((p) => { const n = [...p]; n[i] = false; return n; }); }, 120); }} className={inputStyleLg} />
              {chargeOpen[i] && (chargeOptions[i]?.length ?? 0) > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 shadow-lg"><div className="max-h-64 overflow-y-auto">{chargeOptions[i].map((c) => (<button key={`${c.ocga}-${c.charge}`} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => selectCharge(i, c)} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-800"><div className="text-zinc-100">{c.charge}</div><div className="text-xs text-zinc-400">{c.ocga}</div></button>))}</div></div>
              )}
            </div>
            <select value={formState?.charge?.[i]?.chargeType ?? ""} onChange={(e) => handleChargeField(i, "chargeType", e.target.value)} className={inputStyle}><option value="">Type</option><option value="F">F</option><option value="M">M</option></select>
            <input value={formState?.charge?.[i]?.chargeNum ?? ""} placeholder="Warrant / Citation Number" onChange={(e) => handleChargeField(i, "chargeNum", e.target.value)} className={inputStyle} />
          </motion.div>
        ))}
        <motion.div layout className="pb-4">
        <Button text="Submit" disabled={submitting} type="submit" color={submitting ? `${primaryAccent}90` : primaryAccent} action={() => {}} />
        </motion.div>
      </motion.form>
      </LayoutGroup>
    </motion.div>
  );
}



function CheckboxCard({ primaryAccent, label, danger, name, checked, onChange }) {
  return (
    <label
      htmlFor={name}
      style={{ borderColor: primaryAccent }}
      className="w-full rounded-md border lg:border-none px-3 py-2
                 flex flex-col items-center justify-center gap-2
                 select-none cursor-pointer"
    >
      <div className={`text-center text-xs leading-snug ${danger ? "text-red-500" : "text-zinc-200"}`}>
        {label}
      </div>

      {/* Control row (centered reliably on iPhone) */}
      <div className="flex items-center justify-center w-full">
        {/* Hide native checkbox but keep it accessible */}
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />

        {/* Custom checkbox UI */}
        <span
          aria-hidden="true"
          style={{
            borderColor: primaryAccent,
            backgroundColor: checked ? primaryAccent : "transparent",
          }}
          className="h-6 w-6 rounded-md border flex items-center justify-center transition"
        >
          {/* checkmark */}
          <span
            className={`h-3 w-3 rotate-45 border-r-2 border-b-2 transition ${
              checked ? "opacity-100" : "opacity-0"
            }`}
            style={{ borderColor: "#09090b" }}
          />
        </span>
      </div>
    </label>
  );
}





