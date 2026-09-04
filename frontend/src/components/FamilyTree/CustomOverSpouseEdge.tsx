import { BaseEdge, EdgeLabelRenderer, EdgeProps } from '@xyflow/react';

export default function CustomOverSpouseEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
  label,
  data,
}: EdgeProps) {
  // rank determines how high the loop reaches to allow nesting if there are multiple right wives (wife 3, wife 4, etc.)
  const rank = (data?.rank as number) || 2;
  const archHeight = 45 + (rank - 2) * 22;
  const archY = Math.min(sourceY, targetY) - archHeight;
  const radius = 14;
  const dir = targetX >= sourceX ? 1 : -1;

  const edgePath =
    `M ${sourceX} ${sourceY} ` +
    `L ${sourceX} ${archY + radius} ` +
    `Q ${sourceX} ${archY} ${sourceX + radius * dir} ${archY} ` +
    `L ${targetX - radius * dir} ${archY} ` +
    `Q ${targetX} ${archY} ${targetX} ${archY + radius} ` +
    `L ${targetX} ${targetY}`;

  const labelX = (sourceX + targetX) / 2;
  const labelY = archY;

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
            className="bg-[#FFFDF5] px-2.5 py-0.5 rounded-full border border-red-400 text-red-600 text-[11px] font-bold shadow-sm whitespace-nowrap z-20"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
