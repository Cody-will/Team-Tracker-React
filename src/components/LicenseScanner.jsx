
// src/components/LicenseScannerZXing.jsx
import { useEffect, useRef, useState } from "react";
import { BrowserPDF417Reader, BrowserMultiFormatReader } from "@zxing/browser";

/** Parse AAMVA string from driver's license PDF417 */
function parseAAMVA(data) {
  const get = (code) => {
    const re = new RegExp(code + "([^\\n\\r]+)");
    const match = data.match(re);
    return match ? match[1].trim() : "";
  };

  const dobRaw = get("DBB");
  const expRaw = get("DBA");

  const formatDate = (raw) => {
    if (!raw || raw.length !== 8) return raw;
    const y = raw.slice(0, 4);
    const m = raw.slice(4, 6);
    const d = raw.slice(6, 8);
    return `${m}/${d}/${y}`;
  };

  return {
    firstName: get("DAC"),
    middleName: get("DAD"),
    lastName: get("DCS"),
    street: get("DAG"),
    city: get("DAI"),
    state: get("DAJ"),
    zip: get("DAK"),
    dob: formatDate(dobRaw),
    dobRaw,
    licenseNumber: get("DAQ"),
    expiration: formatDate(expRaw),
    expirationRaw: expRaw,
  };
}

export default function LicenseScanner() {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);

  const [status, setStatus] = useState("Ready. Click Start to begin.");
  const [rawData, setRawData] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // zoom support
  const [zoomSupported, setZoomSupported] = useState(false);
  const [zoomRange, setZoomRange] = useState({ min: 1, max: 1, step: 0.1 });
  const [zoom, setZoom] = useState(1);

  // init ZXing reader once
  useEffect(() => {
    // Prefer dedicated PDF417 reader
    readerRef.current = new BrowserPDF417Reader();
    console.log("Initialized BrowserPDF417Reader");

    return () => {
      stopScan();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // choose back camera on mobile if possible
  function chooseDeviceId(devices) {
    if (!devices || devices.length === 0) return undefined;

    // On mobile, labels often include "back"/"rear"/"environment"
    const back = devices.find((d) =>
      /back|rear|environment/i.test(d.label || "")
    );
    if (back) return back.deviceId;

    // Fallback: just first device
    return devices[0].deviceId;
  }

  async function startScan() {
    const reader = readerRef.current;
    if (!reader) return;

    setRawData("");
    setParsedData(null);
    setZoomSupported(false);
    setZoom(1);
    setZoomRange({ min: 1, max: 1, step: 0.1 });

    try {
      setStatus("Requesting camera access...");
      console.log("Listing video input devices…");

      // NOTE: On some browsers, you don’t get labels until user grants permission once
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();

      console.log("Video input devices:", devices);

      if (!devices || devices.length === 0) {
        setStatus("No video input devices found.");
        return;
      }

      const selectedDeviceId = chooseDeviceId(devices);
      console.log("Selected camera deviceId:", selectedDeviceId);

      setStatus("Starting camera & scanning (PDF417)...");
      setIsScanning(true);

      const controls = await reader.decodeFromVideoDevice(
        selectedDeviceId ?? null,
        videoRef.current,
        (result, error, controlsInstance) => {
          if (result) {
            console.log("ZXing result:", result);
            const text = result.getText();
            setRawData(text);
            setParsedData(parseAAMVA(text));
            setStatus("Barcode detected and parsed. Stopping camera.");
            controlsInstance.stop();
            controlsRef.current = null;
            setIsScanning(false);
          } else if (error) {
            // ZXing will spam NotFoundException while it tries to find a code.
            // We only log serious errors:
            if (error.name !== "NotFoundException") {
              console.warn("ZXing error:", error);
            }
            setStatus("Scanning... (no barcode yet)");
          }
        }
      );

      controlsRef.current = controls;

      // After the stream is live, check zoom capabilities
      setTimeout(() => {
        const video = videoRef.current;
        if (!video || !video.srcObject) return;
        const stream = video.srcObject;
        if (!(stream instanceof MediaStream)) return;
        const [track] = stream.getVideoTracks();
        if (!track || !track.getCapabilities) return;

        const caps = track.getCapabilities();
        console.log("Track capabilities:", caps);
        if (caps && "zoom" in caps) {
          const { min, max, step } = caps.zoom;
          setZoomSupported(true);
          setZoomRange({
            min: min ?? 1,
            max: max ?? 1,
            step: step || 0.1,
          });

          const settings = track.getSettings();
          const currentZoom = settings.zoom ?? min ?? 1;
          setZoom(currentZoom);
        }
      }, 600);
    } catch (err) {
      console.error("ZXing start error:", err);
      setStatus("Failed to start scan: " + err.message);
      setIsScanning(false);
    }
  }

  function stopScan() {
    setIsScanning(false);
    setZoomSupported(false);

    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }

    const video = videoRef.current;
    if (video && video.srcObject instanceof MediaStream) {
      video.srcObject.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }

    setStatus("Stopped.");
  }

  async function handleZoomChange(e) {
    const newZoom = Number(e.target.value);
    setZoom(newZoom);

    const video = videoRef.current;
    if (!video || !video.srcObject) return;
    const stream = video.srcObject;
    if (!(stream instanceof MediaStream)) return;

    const [track] = stream.getVideoTracks();
    if (!track || !track.applyConstraints) return;

    try {
      await track.applyConstraints({
        advanced: [{ zoom: newZoom }],
      });
    } catch (err) {
      console.warn("Failed to apply zoom:", err);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">
          Driver&apos;s License Scanner (ZXing PDF417)
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Uses <code>BrowserPDF417Reader</code> from <code>@zxing/browser</code>{" "}
          with your camera. Should work in most modern browsers on desktop and
          mobile. On phones, it will try to use the back camera.
        </p>
      </div>

      <div className="text-sm text-zinc-300">
        <span className="font-semibold">Status:</span> {status}
      </div>

      {/* Camera box: fixed aspect, video fills it */}
      <div className="w-full max-w-xl aspect-video rounded-xl border border-emerald-500/40 overflow-hidden bg-zinc-900/80">
        <video
          ref={videoRef}
          className="w-full h-full object-cover bg-black"
          autoPlay
          playsInline
          muted
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={startScan}
          disabled={isScanning}
          className="px-3 py-1.5 rounded-md text-sm font-semibold bg-emerald-500 text-emerald-950 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Camera &amp; Scan
        </button>
        <button
          onClick={stopScan}
          disabled={!isScanning}
          className="px-3 py-1.5 rounded-md text-sm font-semibold bg-zinc-700 text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Stop
        </button>

        {zoomSupported && (
          <div className="flex flex-col gap-1 max-w-xs">
            <div className="text-xs text-zinc-300">
              Zoom: {zoom.toFixed(2)}
            </div>
            <input
              type="range"
              min={zoomRange.min}
              max={zoomRange.max}
              step={zoomRange.step}
              value={zoom}
              onChange={handleZoomChange}
              className="w-full"
            />
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-zinc-700 bg-zinc-900/80 p-3">
          <div className="text-sm font-semibold text-zinc-200 mb-1">
            Parsed Fields
          </div>
          <div className="text-xs font-mono bg-zinc-950/80 border border-zinc-800 rounded p-2 max-h-64 overflow-auto">
            {parsedData ? (
              <pre>{JSON.stringify(parsedData, null, 2)}</pre>
            ) : (
              <span className="text-zinc-500">(nothing yet)</span>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-700 bg-zinc-900/80 p-3">
          <div className="text-sm font-semibold text-zinc-200 mb-1">
            Raw AAMVA Data
          </div>
          <div className="text-xs font-mono bg-zinc-950/80 border border-zinc-800 rounded p-2 max-h-64 overflow-auto">
            {rawData ? (
              <pre>{rawData}</pre>
            ) : (
              <span className="text-zinc-500">(nothing yet)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

