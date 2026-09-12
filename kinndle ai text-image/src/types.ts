export interface AspectRatioOption {
  id: string;
  label: string;
  ratio: string;
  width: number;
  height: number;
  icon: string;
}

export interface StyleOption {
  id: string;
  label: string;
  desc: string;
}

export interface QualityPreset {
  id: string;
  label: string;
  detail: string;
}

export interface AgentConfigResponse {
  name: string;
  tagline: string;
  model: string;
  personalisation?: {
    icon: string;
    gradient: {
      from: string;
      to: string;
      angle: number;
      fromStop: number;
      toStop: number;
    };
  };
  capabilities: {
    textToImage: boolean;
    promptEnhancement: boolean;
    referenceImages: boolean;
    styleControl: boolean;
    aspectRatioControl: boolean;
    multiImageRequests: boolean;
    upscalePreview: boolean;
  };
  aspectRatios: AspectRatioOption[];
  styles: StyleOption[];
  imageTypes: string[];
  qualityPresets: QualityPreset[];
}

export interface PromptEnhanceResult {
  success: boolean;
  originalPrompt: string;
  enhancedPrompt: string;
  breakdown: {
    subject: string;
    lighting: string;
    camera: string;
    composition: string;
    mood: string;
  };
  suggestedAspect: string;
  directorNote: string;
}

export interface GenerateImagePayload {
  prompt: string;
  enhancedPrompt?: string;
  aspectRatio: string;
  style: string;
  quality: string;
  referenceImage?: string | null;
  imageType: string;
  guidance?: number;
  creativity?: number;
}

export interface GeneratedImageItem {
  id: string;
  imageUrl: string;
  prompt: string;
  enhancedPrompt?: string;
  aspectRatio: string;
  style: string;
  quality: string;
  imageType: string;
  createdAt: string;
  referenceImageUsed?: boolean;
  metadata?: {
    agent: string;
    model: string;
    dimensions: string;
  };
}

export interface ReferenceAnalysisResult {
  subjectSummary: string;
  lightingStyle: string;
  composition: string;
  colorPalette: string[];
  keyTextures: string;
  recommendedVariations: string[];
}

export interface ExploreArtwork {
  id: string;
  title: string;
  category: 'Trending' | 'Cinematic' | 'Portrait' | 'Fashion' | 'Product' | 'Fantasy' | 'Architecture' | 'Abstract';
  imageUrl: string;
  prompt: string;
  enhancedPrompt: string;
  aspectRatio: string;
  style: string;
  author: string;
  likes: number;
}
