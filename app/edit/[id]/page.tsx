"use client";

import { useState, useEffect, use } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save, Image as ImageIcon, X, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import imageCompression from 'browser-image-compression';
import { Restaurant } from '@/types';

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

export default function EditRestaurant({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use() for Next.js 15+ compatibility
    // Although standard params is async in recent versions, if build fails we can adjust.
    // For Next.js 14, params is a prop, but let's treat it as Promise just in case or await it.
    // Wait, in Next 14 App Router params is just an object. Next 15 it's a promise.
    // Let's safe-guard. Actually, for client component, it receives params directly usually.
    // But let's assume params is passed.

    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [pinError, setPinError] = useState(false);

    // Data State
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<Inputs>();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploadProgress, setUploadProgress] = useState('');
    const router = useRouter();
    const [restaurantId, setRestaurantId] = useState<string>('');

    // City State
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [customCity, setCustomCity] = useState('');

    // Image State
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);

    // Unwrap params safely
    useEffect(() => {
        const unwrapParams = async () => {
            const resolvedParams = await params;
            setRestaurantId(resolvedParams.id);
        };
        unwrapParams();
    }, [params]);

    // 1. PIN Logic
    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (pinInput === process.env.NEXT_PUBLIC_ADMIN_PIN) {
            setIsAuthenticated(true);
            setPinError(false);
        } else {
            setPinError(true);
        }
    };

    // 2. Fetch Data
    useEffect(() => {
        if (!isAuthenticated || !restaurantId) return;

        const fetchData = async () => {
            try {
                const docRef = doc(db, "restaurants", restaurantId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as Restaurant;

                    // Populate Form
                    setValue('name', data.name);
                    setValue('cuisine', data.cuisine);
                    setValue('style', data.style);
                    setValue('price', data.price);
                    setValue('alcohol_type', data.alcohol_type);
                    setValue('alcohol_price', data.alcohol_price);
                    setValue('solo_rating', data.solo_rating);
                    setValue('description', data.description);
                    setValue('tags_input', data.tags.join(', '));

                    // State
                    setSelectedCities(data.cities || []);
                    setExistingImages(data.imageUrls || []);
                } else {
                    alert("Restaurant not found!");
                    router.push('/');
                }
            } catch (err) {
                console.error("Error fetching doc:", err);
            } finally {
                setFetching(false);
            }
        };

        fetchData();
    }, [isAuthenticated, restaurantId, setValue, router]);

    const toggleCity = (city: string) => {
        if (selectedCities.includes(city)) {
            setSelectedCities(selectedCities.filter(c => c !== city));
        } else {
            setSelectedCities([...selectedCities, city]);
        }
    };

    // Image Handlers
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedFiles(prev => [...prev, ...files]);
            const urls = files.map(file => URL.createObjectURL(file));
            setNewPreviews(prev => [...prev, ...urls]);
        }
    };

    const removeExistingImage = (url: string) => {
        setExistingImages(prev => prev.filter(img => img !== url));
    };

    const removeNewImage = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setNewPreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    // Submit Logic
    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        setLoading(true);
        setUploadProgress('Preparing data...');

        // Cities
        let finalCities = [...selectedCities];
        if (customCity.trim()) finalCities.push(customCity.trim());
        finalCities = Array.from(new Set(finalCities));

        if (finalCities.length === 0) {
            alert("Please select at least one city.");
            setLoading(false);
            return;
        }

        try {
            // Upload New Images
            const newImageUrls: string[] = [];
            if (selectedFiles.length > 0) {
                const compressionOptions = {
                    maxWidthOrHeight: 1080,
                    useWebWorker: true,
                    fileType: "image/webp",
                    maxSizeMB: 0.5
                };

                for (let i = 0; i < selectedFiles.length; i++) {
                    const file = selectedFiles[i];
                    setUploadProgress(`Compressing & Uploading image ${i + 1}/${selectedFiles.length}...`);
                    try {
                        const compressedFile = await imageCompression(file, compressionOptions);
                        const filename = `${Date.now()}-${file.name.split('.')[0]}.webp`;
                        const storageRef = ref(storage, `restaurants/${filename}`);
                        await uploadBytes(storageRef, compressedFile);
                        const url = await getDownloadURL(storageRef);
                        newImageUrls.push(url);
                    } catch (err) {
                        console.error("Error upload:", err);
                    }
                }
            }

            // Merge Images
            const finalImageUrls = [...existingImages, ...newImageUrls];

            setUploadProgress('Updating database...');

            const docRef = doc(db, "restaurants", restaurantId);
            await updateDoc(docRef, {
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
                imageUrls: finalImageUrls,
                updatedAt: serverTimestamp() // technically new field but good to have
            });

            router.push('/');
        } catch (error) {
            console.error("Error updating:", error);
            alert("Failed to update");
        } finally {
            setLoading(false);
            setUploadProgress('');
        }
    };

    // PIN UI
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 transition-colors">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg w-full max-w-sm border border-slate-100 dark:border-slate-700 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500 dark:text-slate-400">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Restricted Access</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Enter PIN to edit restaurant details.</p>

                    <form onSubmit={handleUnlock}>
                        <input
                            type="password"
                            value={pinInput}
                            onChange={(e) => setPinInput(e.target.value)}
                            className="w-full text-center text-2xl tracking-widest p-3 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="••••••"
                            autoFocus
                        />
                        {pinError && <p className="text-red-500 text-sm mb-4">Incorrect PIN</p>}
                        <button
                            type="submit"
                            className="w-full bg-slate-900 dark:bg-slate-700 text-white font-bold py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                        >
                            Unlock
                        </button>
                    </form>
                    <button
                        onClick={() => router.push('/')}
                        className="mt-4 text-slate-400 hover:text-slate-600 text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

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
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">แก้ไขข้อมูลร้าน</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Update details and manage photos</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ชื่อร้าน</label>
                            <input
                                {...register("name", { required: true })}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 dark:text-slate-100"
                            />
                            {errors.name && <span className="text-red-500 text-xs">Required</span>}
                        </div>

                        {/* Cities */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">เมือง</label>
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

                        {/* Image Management */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">จัดการรูปภาพ</label>

                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-4">
                                {/* Existing Images */}
                                {existingImages.map((src, index) => (
                                    <div key={`exist-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-green-200 dark:border-green-800 group">
                                        <img src={src} alt="Existing" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-green-500/10 pointer-events-none" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(src)}
                                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove Image"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}

                                {/* New Previews */}
                                {newPreviews.map((src, index) => (
                                    <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-blue-200 dark:border-blue-800 group">
                                        <img src={src} alt="New Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}

                                {/* Upload Button */}
                                <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/50">
                                    <ImageIcon className="text-slate-400 mb-2" />
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Add New</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-slate-400">Green outline = Existing, Blue outline = New (Ready to upload)</p>
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
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags (คั่นด้วยคอมม่า)</label>
                            <input
                                {...register("tags_input")}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 dark:text-slate-100"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-all flex justify-center items-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <Loader2 className="animate-spin mr-2" />
                                    <span>{uploadProgress || 'Updating...'}</span>
                                </div>
                            ) : (
                                <><Save size={18} className="mr-2" /> บันทึกการแก้ไข</>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
