"use client";

import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Restaurant, AlcoholType, RestaurantStyle } from '@/types';
import RestaurantCard from '@/components/RestaurantCard';
import FilterSidebar from '@/components/FilterSidebar';
import DashboardCharts from '@/components/DashboardCharts';
import { SlidersHorizontal, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import RestaurantModal from '@/components/RestaurantModal';

interface FilterState {
  city: string[];
  style: RestaurantStyle | 'all';
  cuisine: string;
  alcohol: AlcoholType | 'all';
  sort: 'low' | 'high';
}

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Modal State
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    city: [],
    style: 'all',
    cuisine: 'all',
    alcohol: 'all',
    sort: 'high',
  });

  // Fetch Data
  useEffect(() => {
    const q = query(collection(db, "restaurants"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant));
      setRestaurants(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Modal Handlers
  const handleCardClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedRestaurant(null), 300); // Clear after animation
  };

  // Derived Data
  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    restaurants.forEach(r => r.cities.forEach(c => cities.add(c)));
    return Array.from(cities).sort();
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    let result = restaurants.filter(r => {
      const matchCity = filters.city.length === 0 || r.cities.some(c => filters.city.includes(c));
      const matchStyle = filters.style === 'all' || r.style === filters.style;
      const matchCuisine = filters.cuisine === 'all' || r.cuisine === filters.cuisine;

      let matchAlcohol = true;
      if (filters.alcohol === 'Nomihodai') matchAlcohol = r.alcohol_type === 'Nomihodai';
      if (filters.alcohol === 'PayPerGlass') matchAlcohol = r.alcohol_type === 'PayPerGlass';

      return matchCity && matchStyle && matchCuisine && matchAlcohol;
    });

    if (filters.sort === 'low') {
      result.sort((a, b) => a.price - b.price);
    } else {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [restaurants, filters]);

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar /> {/* Mobile friendly Navbar */}

      <div className="flex flex-1">
        {/* Mobile Header / Controls (Sticky below Navbar on mobile?) */}
        {/* We'll just put the mobile toggle in the main content area top if strict sidebar behavior */}

        {/* Sidebar (Desktop) */}
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          availableCities={availableCities}
          className="hidden md:block w-72 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-slate-200 dark:border-slate-700"
        />

        {/* Main Content */}
        <main className="flex-grow p-4 md:p-8 relative transition-colors">

          {/* Mobile Filter Toggle */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-medium text-sm flex justify-center items-center shadow-sm transition-colors"
            >
              <SlidersHorizontal size={16} className="mr-2" />
              <span>{showMobileFilters ? 'ปิดตัวกรอง' : 'ตัวกรอง / ค้นหา'}</span>
            </button>

            {showMobileFilters && (
              <div className="mt-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 p-4 animate-in fade-in slide-in-from-top-2">
                <FilterSidebar
                  filters={filters}
                  setFilters={setFilters}
                  availableCities={availableCities}
                  className="border-none p-0 h-auto overflow-visible mb-4 bg-transparent dark:bg-transparent"
                />
                <p className="text-xs text-center text-gray-400 border-t dark:border-slate-700 pt-2">
                  กดปุ่มด้านบนเพื่อซ่อน
                </p>
              </div>
            )}
          </div>

          {/* Dashboard Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Widget 1: Count */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center items-center text-center transition-colors">
              {loading ? (
                <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400 mb-2" />
              ) : (
                <div className="text-6xl font-black text-indigo-600 dark:text-indigo-400">
                  {filteredRestaurants.length}
                </div>
              )}
              <div className="text-md text-slate-500 dark:text-slate-400 font-medium">ร้านที่ตรงเงื่อนไข</div>
            </div>

            {/* Widget 2: Chart */}
            <div className="col-span-1 lg:col-span-2">
              <DashboardCharts restaurants={filteredRestaurants} />
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-slate-400 dark:text-slate-500" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
              {filteredRestaurants.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 transition-colors">
                  <div className="text-4xl mb-4">😔</div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">ไม่พบร้านอาหาร</h3>
                  <p className="text-slate-500 dark:text-slate-400">ลองปรับตัวกรองให้กว้างขึ้น</p>
                </div>
              ) : (
                filteredRestaurants.map(restaurant => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    exchangeRate={0.20}
                    onClick={() => handleCardClick(restaurant)}
                  />
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      <RestaurantModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        restaurant={selectedRestaurant}
        exchangeRate={0.20}
      />
    </div>
  );
}
