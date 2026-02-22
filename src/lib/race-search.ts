import getZAI from './zai';

export interface SearchResult {
  source: string;
  url: string;
  title: string;
  snippet: string;
}

export interface RaceCardData {
  raceNumber: number;
  raceName: string;
  raceTime: string;
  distance: string;
  surface: string;
  horses: {
    name: string;
    number: number;
    jockey: string;
    trainer: string;
    rating?: string;
    weight?: string;
    form?: string;
  }[];
}

export interface RaceSearchResult {
  success: boolean;
  sources: string[];
  racecards: RaceCardData[];
  rawContent: string;
  message: string;
}

// Racing sources to search
const RACING_SOURCES = [
  { name: 'Emirates Racing', domain: 'emiratesracing.com', region: 'UAE' },
  { name: 'At The Races', domain: 'attheraces.com', region: 'UK/EU' },
  { name: 'Racing Post', domain: 'racingpost.com', region: 'UK/Global' },
  { name: 'Sky Racing World', domain: 'skyracingworld.com', region: 'Australia' }
];

/**
 * Search for race card information from multiple sources
 */
export async function searchRaceData(date: string, racecourse: string): Promise<RaceSearchResult> {
  const zai = await getZAI();
  
  const formattedDate = formatDateForSearch(date);
  const searchQueries = buildSearchQueries(racecourse, formattedDate);
  
  let allResults: SearchResult[] = [];
  let combinedContent = '';
  const sourcesUsed: string[] = [];
  
  try {
    // Search each source for racecard data
    for (const query of searchQueries) {
      try {
        const searchResult = await zai.functions.invoke('web_search', {
          query: query,
          num: 5
        });
        
        if (searchResult && Array.isArray(searchResult)) {
          for (const result of searchResult) {
            const searchItem: SearchResult = {
              source: result.host_name || 'Unknown',
              url: result.url || '',
              title: result.name || '',
              snippet: result.snippet || ''
            };
            allResults.push(searchItem);
            
            if (!sourcesUsed.includes(searchItem.source)) {
              sourcesUsed.push(searchItem.source);
            }
            
            combinedContent += `\n\n--- ${searchItem.source} ---\n`;
            combinedContent += `Title: ${searchItem.title}\n`;
            combinedContent += `URL: ${searchItem.url}\n`;
            combinedContent += `Content: ${searchItem.snippet}\n`;
          }
        }
      } catch (error) {
        console.error(`Error searching for query "${query}":`, error);
      }
    }
    
    // Also try to read content from the most relevant URLs
    const relevantUrls = filterRelevantUrls(allResults, racecourse);
    
    for (const url of relevantUrls.slice(0, 3)) {
      try {
        const pageContent = await zai.functions.invoke('web_reader', {
          url: url
        });
        
        if (pageContent && pageContent.content) {
          combinedContent += `\n\n--- Page Content from ${url} ---\n`;
          combinedContent += pageContent.content.substring(0, 5000); // Limit content size
        }
      } catch (error) {
        console.error(`Error reading page ${url}:`, error);
      }
    }
    
    return {
      success: allResults.length > 0,
      sources: sourcesUsed,
      racecards: [], // Will be populated by AI analysis
      rawContent: combinedContent,
      message: allResults.length > 0 
        ? `Found data from ${sourcesUsed.length} sources` 
        : 'No race data found'
    };
    
  } catch (error) {
    console.error('Error in searchRaceData:', error);
    return {
      success: false,
      sources: [],
      racecards: [],
      rawContent: '',
      message: `Error searching for race data: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Format date for search queries
 */
function formatDateForSearch(date: string): string {
  try {
    const dateObj = new Date(date);
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    
    return `${day} ${month} ${year}`;
  } catch {
    return date;
  }
}

/**
 * Build search queries for different sources
 */
function buildSearchQueries(racecourse: string, formattedDate: string): string[] {
  const queries: string[] = [];
  
  // Main query
  queries.push(`${racecourse} racecard ${formattedDate}`);
  queries.push(`${racecourse} horse racing ${formattedDate}`);
  
  // Source-specific queries
  queries.push(`site:emiratesracing.com ${racecourse} ${formattedDate}`);
  queries.push(`site:racingpost.com ${racecourse} racecard ${formattedDate}`);
  queries.push(`site:attheraces.com ${racecourse} ${formattedDate}`);
  queries.push(`site:skyracingworld.com ${racecourse} ${formattedDate}`);
  
  // Alternative queries
  queries.push(`${racecourse} races today horses runners`);
  queries.push(`${racecourse} betting tips predictions ${formattedDate}`);
  
  return queries;
}

/**
 * Filter URLs for relevance to the racecourse
 */
function filterRelevantUrls(results: SearchResult[], racecourse: string): string[] {
  const keywords = racecourse.toLowerCase().split(' ');
  const trustedDomains = ['emiratesracing.com', 'racingpost.com', 'attheraces.com', 'skyracingworld.com'];
  
  const relevantUrls: { url: string; score: number }[] = [];
  
  for (const result of results) {
    let score = 0;
    
    // Check if URL is from trusted domain
    for (const domain of trustedDomains) {
      if (result.url.toLowerCase().includes(domain)) {
        score += 10;
        break;
      }
    }
    
    // Check for racecourse keyword matches
    for (const keyword of keywords) {
      if (result.title.toLowerCase().includes(keyword) || 
          result.snippet.toLowerCase().includes(keyword)) {
        score += 5;
      }
    }
    
    // Check for racecard/races keywords
    if (result.title.toLowerCase().includes('racecard') ||
        result.title.toLowerCase().includes('race card')) {
      score += 5;
    }
    
    if (score > 0) {
      relevantUrls.push({ url: result.url, score });
    }
  }
  
  // Sort by score and return URLs
  return relevantUrls
    .sort((a, b) => b.score - a.score)
    .map(item => item.url);
}

/**
 * Get source name from URL
 */
export function getSourceFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    const source = RACING_SOURCES.find(s => hostname.includes(s.domain));
    return source?.name || hostname;
  } catch {
    return 'Unknown Source';
  }
}

export { RACING_SOURCES };
