export type AlcoholType = 'Nomihodai' | 'PayPerGlass';
export type RestaurantStyle = 'Buffet' | 'AlaCarte';

export interface AlcoholInfo {
    type: AlcoholType;
    price: number;
}

export interface Restaurant {
    id?: string;
    name: string;
    cities: string[]; // Changed from single city to array
    cuisine: string;
    style: RestaurantStyle;
    price: number;
    alcohol_type: AlcoholType; // Flatted for form simplicity or mapped from nested
    alcohol_price: number;
    solo_rating: number;
    description: string;
    tags: string[];
    imageUrls?: string[]; // Array of image URLs
    createdAt?: any; // Timestamp
}

// Helper for display/logic if needed, though interfaces are usually enough
