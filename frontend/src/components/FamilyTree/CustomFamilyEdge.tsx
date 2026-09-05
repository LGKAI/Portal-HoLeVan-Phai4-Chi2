import React from 'react';
import { BaseEdge, EdgeProps } from '@xyflow/react';

function CustomFamilyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
  data,
}: EdgeProps) {
  let startX = sourceX;
  let startY = sourceY;

  const spouseCenterX = data?.spouseCenterX as number | undefined;
  const spouseCenterY = data?.spouseCenterY as number | undefined;

  if (spouseCenterX !== undefined && spouseCenterY !== undefined) {
    startY = spouseCenterY;
    const husbandWifeDist = spouseCenterX - sourceX;
    if (husbandWifeDist > 600) {
      // Vợ 3 trở lên (nằm xa bên phải): điểm nối xuất phát tại cột của người vợ đó
      startX = spouseCenterX;
    } else {
      // Điểm giữa của 2 vợ chồng
      startX = (sourceX + spouseCenterX) / 2;
    }
  }

  // Độ cao thanh ngang: sử dụng spineRatio truyền từ TreeCanvas (tách tầng riêng cho các đời vợ)
  const spineRatio = (data?.spineRatio as number) || 0.45;
  const spineY = startY + (targetY - startY) * spineRatio;

  // Vẽ đường nối cây gia phả chuẩn mực, bo góc nhẹ nhàng
  let edgePath = '';
  if (Math.abs(startX - targetX) < 1) {
    edgePath = `M ${startX} ${startY} L ${targetX} ${targetY}`;
  } else {
    const dir = targetX >= startX ? 1 : -1;
    const absDiffX = Math.abs(targetX - startX);
    const radius = Math.min(10, absDiffX / 2);

    edgePath =
      `M ${startX} ${startY} ` +
      `L ${startX} ${spineY - radius} ` +
      `Q ${startX} ${spineY} ${startX + radius * dir} ${spineY} ` +
      `L ${targetX - radius * dir} ${spineY} ` +
      `Q ${targetX} ${spineY} ${targetX} ${spineY + radius} ` +
      `L ${targetX} ${targetY}`;
  }

  // non-scaling-stroke: Giữ nguyên độ dày và độ sắc nét ở mọi mức độ thu phóng
  const enhancedStyle: React.CSSProperties = {
    ...style,
    vectorEffect: 'non-scaling-stroke',
  };

  return (
    <BaseEdge path={edgePath} markerEnd={markerEnd} style={enhancedStyle} id={id} />
  );
}

export default React.memo(CustomFamilyEdge);