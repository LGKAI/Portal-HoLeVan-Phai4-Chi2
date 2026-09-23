import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Search, MapPin, Filter } from 'lucide-react';
import { MemorialRecord } from '../types';
import defaultMemorials from '../data/memorials.json';

import api from '../services/api';

const MONTH_OPTIONS = [
  { id: 0, label: 'Tất cả 12 tháng', shortLabel: 'Tất cả' },
  { id: 1, label: 'Tháng Giêng (Tháng 1)', shortLabel: 'Tháng 1' },
  { id: 2, label: 'Tháng 2', shortLabel: 'Tháng 2' },
  { id: 3, label: 'Tháng 3', shortLabel: 'Tháng 3' },
  { id: 4, label: 'Tháng 4', shortLabel: 'Tháng 4' },
  { id: 5, label: 'Tháng 5', shortLabel: 'Tháng 5' },
  { id: 6, label: 'Tháng 6', shortLabel: 'Tháng 6' },
  { id: 7, label: 'Tháng 7', shortLabel: 'Tháng 7' },
  { id: 8, label: 'Tháng 8', shortLabel: 'Tháng 8' },
  { id: 9, label: 'Tháng 9', shortLabel: 'Tháng 9' },
  { id: 10, label: 'Tháng 10', shortLabel: 'Tháng 10' },
  { id: 11, label: 'Tháng 11', shortLabel: 'Tháng 11' },
  { id: 12, label: 'Tháng Chạp (Tháng 12)', shortLabel: 'Tháng 12' },
  { id: 99, label: 'Chưa rõ ngày tháng (chỉ có năm mất)', shortLabel: 'Chưa rõ ngày' },
];

function getPhaiGeneration(desc?: string): string {
  if (!desc) return '-';
  const phaiMatch = desc.match(/[Đđ]ời\s*(\d+)\s*Phái/i);
  if (phaiMatch) return phaiMatch[1];
  const phaiMatch2 = desc.match(/Phái[^\d]*[Đđ]ời\s*(\d+)/i);
  if (phaiMatch2) return phaiMatch2[1];
  const allDoi = [...desc.matchAll(/[Đđ]ời\s*(\d+)/gi)];
  if (allDoi.length > 1) return allDoi[allDoi.length - 1][1];
  if (allDoi.length === 1) return allDoi[0][1];
  const numMatch = desc.match(/\d+/);
  return numMatch ? numMatch[0] : desc;
}

const MemorialCalendarPage: React.FC = () => {
  // Khởi tạo sẵn từ dữ liệu hiện có để luôn có đầy đủ 109 ngày giỗ ngay lập tức
  const [memorials, setMemorials] = useState<MemorialRecord[]>(defaultMemorials as MemorialRecord[]);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Tự động đồng bộ với CSDL qua API để khi admin cập nhật/thêm người mất mới sẽ tự động nạp vào
  useEffect(() => {
    api.get('/memorials')
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setMemorials(res.data.data as MemorialRecord[]);
        }
      })
      .catch((err) => {
        console.warn('API /memorials fetch error, sử dụng dữ liệu mặc định:', err);
      });
  }, []);

  // Đếm số lượng theo từng tháng
  const monthCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (let m = 1; m <= 12; m++) counts[m] = 0;
    counts[99] = 0;
    memorials.forEach((item) => {
      if (item.month >= 1 && item.month <= 12) {
        counts[item.month] = (counts[item.month] || 0) + 1;
      } else {
        counts[99] = (counts[99] || 0) + 1;
      }
    });
    return counts;
  }, [memorials]);

  // Lọc dữ liệu theo tháng và từ khóa tìm kiếm
  const filteredRecords = useMemo(() => {
    let list = memorials;
    if (selectedMonth === 99) {
      list = list.filter((m) => m.month === 0);
    } else if (selectedMonth !== 0) {
      list = list.filter((m) => m.month === selectedMonth);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter((m) =>
        (m.full_name && m.full_name.toLowerCase().includes(q)) ||
        (m.father_name && m.father_name.toLowerCase().includes(q)) ||
        (m.mother_name && m.mother_name.toLowerCase().includes(q)) ||
        (m.burial_place && m.burial_place.toLowerCase().includes(q)) ||
        (m.generation_desc && m.generation_desc.toLowerCase().includes(q)) ||
        (m.gio_date && m.gio_date.toLowerCase().includes(q)) ||
        (m.death_date && m.death_date.toLowerCase().includes(q))
      );
    }
    return list;
  }, [memorials, selectedMonth, searchTerm]);

  // Danh sách các tháng cần hiển thị
  const displayMonths = useMemo(() => {
    if (selectedMonth === 99) {
      return [0];
    }
    if (selectedMonth !== 0) {
      return [selectedMonth];
    }
    // Hiển thị từ tháng 1 đến tháng 12, và nếu có bản ghi chưa rõ tháng thì hiển thị thêm ở cuối
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    if (memorials.some((m) => m.month === 0)) {
      months.push(0);
    }
    return months;
  }, [selectedMonth, memorials]);

  return (
    <div className="bg-cream min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Bộ lọc tháng & Tìm kiếm */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/80 p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm theo họ tên, thân phụ, thân mẫu, nơi an táng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded"
                >
                  Xóa
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 self-end md:self-center">
              <Calendar size={16} className="text-primary" />
              <span>
                Hiển thị: <strong>{filteredRecords.length}</strong> ngày giỗ
                {selectedMonth !== 0 && ` (${MONTH_OPTIONS.find((m) => m.id === selectedMonth)?.label})`}
              </span>
            </div>
          </div>

          {/* Nút bấm chọn Tháng 1 -> Tháng 12 & Chưa rõ */}
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Filter size={14} className="text-primary" /> CHỌN THÁNG ÂM LỊCH:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-14 gap-2">
              {MONTH_OPTIONS.map((m) => {
                const isSelected = selectedMonth === m.id;
                const count = m.id === 0 ? memorials.length : monthCounts[m.id] || 0;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMonth(m.id)}
                    className={`px-2 py-2 rounded-lg text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 border ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-md scale-105'
                        : 'bg-cream-light hover:bg-amber-100 text-gray-800 border-amber-200'
                    }`}
                  >
                    <span>{m.shortLabel}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isSelected ? 'bg-secondary text-primary-dark' : 'bg-white/80 text-gray-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Danh sách các tháng và bảng dữ liệu */}
        <div className="space-y-10">
          {displayMonths.map((mNum) => {
            const recordsInMonth = filteredRecords.filter((r) => r.month === mNum);
            const monthInfo =
              mNum === 0
                ? { id: 99, label: 'Chưa rõ ngày tháng giỗ cụ thể (chỉ ghi nhận năm mất)', shortLabel: 'Chưa rõ ngày' }
                : MONTH_OPTIONS.find((m) => m.id === mNum);

            // Nếu người dùng đang tìm kiếm mà tháng này không có kết quả thì ẩn đi (trừ khi đang chọn riêng tháng này)
            if (recordsInMonth.length === 0 && selectedMonth === 0 && searchTerm.trim()) {
              return null;
            }

            return (
              <div
                key={mNum}
                id={`thang-${mNum}`}
                className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden"
              >
                {/* Tiêu đề Tháng */}
                <div className="bg-gradient-to-r from-cream-dark via-amber-100 to-cream-light px-6 py-4 border-b border-amber-200 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary text-secondary flex items-center justify-center font-bold text-sm shadow-sm">
                      {mNum === 0 ? '?' : mNum}
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-primary-dark">
                        {monthInfo?.label}
                      </h2>
                      <p className="text-xs text-gray-600">
                        {mNum === 0
                          ? 'Các vị tiền nhân, con cháu có năm mất nhưng chưa ghi nhận ngày tháng Âm lịch cụ thể'
                          : `Tháng ${mNum} Âm lịch hằng năm`}
                      </p>
                    </div>
                  </div>
                  <div className="bg-primary/10 text-primary-dark px-3 py-1 rounded-full text-xs font-bold border border-primary/20">
                    {recordsInMonth.length} vị tiền nhân / con cháu
                  </div>
                </div>

                {/* Bảng dữ liệu của tháng */}
                {recordsInMonth.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    {searchTerm
                      ? `Không có kết quả nào phù hợp với từ khóa "${searchTerm}" trong ${monthInfo?.label}.`
                      : `Gia phả hiện tại chưa ghi nhận ngày giỗ cụ thể trong ${monthInfo?.label}.`}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-primary text-white text-xs uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="py-3.5 px-4 w-60 min-w-[225px]">Ngày giỗ</th>
                          <th className="py-3.5 px-4 min-w-[215px]">Họ và tên</th>
                          <th className="py-3.5 px-3 w-24 min-w-[96px] text-center">Đời thứ</th>
                          <th className="py-3.5 px-4 min-w-[185px]">Thân phụ (Cha)</th>
                          <th className="py-3.5 px-4 min-w-[185px]">Thân mẫu (Mẹ)</th>
                          <th className="py-3.5 px-4 min-w-[185px]">Nơi an táng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {recordsInMonth.map((item, idx) => {
                          const isThuyTo =
                            item.notes?.includes('Thuỷ tổ') ||
                            item.notes?.includes('Thủy tổ') ||
                            item.id === 1005 ||
                            item.id === 1006;
                          const isLietSi = item.notes?.includes('Liệt sĩ');

                          return (
                            <tr
                              key={item.id || idx}
                              className={`transition-colors hover:bg-amber-50/70 ${
                                idx % 2 === 0 ? 'bg-white' : 'bg-cream-light/40'
                              } ${isThuyTo ? 'bg-yellow-50/50' : ''}`}
                            >
                              {/* Ngày giỗ */}
                              <td className="py-3.5 px-4 align-top">
                                <div className="font-extrabold text-primary-dark text-sm flex items-center gap-1.5">
                                  <Calendar size={14} className="text-primary flex-shrink-0" />
                                  <span>{item.gio_date}</span>
                                </div>
                                {item.death_date && (
                                  <div className="text-[11px] text-gray-500 mt-1 pl-5">
                                    Mất: {item.death_date}
                                  </div>
                                )}
                              </td>

                              {/* Họ và tên */}
                              <td className="py-3.5 px-4 align-top">
                                <div className="font-bold text-dark text-sm uppercase flex items-center gap-1.5">
                                  <span>{item.full_name}</span>
                                  {isThuyTo && (
                                    <span className="bg-secondary text-primary-dark text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-xs">
                                      Thủy tổ
                                    </span>
                                  )}
                                  {isLietSi && (
                                    <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                      Liệt sĩ
                                    </span>
                                  )}
                                </div>
                                {item.gender && (
                                  <div className="text-[11px] text-gray-500 mt-0.5">
                                    <span className={item.gender === 'Nữ' ? 'text-pink-600' : 'text-blue-600'}>
                                      {item.gender}
                                    </span>
                                  </div>
                                )}
                              </td>

                              {/* Đời thứ */}
                              <td className="py-3.5 px-3 text-center align-top">
                                <span
                                  className="inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 bg-primary/10 text-primary-dark rounded-full text-sm font-bold border border-primary/20"
                                  title={item.generation_desc}
                                >
                                  {getPhaiGeneration(item.generation_desc)}
                                </span>
                              </td>

                              {/* Thân phụ */}
                              <td className="py-3.5 px-4 align-top text-gray-800">
                                {item.father_name && item.father_name !== '-' ? (
                                  <span className="font-medium text-gray-900">{item.father_name}</span>
                                ) : (
                                  <span className="text-gray-400 italic">Không rõ</span>
                                )}
                              </td>

                              {/* Thân mẫu */}
                              <td className="py-3.5 px-4 align-top text-gray-800">
                                {item.mother_name && item.mother_name !== '-' ? (
                                  <span className="font-medium text-gray-900">{item.mother_name}</span>
                                ) : (
                                  <span className="text-gray-400 italic">Không rõ</span>
                                )}
                              </td>

                              {/* Nơi an táng */}
                              <td className="py-3.5 px-4 align-top text-gray-700 text-xs leading-relaxed">
                                {item.burial_place && item.burial_place !== 'Không rõ' ? (
                                  <div className="flex items-start gap-1">
                                    <MapPin size={13} className="text-primary flex-shrink-0 mt-0.5" />
                                    <span>{item.burial_place}</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">Chưa ghi nhận</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MemorialCalendarPage;
