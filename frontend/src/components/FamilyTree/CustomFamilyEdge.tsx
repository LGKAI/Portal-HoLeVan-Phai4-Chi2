import React from 'react';
import { BaseEdge, EdgeProps, useNodes } from '@xyflow/react';

export default function CustomFamilyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
  data,
}: EdgeProps) {
  const nodes = useNodes();
  const spouseNode = nodes.find((n) => n.id === data?.spouseId);

  let startX = sourceX;
  let startY = sourceY;

  if (spouseNode) {
    const spouseX = spouseNode.position.x + 190;
    // Xuất phát từ tim đường nối ngang giữa 2 vợ chồng (+85px từ đỉnh card)
    startY = spouseNode.position.y + 85;

    const husbandWifeDist = spouseX - sourceX;
    if (husbandWifeDist > 600) {
      // Vợ 3 trở lên (nằm xa bên phải): điểm nối xuất phát tại cột của người vợ đó
      startX = spouseX;
    } else {
      // Điểm giữa của 2 vợ chồng
      startX = (sourceX + spouseX) / 2;
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

  // non-scaling-stroke: Giữ nguyên độ dày và độ sắc nét ở mọi mức độ thu phóng, triệt tiêu hiện tượng mờ nhạt
  const enhancedStyle: React.CSSProperties = {
    ...style,
    vectorEffect: 'non-scaling-stroke',
  };

  return (
    <BaseEdge path={edgePath} markerEnd={markerEnd} style={enhancedStyle} id={id} />
  );
}