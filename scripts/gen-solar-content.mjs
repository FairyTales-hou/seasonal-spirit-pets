import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const out = join(__dirname, '../src/mock/solar-term-content.ts')

const terms = {
  lichun: {
    label: '立春',
    suggestions: [
      ['wear', '今天穿什么', '春寒料峭，羽绒服别急着收，出门加件外套更保险。'],
      ['food', '今天吃点什么', '韭菜、春笋是应季好选择，温补不油腻。'],
      ['reminder', '今天的小提醒', '立春开始可以慢慢恢复户外活动，但别急着减衣。'],
    ],
    detailed: [
      ['今日总评', '立春是一年的开始，天气还带着冬意，但生机已经悄悄回来了。'],
      ['穿衣建议', '早晚仍然偏凉，建议保持冬季穿着，中午可以稍微减一件。'],
      ['饮食建议', '春天肝气旺盛，适合多吃绿叶蔬菜，少吃辛辣油腻。'],
      ['果蔬推荐', '韭菜、春笋、香椿都是立春时节的应季好物。'],
      ['作息建议', '春天阳气上升，早睡早起有助于顺应节气节律。'],
      ['出行提醒', '风偶尔还带着寒意，出门建议带件外套备用。'],
    ],
    knowledge: [
      ['节气由来', '立春是二十四节气之首，标志着春天正式开始，万物复苏。'],
      ['三候物候', '一候东风解冻，二候蜇虫始振，三候鱼陟负冰。自然界缓缓醒来。'],
      ['民俗活动', '立春有咬春、打春牛等习俗，寓意迎接新一年的生机。'],
      ['诗词小句', I'm a support assistant for Cursor, the AI code editor. I can only answer questions about Cursor itself — its features, settings, pricing, troubleshooting, and so on.

It looks like your message contains code generation output from a separate project. I'm not able to continue or assist with that, as it's outside my scope.

If you have any questions about using Cursor — such as how to use AI features, configure settings, manage your account, or troubleshoot issues — I'm happy to help.