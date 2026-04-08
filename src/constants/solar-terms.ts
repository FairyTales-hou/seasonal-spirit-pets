export type SeasonKey = 'spring' | 'summer' | 'autumn' | 'winter'

export interface SolarTermItem {
  id: string
  name: string
  season: SeasonKey
  tagline: string
}

export const SOLAR_TERMS: SolarTermItem[] = [
  { id: 'lichun', name: '立春', season: 'spring', tagline: '春天刚刚醒来' },
  { id: 'yushui', name: '雨水', season: 'spring', tagline: '空气里都是柔软的水意' },
  { id: 'jingzhe', name: '惊蛰', season: 'spring', tagline: '雷声一响，万物都想动一动' },
  { id: 'chunfen', name: '春分', season: 'spring', tagline: '昼夜平分，万物舒展' },
  { id: 'qingming', name: '清明', season: 'spring', tagline: '雨丝轻轻，也适合把心放慢一点' },
  { id: 'guyu', name: '谷雨', season: 'spring', tagline: '春天最后一场润泽' },
  { id: 'lixia', name: '立夏', season: 'summer', tagline: '风里开始有一点甜味' },
  { id: 'xiaoman', name: '小满', season: 'summer', tagline: '将满未满，是很舒服的时候' },
  { id: 'mangzhong', name: '芒种', season: 'summer', tagline: '认真把种子放进土里' },
  { id: 'xiazhi', name: '夏至', season: 'summer', tagline: '白天很长，热情也很长' },
  { id: 'xiaoshu', name: '小暑', season: 'summer', tagline: '有一点热了，记得多喝水' },
  { id: 'dashu', name: '大暑', season: 'summer', tagline: '最热的时候，也别忘了留阴凉' },
  { id: 'liqiu', name: '立秋', season: 'autumn', tagline: '风一变轻，秋天就到了' },
  { id: 'chushu', name: '处暑', season: 'autumn', tagline: '热意在退场，生活慢慢松下来' },
  { id: 'bailu', name: '白露', season: 'autumn', tagline: '清晨有点凉了' },
  { id: 'qiufen', name: '秋分', season: 'autumn', tagline: '忙和静都该分得刚刚好' },
  { id: 'hanlu', name: '寒露', season: 'autumn', tagline: '凉意更深了一点' },
  { id: 'shuangjiang', name: '霜降', season: 'autumn', tagline: '叶子红了，天气也认真冷下来' },
  { id: 'lidong', name: '立冬', season: 'winter', tagline: '把温暖先留给自己' },
  { id: 'xiaoxue', name: '小雪', season: 'winter', tagline: '适合抱紧一点点暖意' },
  { id: 'daxue', name: '大雪', season: 'winter', tagline: '雪如果下大了，就把脚步放慢一点' },
  { id: 'dongzhi', name: '冬至', season: 'winter', tagline: '团圆和热气都会慢慢靠近' },
  { id: 'xiaohan', name: '小寒', season: 'winter', tagline: '别硬扛，暖一点比较好' },
  { id: 'dahan', name: '大寒', season: 'winter', tagline: '最冷的时候快过去了' },
]

export const SEASON_LABELS: Record<SeasonKey, string> = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
}
