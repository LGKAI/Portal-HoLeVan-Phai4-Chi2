-- ====================================================
-- SCRIPT ĐỒNG BỘ 5 BÀI VIẾT TỪ LOCALHOST LÊN SUPABASE
-- Mở Supabase -> SQL Editor -> Dán toàn bộ script này -> Run
-- ====================================================

BEGIN;

-- Bài viết: Lăng Chi và Cồn Giữa nhìn từ trên cao: Chốn cội nguồn bình yên giữa đồng xanh An Lợi
INSERT INTO news (id, title, slug, content, thumbnail_url, category, published_at, view_count, is_published)
VALUES (1006, 'Lăng Chi và Cồn Giữa nhìn từ trên cao: Chốn cội nguồn bình yên giữa đồng xanh An Lợi', 'lng-chi-v-cn-gia-nhn-t-trn-cao-chn-ci-ngun-bnh-yn-gia-ng-xanh-an-li-1789833061802', '<p>Nhìn từ trên cao qua ống kính flycam, Cồn Giữa và khu Lăng Chi 2 - Phái 4 - Họ Lê Văn hiện lên vừa bao la, thanh thoát, lại vừa lắng đọng xiết bao nghĩa tình cốt nhục. Giữa bốn bề đồng ruộng làng An Lợi bát ngát, chốn an nghỉ ngàn thu của cửu huyền thất tổ như được đất mẹ chở che trọn vẹn trong bầu không khí thanh bình, tĩnh lặng.</p><p class="my-3 text-center"><img src="/uploads/general/image-1789833045407-576382490.jpg" alt="Ảnh bài viết" style="border-radius: 8px; margin: 12px auto; box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px;"></p><p>Phóng tầm mắt từ tầng không khoáng đạt, cảnh sắc quê nhà đẹp tựa một bức họa thiên nhiên hiền hòa. Những thửa ruộng xanh mướt đan cài bên con đường bê tông nhỏ dẫn lối ra khu lăng, xa xa là dòng Thạch Hãn êm đềm lững lờ trôi cùng nhịp cầu vươn mình nối đôi bờ. Giữa không gian ấy, khu lăng mộ của tổ tiên nổi bật với nét kiến trúc truyền thống trang nghiêm: mái ngói đao cong đỏ tươi, cuốn thư, trụ biểu rêu phong cùng từng hàng bia mộ được con cháu chăm chút, quét dọn sạch sẽ qua bao mùa mưa nắng.</p><p class="my-3 text-center"><img src="/uploads/general/image-1789833054459-994631608.jpg" alt="Ảnh bài viết" style="border-radius: 8px; margin: 12px auto; box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px;"></p><p>Cồn Giữa không chỉ là mảnh đất gửi gắm thân xác của bao thế hệ tiền nhân đã dày công khai hoang lập ấp, mà còn là cội rễ tâm linh thiêng liêng của toàn thể con cháu họ Lê Văn. Dù cuộc sống có đưa mỗi người đi muôn phương lập nghiệp, mỗi lần ngắm nhìn chốn linh thiêng nơi đầu bờ ngọn cỏ quê nhà, lòng lại thấy bùi ngùi ấm áp, nhắc nhở nhau luôn hướng về nguồn cội và giữ trọn đạo hiếu của gia tộc muôn đời.</p>', 'https://ulhzlkowepovmxzahyve.supabase.co/storage/v1/object/public/uploads/thumbnails/thumbnail-1789833061851-293861645.jpg', 'event', '2026-09-19T15:51:01.861Z', 3, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  content = EXCLUDED.content,
  thumbnail_url = EXCLUDED.thumbnail_url,
  category = EXCLUDED.category,
  is_published = EXCLUDED.is_published;

-- Bài viết: Ấm áp tinh thần tri ân tại Lễ Tảo mộ Truyền thống Phái 4 – Họ Lê Văn
INSERT INTO news (id, title, slug, content, thumbnail_url, category, published_at, view_count, is_published)
VALUES (1005, 'Ấm áp tinh thần tri ân tại Lễ Tảo mộ Truyền thống Phái 4 – Họ Lê Văn', 'm-p-tinh-thn-tri-n-ti-l-to-m-truyn-thng-phi-4-h-l-vn-1788578877834', '<p>Vừa qua, ngày 23 tháng 07 năm 2026 (10/06/2026 âm lịch), trong không khí trang nghiêm và ấm cúng, toàn thể con cháu nội ngoại Phái 4 thuộc dòng họ Lê Văn đã cùng tề tựu về nhà ông Lê Văn Sau (đời thứ 14) để tham gia Lễ Tảo mộ Truyền thống hàng năm.</p><p>Từ sáng sớm, ngôi nhà của ông Lê Văn Sau đã rộn rã tiếng cười nói của các thế hệ tụ hội về cội nguồn. Sau nghi thức dâng hương bái tổ tại gia từ, đoàn con cháu cùng nhau tiến về khu lăng mộ dòng họ để dọn dẹp khuôn viên, cắt tỉa cây cỏ, đắp lại từng nấm mồ và dâng nén hương thơm tưởng nhớ tiền nhân. Đây không chỉ là việc làm thể hiện đạo lý “Uống nước nhớ nguồn” sâu sắc, mà còn là dịp để thế hệ cha anh giáo dục lớp con cháu trẻ tuổi về gốc tích, gia phong và niềm tự hào đối với công đức tổ tiên.</p><p>Khép lại phần nghi lễ nghĩa tình ngoài lăng tẩm, mọi người cùng quây quần dùng bữa cơm thân mật tại nhà ông Lê Văn Sau. Những câu chuyện dòng họ, lời thăm hỏi ân cần và lời chúc sức khỏe đầu năm rộn rã bên mâm cơm, thắt chặt hơn nữa sợi dây liên kết giữa các nhánh, các chi trong gia tộc.</p><p>Lễ tảo mộ thường niên của Phái 4 – Họ Lê Văn tiếp tục khẳng định nét đẹp văn hóa tâm linh bền vững, nhắc nhở mỗi người con họ Lê dù đi đâu, làm gì vẫn luôn hướng về cội nguồn huyết thống.</p><p class="my-3 text-center"><img src="/uploads/general/image-1789831206542-233167383.jpg" alt="Ảnh bài viết" style="border-radius: 8px; margin: 12px auto; box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px;"></p><p><br></p>', 'https://ulhzlkowepovmxzahyve.supabase.co/storage/v1/object/public/uploads/thumbnails/thumbnail-1788578877847-479558684.jpg', 'event', '2026-09-05T03:27:57.853Z', 11, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  content = EXCLUDED.content,
  thumbnail_url = EXCLUDED.thumbnail_url,
  category = EXCLUDED.category,
  is_published = EXCLUDED.is_published;

-- Bài viết: Tìm về cội nguồn: Lễ Tảo mộ Truyền thống Phái 4 – Họ Lê Văn
INSERT INTO news (id, title, slug, content, thumbnail_url, category, published_at, view_count, is_published)
VALUES (1004, 'Tìm về cội nguồn: Lễ Tảo mộ Truyền thống Phái 4 – Họ Lê Văn', 'tm-v-ci-ngun-l-to-m-truyn-thng-phi-4-h-l-vn-1788578780298', '<p>Có những con đường càng đi xa càng thấy nhớ. Có những miền đất, dù cuộc đời đưa mỗi người đến muôn phương lập nghiệp, vẫn luôn là nơi trái tim đau đáu muốn trở về. Đó là quê cha đất tổ, là nơi chôn nhau cắt rốn, nơi từng nắm đất, từng ngọn cỏ đều in dấu bước chân của bao thế hệ tiền nhân.</p><p>Con cháu bổn phái (Phái 4) dòng họ Lê Văn – tiền khai khẩn làng An Lợi, cùng các dòng họ Lê Công, Hồ, Trần, Phan, Phạm, Hoàng, Nguyễn,... vẫn luôn tự hào về cội nguồn của mình. Tổ tiên chúng ta vốn là con cháu đất kinh kỳ xứ Thanh, theo bước các bậc tiền nhân triều Hậu Lê vào phương Nam mở mang bờ cõi, khai hoang lập ấp, dựng nên làng An Toàn thuở trước, nay là làng An Lợi hiền hòa bên dòng Thạch Hãn. Biết bao giọt mồ hôi đã rơi xuống để biến vùng đất hoang vu thành xóm làng trù phú. Biết bao thế hệ đã bền bỉ giữ gìn gia phong, hun đúc đạo hiếu, để hôm nay con cháu được sum vầy dưới một mái nhà chung mang tên dòng tộc.</p><p>Người xưa dạy rằng: "Cây có cội, nước có nguồn." Một dòng họ muốn trường tồn không chỉ nhờ sự hưng thịnh của con cháu, mà còn bởi mỗi người luôn biết cúi đầu trước tổ tiên, tri ân người đi trước và giữ gìn các giá trị trao truyền qua bao đời. Lễ Tảo mộ vì thế không chỉ là dịp chăm sóc phần mộ ông bà, mà còn là cuộc trở về của ký ức, của tình thân và lòng biết ơn sâu sắc.</p><p>Theo lệ xưa, năm nay con cháu Phái 4 – họ Lê Văn long trọng tổ chức Lễ Tảo mộ, dâng hương tưởng nhớ công đức cao dày của Cửu huyền Thất tổ. Đây không chỉ là cuộc hội ngộ huyết thống, mà còn là dịp để thế hệ hôm nay trao lại cho cháu con ngọn lửa của lòng hiếu kính, tình quê hương và niềm tự hào về cội nguồn họ Lê Văn.</p><p class="my-3 text-center"><img src="/uploads/general/image-1789831081706-359772073.jpg" alt="Ảnh bài viết" style="border-radius: 8px; margin: 12px auto; box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px;"></p>', 'https://ulhzlkowepovmxzahyve.supabase.co/storage/v1/object/public/uploads/thumbnails/thumbnail-1788578780306-228720381.jpg', 'event', '2026-09-05T03:26:20.320Z', 23, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  content = EXCLUDED.content,
  thumbnail_url = EXCLUDED.thumbnail_url,
  category = EXCLUDED.category,
  is_published = EXCLUDED.is_published;

-- Bài viết: Niềm tự hào dòng tộc: Em Lê Đức Trí đạt giải Ba kỳ thi Học sinh giỏi cấp Tỉnh
INSERT INTO news (id, title, slug, content, thumbnail_url, category, published_at, view_count, is_published)
VALUES (1003, 'Niềm tự hào dòng tộc: Em Lê Đức Trí đạt giải Ba kỳ thi Học sinh giỏi cấp Tỉnh', 'nim-t-ho-dng-tc-em-l-c-tr-t-gii-ba-k-thi-hc-sinh-gii-cp-tnh-1788578519931', '<p>Truyền thống hiếu học và trọng tri thức vốn là nét đẹp được bao thế hệ tiền nhân họ Lê Văn dày công vun đắp. Tiếp nối truyền thống vẻ vang ấy, con cháu Phái 4 hôm nay tiếp tục ghi dấu ấn tự hào trên con đường học vấn.</p><p>Trong kỳ thi chọn Học sinh giỏi văn hóa cấp Tỉnh năm học 2025 – 2026, em Lê Đức Trí (Bi) – học sinh lớp 8E, trường THCS Phan Đình Phùng (thành viên đời thứ 15, Phái 4 – Họ Lê Văn) đã xuất sắc đạt thành tích: Giải Ba môn KHTN 1 (Hóa học).</p><p>Thành tích này là kết quả xứng đáng cho tinh thần kiên trì, say mê học tập của em, sự tận tâm dạy dỗ từ quý thầy cô giáo, cùng sự chăm sóc, động viên chu đáo từ phía gia đình. Đây không chỉ là niềm vui lớn của bản thân và gia đình em Bi, mà còn là niềm tự hào chung của toàn thể con cháu Phái 4 – Họ Lê Văn.</p><p class="my-3 text-center"><img src="/uploads/general/image-1789831142111-226106004.jpg" alt="Ảnh bài viết" style="border-radius: 8px; margin: 12px auto; box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px;"></p><p><br></p>', 'https://ulhzlkowepovmxzahyve.supabase.co/storage/v1/object/public/uploads/thumbnails/thumbnail-1788578519948-563492862.jpg', 'event', '2026-09-05T03:21:59.960Z', 18, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  content = EXCLUDED.content,
  thumbnail_url = EXCLUDED.thumbnail_url,
  category = EXCLUDED.category,
  is_published = EXCLUDED.is_published;

-- Bài viết: Triển khai Dự án Web Portal Họ Lê Văn - Phái 4 - Chi 2
INSERT INTO news (id, title, slug, content, thumbnail_url, category, published_at, view_count, is_published)
VALUES (2, 'Triển khai Dự án Web Portal Họ Lê Văn - Phái 4 - Chi 2', 'trin-khai-d-n-web-portal-h-l-vn-phi-4-chi-2-1787370573465', '<p>Trong dòng chảy hối hả của thời đại số, khi con cháu ngày một trưởng thành và vươn xa lập nghiệp ở khắp mọi miền đất nước lẫn hải ngoại, việc lưu giữ nguồn cội và kết nối tình thân gia tộc càng trở nên cấp thiết. Xuất phát từ tâm huyết cháy bỏng muốn bảo tồn những giá trị văn hóa ngàn đời của tiên tổ, ông Lê Văn Nhàn (thành viên đời thứ 14, Phái 4 – Họ Lê Văn) đã ấp ủ và khởi xướng ý tưởng xây dựng một không gian số chung cho dòng tộc.</p><p>Hiện thực hóa ý tưởng giàu ý nghĩa ấy, vào ngày 22/08/2026, dự án Cổng thông tin điện tử (Web Portal) Dòng họ Lê Văn – Phái 4 – Chi 2 (thôn An Lợi, xã Triệu Bình, tỉnh Quảng Trị) đã chính thức được khởi công và triển khai kỹ thuật bởi anh Lê Gia Khánh (thành viên đời thứ 15, con trai ông Lê Văn Nhàn) – hiện là sinh viên năm 3 chuyên ngành Trí tuệ nhân tạo, Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM.</p><p>Đây sẽ là cổng thông tin lưu trữ gia phả, tư liệu, thường xuyên đăng tải các tin tức, sự kiện. Ngoài ra còn có tích hợp trợ lý AI để giải đáp các thắc mắc của người dùng về chi, phái, dòng họ. Dự án không chỉ là minh chứng sống động cho sự giao thoa hài hòa giữa truyền thống đạo hiếu với tri thức công nghệ hiện đại, mà còn thể hiện tinh thần trách nhiệm, lòng nhiệt huyết của lớp trẻ họ Lê Văn đối với quê cha đất tổ.</p>', 'https://ulhzlkowepovmxzahyve.supabase.co/storage/v1/object/public/uploads/thumbnails/thumbnail-1788638851253-612282212.png', 'event', '2026-08-22T03:49:33.540Z', 31, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  content = EXCLUDED.content,
  thumbnail_url = EXCLUDED.thumbnail_url,
  category = EXCLUDED.category,
  is_published = EXCLUDED.is_published;

-- Đồng bộ lại sequence ID của bảng news
SELECT setval(pg_get_serial_sequence('news', 'id'), COALESCE((SELECT MAX(id) FROM news), 1) + 1, false);

COMMIT;
