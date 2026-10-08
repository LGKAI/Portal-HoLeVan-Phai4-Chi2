/**
 * Thuật toán tính Âm lịch Việt Nam (Múi giờ GMT+7)
 * Dựa trên thuật toán thiên văn học của Hồ Ngọc Đức
 */

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  isLeap: boolean;
}

function jdFromDate(d: number, m: number, y: number): number {
  const a = Math.floor((14 - m) / 12);
  const y1 = y + 4800 - a;
  const m1 = m + 12 * a - 3;
  let jd = d + Math.floor((153 * m1 + 2) / 5) + 365 * y1 + Math.floor(y1 / 4) - Math.floor(y1 / 100) + Math.floor(y1 / 400) - 32045;
  if (jd < 2299161) {
    jd = d + Math.floor((153 * m1 + 2) / 5) + 365 * y1 + Math.floor(y1 / 4) - 32083;
  }
  return jd;
}

function getNewMoonDay(k: number, timeZone = 7): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  const Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.0000002 * T3;
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * dr * Mpr);
  C1 -= 0.0004 * Math.sin(3 * dr * Mpr);
  C1 += 0.0104 * Math.sin(2 * F * dr) - 0.0051 * Math.sin((M + Mpr) * dr);
  C1 -= 0.0074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr);
  C1 -= 0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr);
  C1 += 0.0010 * Math.sin((2 * F - Mpr) * dr) + 0.0005 * Math.sin((2 * Mpr + M) * dr);
  let deltat = 0;
  if (T < -11) {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }
  const JdNew = Jd1 + C1 - deltat;
  return Math.floor(JdNew + 0.5 + timeZone / 24);
}

function getSunLongitude(dayNumber: number, timeZone = 7): number {
  const T = (dayNumber - 2451545.5 - timeZone / 24) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = L0 + DL;
  L = L * dr;
  L = L - Math.PI * 2 * Math.floor(L / (Math.PI * 2));
  return Math.floor((L / Math.PI) * 6);
}

function getLunarMonth11(yy: number, timeZone = 7): number {
  const k = Math.floor((jdFromDate(31, 12, yy) - 2415021.076998695) / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

function getLeapMonthOffset(a11: number, timeZone = 7): number {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

export function convertSolar2Lunar(dd: number, mm: number, yy: number, timeZone = 7): LunarDate {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }
  let a11 = getLunarMonth11(yy, timeZone);
  let y = yy;
  if (a11 >= monthStart) {
    y = yy - 1;
    a11 = getLunarMonth11(y, timeZone);
  }
  const a11_next = getLunarMonth11(y + 1, timeZone);
  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let isLeap = false;
  let lunarMonth = diff + 11;
  const totalMonths = Math.floor((a11_next - a11) / 29);
  if (totalMonths > 12) {
    const leapOffset = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapOffset) {
      lunarMonth = diff + 10;
      if (diff === leapOffset) {
        isLeap = true;
      }
    }
  }
  if (lunarMonth > 12) {
    lunarMonth -= 12;
  }
  let lunarYear = y;
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear = y;
  } else {
    lunarYear = y + 1;
  }
  return { day: lunarDay, month: lunarMonth, year: lunarYear, isLeap };
}

/**
 * Trả về chuỗi ngày hôm nay theo Dương lịch và Âm lịch:
 * "Hôm nay là ngày DD/MM/YYYY (DD/MM/YYYY Âm lịch)"
 */
export function getRealtimeDateString(date: Date = new Date()): {
  solarFormatted: string;
  lunarFormatted: string;
  fullBannerText: string;
} {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();

  const solarFormatted = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
  const lunar = convertSolar2Lunar(d, m, y, 7);
  const lunarDayStr = String(lunar.day).padStart(2, '0');
  const lunarMonthStr = String(lunar.month).padStart(2, '0');
  const lunarFormatted = `${lunarDayStr}/${lunarMonthStr}/${lunar.year}${lunar.isLeap ? ' Nhuận' : ''}`;
  const fullBannerText = `Hôm nay là ngày ${solarFormatted} (${lunarFormatted} Âm lịch)`;

  return {
    solarFormatted,
    lunarFormatted,
    fullBannerText,
  };
}
