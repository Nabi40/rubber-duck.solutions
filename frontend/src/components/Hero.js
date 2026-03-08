"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Cropper from "react-easy-crop";

const TABS = ["Background", "Passport Size Image", "Stamp Size Image"];
const PASSPORT_SIZE_OPTIONS = ["4", "8", "12", "16", "20"];
const STAMP_SIZE_OPTIONS = ["9", "18", "27", "36", "45"];
const PASSPORT_COLOR_ROWS = [
  ["#EAF4FF", "#D6E9FF", "#BFD9FF", "#A6C8FF", "#8AB6FF", "#6FA4FF", "#4E8FF7", "#3B78D8"],
  ["#F0FAFF", "#D9F2FF", "#BFE7FF", "#A3DAFF", "#85CBFF", "#66BCFF", "#42A7F5", "#2D8ED6"],
  ["#F8F9FA", "#E9ECEF", "#DEE2E6", "#CED4DA", "#ADB5BD", "#868E96", "#6C757D", "#495057"],
  ["#FFF8ED", "#FFF0DB", "#FFE6C7", "#FFD9B0", "#FFC997", "#FFB87E", "#F2A363", "#D88945"],
  ["#FFFDF5", "#FFF8E6", "#FFF1CC", "#FFE9B3", "#FFE199", "#FFD880", "#F5C861", "#DBAE42"],
  ["#F0FFF5", "#D9FBE7", "#BFF6D6", "#A2F0C4", "#82E8B0", "#5EDC98", "#3BC67F", "#29A965"],
  ["#F2FFFB", "#D9FFF2", "#BFFFE6", "#A1F8D8", "#81EEC7", "#5FE2B4", "#3BC99A", "#27A67F"],
  ["#F7F5FF", "#ECE8FF", "#DED7FF", "#CFC5FF", "#BEB1FF", "#A99BFF", "#8E7DE8", "#7563C7"],
  ["#FFF5F7", "#FFE5EC", "#FFD6E0", "#FFC2D1", "#FFAFC2", "#FF99B3", "#F27896", "#D65A78"],
  ["#FFF6F2", "#FFE5DB", "#FFD4C2", "#FFC1A6", "#FFAD8B", "#FF986F", "#F57C52", "#D85F37"],
  ["#FFFDF0", "#FFF8CC", "#FFF2A6", "#FFEB80", "#FFE35C", "#FFD93B", "#F5C81D", "#DBB100"],
  ["#F1F7FF", "#DCEBFF", "#C4DBFF", "#AAC9FF", "#8EB7FF", "#6FA2F5", "#5188D8", "#3D6FB8"],
];

function checkerboardStyle(size = 16) {
  return {
    backgroundImage: `
      linear-gradient(45deg, rgba(0,0,0,0.12) 25%, transparent 25%),
      linear-gradient(-45deg, rgba(0,0,0,0.12) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.12) 75%),
      linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.12) 75%)
    `,
    backgroundSize: `${size}px ${size}px`,
    backgroundPosition: `0 0, 0 ${size / 2}px, ${size / 2}px -${size / 2}px, -${size / 2}px 0px`,
  };
}

export default function Hero() {
  const [activeTab, setActiveTab] = useState("Background");
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState("Removing background...");
  const [origFile, setOrigFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [bgColor, setBgColor] = useState("#5f9de8");
  const [step, setStep] = useState("edit");
  const [sizeOption, setSizeOption] = useState("16");
  const [showLanding, setShowLanding] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [fakeRemovedReady, setFakeRemovedReady] = useState(false);

  // ✅ NEW (needed): store removed background result
  const [removedBlob, setRemovedBlob] = useState(null);
  const [removedBgId, setRemovedBgId] = useState(null); // id from /api/remove-bg/ for passport-stamp

  // cropper state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const fileInputRef = useRef(null);
  const colorInputRef = useRef(null);
  const heroContainerRef = useRef(null);

  // ✅ prevent old async finishing after new image chosen
  const jobRef = useRef(0);

  const hasImage = Boolean(origFile);
  const isPassportTab = activeTab === "Passport Size Image";
  // Background tab: show color palette on the right
  const showPalette = hasImage && activeTab === "Background" && step === "edit";
  // Passport/Stamp tabs: show size controls + A4 preview on the right
  const showSizes = hasImage && activeTab !== "Background" && step === "edit";
  const isStampTab = activeTab === "Stamp Size Image";
  const sizeOptions = isStampTab ? STAMP_SIZE_OPTIONS : PASSPORT_SIZE_OPTIONS;
  const photoAspectRatio = "1.7 / 2.1";

  const pageCols = isStampTab ? 9 : 4;
  const pageRows = 5;
  const selectedCount = Math.min(Number(sizeOption) || 16, pageCols * pageRows);
  const a4FillMap = useMemo(() => {
    const fullRows = Math.floor(selectedCount / pageCols);
    const remainder = selectedCount % pageCols;
    return Array.from({ length: pageRows * pageCols }, (_, idx) => {
      const row = Math.floor(idx / pageCols); // 0 = top
      const col = idx % pageCols; // 0 = left
      const rowFromBottom = pageRows - 1 - row; // 0 = bottom

      if (rowFromBottom < fullRows) return true;
      if (rowFromBottom === fullRows && remainder > 0) return col < remainder;
      return false;
    });
  }, [selectedCount, pageCols, pageRows]);

  useEffect(() => {
    if (isStampTab && !STAMP_SIZE_OPTIONS.includes(sizeOption)) {
      setSizeOption("45");
      return;
    }
    if (!isStampTab && !PASSPORT_SIZE_OPTIONS.includes(sizeOption)) {
      setSizeOption("16");
    }
  }, [isStampTab, sizeOption]);

  // ✅ removed image url
  const removedUrl = useMemo(() => {
    if (!removedBlob) return "";
    return URL.createObjectURL(removedBlob);
  }, [removedBlob]);

  useEffect(() => {
    return () => {
      if (removedUrl) URL.revokeObjectURL(removedUrl);
    };
  }, [removedUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(blob);
      }, "image/png");
    });
  };

  const removeBgServer = async (file) => {
    const currentJob = ++jobRef.current;

    setBusy(true);
    setBusyLabel("Removing background...");
    setError("");
    setFakeRemovedReady(false);
    setRemovedBlob(null);
    setRemovedBgId(null);

    const minDelay = new Promise((r) => setTimeout(r, 350));

    try {
      const apiBase = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API || "";
      const endpoint = apiBase
        ? `${apiBase.replace(/\/$/, "")}/api/remove-bg/`
        : "/api/remove-bg/";

      const formData = new FormData();
      formData.append("image", file, file.name || "your_photo.jpg");

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        let message = "Background removal failed";
        try {
          const errData = JSON.parse(text);
          message = errData?.error || errData?.detail || message;
        } catch {
          message = text || message;
        }
        throw new Error(message);
      }

      const contentType = res.headers.get("content-type") || "";
      let imageBlob;
      let imageId = null;

      if (contentType.includes("application/json")) {
        const data = await res.json();
        const imageUrl = data?.url ?? data?.results?.[0]?.url;
        imageId = data?.id ?? data?.results?.[0]?.id;
        if (!imageUrl) {
          throw new Error("Missing image url in response");
        }

        // Fetch the actual image from the returned URL
        const imgRes = await fetch(imageUrl);
        if (!imgRes.ok) {
          throw new Error("Failed to fetch processed image");
        }
        imageBlob = await imgRes.blob();
      } else {
        imageBlob = await res.blob();
      }

      await minDelay;

      if (jobRef.current !== currentJob) return;

      setRemovedBlob(imageBlob);
      if (imageId != null) setRemovedBgId(imageId);
      setFakeRemovedReady(true);
    } catch (e) {
      console.error(e);
      if (jobRef.current !== currentJob) return;
      setError("Background removal failed. Please try again.");
      setFakeRemovedReady(false);
    } finally {
      if (jobRef.current === currentJob) {
        setBusy(false);
        setBusyLabel("Removing background...");
      }
    }
  };

  const onPickFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setOrigFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowLanding(false);
    setStep("crop");
    setDragging(false);
    setError("");
  };

  const handleCropConfirm = async () => {
    if (!previewUrl || !croppedAreaPixels) return;

    try {
      setBusy(true);
      setBusyLabel("Applying crop...");

      const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels);
      const fileName = origFile?.name || "cropped.png";
      const croppedFile = new File([croppedBlob], fileName, { type: "image/png" });

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const newPreviewUrl = URL.createObjectURL(croppedBlob);

      setOrigFile(croppedFile);
      setPreviewUrl(newPreviewUrl);
      setStep("edit");

      // now send cropped image to backend for bg removal
      await removeBgServer(croppedFile);
    } catch (e) {
      console.error(e);
      setError("Cropping failed. Please try again.");
    } finally {
      setBusy(false);
      setBusyLabel("Removing background...");
    }
  };

  const resetImage = () => {
    jobRef.current += 1; // cancel pending async result
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setOrigFile(null);
    setPreviewUrl("");
    setShowLanding(true);
    setRemovedBlob(null);
    setRemovedBgId(null);
    setFakeRemovedReady(false);
    setBusy(false);
    setStep("edit");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";

    requestAnimationFrame(() => {
      heroContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onPickFile(file);
  };

  const normalizedBgColor =
    bgColor === "transparent" || !bgColor?.startsWith("#") ? "#FFFFFF" : bgColor.toUpperCase();

  const triggerBlobDownload = (blob, fileName = "output.png") => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const downloadOutput = async () => {
    if (!origFile) return;

    try {
      setError("");
      setBusy(true);
      setBusyLabel("Processing...");

      const apiBase =
        process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API || "";
      // Passport/stamp always go through our API proxy so the backend URL is never exposed
      let endpoint = apiBase ? `${apiBase.replace(/\/$/, "")}/api/passport-stamp` : "/api/passport-stamp";
      const form = new FormData();

      if (isPassportTab || isStampTab) {
        if (removedBgId == null) {
          setError("Please wait for background removal to complete.");
          return;
        }
        // Use removed_bg_result id from /api/remove-bg/ response
        const rows = Math.ceil(selectedCount / pageCols);

        endpoint = apiBase
          ? `${apiBase.replace(/\/$/, "")}/api/passport-stamp/`
          : "/api/passport-stamp/";

        const body = JSON.stringify({
          image: removedBgId,
          bg_color: normalizedBgColor,
          photo_size: isStampTab ? "0.8x1" : "1.5x1.9",
          page_size: "A4",
          rows,
          dpi: 300,
        });

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });

        if (!res.ok) {
          const text = await res.text();
          let message = "Request failed";
          try {
            const errData = JSON.parse(text);
            message = errData?.error || errData?.detail || message;
          } catch {
            message = text || message;
          }
          throw new Error(message);
        }

        const data = await res.json();
        const sheetUrl = data?.sheet_url;
        if (!sheetUrl) throw new Error("sheet_url missing in response");

        const absoluteSheetUrl = /^https?:\/\//i.test(sheetUrl)
          ? sheetUrl
          : `${(apiBase || "").replace(/\/$/, "")}${sheetUrl.startsWith("/") ? "" : "/"}${sheetUrl}`;

        try {
          const fileRes = await fetch(absoluteSheetUrl);
          if (!fileRes.ok) throw new Error("File download failed");

          const blob = await fileRes.blob();
          const fileName = absoluteSheetUrl.split("/").pop() || "output.png";
          triggerBlobDownload(blob, fileName);
        } catch {
          window.location.assign(absoluteSheetUrl);
        }
        return;
      }

      {
        form.append("image", origFile, origFile.name || "your_photo.jpg");
        form.append("mode", activeTab);
        form.append("color", normalizedBgColor);
        form.append("size_option", sizeOption);
      }

      const res = await fetch(endpoint, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        let message = "Request failed";
        try {
          const errData = JSON.parse(text);
          message = errData?.error || errData?.detail || message;
        } catch {
          message = text || message;
        }
        throw new Error(message);
      }

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        const sheetUrl = data?.sheet_url;
        if (!sheetUrl) throw new Error("sheet_url missing in response");

        const absoluteSheetUrl = /^https?:\/\//i.test(sheetUrl)
          ? sheetUrl
          : `${apiBase.replace(/\/$/, "")}/${sheetUrl.replace(/^\//, "")}`;

        try {
          const fileRes = await fetch(absoluteSheetUrl);
          if (!fileRes.ok) throw new Error("File download failed");

          const blob = await fileRes.blob();
          const fileName = absoluteSheetUrl.split("/").pop() || "output.png";
          triggerBlobDownload(blob, fileName);
        } catch {
          window.location.assign(absoluteSheetUrl);
        }
      } else {
        const blob = await res.blob();
        triggerBlobDownload(blob, "output.png");
      }
    } catch (e) {
      console.error(e);
      setError("Processing failed. Please try again.");
    } finally {
      setBusy(false);
      setBusyLabel("Removing background...");
    }
  };

  const renderToolbar = () => (
    <div className="mx-auto mt-2 w-full max-w-[920px] rounded-full bg-[#f2f2f0] px-2 py-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            const isBackgroundTab = tab === "Background";

            const activeClass = isBackgroundTab
              ? "bg-[#7f8ef0] text-white"
              : "bg-[#e5e5e5] text-[#202020]";

            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === "Background") setStep("edit");
                }}
                className={`rounded-full px-3 py-1.5 text-[13px] sm:text-sm ${
                  isActive ? activeClass : "text-[#505050]"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {/* <button className="text-xs text-[#595959]">↶</button>
          <button className="text-xs text-[#595959]">↷</button> */}
          <button
            onClick={downloadOutput}
            disabled={
              !origFile ||
              busy ||
              ((isPassportTab || isStampTab) && removedBgId == null)
            }
            className="rounded-full bg-[#7f8ef0] px-4 py-1 text-[10px] text-white disabled:opacity-40"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );

  // ✅ what to show in preview:
  // if removed is ready -> show transparent PNG
  // else -> show original preview
  const shownSrc = fakeRemovedReady && removedUrl ? removedUrl : previewUrl;

  return (
    <>
      <section id="hero" className="px-4 pb-4 font-[Poppins] md:px-6">
        <div
          ref={heroContainerRef}
          className="relative mx-auto mt-3 min-h-[600px] w-full max-w-[1240px] overflow-hidden rounded-[18px] bg-gradient-to-b from-[#d0d4ea] to-[#97a0ea] px-4 py-10 md:px-8"
        >
          {!hasImage && showLanding && (
            <>
              <img
                src="/images/bg-image10.png"
                alt=""
                className="pointer-events-none absolute left-2 top-12 hidden h-[140px] w-[190px] -rotate-[15deg] rounded-2xl object-cover md:block lg:left-7 lg:h-[170px] lg:w-[240px]"
              />
              <img
                src="/images/bg-image2.png"
                alt=""
                className="pointer-events-none absolute right-10 top-16 hidden h-[105px] w-[180px] rotate-[18deg] object-cover opacity-95 md:block"
              />
              <img
                src="/images/bg-image3.png"
                alt=""
                className="pointer-events-none absolute bottom-7 left-8 hidden h-[125px] w-[165px] rotate-[14deg] rounded-2xl object-cover md:block lg:h-[155px] lg:w-[210px]"
              />
              <img
                src="/images/bg-image40.png"
                alt=""
                className="pointer-events-none absolute bottom-7 right-8 hidden h-[125px] w-[165px] rotate-[14deg] rounded-2xl object-cover md:block lg:h-[155px] lg:w-[210px]"
              />

              <div className="relative mx-auto mt-8 flex max-w-[660px] flex-col items-center text-center">
                <h2 className="text-3xl font-semibold leading-tight text-[#22232c] md:text-[52px]">
                Drag, Drop and print 
                  <br />
                  passport size photo
                </h2>
                <p className="mt-2 text-xs text-[#5c6176] md:text-[24px]">
                  Instantly get clean, high-quality images with sharp, pixel-perfect precision
                </p>

                <div
                  className={`mt-8 w-full max-w-[390px] rounded-2xl bg-[#f4f4f4] px-4 py-16 text-center ${
                    dragging ? "ring-2 ring-[#7f8ef0]" : ""
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setDragging(false);
                  }}
                  onDrop={onDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onPickFile(file);
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mx-auto inline-flex rounded-full bg-[#7f8ef0] px-8 py-2.5 text-2xl text-white"
                  >
                    Upload Image
                  </button>
                  <p className="mt-3 text-xs text-[#585858]">Or drop and image here</p>
                </div>
              </div>
            </>
          )}

          {hasImage && (
            <>
              {renderToolbar()}

              <div
                className={`mx-auto mt-10 grid w-full max-w-[920px] gap-3 ${
                  showPalette || showSizes ? "md:grid-cols-2" : ""
                }`}
              >
                <div className="relative overflow-hidden rounded-[16px] bg-[#f4f4f4] p-3">
                  <button
                    onClick={resetImage}
                    className="absolute right-2 top-2 z-10 h-5 w-5 rounded-full border border-[#9a9a9a] text-[10px] text-[#636363]"
                  >
                    ×
                  </button>

                  <div
                    className="relative mx-auto overflow-hidden"
                    style={{
                      width: "454px",
                      maxWidth: "100%",
                      aspectRatio: "1.7 / 2.1",
                      // Background tab: show checkerboard when "transparent", otherwise fake the solid color.
                      // Other tabs: always show chosen background color.
                      ...(activeTab === "Background"
                        ? bgColor === "transparent"
                          ? checkerboardStyle(20)
                          : { backgroundColor: bgColor }
                        : { backgroundColor: bgColor === "transparent" ? "#ffffff" : bgColor }),
                    }}
                  >
                    {step === "crop" && previewUrl ? (
                      <>
                        <Cropper
                          image={previewUrl}
                          crop={crop}
                          zoom={zoom}
                          aspect={1.7 / 2.1}
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                          onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                        />
                      </>
                    ) : (
                      <img
                        src={shownSrc}
                        alt="preview"
                        className={`h-full w-full ${
                          activeTab === "Background" ? "object-contain" : "object-contain"
                        } ${fakeRemovedReady ? "drop-shadow-[0_10px_18px_rgba(0,0,0,0.18)]" : ""}`}
                      />
                    )}

                    {busy && (
                      <div className="absolute inset-0 z-20 grid place-items-center bg-white/60">
                        <div className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
                          {busyLabel}
                        </div>
                      </div>
                    )}
                  </div>

                  {step === "crop" && previewUrl && (
                    <div className="mt-3 flex flex-col items-center gap-2">
                      <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-48"
                      />
                      <button
                        onClick={handleCropConfirm}
                        className="rounded-full bg-[#7f8ef0] px-6 py-1.5 text-xs text-white"
                      >
                        Crop & Continue
                      </button>
                    </div>
                  )}
                </div>

                {showPalette && (
                  <div className="h-[320px] min-w-[200px] self-start rounded-[16px] bg-[#e6e9f4] p-4">
                    <div className="flex max-h-[280px] flex-col gap-3 overflow-y-auto pr-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          onClick={() => setBgColor("transparent")}
                          className={`h-[18px] w-[18px] rounded-full border border-[#8e97b3] shadow-[0_0_0_1px_rgba(255,255,255,0.75)] ${
                            bgColor === "transparent" ? "ring-2 ring-[#5f6de2]" : ""
                          }`}
                          style={checkerboardStyle(6)}
                        >
                          <span className="sr-only">Transparent</span>
                        </button>
                        <button
                          onClick={() => colorInputRef.current?.click()}
                          className="h-[18px] w-[18px] rounded-full border border-[#8e97b3] shadow-[0_0_0_1px_rgba(255,255,255,0.75)]"
                          style={{
                            background:
                              "conic-gradient(rgb(255,0,0),rgb(255,204,0),rgb(82,255,0),rgb(0,213,255),rgb(29,77,255),rgb(209,0,255),rgb(255,0,0))",
                          }}
                        />
                        <input
                          ref={colorInputRef}
                          type="color"
                          className="hidden"
                          onChange={(e) => setBgColor(e.target.value)}
                        />
                      </div>
                      {PASSPORT_COLOR_ROWS.map((row, rowIdx) => (
                        <div key={rowIdx} className="flex flex-wrap items-center gap-2.5">
                          {row.map((color) => (
                            <button
                              key={color}
                              onClick={() => setBgColor(color)}
                              className={`h-[18px] w-[18px] rounded-full border border-[#8e97b3] shadow-[0_0_0_1px_rgba(255,255,255,0.75)] ${
                                bgColor === color ? "ring-2 ring-[#5f6de2]" : ""
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showSizes && (
                  <div className="relative overflow-hidden rounded-[16px] bg-[#f4f4f4] p-3">
                    <div className="mb-2 flex items-center gap-2">
                      {sizeOptions.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSizeOption(size)}
                          className={`rounded-md border px-3 py-1 text-xs ${
                            sizeOption === size
                              ? "border-[#7d8bee] bg-[#7d8bee] text-white"
                              : "border-[#c8c8c8] text-[#666]"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>

                    <div className="rounded-md border border-[#d2d2d2] bg-[#ececec] p-2">
                      <div className="mx-auto aspect-[210/297] w-full max-w-[320px] bg-white p-3 shadow-[0_6px_20px_rgba(0,0,0,0.12)]">
                        <div
                          className="grid h-full gap-2"
                          style={{ gridTemplateColumns: `repeat(${pageCols}, minmax(0, 1fr))` }}
                        >
                          {a4FillMap.map((isFilled, idx) => (
                            <div
                              key={idx}
                              className="overflow-hidden"
                              style={{
                                backgroundColor: isFilled
                                  ? bgColor === "transparent"
                                    ? "#e9df8c"
                                    : bgColor
                                  : "transparent",
                              }}
                            >
                              {isFilled && (
                                <div
                                  className="mx-auto h-full max-h-full w-full max-w-full"
                                  style={{ aspectRatio: photoAspectRatio }}
                                >
                                  <img
                                    src={shownSrc}
                                    alt="size preview"
                                    className="h-full w-full object-contain"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* No Next/Back button; Passport/Stamp show sizes on the right immediately */}
            </>
          )}
        </div>
      </section>

      {error && <p className="px-6 pb-2 text-center text-xs text-red-600">{error}</p>}
    </>
  );
}
