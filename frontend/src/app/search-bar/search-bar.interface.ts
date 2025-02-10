export interface ApiResponse {
    count: number;
    result: {
        description: string;
        displaySymbol: string;
        symbol: string;
        type: string;
    }[];
}