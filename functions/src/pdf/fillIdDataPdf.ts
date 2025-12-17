 
import { PDFDocument } from "pdf-lib";
import { readFile } from "node:fs/promises";
import path from "node:path";

export type Charge = { charge: string; chargeType: string; chargeNum: string };

export interface FormData {
  firstName: string;
  lastName: string;
  middleName: string;
  dob: string;
  hairColor: string;
  weight: string;
  height: string;
  eyeColor: string;
  sex: string;
  race: string;
  oln?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  arrestingAgency: string;
  incidentNumber: string;
  loa: string;
  arrestDate: string;
  arrestTime: string;
  social?: string;
  phoneNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleColor?: string;
  vehicleVin?: string;
  vehicleTag?: string;
  arrestingOfficer: string;
  arrestingOfficerAgency: string;
  arrestingOfficerBadge: string;
  transportingOfficer?: string;
  transportingOfficerAgency?: string;
  transportingOfficerBadge?: string;
  intakeDeputy?: string;
  intakeDeputyBadge?: string;
  victimNotif?: boolean;
  accident?: boolean;
  accidentType?: string;
  uof?: boolean;
  uofType?: string;
  suicide?: boolean;
  medicallyClear?: boolean;
  charge?: Charge[];
}

export type ServerUser = {
  firstName: string;
  lastName: string;
  badge: string | number;
};

function templatePath(filename: string) {
  // When deployed, __dirname will be functions/lib/pdf (after TS build)
  // so templates should be alongside it under ./templates
  return path.join(__dirname, "templates", filename);
}

async function loadTemplateBytes(filename: string): Promise<Uint8Array> {
  const p = templatePath(filename);
  const buf = await readFile(p);
  return new Uint8Array(buf);
}

// ✅ Booking PDF -> returns bytes (Uint8Array)
export async function fillBookingPdfBytes(form: FormData, user: ServerUser) {
  const templateBytes = await loadTemplateBytes("preBookFillable.pdf");

  const total = ["One", "Two", "Three", "Four", "Five", "Six"];

  const pdfDoc = await PDFDocument.load(templateBytes);
  const pdf = pdfDoc.getForm();

  pdf.getTextField("firstName").setText(form.firstName ?? "");
  pdf.getTextField("lastName").setText(form.lastName ?? "");
  pdf.getTextField("middleName").setText(form.middleName ?? "");
  pdf.getTextField("arrestingAgency").setText(form.arrestingAgency ?? "");
  pdf.getTextField("incidentNumber").setText(form.incidentNumber ?? "");
  pdf.getTextField("arrestDate").setText(form.arrestDate ?? "");
  pdf.getTextField("arrestTime").setText(form.arrestTime ?? "");

  pdf.getTextField("victimYes").setText(form.victimNotif ? "X" : "");
  pdf.getTextField("victimNo").setText(form.victimNotif ? "" : "X");

  pdf.getTextField("accidentYes").setText(form.accident ? "X" : "");
  pdf.getTextField("accidentNo").setText(form.accident ? "" : "X");
  pdf.getTextField("accidentType").setText(form.accidentType ?? "");

  pdf.getTextField("uofYes").setText(form.uof ? "X" : "");
  pdf.getTextField("uofNo").setText(form.uof ? "" : "X");
  pdf.getTextField("uofType").setText(form.uofType ?? "");

  pdf.getTextField("suicideYes").setText(form.suicide ? "X" : "");
  pdf.getTextField("suicideNo").setText(form.suicide ? "" : "X");

  pdf.getTextField("medClearYes").setText(form.medicallyClear ? "X" : "");
  pdf.getTextField("medClearNo").setText(form.medicallyClear ? "" : "X");

  const charges = form.charge ?? [];
  for (let i = 0; i < Math.min(charges.length, 6); i++) {
    const chargeField = `charge${total[i]}`;
    const chargeTypeField = `chargeType${total[i]}`;
    const chargeNumField = `chargeNum${total[i]}`;

    pdf.getTextField(chargeField).setText(charges[i].charge ?? "");

    // ✅ FIX: you had these swapped
    pdf.getTextField(chargeTypeField).setText(charges[i].chargeType ?? "");
    pdf.getTextField(chargeNumField).setText(charges[i].chargeNum ?? "");
  }

  pdf.getTextField("arrestingOfficer").setText(form.arrestingOfficer ?? "");
  pdf.getTextField("arrestingOfficerBadge").setText(String(form.arrestingOfficerBadge ?? ""));
  pdf.getTextField("arrestingOfficerAgency").setText(form.arrestingOfficerAgency ?? "");

  pdf.getTextField("transportingOfficer").setText(form.transportingOfficer ?? "");
  pdf.getTextField("transportingOfficerBadge").setText(String(form.transportingOfficerBadge ?? ""));
  pdf.getTextField("transportingOfficerAgency").setText(form.transportingOfficerAgency ?? "");

  // optionally lock fields:
  // pdf.flatten();

  return await pdfDoc.save(); // Uint8Array
}

// ✅ ID Data PDF -> returns bytes (Uint8Array)
export async function fillIdDataPdfBytes(form: FormData, user: ServerUser) {
  const templateBytes = await loadTemplateBytes("idDataFillable.pdf");

  const pdfDoc = await PDFDocument.load(templateBytes);
  const f = pdfDoc.getForm();

  f.getTextField("firstName").setText(form.firstName ?? "");
  f.getTextField("lastName").setText(form.lastName ?? "");
  f.getTextField("middleName").setText(form.middleName ?? "");
  f.getTextField("incidentNumber").setText(form.incidentNumber ?? "");

  f.getTextField("arrestingAgency").setText(form.arrestingAgency ?? "PSO");
  f.getTextField("loa").setText(form.loa ?? "");
  f.getTextField("arrestDate").setText(form.arrestDate ?? "");
  f.getTextField("arrestTime").setText(form.arrestTime ?? "");

  f.getTextField("sex").setText(form.sex ?? "");
  f.getTextField("race").setText(form.race ?? "");
  f.getTextField("height").setText(form.height ?? "");
  f.getTextField("weight").setText(form.weight ?? "");
  f.getTextField("hair").setText(form.hairColor ?? "");
  f.getTextField("eyes").setText(form.eyeColor ?? "");
  f.getTextField("dob").setText(form.dob ?? "");
  f.getTextField("oln").setText(form.oln ?? "");
  f.getTextField("social").setText(form.social ?? "");

  f.getTextField("address").setText(form.street ?? "");
  f.getTextField("city").setText(form.city ?? "");
  f.getTextField("state").setText(form.state ?? "");
  f.getTextField("zip").setText(form.zip ?? "");
  f.getTextField("phoneNumber").setText(form.phoneNumber ?? "");

  f.getTextField("arrestingOfficer").setText(form.arrestingOfficer ?? "");
  f.getTextField("arrestingOfficerAgency").setText(form.arrestingOfficerAgency ?? "");
  f.getTextField("arrestingBadge").setText(String(form.arrestingOfficerBadge ?? ""));

  f.getTextField("transportOfficer").setText(form.transportingOfficer ?? "");
  f.getTextField("transportOfficerBadge").setText(String(form.transportingOfficerBadge ?? ""));
  f.getTextField("transportOfficerAgency").setText(form.transportingOfficerAgency ?? "");

  // f.flatten();

  return await pdfDoc.save(); // Uint8Array
}
