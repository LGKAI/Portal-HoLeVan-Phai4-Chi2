import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Member } from "../../types";
import { useAuthStore } from "../../store/authStore";
import { User as UserIcon, Plus, Edit2, Trash2, Heart } from "lucide-react";

// Dinh nghia data type cho custom node - phai extend Record<string, unknown>
export type MemberNodeData = Member & {
  onAddChild?: (parentId: number) => void;
  onAddSpouse?: (memberId: number) => void;
  onEdit?: (memberId: number) => void;
  onDelete?: (memberId: number) => void;
  onClickDetail?: (member: Member) => void;
  [key: string]: unknown; // Required by React Flow v12
};

// These MUST match NODE_WIDTH / BASE_NODE_HEIGHT in TreeCanvas.tsx
const NODE_W = 380;
const NODE_H = 170;

const MemberNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as MemberNodeData;
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const isMale = nodeData.gender === "male";
  const isFemale = nodeData.gender === "female";
  const isDeceased = Boolean(nodeData.is_deceased);

  // Tăng tone màu rõ rệt, rực rỡ và có chiều sâu (không bị nhạt nhoà khi thu nhỏ)
  const bgColor = isMale
    ? "bg-gradient-to-b from-[#dbeafe] via-[#bfdbfe] to-[#93c5fd]/90" // Xanh dương tươi sáng, tone đậm rõ
    : isFemale
    ? "bg-gradient-to-b from-[#fce7f3] via-[#fbcfe8] to-[#f472b6]/80" // Hồng phấn tươi tắn, tone đậm rõ
    : "bg-gradient-to-b from-stone-100 to-stone-200";

  // Viền đậm hơn, sắc nét với độ dày 3px để nhìn rõ cây gia phả cả khi thu nhỏ
  const borderColor = isDeceased
    ? "border-[#dc2626] shadow-red-900/15" // Đã mất: viền đỏ đậm
    : isMale
    ? "border-[#1d4ed8] shadow-blue-900/20" // Nam còn sống: viền xanh dương đậm (blue-700)
    : isFemale
    ? "border-[#be185d] shadow-pink-900/20" // Nữ còn sống: viền hồng đậm (pink-700)
    : "border-slate-600 shadow-gray-900/10";

  const hasValidOccupation =
    nodeData.occupation &&
    nodeData.occupation.trim() !== "" &&
    nodeData.occupation !== "Không rõ" &&
    nodeData.occupation.toLowerCase() !== "không rõ";

  return (
    <div
      className={`relative rounded-xl border-[3px] ${bgColor} ${borderColor} shadow-lg overflow-visible transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5`}
      style={{ width: `${NODE_W}px`, height: `${NODE_H}px` }}
    >
      {/* Top handles */}
      <Handle type="target" position={Position.Top} id="top-target" className="w-2 h-2 !bg-gray-400" />
      <Handle type="source" position={Position.Top} id="spouse-top-source" className="w-2 h-2 !bg-transparent opacity-0" />
      <Handle type="target" position={Position.Top} id="spouse-top-target" className="w-2 h-2 !bg-transparent opacity-0" />

      {/* Left handles */}
      <Handle type="target" position={Position.Left} id="spouse-left" className="w-2 h-2 !bg-gray-400" />
      <Handle type="source" position={Position.Left} id="spouse-left-source" className="w-2 h-2 !bg-transparent opacity-0" />

      {/* Right handles */}
      <Handle type="source" position={Position.Right} id="spouse-right" className="w-2 h-2 !bg-gray-400" />
      <Handle type="target" position={Position.Right} id="spouse-right-target" className="w-2 h-2 !bg-transparent opacity-0" />

      {/* Bottom handle for child outgoing edges */}
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="w-2 h-2 !bg-gray-400" />

      {/* Generation Badge */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3.5 py-1 rounded-full shadow-md border-2 border-white z-10 whitespace-nowrap">
        Đời {Number(nodeData.generation_in_branch) + 8}
      </div>

      {/* Inner layout using absolute to guarantee bounds */}
      <div className="absolute inset-0 flex flex-col rounded-lg overflow-hidden">
        {Number(nodeData.generation_in_branch) === 1 && (
          <div 
            className="absolute top-0 left-0 right-0 h-[12px] z-0 border-b border-yellow-600/40"
            style={{
              background: `url("data:image/svg+xml,%3Csvg width='20' height='12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 12 C 5 2, 15 2, 20 12' fill='none' stroke='%23b45309' stroke-width='1.5'/%3E%3C/svg%3E") repeat-x, linear-gradient(90deg, #fde047 0%, #fef08a 50%, #fde047 100%)`
            }}
          />
        )}
        {/* Top: Name centered in the whole box */}
        <div className="pt-5 px-4 w-full text-center">
          <h3 className="font-bold text-gray-900 text-[17px] leading-normal truncate" title={nodeData.full_name}>
            {nodeData.full_name}
          </h3>
        </div>

        {/* Middle: avatar + info */}
        <div 
          onClick={() => nodeData.onClickDetail?.(nodeData as Member)}
          className="nodrag nopan flex items-center gap-4 pl-6 pr-4 pt-0 pb-2 flex-1 min-h-0 cursor-pointer"
          title="Bấm để xem chi tiết"
        >
          {/* Avatar */}
          <div className="w-[76px] h-[76px] rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-white flex items-center justify-center">
            {nodeData.avatar_url ? (
              <img
                src={nodeData.avatar_url}
                alt={nodeData.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon
                size={40}
                className={isMale ? "text-blue-600" : isFemale ? "text-pink-600" : "text-gray-500"}
              />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1">
            <p className="text-xs text-gray-700">
              <span className="font-medium text-gray-700">Ngày sinh:</span>{" "}
              <span className="font-semibold text-gray-900">{nodeData.birth_date || "Không rõ"}</span>
            </p>

            {nodeData.is_deceased && (
              <p className="text-xs text-red-700">
                <span className="font-medium text-red-700">Mất:</span>{" "}
                <span className="font-semibold text-red-900">{nodeData.death_date || "Đã mất"}</span>
              </p>
            )}

            {hasValidOccupation && (
              <p className="text-xs text-blue-700 truncate" title={nodeData.occupation!}>
                <span className="font-medium text-gray-700">Nghề nghiệp:</span>{" "}
                <span className="font-semibold text-blue-900">{nodeData.occupation}</span>
              </p>
            )}
          </div>
        </div>

        {/* Bottom: actions bar - fixed height so it never gets clipped */}
        <div className="nodrag nopan flex-shrink-0 flex items-center gap-1 border-t border-black/10 px-2 py-1.5 bg-white/95">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nodeData.onClickDetail?.(nodeData as Member);
            }}
            className="nodrag nopan flex-1 text-center text-[13px] font-semibold text-primary hover:bg-primary/10 py-1 rounded transition-colors cursor-pointer"
          >
            Chi tiết
          </button>

          {isAdmin && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nodeData.onAddSpouse?.(nodeData.id as number);
                }}
                className="nodrag nopan p-2 text-pink-600 hover:bg-pink-100 rounded transition-colors"
                title="Thêm Vợ/Chồng"
              >
                <Heart size={16} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nodeData.onAddChild?.(nodeData.id as number);
                }}
                className="nodrag nopan p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
                title="Thêm con"
              >
                <Plus size={16} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nodeData.onEdit?.(nodeData.id as number);
                }}
                className="nodrag nopan p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                title="Sửa"
              >
                <Edit2 size={16} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nodeData.onDelete?.(nodeData.id as number);
                }}
                className="nodrag nopan p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                title="Xóa"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberNode;