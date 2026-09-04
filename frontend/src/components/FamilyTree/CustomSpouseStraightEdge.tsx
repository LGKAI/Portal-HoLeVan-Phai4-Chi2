import { BaseEdge, EdgeLabelRenderer, EdgeProps, getStraightPath } from '@xyflow/react';

export default function CustomSpouseStraightEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
  label,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const enhancedStyle: React.CSSProperties = {
    ...style,
    vectorEffect: 'non-scaling-stroke',
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={enhancedStyle} id={id} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="bg-[#FFFDF5] px-2.5 py-0.5 rounded-full border-2 border-red-500 text-red-700 text-[11px] font-bold shadow-md whitespace-nowrap z-20"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
