export interface companyData {
    symbol:	string;
    year: number;
    month: number;  
    change:	number;
    mspr: number;
}


export interface companyInsights {
    data : companyData[];
    symbol: string;
}