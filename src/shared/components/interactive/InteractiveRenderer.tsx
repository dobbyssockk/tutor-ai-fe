import type { InteractiveSpec } from '@/shared/components/interactive/interactive-spec';
import {
  ComparisonExplorer,
  LinearExplorer,
  MediaGalleryExplorer,
  QuadraticExplorer,
  TimelineExplorer,
  TrigExplorer,
} from '@/shared/components/interactive/renderers';

type InteractiveRendererProps = {
  spec: InteractiveSpec;
};

const InteractiveRenderer = ({ spec }: InteractiveRendererProps) => {
  if (spec.type === 'comparison_explorer') {
    return <ComparisonExplorer spec={spec} />;
  }

  if (spec.type === 'quadratic_explorer') {
    return <QuadraticExplorer spec={spec} />;
  }

  if (spec.type === 'linear_explorer') {
    return <LinearExplorer spec={spec} />;
  }

  if (spec.type === 'timeline_explorer') {
    return <TimelineExplorer spec={spec} />;
  }

  if (spec.type === 'media_gallery_explorer') {
    return <MediaGalleryExplorer spec={spec} />;
  }

  return <TrigExplorer spec={spec} />;
};

export default InteractiveRenderer;
