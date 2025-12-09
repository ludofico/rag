interface ShowData {
  score: number;
  show: {
    id: number;
    name: string;
    image: { 
      medium: string; 
      original: string; 
    } | null;
    genres: string[];
    rating: { average: number | null };
    premiered: string;
    status: string;
    summary: string;
    network?: {
      name: string;
      country?: { name: string };
    };
    url: string;
  };
}

interface ShowCardProps {
  data: ShowData;
}
export type { ShowData, ShowCardProps };