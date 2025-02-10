export interface OHLCData {
    v: number;
    vw: number;
    o: number; 
    c: number; 
    h: number; 
    l: number; 
    t: number; 
    n: number; 
}




export interface chartsTabApiResponse {
    ticker: string;
    queryCount: number;
    resultsCount: number;
    adjusted: boolean;
    results: OHLCData[];
    status: string;
    request_id: string;
    count: number;
}