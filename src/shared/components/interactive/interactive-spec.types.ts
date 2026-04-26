export type TrigFunction = 'sin' | 'cos' | 'tan';
export type InteractiveSubject = 'biology' | 'literature' | 'history' | 'general';

export interface InteractiveRange {
  min: number;
  max: number;
  step: number;
}

export interface QuadraticExplorerSpec {
  type: 'quadratic_explorer';
  title: string;
  params: {
    a: number;
    b: number;
    c: number;
  };
  ranges: {
    a: InteractiveRange;
    b: InteractiveRange;
    c: InteractiveRange;
  };
}

export interface LinearExplorerSpec {
  type: 'linear_explorer';
  title: string;
  params: {
    slope: number;
    intercept: number;
  };
  ranges: {
    slope: InteractiveRange;
    intercept: InteractiveRange;
  };
}

export interface TrigExplorerSpec {
  type: 'trig_explorer';
  title: string;
  function: TrigFunction;
  params: {
    amplitude: number;
    frequency: number;
    phase: number;
    offset: number;
  };
  ranges: {
    amplitude: InteractiveRange;
    frequency: InteractiveRange;
    phase: InteractiveRange;
    offset: InteractiveRange;
  };
}

export interface TimelineExplorerStep {
  id: string;
  title: string;
  details?: string;
  period?: string;
  imageQuery?: string;
  imageCaption?: string;
  keyPoints?: string[];
  outcomes?: string[];
  terms?: string[];
  commonMistake?: string;
  checkQuestion?: string;
  checkAnswer?: string;
}

export interface TimelineExplorerSpec {
  type: 'timeline_explorer';
  title: string;
  subject?: InteractiveSubject;
  steps: TimelineExplorerStep[];
  initialStepId: string;
}

export interface MediaGalleryExplorerSpec {
  type: 'media_gallery_explorer';
  title: string;
  subject?: InteractiveSubject;
  query: string;
  mediaType: 'image' | 'video';
  limit: number;
}

export type ChartInteractiveSpec =
  | QuadraticExplorerSpec
  | LinearExplorerSpec
  | TrigExplorerSpec;

export type SingleInteractiveSpec =
  | ChartInteractiveSpec
  | TimelineExplorerSpec
  | MediaGalleryExplorerSpec;

export interface ComparisonSeriesSpec {
  id: string;
  label?: string;
  color?: string;
  spec: ChartInteractiveSpec;
}

export interface ComparisonExplorerSpec {
  type: 'comparison_explorer';
  title: string;
  mode: 'overlay';
  series: [ComparisonSeriesSpec, ComparisonSeriesSpec];
}

export type InteractiveSpec = SingleInteractiveSpec | ComparisonExplorerSpec;
