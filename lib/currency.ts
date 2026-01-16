export async function getExchangeRate(): Promise<number> {
    try {
        const res = await fetch('https://api.frankfurter.app/latest?from=JPY&to=THB', {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!res.ok) {
            throw new Error('Failed to fetch exchange rate');
        }

        const data = await res.json();
        return data.rates.THB;
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        return 0.20; // Fallback rate (approximate current rate)
    }
}
