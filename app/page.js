"use client";

import React, { useState, useRef, useEffect } from 'react';

export default function Home() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const canvasRef = useRef(null);
    const [imageURL, setImageURL] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const image = new Image();
        image.src = '/card3.jpeg';

        image.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Set canvas dimensions to square format
            const size = Math.max(image.width, image.height);
            canvas.width = size;
            canvas.height = size;

            // Calculate the position to center the image on the canvas
            const offsetX = (size - image.width) / 2;
            const offsetY = (size - image.height) / 2;

            ctx.drawImage(image, offsetX, offsetY, image.width, image.height);
            setImageLoaded(true);
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const image = new Image();
        image.src = '/card3.jpeg';

        image.onload = () => {
            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Redraw the image centered on the canvas
            const offsetX = (canvas.width - image.width) / 2;
            const offsetY = (canvas.height - image.height) / 2;
            ctx.drawImage(image, offsetX, offsetY, image.width, image.height);

            // Add text
            ctx.font = '27px Arial';
            ctx.fillStyle = '#133378';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const sanitizedName = name;
            const textX = canvas.width / 2.15;
            const textY = canvas.height / 2.1;
            ctx.fillText(sanitizedName, textX, textY);

            // Generate the image URL
            const dataURL = canvas.toDataURL('image/jpeg');
            setImageURL(dataURL);
            localStorage.setItem('generatedCard', dataURL);
            setLoading(false);
        };
    };

    const downloadImage = () => {
        const link = document.createElement('a');
        link.href = imageURL;
        link.download = `${name}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const shareImage = () => {
        const savedImageURL = localStorage.getItem('generatedCard');
    
        if (navigator.share) {
            fetch(savedImageURL)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], `${name}.jpeg`, { type: blob.type });
                    navigator.share({
                        files: [file],
                    })
                    .then(() => console.log('Thanks for sharing!'))
                    .catch(err => console.error('Error sharing:', err));
                });
        } else {
            alert('Sharing is not supported in your browser. Please download the image and share it manually.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
            <nav className="bg-white shadow-md p-4 flex justify-between w-full max-w-5xl">
                <div className="text-xl font-bold">Card Generator</div>
                <div className="space-x-4">
                    <button onClick={() => setImageURL(null)} className="text-blue-500 hover:underline">Home</button>
                </div>
            </nav>

            <div className="py-10 flex flex-col items-center w-full max-w-5xl">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-center text-black">
                    Dr Wasswas weds Dr Betty Party Card Generator
                </h2>
                <p className="mb-6 sm:mb-8 md:mb-10 text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 text-center">
                    Enter a name and see the generated card on the right.
                </p>
                <div className="flex flex-wrap justify-center gap-10 w-full px-4">
                    <div className="bg-white shadow-md rounded-lg p-5 w-full md:w-1/2 flex flex-col items-center">
                        <h2 className="text-2xl font-semibold mb-3">Generate Your Card</h2>
                        <form onSubmit={handleSubmit} className="w-full">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter Guest name"
                                required
                                className="w-full p-3 border border-gray-300 rounded mb-4 text-black bg-white placeholder-gray-500"
                                style={{ color: '#000', backgroundColor: '#fff' }}
                            />
                            <button type="submit" className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600">
                                Generate Card
                            </button>
                        </form>
                        {loading && <p className="mt-3 text-gray-500">Generating...</p>}
                    </div>
                    {imageURL && (
                        <div className="bg-white shadow-md rounded-lg p-3 w-full md:w-1/2 flex flex-col items-center overflow-hidden">
                            <h2 className="text-lg font-semibold mb-2">Your Generated Card</h2>
                            <img src={imageURL} alt="Generated Card" className="mb-3 max-w-full max-h-[300px] h-auto object-contain" />
                            <div className="flex justify-between w-full">
                                <button onClick={downloadImage} className="w-full mr-1 p-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">
                                    Download
                                </button>
                                <button onClick={shareImage} className="w-full ml-1 p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm">
                                    Share
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
    );
}