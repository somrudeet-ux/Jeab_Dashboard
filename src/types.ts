export interface FeedbackItem {
  id: string;
  createdAt: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  average: number;
  comment?: string;
  deviceToken?: string;
}

export interface QuestionDef {
  id: number;
  title: string;
  shortLabel: string;
  description: string;
  category: string;
}

export const QUESTIONS: QuestionDef[] = [
  {
    id: 1,
    title: 'เนื้อหาและหลักสูตรตรงตามวัตถุประสงค์และความต้องการ',
    shortLabel: '1. เนื้อหาหลักสูตร',
    description: 'เนื้อหามีความทันสมัย ครบถ้วน และตรงกับความคาดหวัง',
    category: 'หลักสูตร'
  },
  {
    id: 2,
    title: 'วิทยากรมีความรู้ ความเชี่ยวชาญ และการถ่ายทอดที่เข้าใจง่าย',
    shortLabel: '2. การสอนของวิทยากร',
    description: 'อธิบายชัดเจน มีตัวอย่าง มีการตอบข้อซักถามอย่างเป็นกันเอง',
    category: 'วิทยากร'
  },
  {
    id: 3,
    title: 'การจัดสรรเวลา ลำดับหัวข้อ และกิจกรรมการเรียนรู้',
    shortLabel: '3. กิจกรรมและเวลา',
    description: 'ระยะเวลาเหมาะสม กิจกรรมช่วยกระตุ้นการมีส่วนร่วม',
    category: 'กระบวนการ'
  },
  {
    id: 4,
    title: 'อุปกรณ์ โสตทัศนูปกรณ์ สภาพแวดล้อม และการอำนวยความสะดวก',
    shortLabel: '4. สถานที่และอุปกรณ์',
    description: 'สัญญาณภาพ-เสียงชัดเจน สภาพแวดล้อมเอื้อต่อการเรียนรู้',
    category: 'สิ่งอำนวยความสะดวก'
  },
  {
    id: 5,
    title: 'ความรู้และทักษะที่ได้รับสามารถนำไปประยุกต์ใช้ในการปฏิบัติงานได้จริง',
    shortLabel: '5. ประโยชน์และการนำไปใช้',
    description: 'เกิดความคุ้มค่า เพิ่มประสิทธิภาพ และต่อยอดทักษะได้จริง',
    category: 'การประยุกต์ใช้'
  }
];

export interface LikertOption {
  value: number;
  label: string;
  emoji: string;
  colorClass: string;
}

export const LIKERT_OPTIONS: LikertOption[] = [
  { value: 5, label: 'มากที่สุด', emoji: '🤩', colorClass: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20' },
  { value: 4, label: 'มาก', emoji: '🙂', colorClass: 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10 hover:bg-cyan-500/20' },
  { value: 3, label: 'ปานกลาง', emoji: '😐', colorClass: 'text-amber-400 border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20' },
  { value: 2, label: 'น้อย', emoji: '🙁', colorClass: 'text-orange-400 border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20' },
  { value: 1, label: 'น้อยที่สุด', emoji: '😞', colorClass: 'text-rose-400 border-rose-500/50 bg-rose-500/10 hover:bg-rose-500/20' }
];

export interface LikertInterpretation {
  level: number;
  label: string;
  range: string;
  badgeColor: string;
  textColor: string;
  barColor: string;
  meaning: string;
}

export function getLikertInterpretation(score: number): LikertInterpretation {
  if (score >= 4.51) {
    return {
      level: 5,
      label: 'มากที่สุด (ดีเยี่ยม)',
      range: '4.51 - 5.00',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      textColor: 'text-emerald-400',
      barColor: 'bg-emerald-500',
      meaning: 'ผู้เข้าอบรมมีความพึงพอใจในระดับสูงสุด ผลการจัดอบรมประสบความสำเร็จอย่างดียิ่ง'
    };
  }
  if (score >= 3.51) {
    return {
      level: 4,
      label: 'มาก (ดี)',
      range: '3.51 - 4.50',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      textColor: 'text-cyan-400',
      barColor: 'bg-cyan-500',
      meaning: 'ผู้เข้าอบรมมีความพึงพอใจในเกณฑ์ดี ตรงตามเป้าหมายของหลักสูตร'
    };
  }
  if (score >= 2.51) {
    return {
      level: 3,
      label: 'ปานกลาง',
      range: '2.51 - 3.50',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      textColor: 'text-amber-400',
      barColor: 'bg-amber-500',
      meaning: 'อยู่ในระดับยอมรับได้ แต่มีจุดที่สามารถปรับปรุงเพิ่มเติมได้'
    };
  }
  if (score >= 1.51) {
    return {
      level: 2,
      label: 'น้อย',
      range: '1.51 - 2.50',
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      textColor: 'text-orange-400',
      barColor: 'bg-orange-500',
      meaning: 'ควรพิจารณาปรับปรุงเนื้อหาหรือวิธีการถ่ายทอดให้ตอบโจทย์ผู้เรียนมากขึ้น'
    };
  }
  return {
    level: 1,
    label: 'น้อยที่สุด',
    range: '1.00 - 1.50',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    textColor: 'text-rose-400',
    barColor: 'bg-rose-500',
    meaning: 'จำเป็นต้องได้รับการทบทวนและปรับปรุงกระบวนการฝึกอบรมโดยด่วน'
  };
}
