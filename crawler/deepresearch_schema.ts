/**
 * DeepResearch Schema - Defines the input format for the hashtag trend crawler
 */

export interface DeepResearchInput {
  seed_hashtags: string[];          // e.g. ["#ai", "#llm"]
  target_keywords: string[];        // e.g. ["fine-tuning", "LoRA"]
  seed_accounts: string[];          // e.g. ["@levelsio", "@OpenAI"]
  time_window: string;              // ISO-8601 duration (e.g. "P1D" = last 24h)
  content_type?: ("text"|"image"|"video")[]; // optional filter
  cooccurrence?: [string,string][]; // pairs to watch
}

// JSON Schema for validation
export const deepResearchSchema = {
  type: "object",
  required: ["seed_hashtags", "target_keywords", "seed_accounts", "time_window"],
  properties: {
    seed_hashtags: {
      type: "array",
      items: { type: "string", pattern: "^#[a-zA-Z0-9_]+" },
      minItems: 1
    },
    target_keywords: {
      type: "array",
      items: { type: "string" },
      minItems: 1
    },
    seed_accounts: {
      type: "array",
      items: { type: "string", pattern: "^@[a-zA-Z0-9_]+" },
      minItems: 1
    },
    time_window: {
      type: "string",
      pattern: "^P(?:[0-9]+Y)?(?:[0-9]+M)?(?:[0-9]+W)?(?:[0-9]+D)?(?:T(?:[0-9]+H)?(?:[0-9]+M)?(?:[0-9]+S)?)?$"
    },
    content_type: {
      type: "array",
      items: { type: "string", enum: ["text", "image", "video"] }
    },
    cooccurrence: {
      type: "array",
      items: {
        type: "array",
        minItems: 2,
        maxItems: 2,
        items: { type: "string" }
      }
    }
  }
};

// Define the output trend format
export interface TrendItem {
  tag: string;
  surface_level: "mass" | "deep";
  count: number;
  velocity: number;
  ts: string; // ISO timestamp
}

export interface TrendOutput {
  generated_at: string;
  surface: Array<Omit<TrendItem, "surface_level" | "ts">>;
  deep: Array<Omit<TrendItem, "surface_level" | "ts">>;
}
