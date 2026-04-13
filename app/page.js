"use client";

import React, { useState, useRef, useEffect } from "react";

const CARD_ASSETS = {
    gold: "/card_gold.png",
    black: "/card_black.png",
};

/** Layout ratios tuned for 2481×3508 wedding templates (gold & black share dimensions). */
const LAYOUT = {
    nameYRatio: 0.387,
    admitsYRatio: 0.936,
    /** Horizontal nudge for the admit count (fraction of card width, added to center). */
    admitsXOffsetRatio: 0.056,
    nameFontRatio: 0.033,
    admitsFontRatio: 0.031,
    textMaxWidthRatio: 0.86,
};

/** Accent blue for both guest name and admit count (per card variant). */
const TEXT_THEME = {
    gold: { accent: "#0b6ecf" },
    black: { accent: "#0a7ae0" },
};

const SANS_STACK = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const SERIF_STACK = "Georgia, 'Times New Roman', serif";

function drawCardOverlay(ctx, image, guestName, admitCount, variant) {
    const w = image.naturalWidth;
    const h = image.naturalHeight;
    const theme = TEXT_THEME[variant] || TEXT_THEME.gold;
    const maxW = w * LAYOUT.textMaxWidthRatio;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(image, 0, 0);

    const sanitizedName = guestName.replace(/&/g, "and").trim();
    const n = Math.min(99, Math.max(1, parseInt(String(admitCount), 10) || 1));
    const admitsText = String(n);

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
    ctx.fillStyle = theme.accent;
    ctx.fillText(sanitizedName, w / 2, h * LAYOUT.nameYRatio);

    let admitSize = Math.round(w * LAYOUT.admitsFontRatio);
    const setAdmitFont = (size) => {
        ctx.font = `italic bold ${size}px ${SERIF_STACK}`;
    };
    setAdmitFont(admitSize);
    while (admitSize > 12 && ctx.measureText(admitsText).width > maxW) {
        admitSize -= 1;
        setAdmitFont(admitSize);
    }
    const admitX = w / 2 + w * LAYOUT.admitsXOffsetRatio;
    ctx.fillText(admitsText, admitX, h * LAYOUT.admitsYRatio);
}

export default function Home() {
    const [guestName, setGuestName] = useState("");
    const [admitCount, setAdmitCount] = useState(1);
    const [cardVariant, setCardVariant] = useState("gold");
    const [loading, setLoading] = useState(false);
    const canvasRef = useRef(null);
    const baseImageRef = useRef(null);
    const [imageURL, setImageURL] = useState(null);
    const [previewReady, setPreviewReady] = useState(false);

    const cardSrc = CARD_ASSETS[cardVariant];

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
        drawCardOverlay(ctx, img, guestName, admitCount, cardVariant);

        const dataURL = canvas.toDataURL("image/jpeg", 0.92);
        setImageURL(dataURL);
        localStorage.setItem("generatedCard", dataURL);
        localStorage.setItem(
            "generatedCardMeta",
            JSON.stringify({ variant: cardVariant, guestName, admitCount: String(admitCount) }),
        );
        setLoading(false);
    };

    const downloadImage = () => {
        const safe = guestName.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_") || "guest";
        const link = document.createElement("a");
        link.href = imageURL;
        link.download = `${safe}_${cardVariant}_admit-${admitCount}.jpeg`;
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
                    const file = new File([blob], `${safe}_${cardVariant}.jpeg`, { type: blob.type });
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
                    Wedding invitation card generator
                </h2>
                <p className="mb-6 sm:mb-8 md:mb-10 text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 text-center">
                    Choose gold or black artwork, enter the guest name and how many people the invitation admits, then
                    generate.
                </p>
                <div className="flex flex-wrap justify-center gap-10 w-full">
                    <div className="bg-white shadow-md rounded-lg p-5 w-full md:w-1/2 flex flex-col items-center">
                        <h2 className="text-2xl font-semibold mb-3">Generate your card</h2>
                        <form onSubmit={handleSubmit} className="w-full space-y-4">
                            <div>
                                <span className="block text-sm font-medium text-gray-700 mb-2">Card style</span>
                                <div className="flex gap-3">
                                    <label
                                        className={`flex-1 cursor-pointer rounded-lg border-2 p-3 text-center transition ${
                                            cardVariant === "gold"
                                                ? "border-amber-600 bg-amber-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="cardVariant"
                                            value="gold"
                                            checked={cardVariant === "gold"}
                                            onChange={() => setCardVariant("gold")}
                                            className="sr-only"
                                        />
                                        <span className="font-medium text-amber-900">Gold</span>
                                    </label>
                                    <label
                                        className={`flex-1 cursor-pointer rounded-lg border-2 p-3 text-center transition ${
                                            cardVariant === "black"
                                                ? "border-gray-800 bg-gray-100"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="cardVariant"
                                            value="black"
                                            checked={cardVariant === "black"}
                                            onChange={() => setCardVariant("black")}
                                            className="sr-only"
                                        />
                                        <span className="font-medium text-gray-900">Black</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Name of the person to invite
                                </label>
                                <input
                                    id="guestName"
                                    type="text"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    placeholder="e.g. Mr. John Mukasa"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded text-black bg-white placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="admitCount" className="block text-sm font-medium text-gray-700 mb-1">
                                    Number of persons this invitation admits
                                </label>
                                <input
                                    id="admitCount"
                                    type="number"
                                    min={1}
                                    max={99}
                                    value={admitCount}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setAdmitCount(v === "" ? "" : Number(v));
                                    }}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded text-black bg-white"
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
