export type NewsSource = {
  id: string;
  domain: string;
  section: string;
  url: string;
  pageType: "list" | "article";
  articleLinkSelector?: string;
  titleSelector?: string;
  contentSelector?: string;
  publishedAtSelector?: string;
  locationHint?: string[];
};

export const defaultNewsSources: NewsSource[] = [
  { id: "news24-south-africa", domain: "news24.com", section: "south-africa", url: "https://www.news24.com/news24", pageType: "list", locationHint: ["South Africa"] },
  { id: "timeslive-news", domain: "timeslive.co.za", section: "news", url: "https://www.timeslive.co.za/news/south-africa/", pageType: "list", locationHint: ["South Africa"] },
  { id: "sabc-news", domain: "sabcnews.com", section: "south-africa", url: "https://www.sabcnews.com/sabcnews/category/south-africa/", pageType: "list", locationHint: ["South Africa"] },
  { id: "ewn-news", domain: "ewn.co.za", section: "news", url: "https://ewn.co.za/", pageType: "list", locationHint: ["South Africa"] },
  { id: "iol-news", domain: "iol.co.za", section: "news", url: "https://www.iol.co.za/news", pageType: "list", locationHint: ["South Africa"] },
  { id: "daily-maverick", domain: "dailymaverick.co.za", section: "south-africa", url: "https://www.dailymaverick.co.za/section/south-africa/", pageType: "list", locationHint: ["South Africa"] },
  { id: "business-day", domain: "businesslive.co.za", section: "business", url: "https://www.businesslive.co.za/", pageType: "list", locationHint: ["South Africa"] },
  { id: "mybroadband", domain: "mybroadband.co.za", section: "technology", url: "https://mybroadband.co.za/news/", pageType: "list", locationHint: ["South Africa"] },
  { id: "sport24", domain: "sport24.co.za", section: "sport", url: "https://www.news24.com/sport", pageType: "list", locationHint: ["South Africa"] },
  { id: "citizen-news", domain: "citizen.co.za", section: "news", url: "https://www.citizen.co.za/news/", pageType: "list", locationHint: ["South Africa"] }
];