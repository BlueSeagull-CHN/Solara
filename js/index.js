// 原有代码（假设包含其他逻辑，如搜索、播放等，保持不变）
const API_BASE = 'https://music.gdstudio.xyz/api';

// 热门歌单 ID（从网易云音乐热门歌单获取，示例 ID）
const PLAYLIST_IDS = [
    '3778678',    // 热歌榜
    '3779629',    // 新歌榜
    '2884035',    // 原创音乐榜
    '19723756',   // 飙升榜
    '180106',     // UK排行榜
    '60198',      // 美国Billboard榜
    '6778226435', // 其他热门歌单（可扩展）
    '7849903053',
    '9100237653'
];

// 显示通知（从原代码推测，可能已有类似函数）
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// 探索雷达逻辑（替换原有 loadOnlineBtn 事件）
document.addEventListener('DOMContentLoaded', () => {
    const loadOnlineBtn = document.getElementById('loadOnlineBtn');
    const loader = loadOnlineBtn.querySelector('.loader');
    const btnText = loadOnlineBtn.querySelector('.btn-text');
    const searchResults = document.getElementById('searchResults');

    loadOnlineBtn.addEventListener('click', async () => {
        // 显示加载动画
        loader.style.display = 'inline-block';
        btnText.style.opacity = '0.6';
        loadOnlineBtn.disabled = true;

        try {
            // 随机选择歌单和偏移量
            const randomPlaylistId = PLAYLIST_IDS[Math.floor(Math.random() * PLAYLIST_IDS.length)];
            const randomOffset = Math.floor(Math.random() * 501); // 0-500 随机偏移
            const limit = 50;

            // 调用歌单歌曲 API
            const response = await fetch(`${API_BASE}/playlist/track/all?id=${randomPlaylistId}&limit=${limit}&offset=${randomOffset}`);
            const data = await response.json();

            if (data.code === 200 && data.songs && data.songs.length > 0) {
                // 随机打乱歌曲并取前 50 首（额外随机化）
                const songs = data.songs.sort(() => 0.5 - Math.random()).slice(0, 50);

                // 清空并显示结果
                searchResults.innerHTML = '';
                songs.forEach(song => {
                    const item = document.createElement('div');
                    item.className = 'search-result-item';
                    item.innerHTML = `
                        <div class="song-title">${song.name}</div>
                        <div class="song-artist">${song.ar[0].name}</div>
                        <button onclick="addToPlaylist(${song.id})">添加到播放列表</button>
                    `;
                    searchResults.appendChild(item);
                });

                showNotification('发现 50 首随机新歌！', 'success');
            } else {
                showNotification('无法加载歌曲，请重试', 'error');
            }
        } catch (error) {
            console.error('探索雷达错误:', error);
            showNotification('网络错误，请检查连接', 'error');
        } finally {
            // 隐藏加载动画
            loader.style.display = 'none';
            btnText.style.opacity = '1';
            loadOnlineBtn.disabled = false;
        }
    });

    // 以下是其他原有逻辑（假设未更改）
    // 搜索逻辑
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    searchBtn.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        if (!query) return;
        try {
            const response = await fetch(`${API_BASE}/search?keywords=${query}&type=1&limit=20&offset=0`);
            const data = await response.json();
            if (data.code === 200 && data.result.songs) {
                searchResults.innerHTML = '';
                data.result.songs.forEach(song => {
                    const item = document.createElement('div');
                    item.className = 'search-result-item';
                    item.innerHTML = `
                        <div class="song-title">${song.name}</div>
                        <div class="song-artist">${song.ar[0].name}</div>
                        <button onclick="addToPlaylist(${song.id})">添加到播放列表</button>
                    `;
                    searchResults.appendChild(item);
                });
            }
        } catch (error) {
            console.error('搜索错误:', error);
            showNotification('搜索失败，请重试', 'error');
        }
    });

    // 登录逻辑（从历史复制，保持不变）
    const loginContainer = document.getElementById('loginContainer');
    const mainContentContainer = document.getElementById('mainContentContainer');
    const passwordInput = document.getElementById('passwordInput');
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    const errorMessage = document.getElementById('errorMessage');

    if (!window.APP_CONFIG || !window.APP_CONFIG.PASSWORD) {
        errorMessage.textContent = '配置加载失败，请检查部署配置';
        errorMessage.style.display = 'block';
        return;
    }

    loginButton.addEventListener('click', () => {
        const enteredPassword = passwordInput.value.trim();
        if (!enteredPassword) {
            errorMessage.textContent = '请输入密码';
            errorMessage.style.display = 'block';
            return;
        }
        if (enteredPassword === window.APP_CONFIG.PASSWORD) {
            localStorage.setItem('isLoggedIn', 'true');
            document.documentElement.setAttribute('data-logged-in', 'true');
            errorMessage.style.display = 'none';
            passwordInput.value = '';
        } else {
            errorMessage.textContent = '密码错误，请重试';
            errorMessage.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
        }
    });

    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginButton.click();
        }
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('isLoggedIn');
        document.documentElement.setAttribute('data-logged-in', 'false');
        passwordInput.value = '';
        errorMessage.style.display = 'none';
        passwordInput.focus();
        window.scrollTo(0, 0);
    });

    if (document.documentElement.getAttribute('data-logged-in') === 'false') {
        passwordInput.focus();
    }

    // 其他原有函数（假设，如播放、歌词等）
    function addToPlaylist(songId) {
        console.log('添加歌曲 ID:', songId);
        // 原有播放列表逻辑（请保留你的实现）
    }

    // 移动端脚本（从原代码复制）
    if (window.__SOLARA_IS_MOBILE) {
        const mobileScript = document.createElement('script');
        mobileScript.src = 'js/mobile.js';
        mobileScript.async = false;
        mobileScript.defer = false;
        document.body.appendChild(mobileScript);
    }
});
