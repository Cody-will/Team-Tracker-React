import { useEffect, useRef, useState } from "react";
import { BrowserPDF417Reader } from "@zxing/browser";
import { motion, AnimatePresence } from "motion/react";
import { useSafeSettings } from "../pages/hooks/useSafeSettings";

function parseAAMVA(data) {
  const get = (code) => {
    const re = new RegExp(code + "([^\\n\\r]+)");
    const match = data.match(re);
    return match ? match[1].trim() : "";
  };

  const dobRaw = get("DBB");
  const formatDate = (raw) => {
    if (!raw || raw.length !== 8) return raw || "";
    const y = raw.slice(4, 8);
    const m = raw.slice(0, 2);
    const d = raw.slice(2, 4);
    return `${m}/${d}/${y}`;
  };

  const normalizeSex = (s) => {
    const v = (s || "").trim().toUpperCase();
    if (v === "1") return "M";
    if (v === "2") return "F";
    if (v === "9") return "X";
    return v;
  };

  const normalizeHeight = (h) => {
  const raw = (h || "").trim().toUpperCase();
  if (!raw) return "";

  // Grab just the number part (keeps leading zeros)
  const numMatch = raw.match(/(\d{2,3})/);
  const nStr = numMatch ? numMatch[1] : "";
  const n = nStr ? parseInt(nStr, 10) : NaN;
  if (!Number.isFinite(n)) return raw;

  const hasIN = /\bIN\b/.test(raw);
  const hasCM = /\bCM\b/.test(raw);

  // If it's explicitly inches, treat as total inches
  if (hasIN) {
    const ft = Math.floor(n / 12);
    const inch = n % 12;
    return `${ft}'${String(inch).padStart(2, "0")}"`;
  }

  // If it's explicitly cm, you can keep it or convert
  if (hasCM) {
    // convert cm -> inches -> ft/in
    const totalIn = Math.round(n / 2.54);
    const ft = Math.floor(totalIn / 12);
    const inch = totalIn % 12;
    return `${ft}'${String(inch).padStart(2, "0")}"`;
    // or: return `${n} CM`;
  }

  // No unit given:
  // If it looks like feet+inches packed (first digit feet, last 2 digits 00-11), treat it that way.
  if (/^\d{3}$/.test(nStr)) {
    const feet = parseInt(nStr[0], 10);
    const inches = parseInt(nStr.slice(1), 10);

    if (inches >= 0 && inches <= 11 && feet >= 3 && feet <= 8) {
      return `${feet}'${String(inches).padStart(2, "0")}"`;
    }

    // Otherwise assume it's total inches (e.g., 079)
    const ft = Math.floor(n / 12);
    const inch = n % 12;
    return `${ft}'${String(inch).padStart(2, "0")}"`;
  }

  return raw;
};

  const normalizeWeight = (w) => (w || "").trim().replace("/", "");
  const normalizeRace = (r) => (r || "").trim();

  return {
    firstName: get("DAC"),
    middleName: get("DAD"),
    lastName: get("DCS"),
    street: get("DAG"),
    city: get("DAI"),
    state: get("DAJ"),
    zip: get("DAK"),
    dob: formatDate(dobRaw),
    licenseNumber: get("DAQ"),
    eyeColor: get("DAY"),
    sex: normalizeSex(get("DBC")),
    height: normalizeHeight(get("DAU")),
    weight: normalizeWeight(get("DAW")),
    race: normalizeRace(get("DCL")),
  };
}

export default function LicenseScanner({ handleSubmit }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const readerRef = useRef(null);
  const nextTimerRef = useRef(null);

  const { primaryAccent, secondaryAccent } = useSafeSettings();

  const [status, setStatus] = useState("Ready. Tap Start Camera.");
  const [phase, setPhase] = useState("idle"); // idle | ready | working | success | failed
  const [busy, setBusy] = useState(false);

  const [cameraOn, setCameraOn] = useState(false);

  // torch
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  // subtle “photo taken” feedback
  const [flashTaken, setFlashTaken] = useState(false);

  useEffect(() => {
    readerRef.current = new BrowserPDF417Reader();
    return () => {
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
      stopCamera(); // ✅ stop on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera() {
    try {
      setBusy(true);
      setPhase("working");
      setStatus("Requesting camera access…");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      const video = videoRef.current;
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      await video.play();

      // torch capability (must be checked after stream is live)
      const [track] = stream.getVideoTracks();
      const caps = track?.getCapabilities?.();
      const torchOk = !!caps?.torch;
      setTorchSupported(torchOk);
      setTorchOn(false);

      setCameraOn(true);
      setBusy(false);
      setPhase("ready");
      setStatus("Fill the frame with the barcode, then tap Take Picture & Decode.");
    } catch (err) {
      console.error(err);
      setBusy(false);
      setPhase("failed");
      setStatus("Failed to start camera. Check permissions and try again.");
      setCameraOn(false);
      setTorchSupported(false);
      setTorchOn(false);
    }
  }

  function stopCamera() {
    setCameraOn(false);
    setTorchSupported(false);
    setTorchOn(false);

    const video = videoRef.current;
    if (video && video.srcObject instanceof MediaStream) {
      video.srcObject.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
  }

  async function toggleTorch() {
    try {
      const video = videoRef.current;
      const stream = video?.srcObject;
      if (!(stream instanceof MediaStream)) return;

      const [track] = stream.getVideoTracks();
      if (!track?.applyConstraints) return;

      const next = !torchOn;
      await track.applyConstraints({ advanced: [{ torch: next }] });
      setTorchOn(next);
    } catch (err) {
      console.warn("Torch failed:", err);
      setTorchSupported(false);
      setTorchOn(false);
      setPhase("failed");
      setStatus("Torch not available on this device/browser.");
    }
  }

  function preprocessToGrayscaleContrast(ctx, w, h) {
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;

    const contrast = 1.35;
    const intercept = 128 * (1 - contrast);

    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      let y = 0.299 * r + 0.587 * g + 0.114 * b;
      y = y * contrast + intercept;
      y = Math.max(0, Math.min(255, y));
      d[i] = d[i + 1] = d[i + 2] = y;
    }
    ctx.putImageData(img, 0, 0);
  }

  async function decodeCanvasOnce(canvas) {
    return readerRef.current.decodeFromCanvas(canvas);
  }

  async function takePictureAndDecode() {
    if (!cameraOn || busy) return;

    setFlashTaken(true);
    setTimeout(() => setFlashTaken(false), 180);

    try {
      setBusy(true);
      setPhase("working");
      setStatus("Capturing image…");

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) {
        setBusy(false);
        setPhase("ready");
        setStatus("Camera not ready yet. Try again.");
        return;
      }

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) {
        setBusy(false);
        setPhase("ready");
        setStatus("Video not ready yet. Try again.");
        return;
      }

      const attempts = [
        { name: "full", sx: 0, sy: 0, sw: vw, sh: vh },
        {
          name: "centerCrop",
          sx: Math.floor(vw * 0.15),
          sy: Math.floor(vh * 0.15),
          sw: Math.floor(vw * 0.7),
          sh: Math.floor(vh * 0.7),
        },
      ];

      for (const a of attempts) {
        canvas.width = a.sw;
        canvas.height = a.sh;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(video, a.sx, a.sy, a.sw, a.sh, 0, 0, a.sw, a.sh);

        setStatus(`Decoding (${a.name})…`);
        try {
          const result = await decodeCanvasOnce(canvas);
          const parsed = parseAAMVA(result.getText());

          // ✅ success: stop camera immediately, then advance after a short delay
          stopCamera();
          setBusy(false);
          setPhase("success");
          setStatus("Success! Building the form…");
          nextTimerRef.current = setTimeout(() => handleSubmit(parsed), 650);
          return;
        } catch (_) {
          // ignore and try enhanced
        }

        preprocessToGrayscaleContrast(ctx, a.sw, a.sh);

        try {
          const result2 = await decodeCanvasOnce(canvas);
          const parsed2 = parseAAMVA(result2.getText());

          stopCamera();
          setBusy(false);
          setPhase("success");
          setStatus("Success! Building the form…");
          nextTimerRef.current = setTimeout(() => handleSubmit(parsed2), 650);
          return;
        } catch (_) {
          // ignore
        }
      }

      setBusy(false);
      setPhase("failed");
      setStatus("Try again: more light, less glare, fill the frame with the barcode.");
    } catch (err) {
      console.error(err);
      setBusy(false);
      setPhase("failed");
      setStatus("Decode failed. Try again with more light / less glare.");
    }
  }

  function handleSkip() {
    stopCamera();
    handleSubmit({});
  }

  const panelBorder = { borderColor: primaryAccent };
  const primaryBtn = { backgroundColor: primaryAccent, color: "#09090b" };
  const secondaryBtn = { backgroundColor: secondaryAccent, color: "#09090b" };

  const showSideButtons = cameraOn;
  const primaryWidthClass = showSideButtons ? "flex-1" : "w-full";

  return (
    <div id="panel" style={panelBorder} className="w-full rounded-lg max-w-3xl mx-auto flex flex-col gap-4 border p-4">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">Driver&apos;s License Scanner</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Fill the frame with the barcode, avoid glare, then tap Take Picture &amp; Decode.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-zinc-200">
            <span className="font-semibold">Status:</span> {status}
          </div>
          <AnimatePresence mode="wait">
            {busy && (
              <motion.div
                key="spin"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="h-5 w-5 rounded-full border-2 border-t-transparent"
                style={{ borderColor: primaryAccent, borderTopColor: "transparent" }}
                transition={{ duration: 0.15 }}
              >
                <motion.div
                  className="h-full w-full rounded-full border-2 border-t-transparent"
                  style={{ borderColor: primaryAccent, borderTopColor: "transparent" }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {phase === "failed" && (
          <div className="mt-2 text-xs text-zinc-400">
            • Get closer so the barcode fills more of the frame<br />
            • Use more light / torch and reduce glare<br />
            • Hold steady for a second before tapping
          </div>
        )}
      </div>

      <div style={{ borderColor: `${primaryAccent}E6` }} className="w-full max-w-xl aspect-video rounded-xl border overflow-hidden bg-zinc-900/80 relative">
        <video ref={videoRef} className="w-full h-full object-cover bg-black" autoPlay playsInline muted />
        {flashTaken && <div className="absolute inset-0 bg-white/10" />}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {!cameraOn ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              style={primaryBtn}
              onClick={startCamera}
              disabled={busy}
              className="w-full px-3 py-2 rounded-md text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Camera
            </motion.button>
          ) : (
            <>
              <motion.button
                whileTap={{ scale: 0.98 }}
                animate={flashTaken ? { scale: 0.98 } : { scale: 1 }}
                transition={{ duration: 0.12 }}
                style={primaryBtn}
                onClick={takePictureAndDecode}
                disabled={busy}
                className={`${primaryWidthClass} px-3 py-2 rounded-md text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {busy ? "Working…" : "Take Picture & Decode"}
              </motion.button>

              {torchSupported && (
                <button
                  onClick={toggleTorch}
                  disabled={busy}
                  className="px-3 py-2 rounded-md text-sm font-semibold bg-zinc-800 text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {torchOn ? "Torch On" : "Torch Off"}
                </button>
              )}

              <button
                style={secondaryBtn}
                onClick={() => {
                  stopCamera();
                  setPhase("idle");
                  setStatus("Stopped.");
                }}
                disabled={busy}
                className="px-3 py-2 rounded-md text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Stop
              </button>
            </>
          )}
        </div>

        <button
          style={secondaryBtn}
          onClick={handleSkip}
          disabled={busy}
          className="w-full px-3 py-2 rounded-md text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Skip Scanning
        </button>
      </div>
    </div>
  );
}
