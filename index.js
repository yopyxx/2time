// index.js
// discord.js v14
// 매일 새벽 2시(KST)에 특정 채널 2곳에 "# ~일자 시작" 자동 전송

const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');
const http = require('http');

const TOKEN = process.env.TOKEN;

// 메시지를 보낼 채널 ID
const TARGET_CHANNEL_IDS = [
  '1452674857891266724',
  '1473695977859715093',
  '1473927904714031167' // ✅ 추가
];

// 한국 요일 변환
const WEEKDAY_KR = ['일', '월', '화', '수', '목', '금', '토'];

// KST 기준으로 "3월 26일자 시작" 문자열 생성
function getKSTStartMessage() {
  const now = new Date();

  const kstNow = new Date(
    now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' })
  );

  const month = kstNow.getMonth() + 1;
  const date = kstNow.getDate();
  const dayName = WEEKDAY_KR[kstNow.getDay()];

  return `# ${month}월 ${date}일자 시작`;
  // 요일까지 넣고 싶으면 아래로 변경
  // return `# ${month}월 ${date}일 ${dayName}요일자 시작`;
}

// 채널들에 메시지 전송
async function sendStartMessage(client) {
  const message = getKSTStartMessage();

  for (const channelId of TARGET_CHANNEL_IDS) {
    try {
      const channel = await client.channels.fetch(channelId);

      if (!channel) {
        console.log(`[실패] 채널을 찾을 수 없음: ${channelId}`);
        continue;
      }

      if (!channel.isTextBased()) {
        console.log(`[실패] 텍스트 채널이 아님: ${channelId}`);
        continue;
      }

      await channel.send(message);
      console.log(`[성공] ${channelId} 채널에 전송 완료: ${message}`);
    } catch (error) {
      console.error(`[에러] ${channelId} 채널 전송 실패`, error);
    }
  }
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
  console.log(`${client.user.tag} 로그인 완료`);

  // 매일 새벽 2시 정각 KST
  cron.schedule(
    '0 2 * * *',
    async () => {
      console.log('[크론 실행] 새벽 2시 메시지 전송 시작');
      await sendStartMessage(client);
    },
    {
      timezone: 'Asia/Seoul'
    }
  );

  console.log('매일 새벽 2시(KST) 자동 전송 크론 등록 완료');
});

// 봇 실행
client.login(TOKEN);

// Railway/호스팅용 간단한 웹 서버
const PORT = process.env.PORT || 3000;
http
  .createServer((req, res) => {
    if (req.url === '/' || req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false }));
  })
  .listen(PORT, () => {
    console.log(`웹 서버 실행 중: ${PORT}`);
  });
