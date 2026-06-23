"use client";

import React, { useState, useRef, useEffect } from "react";

const CARD_ASSET = "/nyama.jpeg";

/** Layout ratios tuned for `public/nyama.jpeg` (1080×1326, portrait). */
const LAYOUT = {
    /** Centered on the dotted line in the white header box. */
    nameXRatio: 0.5,
    nameYRatio: 0.232,
    nameFontRatio: 0.038,
    textMaxWidthRatio: 0.88,
};

const SANS_STACK = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

/** Festival purple — matches the Kisoro Nyama branding and reads clearly on the white name box. */
const GUEST_NAME_COLOR = "#5c1f7a";

function drawCardOverlay(ctx, image, guestName) {
    const w = image.naturalWidth;
    const h = image.naturalHeight;
    const maxW = w * LAYOUT.textMaxWidthRatio;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(image, 0, 0);

    const sanitizedName = guestName.replace(/&/g, "and").trim();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let nameSize = Math.round(w * LAYOUT.nameFontRatio);
    const setNameFont = (size) => {
        ctx.font = `bold ${size}px ${SANS_STACK}`;
    };
    setNameFont(nameSize);
    while (nameSize > 12 && ctx.measureText(sanitizedName).width > maxW) {
        nameSize -= 1;
        setNameFont(nameSize);
    }
    ctx.fillStyle = GUEST_NAME_COLOR;
    ctx.fillText(sanitizedName, w * LAYOUT.nameXRatio, h * LAYOUT.nameYRatio);
}

export default function Home() {
    const [guestName, setGuestName] = useState("");
    const [loading, setLoading] = useState(false);
    const canvasRef = useRef(null);
    const baseImageRef = useRef(null);
    const [imageURL, setImageURL] = useState(null);
    const [previewReady, setPreviewReady] = useState(false);

    const cardSrc = CARD_ASSET;

    useEffect(() => {
        setPreviewReady(false);
        const img = new Image();
        img.onload = () => {
            baseImageRef.current = img;
            setPreviewReady(true);
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
        };
        img.onerror = () => {
            baseImageRef.current = null;
            setPreviewReady(false);
        };
        img.src = cardSrc;
    }, [cardSrc]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!previewReady) return;
        const img = baseImageRef.current;
        if (!img?.complete) return;

        setLoading(true);
        const canvas = canvasRef.current;
        if (!canvas) {
            setLoading(false);
            return;
        }
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        drawCardOverlay(ctx, img, guestName);

        const dataURL = canvas.toDataURL("image/jpeg", 0.92);
        setImageURL(dataURL);
        localStorage.setItem("generatedCard", dataURL);
        setLoading(false);
    };

    const downloadImage = () => {
        const safe = guestName.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_") || "guest";
        const link = document.createElement("a");
        link.href = imageURL;
        link.download = `${safe}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const shareImage = () => {
        const savedImageURL = localStorage.getItem("generatedCard");

        if (navigator.share && savedImageURL) {
            fetch(savedImageURL)
                .then((res) => res.blob())
                .then((blob) => {
                    const safe = guestName.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_") || "guest";
                    const file = new File([blob], `${safe}.jpeg`, { type: blob.type });
                    navigator.share({ files: [file] }).catch((err) => console.error("Error sharing:", err));
                });
        } else {
            alert("Sharing is not supported in your browser. Please download the image and share it manually.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
            <nav className="bg-white shadow-md p-4 flex justify-between w-full max-w-5xl">
                <div className="text-xl font-bold">Card Generator</div>
                <div className="space-x-4">
                    <button type="button" onClick={() => setImageURL(null)} className="text-blue-500 hover:underline">
                        Home
                    </button>
                </div>
            </nav>

            <div className="py-10 flex flex-col items-center w-full max-w-5xl px-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-center text-black">
                    Kisoro Nyama Festival invitation
                </h2>
                <p className="mb-6 sm:mb-8 md:mb-10 text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 text-center">
                    Enter the guest name to generate the festival invitation card.
                </p>
                <div className="flex flex-wrap justify-center gap-10 w-full">
                    <div className="bg-white shadow-md rounded-lg p-5 w-full md:w-1/2 flex flex-col items-center">
                        <h2 className="text-2xl font-semibold mb-3">Generate your card</h2>
                        <form onSubmit={handleSubmit} className="w-full space-y-4">
                            <div>
                                <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Name (invitee)
                                </label>
                                <input
                                    id="guestName"
                                    type="text"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    placeholder="e.g. Moses Magezi"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded text-black bg-white placeholder-gray-500"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!previewReady || loading}
                                className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Generate card
                            </button>
                        </form>
                        {!previewReady && <p className="mt-3 text-gray-500 text-sm">Loading card artwork…</p>}
                        {loading && <p className="mt-3 text-gray-500">Generating…</p>}
                    </div>
                    {imageURL && (
                        <div className="bg-white shadow-md rounded-lg p-3 w-full md:w-1/2 flex flex-col items-center overflow-hidden">
                            <h2 className="text-lg font-semibold mb-2">Your generated card</h2>
                            <img
                                src={imageURL}
                                alt="Generated card"
                                className="mb-3 max-w-full max-h-[min(70vh,520px)] h-auto object-contain"
                            />
                            <div className="flex justify-between w-full gap-2">
                                <button
                                    type="button"
                                    onClick={downloadImage}
                                    className="flex-1 p-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                >
                                    Download
                                </button>
                                <button
                                    type="button"
                                    onClick={shareImage}
                                    className="flex-1 p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                                >
                                    Share
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    );
}
