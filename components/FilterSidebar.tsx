import { FilterX } from 'lucide-react';
import { AlcoholType, RestaurantStyle } from '@/types';

interface FilterState {
    city: string;
    style: RestaurantStyle | 'all';
    cuisine: string;
    alcohol: AlcoholType | 'all';
    sort: 'low' | 'high';
}

interface FilterSidebarProps {
    filters: FilterState;
    setFilters: (f: FilterState) => void;
    availableCities: string[];
    className?: string;
}

export default function FilterSidebar({ filters, setFilters, availableCities, className = "" }: FilterSidebarProps) {

    const handleChange = (key: keyof FilterState, value: any) => {
        setFilters({ ...filters, [key]: value });
    };

    return (
        <aside className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-6 ${className} transition-colors`}>
            <div className="mb-8 hidden md:block">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                    Japan<br /><span className="text-indigo-600 dark:text-indigo-400">Solo Dining</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">รวมอาหารที่รับลูกค้าเดี่ยว
                    <br />สำหรับคนที่ไปเที่ยวญี่ปุ่นคนเดียวเพราะหลายๆ สาเหตุ เช่น
                    <br />เพื่อนไม่คบ
                    <br />ต้องดูแลผัวอยู่บ้าน
                    <br />ต้องเก็บตั้งไปซื้อปูนเลยไม่มีตังค์ไปด้วย เฮ้อ</p>
            </div>

            <div className="space-y-6">
                {/* City Filter */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">เมือง (City)</label>
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="city"
                                value="all"
                                checked={filters.city === 'all'}
                                onChange={() => handleChange('city', 'all')}
                                className="text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">ทั้งหมด</span>
                        </label>
                        {availableCities.map(city => (
                            <label key={city} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="city"
                                    value={city}
                                    checked={filters.city === city}
                                    onChange={() => handleChange('city', city)}
                                    className="text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">{city}</span>
                            </label>
                        ))}
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
                        <option value="low">ราคาถูกสุดก่อน</option>
                        <option value="high">ราคาแพงสุดก่อน</option>
                    </select>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-400 dark:text-slate-500 mb-1">อัตราแลกเปลี่ยน (Rate)</div>
                    <div className="font-mono font-bold text-slate-600 dark:text-slate-300">0.20 THB / JPY</div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            Made with ❤️ for Solo Diners and because my best friend is said he can't go with me because he want to saving money for buy airsoft gun only.                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
