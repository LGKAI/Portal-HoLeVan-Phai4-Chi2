import os
import json
import re
import shutil

def parse_death_date(date_str):
    """
    Parse day and month from death date string like '09/08 Âm lịch', '12/09', etc.
    Returns (month, day, raw_str) or (99, 99, raw_str)
    """
    if not date_str or date_str.strip() in ['Không rõ', '']:
        return None
    
    # Check pattern dd/mm
    match = re.search(r'(\d{1,2})\s*/\s*(\d{1,2})', date_str)
    if match:
        day = int(match.group(1))
        month = int(match.group(2))
        return (month, day, date_str.strip())
    
    # Check pattern ngày d tháng m
    match = re.search(r'ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})', date_str, re.IGNORECASE)
    if match:
        day = int(match.group(1))
        month = int(match.group(2))
        return (month, day, date_str.strip())
        
    return (99, 99, date_str.strip())

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    json_path = os.path.join(base_dir, 'backend', 'src', 'data', 'members.json')
    
    with open(json_path, 'r', encoding='utf-8') as f:
        members = json.load(f)
        
    print(f"Loaded {len(members)} members from {json_path}")
    
    # Build indexing maps
    id_map = {m['id']: m for m in members}
    children_map = {}
    spouses_map = {}
    
    for m in members:
        # Children mapping
        fid = m.get('father_id')
        mid = m.get('mother_id')
        if fid:
            children_map.setdefault(fid, []).append(m)
        if mid:
            children_map.setdefault(mid, []).append(m)
            
        # Spouses mapping
        sid = m.get('spouse_id')
        if sid:
            spouses_map.setdefault(m['id'], set()).add(sid)
            spouses_map.setdefault(sid, set()).add(m['id'])

    # Helper formatters
    def get_gender_label(gender):
        if gender == 'male':
            return 'Nam'
        elif gender == 'female':
            return 'Nữ'
        return 'Không rõ'
        
    def get_member_name_link(mid):
        if not mid or mid not in id_map:
            return "Không rõ"
        mem = id_map[mid]
        gen = mem.get('generation_in_branch', 0)
        return f"{mem.get('full_name')} (ID: {mem.get('id')}, Đời {gen})"

    # 1. GENERATE TỔNG QUAN & THỐNG KÊ (tong_quan_va_thong_ke_dong_ho.md)
    gen_counts = {}
    gender_counts = {'male': 0, 'female': 0, 'unknown': 0}
    deceased_counts = {'deceased': 0, 'living': 0}
    burial_places = {}
    
    for m in members:
        gen = m.get('generation_in_branch', 1)
        gen_counts[gen] = gen_counts.get(gen, 0) + 1
        
        g = m.get('gender', 'unknown')
        gender_counts[g] = gender_counts.get(g, 0) + 1
        
        if m.get('is_deceased'):
            deceased_counts['deceased'] += 1
        else:
            deceased_counts['living'] += 1
            
        b = m.get('burial_place')
        if b and b.strip() not in ['Không rõ', '']:
            burial_places[b.strip()] = burial_places.get(b.strip(), 0) + 1

    stats_doc = []
    stats_doc.append("# TỔNG QUAN & THỐNG KÊ DÒNG HỌ LÊ VĂN - PHÁI 4 - CHI 2\n")
    stats_doc.append("## 1. Nguồn gốc & Địa bàn cư trú")
    stats_doc.append("- **Tên Dòng Họ**: Họ Lê Văn - Phái 4 - Chi 2")
    stats_doc.append("- **Địa danh gốc**: Thôn An Lợi, xã Triệu Bình (trước đây là xã Triệu Độ), huyện Triệu Phong, tỉnh Quảng Trị.")
    stats_doc.append("- **Thủy tổ Chi 2**: Ngài **Lê Văn Khôi** (Đời thứ 1 của Chi 2, tương đương Đời thứ 9 của toàn Phái 4 họ Lê Văn).")
    stats_doc.append("- **Chánh phối của Thủy tổ**: Cụ bà **Phan Thị Mưu**.")
    stats_doc.append("- **Quy ước tính đời**: Đời trong Chi 2 = $N$ thì Đời trong toàn Phái 4 = $N + 8$ (Ví dụ: Đời 1 Chi 2 là Đời 9 Phái 4; Đời 8 Chi 2 là Đời 16 Phái 4).\n")
    
    stats_doc.append("## 2. Thống kê số liệu dòng họ")
    stats_doc.append(f"- **Tổng số thành viên ghi nhận trong gia phả**: {len(members)} người")
    stats_doc.append(f"- **Số thế hệ (đời)**: 8 thế hệ (từ Đời 1 đến Đời 8)")
    stats_doc.append(f"- **Cơ cấu giới tính**:")
    stats_doc.append(f"  - Nam: {gender_counts.get('male', 0)} người ({round(gender_counts.get('male', 0)/len(members)*100, 1)}%)")
    stats_doc.append(f"  - Nữ: {gender_counts.get('female', 0)} người ({round(gender_counts.get('female', 0)/len(members)*100, 1)}%)")
    if gender_counts.get('unknown', 0) > 0:
        stats_doc.append(f"  - Chưa rõ: {gender_counts.get('unknown', 0)} người")
    stats_doc.append(f"- **Tình trạng sinh tử**:")
    stats_doc.append(f"  - Đã quy tiên (đã mất): {deceased_counts['deceased']} người")
    stats_doc.append(f"  - Hiện tiền (còn sống): {deceased_counts['living']} người\n")
    
    stats_doc.append("## 3. Thống kê số lượng thành viên qua các thế hệ")
    stats_doc.append("| Thế hệ (Chi 2) | Thế hệ (Phái 4) | Số lượng thành viên | Ghi chú đại diện tiêu biểu |")
    stats_doc.append("| :--- | :--- | :--- | :--- |")
    for g in sorted(gen_counts.keys()):
        rep = ""
        if g == 1:
            rep = "Ngài Thủy tổ Lê Văn Khôi, Cụ bà Phan Thị Mưu"
        elif g == 2:
            rep = "Cụ Lê Văn Tán, Cụ Lê Văn Lợi, các cụ bà..."
        stats_doc.append(f"| Đời thứ {g} | Đời thứ {g + 8} | {gen_counts[g]} người | {rep} |")
    stats_doc.append("\n")

    stats_doc.append("## 4. Các khu nghĩa trang & nơi an táng tập trung")
    sorted_burials = sorted(burial_places.items(), key=lambda x: x[1], reverse=True)
    for place, count in sorted_burials[:10]:
        stats_doc.append(f"- **{place}**: {count} vị tiền nhân/thành viên")
    stats_doc.append("\n")

    stats_doc.append("## 5. Quy tắc xưng hô và tra cứu phả hệ")
    stats_doc.append("- Thành viên Đời 1 là bậc Cụ Thủy tổ của Chi 2.")
    stats_doc.append("- Cành nhánh chính của Chi 2 bắt đầu phân nhánh mạnh từ Đời 2 (các con cụ Lê Văn Khôi, đặc biệt là cụ Lê Văn Tán tiếp nối dòng dõi, cụ Lê Văn Lợi vô tự).")
    stats_doc.append("- Khi con cháu hỏi về ngày giỗ hoặc mộ phần, hệ thống ưu tiên đối chiếu ngày mất theo Âm lịch và địa điểm an táng được ghi nhận.\n")

    # 2. GENERATE LỊCH GIỖ KỴ & MỘ PHẦN (lich_gio_ky_va_an_tang.md)
    death_records = []
    for m in members:
        dd = m.get('death_date')
        parsed = parse_death_date(dd)
        if parsed:
            month, day, raw = parsed
            death_records.append((month, day, raw, m))
            
    # Sort by month then day
    death_records.sort(key=lambda x: (x[0], x[1]))
    
    calendar_doc = []
    calendar_doc.append("# LỊCH GIỖ KỴ (KỴ NHẬT) & MỘ PHẦN TIỀN NHÂN - HỌ LÊ VĂN (CHI 2 - PHÁI 4)\n")
    calendar_doc.append("Tài liệu tổng hợp ngày giỗ kỵ (theo Âm lịch) và vị trí mộ phần của các bậc tiền nhân, con cháu dòng họ Lê Văn - Phái 4 - Chi 2 làng An Lợi. Sử dụng để tra cứu ngày kỵ nhật hằng năm.\n")
    
    # Group by month
    month_names = {
        1: "Tháng Giêng (Tháng 1)", 2: "Tháng 2", 3: "Tháng 3", 4: "Tháng 4",
        5: "Tháng 5", 6: "Tháng 6", 7: "Tháng 7", 8: "Tháng 8",
        9: "Tháng 9", 10: "Tháng 10", 11: "Tháng 11", 12: "Tháng Chạp (Tháng 12)"
    }
    
    current_month = None
    for month, day, raw, m in death_records:
        if month != current_month:
            current_month = month
            m_name = month_names.get(month, "Các ngày giỗ khác / Chưa rõ tháng")
            calendar_doc.append(f"\n## {m_name}\n")
            
        gen = m.get('generation_in_branch', 0)
        burial = m.get('burial_place') or "Không rõ nơi an táng"
        father_name = id_map.get(m.get('father_id'), {}).get('full_name', '')
        father_info = f", thân phụ: {father_name}" if father_name else ""
        bio_info = f" ({m.get('bio')})" if m.get('bio') else ""
        
        calendar_doc.append(f"- **Ngày {raw}**: **{m.get('full_name')}** (ID: {m.get('id')}, Đời {gen} Chi 2 - Đời {gen+8} Phái 4{father_info}). Giới tính: {get_gender_label(m.get('gender'))}. Nơi an táng: {burial}.{bio_info}")

    calendar_doc.append("\n\n## Danh sách nơi an táng và mộ phần tiền nhân")
    for place, count in sorted_burials:
        calendar_doc.append(f"\n### Khu vực: {place} ({count} vị)")
        mems_at_place = [m for m in members if (m.get('burial_place') or '').strip() == place]
        for m in mems_at_place:
            gen = m.get('generation_in_branch', 0)
            dd = m.get('death_date') or 'Chưa rõ'
            calendar_doc.append(f"- **{m.get('full_name')}** (ID: {m.get('id')}, Đời {gen}) - Ngày mất: {dd}")

    # 3. GENERATE GIA PHẢ CHI TIẾT 313 THÀNH VIÊN (gia_pha_chi_tiet_ho_le_van.md)
    detail_doc = []
    detail_doc.append("# GIA PHẢ TOÀN TẬP: DÒNG HỌ LÊ VĂN - PHÁI 4 - CHI 2\n")
    detail_doc.append("Địa chỉ: Thôn An Lợi, xã Triệu Bình (xã Triệu Độ cũ), huyện Triệu Phong, tỉnh Quảng Trị.\n")
    detail_doc.append("Gia phả ghi chép chi tiết toàn bộ 313 thành viên từ Đời 1 (Thủy tổ Lê Văn Khôi) đến Đời 8, bao gồm thông tin thế thứ, thân phụ mẫu, phối ngẫu, con cái, ngày kỵ và nơi an táng.\n")
    
    # Sort members by generation, then ID
    members_sorted = sorted(members, key=lambda x: (x.get('generation_in_branch', 1), x.get('id', 0)))
    
    current_gen = None
    for m in members_sorted:
        gen = m.get('generation_in_branch', 1)
        if gen != current_gen:
            current_gen = gen
            detail_doc.append(f"\n---\n# THẾ HỆ THỨ {gen} (CHI 2) - TƯƠNG ỨNG ĐỜI THỨ {gen + 8} (PHÁI 4 HỌ LÊ VĂN)\n")
            
        mid = m['id']
        name = m.get('full_name', 'Không rõ')
        birth_name = m.get('birth_name')
        gender = get_gender_label(m.get('gender'))
        status = "Đã mất (Quy tiên)" if m.get('is_deceased') else "Còn sống (Hiện tiền)"
        birth_date = m.get('birth_date') or "Không rõ"
        death_date = m.get('death_date') or ("Không rõ" if m.get('is_deceased') else "N/A (còn sống)")
        burial_place = m.get('burial_place') or "Không rõ"
        hometown = m.get('hometown') or "Thôn An Lợi, Triệu Bình, Triệu Phong, Quảng Trị"
        occupation = m.get('occupation') or "Không rõ"
        bio = m.get('bio') or "Không có ghi chú thêm"
        
        # Family Relations
        father = get_member_name_link(m.get('father_id'))
        mother = get_member_name_link(m.get('mother_id'))
        
        # Spouses
        s_ids = spouses_map.get(mid, set())
        if s_ids:
            spouse_strs = []
            for s_id in s_ids:
                sp_mem = id_map.get(s_id)
                if sp_mem:
                    sp_type = sp_mem.get('spouse_type') or m.get('spouse_type') or 'Phối ngẫu'
                    spouse_strs.append(f"{sp_mem.get('full_name')} (ID: {s_id}, {sp_type})")
            spouse_info = ", ".join(spouse_strs)
        else:
            spouse_info = "Chưa ghi nhận hoặc chưa có"
            
        # Children
        children = children_map.get(mid, [])
        # Deduplicate children by ID
        unique_children = {c['id']: c for c in children}.values()
        if unique_children:
            child_strs = []
            for c in sorted(unique_children, key=lambda x: x.get('id', 0)):
                c_gen = c.get('generation_in_branch', gen + 1)
                child_strs.append(f"{c.get('full_name')} (ID: {c.get('id')}, {get_gender_label(c.get('gender'))}, Đời {c_gen})")
            children_info = f"{len(unique_children)} người: " + "; ".join(child_strs)
        else:
            children_info = "Không có ghi nhận con cái (hoặc Vô tự)"
            
        # Siblings
        siblings = []
        fid = m.get('father_id')
        mid_mom = m.get('mother_id')
        if fid or mid_mom:
            for other in members:
                if other['id'] != mid:
                    if (fid and other.get('father_id') == fid) or (mid_mom and other.get('mother_id') == mid_mom):
                        siblings.append(f"{other.get('full_name')} (ID: {other['id']})")
        siblings_info = ", ".join(siblings) if siblings else "Không có ghi nhận"
        
        # Entry in Markdown
        detail_doc.append(f"### {name} (ID: {mid})")
        if birth_name:
            detail_doc.append(f"- **Tên húy / tên tự**: {birth_name}")
        detail_doc.append(f"- **Đời thứ**: Đời {gen} Chi 2 (Đời {gen + 8} Phái 4)")
        detail_doc.append(f"- **Giới tính**: {gender}")
        detail_doc.append(f"- **Tình trạng**: {status}")
        detail_doc.append(f"- **Năm sinh**: {birth_date}")
        detail_doc.append(f"- **Ngày mất (kỵ nhật)**: {death_date}")
        detail_doc.append(f"- **Nơi an táng**: {burial_place}")
        detail_doc.append(f"- **Nguyên quán**: {hometown}")
        detail_doc.append(f"- **Nghề nghiệp**: {occupation}")
        detail_doc.append(f"- **Quan hệ thân tộc**:")
        detail_doc.append(f"  - Thân phụ (Cha): {father}")
        detail_doc.append(f"  - Thân mẫu (Mẹ): {mother}")
        detail_doc.append(f"  - Phối ngẫu (Vợ/Chồng): {spouse_info}")
        detail_doc.append(f"  - Con cái: {children_info}")
        detail_doc.append(f"  - Anh chị em ruột: {siblings_info}")
        detail_doc.append(f"- **Tiểu sử / Ghi chú**: {bio}\n")

    # SAVE TO BOTH DIRECTORIES
    target_dirs = [
        os.path.join(base_dir, 'rag-service', 'data', 'raw_documents'),
        os.path.join(base_dir, 'data', 'raw_documents')
    ]
    
    files_to_save = [
        ('tong_quan_va_thong_ke_dong_ho.md', "\n".join(stats_doc)),
        ('lich_gio_ky_va_an_tang.md', "\n".join(calendar_doc)),
        ('gia_pha_chi_tiet_ho_le_van.md', "\n".join(detail_doc))
    ]
    
    for t_dir in target_dirs:
        os.makedirs(t_dir, exist_ok=True)
        for fname, content in files_to_save:
            fpath = os.path.join(t_dir, fname)
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Saved: {fpath} ({len(content)} characters, {len(content.splitlines())} lines)")

if __name__ == '__main__':
    main()
