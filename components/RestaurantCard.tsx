import Image from 'next/image';
import Link from 'next/link';
import { Restaurant } from '@/types';
import { Star, ImageOff } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

// Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

interface RestaurantCardProps {
    restaurant: Restaurant;
    exchangeRate: number;
    onClick?: () => void;
}

export default function RestaurantCard({ restaurant, exchangeRate, onClick }: RestaurantCardProps) {
    const { name, cities, cuisine, price, alcohol_type, alcohol_price, solo_rating, description, tags, style, imageUrls } = restaurant;

    const priceTHB = Math.round(price * exchangeRate).toLocaleString();
    const priceYen = price.toLocaleString();
    const alcPriceTHB = Math.round(alcohol_price * exchangeRate).toLocaleString();

    // Badge Logic
    const isBuffet = style === 'Buffet';
    const isNomihodai = alcohol_type === 'Nomihodai';

    // Solo Stars Logic
    const stars = Array.from({ length: 5 }, (_, i) => i < solo_rating);

    // Image Logic
    const hasMultipleImages = imageUrls && imageUrls.length > 1;
    const mainImage = imageUrls && imageUrls.length > 0 ? imageUrls[0] : null;

    return (
        <div
            className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col hover:translate-y-[-3px] hover:shadow-md transition-all duration-200 group ${onClick ? 'cursor-pointer' : ''}`}
            data-aos="fade-up"
            data-aos-duration="600"
            onClick={onClick}
        >
            {/* Thumbnail */}
            <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                {hasMultipleImages ? (
                    <Swiper
                        modules={[Autoplay, Pagination]}
                        spaceBetween={0}
                        slidesPerView={1}
                        loop={true}
                        autoplay={{
                            delay: 3500,
                            disableOnInteraction: false,
                        }}
                        pagination={{ clickable: true }}
                        className="w-full h-full"
                    >
                        {imageUrls?.map((url, idx) => (
                            <SwiperSlide key={idx} className="relative w-full h-full">
                                <Image
                                    src={url}
                                    alt={`${name} - ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    priority={idx === 0}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : mainImage ? (
                    <Image
                        src={mainImage}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={false}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                        <ImageOff size={32} className="mb-2 opacity-50" />
                        <span className="text-xs">No Image</span>
                    </div>
                )}

                {/* Edit Button - Only visible on hover/focus */}
                <Link
                    href={restaurant.id ? `/edit/${restaurant.id}` : '#'}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full text-slate-700 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-slate-800 z-10"
                    title="Edit Restaurant"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                </Link>
            </div>
            <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight">{name}</h3>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 flex-wrap">
                            <span>📍 {cities.join(', ')}</span>
                            <span>•</span>
                            <span>{cuisine}</span>
                        </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                        <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">฿{priceTHB}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">¥{priceYen}</div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.7rem] font-semibold ${isBuffet ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800' : 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800'}`}>
                        {style === 'Buffet' ? 'Buffet' : 'A La Carte'}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.7rem] font-semibold ${isNomihodai ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800' : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'}`}>
                        {isNomihodai ? '🍺 บุฟเฟ่ต์เก๊กฮวย' : '🥃 จ่ายแยก'}
                    </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed line-clamp-3">
                    {description}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-auto">
                    {tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[10px] rounded border border-slate-100 dark:border-slate-600">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 px-5 py-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs">
                <div className="flex items-center font-medium">
                    {stars.map((filled, i) => (
                        <Star key={i} size={14} className={filled ? "fill-yellow-500 text-yellow-500" : "text-slate-300 dark:text-slate-600"} />
                    ))}
                    <span className="ml-1 text-slate-500 dark:text-slate-400 hidden sm:inline">Solo Score</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-right">
                    {isNomihodai
                        ? <span className="text-blue-600 dark:text-blue-400 font-semibold">+ดื่มไม่อั้น ~฿{alcPriceTHB}</span>
                        : `เครื่องดื่มเริ่ม ~฿${alcPriceTHB}`
                    }
                </div>
            </div>
        </div>
    );
}
