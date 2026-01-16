"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save, Image as ImageIcon, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import imageCompression from 'browser-image-compression';

type Inputs = {
    name: string;
    cuisine: string;
    style: 'Buffet' | 'AlaCarte';
    price: number;
    alcohol_type: 'Nomihodai' | 'PayPerGlass';
    alcohol_price: number;
    solo_rating: number; // 1-5
    description: string;
    tags_input: string; // Comma separated for input
};

const PREDEFINED_CITIES = ['Osaka', 'Kyoto', 'Kobe', 'Nara', 'Tokyo', 'Fukuoka', 'Hokkaido', 'สะพานควาย', 'อารีย์', 'ห้าแยกลาดพร้าว'];

export default function AddRestaurant() {
    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const router = useRouter();

    // Custom State for Cities (Multi-select + Custom)
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [customCity, setCustomCity] = useState('');

    // Image State
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const toggleCity = (city: string) => {
        if (selectedCities.includes(city)) {
            setSelectedCities(selectedCities.filter(c => c !== city));
        } else {
            setSelectedCities([...selectedCities, city]);
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedFiles(prev => [...prev, ...files]);

            // Create object URLs for preview
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            // Revoke URL to avoid memory leaks
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        setLoading(true);
        setUploadProgress('Preparing data...');

        // Combine cities
        let finalCities = [...selectedCities];
        if (customCity.trim()) {
            finalCities.push(customCity.trim());
        }
        finalCities = Array.from(new Set(finalCities));

        if (finalCities.length === 0) {
            alert("Please select at least one city.");
            setLoading(false);
            return;
        }

        try {
            // 1. Compress and Upload Images
            const imageUrls: string[] = [];

            if (selectedFiles.length > 0) {
                const compressionOptions = {
                    maxWidthOrHeight: 720,
                    useWebWorker: true,
                    fileType: "image/webp",
                    maxSizeMB: 0.25
                };

                for (let i = 0; i < selectedFiles.length; i++) {
                    const file = selectedFiles[i];
                    setUploadProgress(`Compressing & Uploading image ${i + 1}/${selectedFiles.length}...`);

                    try {
                        const compressedFile = await imageCompression(file, compressionOptions);

                        // Create unique filename
                        const filename = `${Date.now()}-${file.name.split('.')[0]}.webp`;
                        const storageRef = ref(storage, `restaurants/${filename}`);

                        await uploadBytes(storageRef, compressedFile);
                        const downloadURL = await getDownloadURL(storageRef);
                        imageUrls.push(downloadURL);
                    } catch (err) {
                        console.error("Error processing image:", file.name, err);
                        // Continue ensuring other images are uploaded
                    }
                }
            }

            setUploadProgress('Saving to database...');

            // 2. Save to Firestore
            await addDoc(collection(db, "restaurants"), {
                name: data.name,
                cities: finalCities,
                cuisine: data.cuisine,
                style: data.style,
                price: Number(data.price),
                alcohol_type: data.alcohol_type,
                alcohol_price: Number(data.alcohol_price),
                solo_rating: Number(data.solo_rating),
                description: data.description,
                tags: data.tags_input.split(',').map(t => t.trim()).filter(t => t !== ''),
                imageUrls: imageUrls,
                createdAt: serverTimestamp()
            });

            router.push('/');
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Error saving data");
        } finally {
            setLoading(false);
            setUploadProgress('');
        }
    };

    return (
        <div className="min-h-screen flex flex-col w-full transition-colors">
            <Navbar />

            <main className="flex-grow p-4 md:p-8">
                <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8 transition-colors">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">เพิ่มร้านใหม่</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">แบ่งปันร้านเด็ดของคุณให้คนอื่นรู้</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ชื่อร้าน</label>
                            <input
                                {...register("name", { required: true })}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 dark:text-slate-100"
                                placeholder="Ex. ป้าซ่าหมูกระทะ"
                            />
                            {errors.name && <span className="text-red-500 text-xs">Required</span>}
                        </div>

                        {/* Cities */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">เมือง (เลือกได้มากกว่า 1)</label>
                            <div className="flex flex-wrap gap-3 mb-3">
                                {PREDEFINED_CITIES.map(city => (
                                    <button
                                        key={city}
                                        type="button"
                                        onClick={() => toggleCity(city)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${selectedCities.includes(city) ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                    >
                                        {city}
                                    </button>
                                ))}
                            </div>
                            <input
                                value={customCity}
                                onChange={(e) => setCustomCity(e.target.value)}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 dark:text-slate-100"
                                placeholder="หรือระบุเมืองอื่นๆ..."
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">รูปภาพ (Multi-select)</label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-4">
                                {previews.map((src, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group">
                                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/50">
                                    <ImageIcon className="text-slate-400 mb-2" />
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Add Photos</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Cuisine */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ประเภทอาหาร</label>
                                <select {...register("cuisine")} className="w-full rounded-lg border-slate-300 dark:border-slate-700 border p-2 bg-white dark:bg-slate-900 dark:text-slate-100">
                                    <option value="Yakiniku">Yakiniku</option>
                                    <option value="Sushi">Sushi</option>
                                    <option value="Fried">Fried/Kushikatsu</option>
                                    <option value="Ramen">Ramen</option>
                                    <option value="Rice">Rice Bowl</option>
                                    <option value="Izakaya">Izakaya</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Style */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">รูปแบบ</label>
                                <select {...register("style")} className="w-full rounded-lg border-slate-300 dark:border-slate-700 border p-2 bg-white dark:bg-slate-900 dark:text-slate-100">
                                    <option value="Buffet">Buffet</option>
                                    <option value="AlaCarte">A La Carte</option>
                                </select>
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ราคาเฉลี่ย (JPY)</label>
                            <input
                                type="number"
                                {...register("price", { required: true, min: 0 })}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 dark:text-slate-100"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Alcohol Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">แอลกอฮอล์</label>
                                <select {...register("alcohol_type")} className="w-full rounded-lg border-slate-300 dark:border-slate-700 border p-2 bg-white dark:bg-slate-900 dark:text-slate-100">
                                    <option value="Nomihodai">Nomihodai (Buffet)</option>
                                    <option value="PayPerGlass">Pay Per Glass</option>
                                </select>
                            </div>

                            {/* Alcohol Price */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ราคาแอลกอฮอล์ (JPY)</label>
                                <input
                                    type="number"
                                    {...register("alcohol_price", { required: true, min: 0 })}
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-700 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 dark:text-slate-100"
                                />
                            </div>
                        </div>

                        {/* Solo Rating */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ระดับความ Solo (1-5)</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range" min="1" max="5" step="1"
                                    {...register("solo_rating")}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                                    {/* Shows current value if watched, but keeping simple for now */}
                                    ★
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">รีวิว / คำอธิบาย</label>
                            <textarea
                                {...register("description", { required: true })}
                                rows={3}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 dark:text-slate-100"
                                placeholder="บรรยากาศเป็นยังไง? สั่งยากไหม?"
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags (คั่นด้วยคอมม่า)</label>
                            <input
                                {...register("tags_input")}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 dark:text-slate-100"
                                placeholder="Dotonbori, วิวสวย, ใกล้สถานี"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all flex justify-center items-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <Loader2 className="animate-spin mr-2" />
                                    <span>{uploadProgress || 'Processing...'}</span>
                                </div>
                            ) : (
                                <><Save size={18} className="mr-2" /> บันทึกข้อมูล</>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
