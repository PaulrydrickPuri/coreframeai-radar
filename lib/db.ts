/**
 * Trend Data Types Module
 * 
 * Contains type definitions for trend data used throughout the application
 */

// Interface for trend data
export interface TrendItem {
  tag: string;
  count: number;
  velocity: number;
}

export interface TrendData {
  generated_at: string;
  surface: TrendItem[];
  deep: TrendItem[];
}
