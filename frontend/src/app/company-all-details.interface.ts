import { OHLCData, chartsTabApiResponse } from "./charts-tab.interface";
import { companyData, companyInsights } from "./company-insights.interface";
import { newsData } from "./news.interface";
import { quoteData } from "./quote-data.interface";
import { recommdationTrends } from "./recommendation-trends.interface";
import { stockProfile } from "./stock-profile.interface";

export interface companyAllDetails {
    quoteData: quoteData, 
    stockProfileData: stockProfile, 
    companyPeer: string[], 
    newsData: newsData[], 
    chartsTabData: number[][], 
    volumeData: number[][], 
    hourlyPriceApiData: number[][], 
    recommendationTrends: recommdationTrends[], 
    companyInsights: companyData[], 
}