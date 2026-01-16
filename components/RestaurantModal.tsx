"use client";

import { useEffect } from 'react';
import { Restaurant } from '@/types';
import { X, Star, MapPin, JapaneseYen, Info, Wine } from 'lucide-react';
import Image from 'next/image';

interface RestaurantModalProps {
    isOpen: boolean;
    onClose: () => void;
    restaurant: Restaurant | null;
    exchangeRate: number;
}

export default function RestaurantModal({ isOpen, onClose, restaurant, exchangeRate }: RestaurantModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !restaurant) return null;

    const { name, cities, cuisine, price, alcohol_type, alcohol_price, solo_rating, description, tags, style, imageUrls } = restaurant;
    const priceTHB = Math.round(price * exchangeRate).toLocaleString();
    const priceYen = price.toLocaleString();
    const alcPriceTHB = Math.round(alcohol_price * exchangeRate).toLocaleString();
    const isBuffet = style === 'Buffet';
    const isNomihodai = alcohol_type === 'Nomihodai';
    const stars = Array.from({ length: 5 }, (_, i) => i < solo_rating);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 pr-8">{name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            {stars.map((filled, i) => (
                                <Star key={i} size={16} className={filled ? "fill-yellow-500 text-yellow-500" : "text-slate-300 dark:text-slate-600"} />
                            ))}
                            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium ml-1">คะแนนความโซโล่</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="overflow-y-auto custom-scroll p-4 md:p-6 space-y-8">

                    {/* Key Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">สถานที่</h3>
                                    <p className="text-slate-600 dark:text-slate-300">{cities.join(', ')}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                                    <Info size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">รายละเอียด</h3>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{cuisine}</span>
                                        <span className={`px-2 py-1 rounded text-xs border ${isBuffet ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-900' : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900'}`}>
                                            {isBuffet ? 'บุฟเฟ่ต์' : 'จานเดี่ยว'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
                                    <JapaneseYen size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">ราคา</h3>
                                    <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">~฿{priceTHB}</p>
                                    <p className="text-xs text-slate-400">ประมาณ ¥{priceYen}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                                    <Wine size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">แอลกอฮอล์</h3>
                                    <p className="text-slate-600 dark:text-slate-300">
                                        {isNomihodai ? 'บุฟเฟ่ต์ (ดื่มไม่อั้น)' : 'สั่งแยกแก้ว'}
                                    </p>
                                    <p className="text-xs text-slate-400">~฿{alcPriceTHB}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">เกี่ยวกับร้าน</h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            {tags.map((tag, idx) => (
                                <span key={idx} className="text-xs px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-500 dark:text-slate-400">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Gallery */}
                    {imageUrls && imageUrls.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                                รูปภาพ <span className="text-xs font-normal text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">{imageUrls.length} รูป</span>
                            </h3>
                            <div className="flex flex-col gap-4">
                                {imageUrls.map((url, idx) => (
                                    <div key={idx} className="relative w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                        {/* Use standard img tag if aspect ratio is unknown and we want natural height, 
                                            or Next Image with width/height prop if known. 
                                            Since we don't know aspect ratio, width=100%, height=auto.
                                            Next Image 'fill' requires parent height. 
                                            Next Image with width/height requires known dimensions.
                                            Option: Use Next Image with 'width={0} height={0} sizes="100vw" style={{ width: '100%', height: 'auto' }}' 
                                            which is the modern way to do responsive auto-height images in Next.js */}
                                        <Image
                                            src={url}
                                            alt={`${name} - Image ${idx + 1}`}
                                            width={0} // dummy
                                            height={0} // dummy
                                            sizes="100vw"
                                            style={{ width: '100%', height: 'auto' }} // make it responsive and maintain aspect ratio
                                            className="block"
                                            unoptimized // optional: if images form firebase sometimes have issues with optimization without width/height
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
