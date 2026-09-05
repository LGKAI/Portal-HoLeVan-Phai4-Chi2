import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MiniMap,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import MemberNode, { MemberNodeData } from './MemberNode';
import CustomFamilyEdge from './CustomFamilyEdge';
import CustomOverSpouseEdge from './CustomOverSpouseEdge';
import CustomSpouseStraightEdge from './CustomSpouseStraightEdge';
import { Member } from '../../types';

interface TreeCanvasProps {
  members: Member[];
  allMembers?: Member[];
  onAddChild: (parentId: number) => void;
  onAddSpouse?: (memberId: number) => void;
  onEdit: (memberId: number) => void;
  onDelete?: (memberId: number) => void;
  onClickDetail: (member: Member) => void;
}

const nodeTypes = { memberNode: MemberNode };
const edgeTypes = {
  familyEdge: CustomFamilyEdge,
  overSpouseEdge: CustomOverSpouseEdge,
  straightSpouseEdge: CustomSpouseStraightEdge,
};

const NODE_WIDTH = 380;
const BASE_NODE_HEIGHT = 170;
const SIBLING_GAP = 120;
// Khoảng cách phân tách rõ ràng giữa nhánh con của các bà vợ (Chánh phối, Thứ phối...)
const WIFE_BRANCH_GAP = 240;
const RANK_SEP = 600;

interface ClusterInfo {
  clusterWidth: number;
  husbandOffset: number;
  wifePositions: { wifeId: number; offset: number; rank: number }[];
}

interface ChildGroup {
  wifeId: number | null;
  children: Member[];
}

/** Tính toán toạ độ cây theo cấu trúc phả hệ chuẩn */
function layoutTreeCore(members: Member[], canonicalXMap?: Map<number, number>) {
  const memberMap = new Map<number, Member>();
  members.forEach(m => memberMap.set(m.id, m));

  // 1. Nhận diện các bà vợ nhập tịch (chỉ tính nếu người chồng cũng có trong members)
  const marriedInWives = new Set<number>();
  members.forEach(m => {
    if (m.gender === 'female' && !m.father_id && !m.mother_id && m.spouse_id && memberMap.has(m.spouse_id)) {
      marriedInWives.add(m.id);
    }
  });

  // 2. Map chồng -> danh sách vợ
  const husbandToWives = new Map<number, number[]>();
  marriedInWives.forEach(wifeId => {
    const wife = memberMap.get(wifeId);
    if (!wife || !wife.spouse_id) return;
    const husbandId = wife.spouse_id;
    if (!husbandToWives.has(husbandId)) {
      husbandToWives.set(husbandId, []);
    }
    husbandToWives.get(husbandId)!.push(wifeId);
  });

  // Helper tính thứ tự vai bậc của vợ
  const getWifeRank = (m?: Member) => {
    if (!m) return 99;
    const type = (m.spouse_type || '').toLowerCase();
    if (type.includes('chánh')) return 0;
    const matches = type.match(/thứ/g);
    if (matches) return matches.length;
    return 99;
  };

  // Sắp xếp các bà vợ theo thứ bậc: Chánh phối (0) -> Thứ phối (1) -> Thứ thứ phối (2)...
  husbandToWives.forEach((wifeIds) => {
    wifeIds.sort((a, b) => {
      const memA = memberMap.get(a);
      const memB = memberMap.get(b);
      const rankA = getWifeRank(memA);
      const rankB = getWifeRank(memB);
      if (rankA !== rankB) return rankA - rankB;
      return a - b;
    });
  });

  // 3. Map người cha mang dòng máu -> danh sách các con
  const bloodlineChildrenMap = new Map<number, Member[]>();
  const rootMembers: Member[] = [];

  members.forEach(m => {
    if (marriedInWives.has(m.id)) return;

    let parentId: number | null = m.father_id || null;
    let motherId: number | null = m.mother_id || null;

    if (parentId && memberMap.has(parentId)) {
      const p = memberMap.get(parentId)!;
      if (marriedInWives.has(p.id)) {
        motherId = p.id;
        parentId = p.spouse_id || null;
      }
    } else if (!parentId && motherId && memberMap.has(motherId)) {
      const mom = memberMap.get(motherId)!;
      if (marriedInWives.has(mom.id)) {
        parentId = mom.spouse_id || null;
      }
    }

    if (parentId && memberMap.has(parentId)) {
      if (!bloodlineChildrenMap.has(parentId)) {
        bloodlineChildrenMap.set(parentId, []);
      }
      bloodlineChildrenMap.get(parentId)!.push(m);
    } else {
      rootMembers.push(m);
    }
  });

  // Sắp xếp con cái và các nhánh gốc theo thứ tự chuẩn từ trái sang phải trong toàn bộ cây gia phả
  const getOrder = (id: number) => (canonicalXMap ? (canonicalXMap.get(id) ?? id) : id);

  bloodlineChildrenMap.forEach((children) => {
    children.sort((a, b) => getOrder(a.id) - getOrder(b.id));
  });
  rootMembers.sort((a, b) => getOrder(a.id) - getOrder(b.id));

  // 4. Nhóm con theo từng người mẹ để phân tách nhánh riêng biệt
  const getChildGroups = (memberId: number): ChildGroup[] => {
    const wives = husbandToWives.get(memberId) || [];
    const allChildren = bloodlineChildrenMap.get(memberId) || [];

    if (wives.length <= 1) {
      return [{ wifeId: wives[0] || null, children: allChildren }];
    }

    // Nếu có từ 2 bà vợ trở lên, chia thành các nhóm riêng theo mẹ
    const wifeGroups: { wifeId: number; rank: number; children: Member[] }[] = wives.map((wId, idx) => ({
      wifeId: wId,
      rank: idx,
      children: [],
    }));

    allChildren.forEach(child => {
      let motherId = child.mother_id;
      if (!motherId && child.father_id && wives.includes(child.father_id)) {
        motherId = child.father_id;
      }
      let group = wifeGroups.find(g => g.wifeId === motherId);
      if (!group) {
        group = wifeGroups[0]; // Mặc định về Chánh phối
      }
      group.children.push(child);
    });

    return wifeGroups.filter(g => g.children.length > 0);
  };

  // 5. Tính toán kích thước cụm (cluster) của một người cùng các vợ
  const getClusterInfo = (memberId: number): ClusterInfo => {
    const wifeIds = husbandToWives.get(memberId) || [];
    const numWives = wifeIds.length;

    if (numWives === 0) {
      return {
        clusterWidth: NODE_WIDTH,
        husbandOffset: 0,
        wifePositions: [],
      };
    }

    // Chánh phối luôn nằm bên trái Chồng
    const husbandOffset = NODE_WIDTH + SIBLING_GAP;
    const wifePositions: { wifeId: number; offset: number; rank: number }[] = [];

    wifeIds.forEach((wId, idx) => {
      if (idx === 0) {
        wifePositions.push({ wifeId: wId, offset: 0, rank: 0 });
      } else {
        wifePositions.push({
          wifeId: wId,
          offset: husbandOffset + idx * (NODE_WIDTH + SIBLING_GAP),
          rank: idx,
        });
      }
    });

    const clusterWidth =
      husbandOffset +
      NODE_WIDTH +
      (numWives > 1 ? (numWives - 1) * (NODE_WIDTH + SIBLING_GAP) : 0);

    return { clusterWidth, husbandOffset, wifePositions };
  };

  // 6. Đệ quy tính toán chiều rộng cây con (Subtree Width)
  const subtreeWidthMap = new Map<number, number>();

  const computeSubtreeWidth = (memberId: number): number => {
    const cluster = getClusterInfo(memberId);
    const groups = getChildGroups(memberId);

    if (groups.length === 0 || groups.every(g => g.children.length === 0)) {
      subtreeWidthMap.set(memberId, cluster.clusterWidth);
      return cluster.clusterWidth;
    }

    let totalChildrenWidth = 0;
    groups.forEach((g, gIdx) => {
      let groupW = 0;
      g.children.forEach((child, cIdx) => {
        groupW += computeSubtreeWidth(child.id);
        if (cIdx < g.children.length - 1) {
          groupW += SIBLING_GAP;
        }
      });
      totalChildrenWidth += groupW;
      if (gIdx < groups.length - 1) {
        totalChildrenWidth += WIFE_BRANCH_GAP;
      }
    });

    const totalWidth = Math.max(cluster.clusterWidth, totalChildrenWidth);
    subtreeWidthMap.set(memberId, totalWidth);
    return totalWidth;
  };

  rootMembers.forEach(r => computeSubtreeWidth(r.id));

  // 7. Gán toạ độ (X, Y) đệ quy cho từng node
  const memberPositions = new Map<number, { x: number; y: number }>();

  const layoutSubtree = (memberId: number, leftX: number, rightX: number, level: number) => {
    const cluster = getClusterInfo(memberId);
    const groups = getChildGroups(memberId);
    const allocatedWidth = rightX - leftX;

    let totalChildrenWidth = 0;
    groups.forEach((g, gIdx) => {
      let groupW = 0;
      g.children.forEach((child, cIdx) => {
        groupW += subtreeWidthMap.get(child.id)!;
        if (cIdx < g.children.length - 1) {
          groupW += SIBLING_GAP;
        }
      });
      totalChildrenWidth += groupW;
      if (gIdx < groups.length - 1) {
        totalChildrenWidth += WIFE_BRANCH_GAP;
      }
    });

    let clusterLeft = leftX + (allocatedWidth - cluster.clusterWidth) / 2;

    if (groups.length > 0 && groups.some(g => g.children.length > 0)) {
      const childrenStartX = leftX + (allocatedWidth - totalChildrenWidth) / 2;
      let currentGroupLeft = childrenStartX;

      groups.forEach(g => {
        let currentChildLeft = currentGroupLeft;
        g.children.forEach(child => {
          const childW = subtreeWidthMap.get(child.id)!;
          const childLevel = child.generation_in_branch || (level + 1);
          layoutSubtree(child.id, currentChildLeft, currentChildLeft + childW, childLevel);
          currentChildLeft += childW + SIBLING_GAP;
        });
        currentGroupLeft = currentChildLeft - SIBLING_GAP + WIFE_BRANCH_GAP;
      });
    }

    const y = (level - 1) * (BASE_NODE_HEIGHT + RANK_SEP);
    const husbandX = clusterLeft + cluster.husbandOffset;

    memberPositions.set(memberId, { x: husbandX, y });
    cluster.wifePositions.forEach(wp => {
      memberPositions.set(wp.wifeId, { x: clusterLeft + wp.offset, y });
    });
  };

  let currentRootLeft = 0;
  rootMembers.forEach(r => {
    const rootW = subtreeWidthMap.get(r.id)!;
    layoutSubtree(r.id, currentRootLeft, currentRootLeft + rootW, r.generation_in_branch || 1);
    currentRootLeft += rootW + SIBLING_GAP * 2;
  });

  // 8. Căn giữa toàn bộ cây theo phương ngang
  let minX = Infinity;
  let maxX = -Infinity;
  memberPositions.forEach(pos => {
    minX = Math.min(minX, pos.x);
    maxX = Math.max(maxX, pos.x + NODE_WIDTH);
  });

  const centerOffset = minX !== Infinity ? (minX + maxX) / 2 : 0;

  return {
    memberPositions,
    bloodlineChildrenMap,
    husbandToWives,
    memberMap,
    centerOffset,
    getChildGroups,
  };
}

/** Tính toạ độ X chuẩn mực của toàn bộ thành viên trong cây đầy đủ để làm thước đo thứ tự chuẩn */
function computeCanonicalPositions(fullMembers: Member[]): Map<number, number> {
  const { memberPositions } = layoutTreeCore(fullMembers);
  const xMap = new Map<number, number>();
  memberPositions.forEach((pos, id) => {
    xMap.set(id, pos.x);
  });
  return xMap;
}

/** Tự động layout cây gia phả chuẩn mực, phân tách rõ ràng nhánh con theo từng đời vợ và giữ đúng thứ tự từ trái sang phải */
const getLayoutedElements = (
  nodes: Node<MemberNodeData>[],
  _edges: Edge[],
  members: Member[],
  canonicalXMap?: Map<number, number>
) => {
  if (!members || members.length === 0) {
    return { nodes: [], edges: [] };
  }

  const {
    memberPositions,
    bloodlineChildrenMap,
    husbandToWives,
    memberMap,
    centerOffset,
    getChildGroups,
  } = layoutTreeCore(members, canonicalXMap);

  const layoutedNodes = nodes.map(node => {
    const id = parseInt(node.id, 10);
    const pos = memberPositions.get(id) || { x: 0, y: 0 };
    return {
      ...node,
      position: {
        x: pos.x - centerOffset,
        y: pos.y,
      },
    };
  });

  // 9. Tạo danh sách các đường nối (Edges)
  const edges: Edge[] = [];

  // 9.1. Đường nối Cha/Mẹ -> Con (Phân tầng thanh ngang riêng biệt cho từng đời vợ)
  bloodlineChildrenMap.forEach((_allChildren, fatherId) => {
    const groups = getChildGroups(fatherId);
    const wives = husbandToWives.get(fatherId) || [];
    const hasMultipleWives = wives.length > 1;

    groups.forEach((g) => {
      const wifeId = g.wifeId;
      // Phân tầng thanh ngang để các nhánh con của từng đời vợ KHÔNG BAO GIỜ bị dính/đè nhau:
      let spineRatio = 0.45;
      if (hasMultipleWives && wifeId) {
        const wifeIndex = wives.indexOf(wifeId);
        if (wifeIndex === 0) {
          // Chánh phối (bên trái): tầng dưới (0.60)
          spineRatio = 0.60;
        } else if (wifeIndex === 1) {
          // Thứ phối (bên phải): tầng trên (0.35)
          spineRatio = 0.35;
        } else {
          // Thứ thứ phối (xa bên phải): tầng trên cùng (0.20)
          spineRatio = 0.20;
        }
      }

      let spouseCenterX: number | undefined;
      let spouseCenterY: number | undefined;
      if (wifeId && memberPositions.has(wifeId)) {
        const wifePos = memberPositions.get(wifeId)!;
        spouseCenterX = wifePos.x - centerOffset + 190;
        spouseCenterY = wifePos.y + 85;
      }

      g.children.forEach((child) => {
        edges.push({
          id: `e-${fatherId}-${child.id}`,
          source: fatherId.toString(),
          target: child.id.toString(),
          sourceHandle: 'bottom-source',
          targetHandle: 'top-target',
          type: 'familyEdge',
          style: { stroke: '#1e293b', strokeWidth: 2.5 },
          data: {
            spouseCenterX,
            spouseCenterY,
            spineRatio,
          },
        });
      });
    });
  });

  // 9.2. Đường nối Hôn phối (Chồng - Vợ)
  husbandToWives.forEach((wifeIds, husbandId) => {
    wifeIds.forEach((wifeId, index) => {
      const wifeMem = memberMap.get(wifeId);
      let label = wifeMem?.spouse_type;
      if (!label) {
        label = index === 0 ? 'Chánh phối' : (index === 1 ? 'Thứ phối' : `${'Thứ '.repeat(index - 1)}Thứ phối`);
      }

      if (index === 0) {
        // Chánh phối nằm bên trái
        edges.push({
          id: `e-wife-${husbandId}-${wifeId}`,
          source: husbandId.toString(),
          target: wifeId.toString(),
          type: 'straightSpouseEdge',
          sourceHandle: 'spouse-left-source',
          targetHandle: 'spouse-right-target',
          style: { stroke: '#b91c1c', strokeWidth: 2.5, strokeDasharray: '6 6' },
          label,
        });
      } else if (index === 1) {
        // Thứ phối nằm ngay bên phải
        edges.push({
          id: `e-wife-${husbandId}-${wifeId}`,
          source: husbandId.toString(),
          target: wifeId.toString(),
          type: 'straightSpouseEdge',
          sourceHandle: 'spouse-right',
          targetHandle: 'spouse-left',
          style: { stroke: '#b91c1c', strokeWidth: 2.5, strokeDasharray: '6 6' },
          label,
        });
      } else {
        // Thứ thứ phối (từ vợ 3 trở lên) có đường nối vòng cong lên phía trên
        edges.push({
          id: `e-wife-${husbandId}-${wifeId}`,
          source: husbandId.toString(),
          target: wifeId.toString(),
          type: 'overSpouseEdge',
          sourceHandle: 'spouse-top-source',
          targetHandle: 'spouse-top-target',
          style: { stroke: '#b91c1c', strokeWidth: 2.5, strokeDasharray: '6 6' },
          label,
          data: { rank: index },
        });
      }
    });
  });

  return { nodes: layoutedNodes, edges };
};

const TreeCanvas: React.FC<TreeCanvasProps> = ({
  members,
  allMembers,
  onAddChild,
  onAddSpouse,
  onEdit,
  onDelete,
  onClickDetail,
}) => {
  const canonicalXMap = useMemo(() => {
    const source = allMembers && allMembers.length > 0 ? allMembers : members;
    return computeCanonicalPositions(source);
  }, [allMembers, members]);

  const rawNodes: Node<MemberNodeData>[] = useMemo(() => {
    return members.map((m) => ({
      id: m.id.toString(),
      type: 'memberNode',
      position: { x: 0, y: 0 },
      data: {
        ...m,
        computedHeight: BASE_NODE_HEIGHT,
        onAddChild,
        onAddSpouse,
        onEdit,
        onDelete,
        onClickDetail,
      } as MemberNodeData,
    }));
  }, [members, onAddChild, onAddSpouse, onEdit, onDelete, onClickDetail]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(rawNodes, [], members, canonicalXMap),
    [rawNodes, members, canonicalXMap]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  React.useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = getLayoutedElements(rawNodes, [], members, canonicalXMap);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [rawNodes, members, canonicalXMap, setNodes, setEdges]);

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#FFFDF5' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_event, node) => onClickDetail(node.data as Member)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.01}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        onlyRenderVisibleElements={true}
        proOptions={{ hideAttribution: true }}
      >
        <Controls showInteractive={false} />
        <MiniMap
          zoomable
          pannable
          nodeColor={(n) => {
            const d = n.data as any;
            if (d?.is_deceased) return '#dc2626';
            return d?.gender === 'male' ? '#2563eb' : '#db2777';
          }}
          style={{ backgroundColor: '#FFF5D6' }}
          className="!hidden md:!block"
        />
        <Background gap={16} size={1.5} color="#E2D4B7" />
      </ReactFlow>
    </div>
  );
};

export default TreeCanvas;