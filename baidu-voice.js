// 百度语音API集成
// 支持语音识别和语音合成

const BAIDU_CONFIG = {
    APP_ID: '122852124',
    API_KEY: 'KzPJnG6YSZXZKM1ic9KsrAGi',
    SECRET_KEY: 'JGACwssuiimzcyJOJD9JNaIacYZchdze'
};

// 获取百度Access Token
async function getBaiduToken() {
    const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${BAIDU_CONFIG.API_KEY}&client_secret=${BAIDU_CONFIG.SECRET_KEY}`;
    
    const res = await fetch(url);
    const data = await res.json();
    return data.access_token;
}

// 语音识别（语音转文字）
async function baiduASR(audioData) {
    const token = await getBaiduToken();
    const url = `https://vop.baidu.com/server_api?cuid=TOKI&token=${token}&dev_pid=1537&format=wav&rate=16000`;
    
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'audio/wav; rate=16000' },
        body: audioData
    });
    
    const data = await res.json();
    return data.result?.[0] || '';
}

// 语音合成（文字转语音）
async function baiduTTS(text) {
    const token = await getBaiduToken();
    const url = `https://tsn.baidu.com/text2audio?tex=${encodeURIComponent(text)}&tok=${token}&cuid=TOKI&ctp=1&lan=zh&spd=5&pit=5&vol=9&per=4&aue=6`;
    
    const res = await fetch(url);
    return await res.arrayBuffer(); // 返回音频数据
}

// 播放百度TTS音频
async function playBaiduTTS(text) {
    const audioData = await baiduTTS(text);
    const blob = new Blob([audioData], { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    await audio.play();
}

// 导出
window.BaiduVoice = {
    asr: baiduASR,
    tts: baiduTTS,
    play: playBaiduTTS,
    config: BAIDU_CONFIG
};
