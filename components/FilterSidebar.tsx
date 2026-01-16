import { useState } from 'react';
import { FilterX, ChevronDown, Check } from 'lucide-react';
import { AlcoholType, RestaurantStyle } from '@/types';

interface FilterState {
    city: string[];
    style: RestaurantStyle | 'all';
    cuisine: string;
    alcohol: AlcoholType | 'all';
    sort: 'low' | 'high';
}

interface FilterSidebarProps {
    filters: FilterState;
    setFilters: (f: FilterState) => void;
    availableCities: string[];
    exchangeRate: number;
    className?: string;
}

export default function FilterSidebar({ filters, setFilters, availableCities, exchangeRate, className = "" }: FilterSidebarProps) {
    const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

    const handleChange = (key: keyof FilterState, value: any) => {
        setFilters({ ...filters, [key]: value });
    };

    const toggleCity = (city: string) => {
        const current = filters.city;
        // Handle "All" represented as empty array
        const newCities = current.includes(city)
            ? current.filter(c => c !== city)
            : [...current, city];
        handleChange('city', newCities);
    };

    const clearCities = () => {
        handleChange('city', []);
    };

    return (
        <aside className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-6 ${className} transition-colors`}>
            <div className="mb-8 hidden md:block">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                    Japan<br /><span className="text-indigo-600 dark:text-indigo-400">Solo Dining</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">รวมร้านอาหารที่รับลูกค้ากินคนเดียว
                    <br />สำหรับคนที่ไปเที่ยวญี่ปุ่นคนเดียวเพราะหลายๆ สาเหตุ เช่น
                    <br />เพื่อนไม่คบ
                    <br />ต้องดูแลผัวอยู่บ้าน
                    <br />เพื่อนรักต้องเก็บตังค์ไปซื้อปูนเลยไม่มีตังค์ไปด้วย เฮ้อ</p>
            </div>

            <div className="space-y-6">
                {/* City Filter (Multi-Select Dropdown) */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">เมือง (City)</label>
                    <div className="relative">
                        <button
                            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                            className="w-full flex items-center justify-between text-left text-sm border border-slate-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 dark:text-slate-200 hover:border-indigo-500 transition-colors"
                        >
                            <span className="truncate">
                                {filters.city.length === 0 ? 'ทั้งหมด (All)' : `เลือกแล้ว ${filters.city.length} เมือง`}
                            </span>
                            <ChevronDown size={16} className={`transition-transform duration-200 ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isCityDropdownOpen && (
                            <div className="mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                <div
                                    className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center text-sm text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700"
                                    onClick={clearCities}
                                >
                                    <div className={`w-4 h-4 mr-2 border border-slate-300 dark:border-slate-600 rounded flex items-center justify-center ${filters.city.length === 0 ? 'bg-indigo-600 border-indigo-600' : ''}`}>
                                        {filters.city.length === 0 && <Check size={12} className="text-white" />}
                                    </div>
                                    ทั้งหมด (All)
                                </div>
                                <div className="max-h-48 overflow-y-auto custom-scroll">
                                    {availableCities.map(city => (
                                        <div
                                            key={city}
                                            className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center text-sm text-slate-700 dark:text-slate-200"
                                            onClick={() => toggleCity(city)}
                                        >
                                            <div className={`w-4 h-4 mr-2 border border-slate-300 dark:border-slate-600 rounded flex items-center justify-center ${filters.city.includes(city) ? 'bg-indigo-600 border-indigo-600' : ''}`}>
                                                {filters.city.includes(city) && <Check size={12} className="text-white" />}
                                            </div>
                                            {city}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Style Filter */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">รูปแบบ (Style)</label>
                    <select
                        value={filters.style}
                        onChange={(e) => handleChange('style', e.target.value)}
                        className="w-full text-sm border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-200 p-2 border bg-white dark:bg-slate-800 dark:text-slate-200"
                    >
                        <option value="all">ทั้งหมด</option>
                        <option value="Buffet">บุฟเฟ่ต์ (Buffet)</option>
                        <option value="AlaCarte">จานเดี่ยว (A La Carte)</option>
                    </select>
                </div>

                {/* Cuisine Filter */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">ประเภทอาหาร</label>
                    <select
                        value={filters.cuisine}
                        onChange={(e) => handleChange('cuisine', e.target.value)}
                        className="w-full text-sm border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-200 p-2 border bg-white dark:bg-slate-800 dark:text-slate-200"
                    >
                        <option value="all">ทั้งหมด</option>
                        <option value="Yakiniku">เนื้อย่าง (Yakiniku)</option>
                        <option value="Sushi">ซูชิ (Sushi)</option>
                        <option value="Fried">ของทอด (Tempura/Kushikatsu)</option>
                        <option value="Ramen">ราเมง (Ramen)</option>
                        <option value="Rice">ข้าวหน้าต่างๆ (Rice Bowl)</option>
                        <option value="Izakaya">อิซากายะ (Izakaya)</option>
                    </select>
                </div>

                {/* Alcohol Filter */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">แอลกอฮอล์</label>
                    <select
                        value={filters.alcohol}
                        onChange={(e) => handleChange('alcohol', e.target.value)}
                        className="w-full text-sm border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-200 p-2 border bg-white dark:bg-slate-800 dark:text-slate-200"
                    >
                        <option value="all">ทั้งหมด</option>
                        <option value="Nomihodai">มีบุฟเฟ่ต์เก๊กฮวย (Nomihodai)</option>
                        <option value="PayPerGlass">สั่งแยกแก้ว</option>
                    </select>
                </div>

                {/* Sort */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">เรียงลำดับ</label>
                    <select
                        value={filters.sort}
                        onChange={(e) => handleChange('sort', e.target.value as any)}
                        className="w-full text-sm border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-200 p-2 border bg-white dark:bg-slate-800 dark:text-slate-200"
                    >
                        <option value="high">ราคาแพงสุดก่อน</option>
                        <option value="low">ราคาถูกสุดก่อน</option>
                    </select>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-400 dark:text-slate-500 mb-1">อัตราแลกเปลี่ยน (Rate)</div>
                    <div className="font-mono font-bold text-slate-600 dark:text-slate-300">{exchangeRate.toFixed(2)} THB / JPY</div>
                    <div className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">Source: ECB by Frankfurter API</div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            Made with ❤️ for Solo Diners and because my best friend is said he can't go with me because he want to saving money for buy airsoft gun only.                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
