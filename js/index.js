const dom = {
    container: document.getElementById("mainContainer"),
    backgroundStage: document.getElementById("backgroundStage"),
    backgroundBaseLayer: document.getElementById("backgroundBaseLayer"),
    backgroundTransitionLayer: document.getElementById("backgroundTransitionLayer"),
    playlist: document.getElementById("playlist"),
    playlistItems: document.getElementById("playlistItems"),
    lyrics: document.getElementById("lyrics"),
    lyricsScroll: document.getElementById("lyricsScroll"),
    lyricsContent: document.getElementById("lyricsContent"),
    mobileInlineLyrics: document.getElementById("mobileInlineLyrics"),
    mobileInlineLyricsScroll: document.getElementById("mobileInlineLyricsScroll"),
    mobileInlineLyricsContent: document.getElementById("mobileInlineLyricsContent"),
    audioPlayer: document.getElementById("audioPlayer"),
    themeToggleButton: document.getElementById("themeToggleButton"),
    loadOnlineBtn: document.getElementById("loadOnlineBtn"),
    showPlaylistBtn: document.getElementById("showPlaylistBtn"),
    showLyricsBtn: document.getElementById("showLyricsBtn"),
    searchInput: document.getElementById("searchInput"),
    searchBtn: document.getElementById("searchBtn"),
    sourceSelectButton: document.getElementById("sourceSelectButton"),
    sourceSelectLabel: document.getElementById("sourceSelectLabel"),
    sourceMenu: document.getElementById("sourceMenu"),
    searchResults: document.getElementById("searchResults"),
    notification: document.getElementById("notification"),
    albumCover: document.getElementById("albumCover"),
    currentSongTitle: document.getElementById("currentSongTitle"),
    currentSongArtist: document.getElementById("currentSongArtist"),
    debugInfo: document.getElementById("debugInfo"),
    playModeBtn: document.getElementById("playModeBtn"),
    playPauseBtn: document.getElementById("playPauseBtn"),
    progressBar: document.getElementById("progressBar"),
    currentTimeDisplay: document.getElementById("currentTimeDisplay"),
    durationDisplay: document.getElementById("durationDisplay"),
    volumeSlider: document.getElementById("volumeSlider"),
    volumeIcon: document.getElementById("volumeIcon"),
    qualityToggle: document.getElementById("qualityToggle"),
    playerQualityMenu: document.getElementById("playerQualityMenu"),
    qualityLabel: document.getElementById("qualityLabel"),
    mobileToolbarTitle: document.getElementById("mobileToolbarTitle"),
    mobileSearchToggle: document.getElementById("mobileSearchToggle"),
    mobileSearchClose: document.getElementById("mobileSearchClose"),
    mobilePanelClose: document.getElementById("mobilePanelClose"),
    mobileClearPlaylistBtn: document.getElementById("mobileClearPlaylistBtn"),
    mobileOverlayScrim: document.getElementById("mobileOverlayScrim"),
    mobileExploreButton: document.getElementById("mobileExploreButton"),
    mobileQualityToggle: document.getElementById("mobileQualityToggle"),
    mobileQualityLabel: document.getElementById("mobileQualityLabel"),
    mobilePanel: document.getElementById("mobilePanel"),
    mobilePanelTitle: document.getElementById("mobilePanelTitle"),
    mobileQueueToggle: document.getElementById("mobileQueueToggle"),
    searchArea: document.getElementById("searchArea"),
};

window.SolaraDom = dom;

const isMobileView = Boolean(window.__SOLARA_IS_MOBILE);

const mobileBridge = window.SolaraMobileBridge || {};
mobileBridge.handlers = mobileBridge.handlers || {};
mobileBridge.queue = Array.isArray(mobileBridge.queue) ? mobileBridge.queue : [];
window.SolaraMobileBridge = mobileBridge;

function invokeMobileHook(name, ...args) {
    if (!isMobileView) return undefined;
    const handler = mobileBridge.handlers[name];
    if (typeof handler === "function") {
        return handler(...args);
    }
    mobileBridge.queue.push({ name, args });
    return undefined;
}

function initializeMobileUI() {
    return invokeMobileHook("initialize");
}

function updateMobileToolbarTitle() {
    return invokeMobileHook("updateToolbarTitle");
}

function runAfterOverlayFrame(callback) {
    if (typeof callback !== "function" || !isMobileView) return;
    const runner = () => {
        if (!document.body) return;
        callback();
    };
    if (typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(runner);
    } else {
        window.setTimeout(runner, 0);
    }
}

function syncMobileOverlayVisibility() {
    if (!isMobileView || !document.body) return;
    const searchOpen = document.body.classList.contains("mobile-search-open");
    const panelOpen = document.body.classList.contains("mobile-panel-open");
    if (dom.searchArea) {
        dom.searchArea.setAttribute("aria-hidden", searchOpen ? "false" : "true");
    }
    if (dom.mobileOverlayScrim) {
        dom.mobileOverlayScrim.setAttribute("aria-hidden", (searchOpen || panelOpen) ? "false" : "true");
    }
}

function updateMobileClearPlaylistVisibility() {
    if (!isMobileView) return;
    const button = dom.mobileClearPlaylistBtn;
    if (!button) return;
    const playlistElement = dom.playlist;
    const body = document.body;
    const currentView = body ? body.getAttribute("data-mobile-panel-view") : null;
    const isPlaylistView = !body || !currentView || currentView === "playlist";
    const playlistSongs = Array.isArray(state.playlistSongs) ? state.playlistSongs : [];
    const isEmpty = playlistSongs.length === 0 || !playlistElement || playlistElement.classList.contains("empty");
    const shouldShow = isPlaylistView && !isEmpty;
    button.hidden = !shouldShow;
    button.setAttribute("aria-hidden", shouldShow ? "false" : "true");
}

function forceCloseMobileSearchOverlay() {
    if (!isMobileView || !document.body) return;
    document.body.classList.remove("mobile-search-open");
    if (dom.searchInput) dom.searchInput.blur();
    syncMobileOverlayVisibility();
}

function forceCloseMobilePanelOverlay() {
    if (!isMobileView || !document.body) return;
    document.body.classList.remove("mobile-panel-open");
    syncMobileOverlayVisibility();
}

function openMobileSearch() {
    return invokeMobileHook("openSearch");
}

function closeMobileSearch() {
    const result = invokeMobileHook("closeSearch");
    runAfterOverlayFrame(forceCloseMobileSearchOverlay);
    return result;
}

function toggleMobileSearch() {
    return invokeMobileHook("toggleSearch");
}

function openMobilePanel(view = "playlist") {
    return invokeMobileHook("openPanel", view);
}

function closeMobilePanel() {
    const result = invokeMobileHook("closePanel");
    runAfterOverlayFrame(forceCloseMobilePanelOverlay);
    return result;
}

function toggleMobilePanel(view = "playlist") {
    return invokeMobileHook("togglePanel", view);
}

function closeAllMobileOverlays() {
    const result = invokeMobileHook("closeAllOverlays");
    runAfterOverlayFrame(() => {
        forceCloseMobileSearchOverlay();
        forceCloseMobilePanelOverlay();
    });
    return result;
}

function updateMobileInlineLyricsAria(isOpen) {
    if (!dom.mobileInlineLyrics) return;
    dom.mobileInlineLyrics.setAttribute("aria-hidden", isOpen ? "false" : "true");
}

function setMobileInlineLyricsOpen(isOpen) {
    if (!isMobileView || !document.body) return;
    state.isMobileInlineLyricsOpen = Boolean(isOpen);
    document.body.classList.toggle("mobile-inline-lyrics-open", Boolean(isOpen));
    updateMobileInlineLyricsAria(Boolean(isOpen));
}

function hasInlineLyricsContent() {
    const content = dom.mobileInlineLyricsContent;
    if (!content) return false;
    return content.textContent.trim().length > 0;
}

function canOpenMobileInlineLyrics() {
    if (!isMobileView || !document.body) return false;
    const hasSong = Boolean(state.currentSong);
    return hasSong && hasInlineLyricsContent();
}

function closeMobileInlineLyrics(options = {}) {
    if (!isMobileView || !document.body) return false;
    if (!document.body.classList.contains("mobile-inline-lyrics-open")) {
        updateMobileInlineLyricsAria(false);
        state.isMobileInlineLyricsOpen = false;
        return false;
    }
    setMobileInlineLyricsOpen(false);
    if (options.force) state.userScrolledLyrics = false;
    return true;
}

function openMobileInlineLyrics() {
    if (!isMobileView || !document.body) return false;
    if (!canOpenMobileInlineLyrics()) return false;
    setMobileInlineLyricsOpen(true);
    state.userScrolledLyrics = false;
    window.requestAnimationFrame(() => {
        const container = dom.mobileInlineLyricsScroll || dom.mobileInlineLyrics;
        const activeLyric = dom.mobileInlineLyricsContent?.querySelector(".current") ||
            dom.mobileInlineLyricsContent?.querySelector("div[data-index]");
        if (container && activeLyric) {
            scrollToCurrentLyric(activeLyric, container);
        }
    });
    syncLyrics();
    return true;
}

function toggleMobileInlineLyrics() {
    if (!isMobileView || !document.body) return;
    if (document.body.classList.contains("mobile-inline-lyrics-open")) {
        closeMobileInlineLyrics();
    } else {
        openMobileInlineLyrics();
    }
}

const PLACEHOLDER_HTML = `<div class="placeholder"><i class="fas fa-music"></i></div>`;
const paletteCache = new Map();
const PALETTE_STORAGE_KEY = "paletteCache.v1";
let paletteAbortController = null;
const BACKGROUND_TRANSITION_DURATION = 850;
let backgroundTransitionTimer = null;
const PALETTE_APPLY_DELAY = 140;
let pendingPaletteTimer = null;
let deferredPaletteHandle = null;
let deferredPaletteType = "";
let deferredPaletteUrl = null;
const themeDefaults = {
    light: { gradient: "", primaryColor: "", primaryColorDark: "" },
    dark: { gradient: "", primaryColor: "", primaryColorDark: "" }
};
let paletteRequestId = 0;

function safeGetLocalStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.warn(`读取本地存储失败: ${key}`, error);
        return null;
    }
}

function safeSetLocalStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.warn(`写入本地存储失败: ${key}`, error);
    }
}

function parseJSON(value, fallback) {
    if (!value) return fallback;
    try {
        return JSON.parse(value);
    } catch (error) {
        console.warn("解析本地存储 JSON 失败", error);
        return fallback;
    }
}

function loadStoredPalettes() {
    const stored = safeGetLocalStorage(PALETTE_STORAGE_KEY);
    if (!stored) return;
    try {
        const entries = JSON.parse(stored);
        if (Array.isArray(entries)) {
            for (const entry of entries) {
                if (Array.isArray(entry) && typeof entry[0] === "string" && entry[1] && typeof entry[1] === "object") {
                    paletteCache.set(entry[0], entry[1]);
                }
            }
        }
    } catch (error) {
        console.warn("解析调色板缓存失败", error);
    }
}

function persistPaletteCache() {
    const maxEntries = 20;
    const entries = Array.from(paletteCache.entries()).slice(-maxEntries);
    try {
        safeSetLocalStorage(PALETTE_STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
        console.warn("保存调色板缓存失败", error);
    }
}

function preferHttpsUrl(url) {
    if (!url || typeof url !== "string") return url;
    try {
        const parsedUrl = new URL(url, window.location.href);
        if (parsedUrl.protocol === "http:" && window.location.protocol === "https:") {
            parsedUrl.protocol = "https:";
            return parsedUrl.toString();
        }
        return parsedUrl.toString();
    } catch (error) {
        if (window.location.protocol === "https:" && url.startsWith("http://")) {
            return "https://" + url.substring("http://".length);
        }
        return url;
    }
}

function buildAudioProxyUrl(url) {
    if (!url || typeof url !== "string") return url;
    try {
        const parsedUrl = new URL(url, window.location.href);
        if (parsedUrl.protocol === "https:") return parsedUrl.toString();
        if (parsedUrl.protocol === "http:" && /(^|\.)kuwo\.cn$/i.test(parsedUrl.hostname)) {
            return `${API.baseUrl}?target=${encodeURIComponent(parsedUrl.toString())}`;
        }
        return parsedUrl.toString();
    } catch (error) {
        console.warn("无法解析音频地址，跳过代理", error);
        return url;
    }
}

const SOURCE_OPTIONS = [
    { value: "netease", label: "网易云音乐" },
    { value: "kuwo", label: "酷我音乐" },
    { value: "joox", label: "JOOX音乐" }
];

function normalizeSource(value) {
    const allowed = SOURCE_OPTIONS.map(option => option.value);
    return allowed.includes(value) ? value : SOURCE_OPTIONS[0].value;
}

const QUALITY_OPTIONS = [
    { value: "128", label: "标准音质", description: "128 kbps" },
    { value: "192", label: "高品音质", description: "192 kbps" },
    { value: "320", label: "极高音质", description: "320 kbps" },
    { value: "999", label: "无损音质", description: "FLAC" }
];

function normalizeQuality(value) {
    const match = QUALITY_OPTIONS.find(option => option.value === value);
    return match ? match.value : "320";
}

const savedPlaylistSongs = (() => {
    const stored = safeGetLocalStorage("playlistSongs");
    const playlist = parseJSON(stored, []);
    return Array.isArray(playlist) ? playlist : [];
})();

const savedCurrentTrackIndex = (() => {
    const stored = safeGetLocalStorage("currentTrackIndex");
    const index = Number.parseInt(stored, 10);
    return Number.isInteger(index) ? index : -1;
})();

const savedPlayMode = (() => {
    const stored = safeGetLocalStorage("playMode");
    const modes = ["list", "single", "random"];
    return modes.includes(stored) ? stored : "list";
})();

const savedPlaybackQuality = normalizeQuality(safeGetLocalStorage("playbackQuality"));

const savedVolume = (() => {
    const stored = safeGetLocalStorage("playerVolume");
    const volume = Number.parseFloat(stored);
    if (Number.isFinite(volume)) {
        return Math.min(Math.max(volume, 0), 1);
    }
    return 0.8;
})();

const savedSearchSource = (() => {
    const stored = safeGetLocalStorage("searchSource");
    return normalizeSource(stored);
})();

const savedPlaybackTime = (() => {
    const stored = safeGetLocalStorage("currentPlaybackTime");
    const time = Number.parseFloat(stored);
    return Number.isFinite(time) && time >= 0 ? time : 0;
})();

const savedCurrentSong = (() => {
    const stored = safeGetLocalStorage("currentSong");
    return parseJSON(stored, null);
})();

const savedCurrentPlaylist = (() => {
    const stored = safeGetLocalStorage("currentPlaylist");
    const playlists = ["playlist", "online", "search"];
    return playlists.includes(stored) ? stored : "playlist";
})();

const API = {
    baseUrl: "/proxy",

    generateSignature: () => {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    },

    fetchJson: async (url) => {
        try {
            const response = await fetch(url, {
                headers: { "Accept": "application/json" },
            });
            if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch (parseError) {
                console.warn("JSON parse failed, returning raw text", parseError);
                return text;
            }
        } catch (error) {
            console.error("API request error:", error);
            throw error;
        }
    },

    search: async (keyword, source = "netease", count = 20, page = 1) => {
        const signature = API.generateSignature();
        const url = `${API.baseUrl}?types=search&source=${source}&name=${encodeURIComponent(keyword)}&count=${count}&pages=${page}&s=${signature}`;
        try {
            debugLog(`API请求: ${url}`);
            const data = await API.fetchJson(url);
            debugLog(`API响应: ${JSON.stringify(data).substring(0, 200)}...`);
            if (!Array.isArray(data)) throw new Error("搜索结果格式错误");
            return data.map(song => ({
                id: song.id,
                name: song.name,
                artist: song.artist,
                album: song.album,
                pic_id: song.pic_id,
                url_id: song.url_id,
                lyric_id: song.lyric_id,
                source: song.source,
            }));
        } catch (error) {
            debugLog(`API错误: ${error.message}`);
            throw error;
        }
    },

    getRadarPlaylist: async (playlistId = "3778678", options = {}) => {
        const signature = API.generateSignature();
        let limit = 50;
        let offset = 0;
        if (typeof options === "number") {
            limit = options;
        } else if (options && typeof options === "object") {
            if (Number.isFinite(options.limit)) limit = options.limit;
            else if (Number.isFinite(options.count)) limit = options.count;
            if (Number.isFinite(options.offset)) offset = options.offset;
        }
        limit = Math.max(1, Math.min(200, Math.trunc(limit) || 50));
        offset = Math.max(0, Math.trunc(offset) || 0);
        const params = new URLSearchParams({
            types: "playlist",
            id: playlistId,
            limit: String(limit),
            offset: String(offset),
            s: signature,
        });
        const url = `${API.baseUrl}?${params.toString()}`;
        try {
            const data = await API.fetchJson(url);
            const tracks = data && data.playlist && Array.isArray(data.playlist.tracks)
                ? data.playlist.tracks.slice(0, limit)
                : [];
            if (tracks.length === 0) throw new Error("No tracks found");
            return tracks.map(track => ({
                id: track.id,
                name: track.name,
                artist: Array.isArray(track.ar) ? track.ar.map(artist => artist.name).join(" / ") : "",
                source: "netease",
                lyric_id: track.id,
                pic_id: track.al?.pic_str || track.al?.pic || track.al?.picUrl || "",
            }));
        } catch (error) {
            console.error("API request failed:", error);
            throw error;
        }
    },

    getSongUrl: (song, quality = "320") => {
        const signature = API.generateSignature();
        return `${API.baseUrl}?types=url&id=${song.id}&source=${song.source || "netease"}&br=${quality}&s=${signature}`;
    },

    getLyric: (song) => {
        const signature = API.generateSignature();
        return `${API.baseUrl}?types=lyric&id=${song.lyric_id || song.id}&source=${song.source || "netease"}&s=${signature}`;
    },

    getPicUrl: (song) => {
        const signature = API.generateSignature();
        return `${API.baseUrl}?types=pic&id=${song.pic_id}&source=${song.source || "netease"}&size=300&s=${signature}`;
    }
};

Object.freeze(API);

const state = {
    onlineSongs: [],
    searchResults: [],
    renderedSearchCount: 0,
    currentTrackIndex: savedCurrentTrackIndex,
    currentAudioUrl: null,
    lyricsData: [],
    currentLyricLine: -1,
    currentPlaylist: savedCurrentPlaylist,
    searchPage: 1,
    searchKeyword: "",
    searchSource: savedSearchSource,
    hasMoreResults: true,
    currentSong: savedCurrentSong,
    debugMode: true,
    isSearchMode: false,
    playlistSongs: savedPlaylistSongs,
    playMode: savedPlayMode,
    playbackQuality: savedPlaybackQuality,
    volume: savedVolume,
    currentPlaybackTime: savedPlaybackTime,
    lastSavedPlaybackTime: savedPlaybackTime,
    pendingSeekTime: null,
    isSeeking: false,
    qualityMenuOpen: false,
    sourceMenuOpen: false,
    userScrolledLyrics: false,
    lyricsScrollTimeout: null,
    themeDefaultsCaptured: false,
    dynamicPalette: null,
    currentPaletteImage: null,
    pendingPaletteData: null,
    pendingPaletteImage: null,
    pendingPaletteImmediate: false,
    pendingPaletteReady: false,
    audioReadyForPalette: true,
    currentGradient: '',
    isMobileInlineLyricsOpen: false,
};

let sourceMenuPositionFrame = null;
let qualityMenuPositionFrame = null;
let floatingMenuListenersAttached = false;
let qualityMenuAnchor = null;

function runWithoutTransition(element, callback) {
    if (!element || typeof callback !== "function") return;
    const previousTransition = element.style.transition;
    element.style.transition = "none";
    callback();
    void element.offsetHeight;
    if (previousTransition) {
        element.style.transition = previousTransition;
    } else {
        element.style.removeProperty("transition");
    }
}

function cancelSourceMenuPositionUpdate() {
    if (sourceMenuPositionFrame !== null) {
        window.cancelAnimationFrame(sourceMenuPositionFrame);
        sourceMenuPositionFrame = null;
    }
}

function scheduleSourceMenuPositionUpdate() {
    if (!state.sourceMenuOpen) {
        cancelSourceMenuPositionUpdate();
        return;
    }
    if (sourceMenuPositionFrame !== null) return;
    sourceMenuPositionFrame = window.requestAnimationFrame(() => {
        sourceMenuPositionFrame = null;
        updateSourceMenuPosition();
    });
}

function cancelPlayerQualityMenuPositionUpdate() {
    if (qualityMenuPositionFrame !== null) {
        window.cancelAnimationFrame(qualityMenuPositionFrame);
        qualityMenuPositionFrame = null;
    }
}

function schedulePlayerQualityMenuPositionUpdate() {
    if (!state.qualityMenuOpen) {
        cancelPlayerQualityMenuPositionUpdate();
        return;
    }
    if (qualityMenuPositionFrame !== null) return;
    qualityMenuPositionFrame = window.requestAnimationFrame(() => {
        qualityMenuPositionFrame = null;
        updatePlayerQualityMenuPosition();
    });
}

function handleFloatingMenuResize() {
    if (state.sourceMenuOpen) scheduleSourceMenuPositionUpdate();
    if (state.qualityMenuOpen) schedulePlayerQualityMenuPositionUpdate();
}

function handleFloatingMenuScroll() {
    if (state.sourceMenuOpen) scheduleSourceMenuPositionUpdate();
    if (state.qualityMenuOpen) schedulePlayerQualityMenuPositionUpdate();
}

function ensureFloatingMenuListeners() {
    if (floatingMenuListenersAttached) return;
    window.addEventListener("resize", handleFloatingMenuResize);
    window.addEventListener("scroll", handleFloatingMenuScroll, { passive: true, capture: true });
    floatingMenuListenersAttached = true;
}

function releaseFloatingMenuListenersIfIdle() {
    if (state.sourceMenuOpen || state.qualityMenuOpen) return;
    if (!floatingMenuListenersAttached) return;
    window.removeEventListener("resize", handleFloatingMenuResize);
    window.removeEventListener("scroll", handleFloatingMenuScroll, true);
    floatingMenuListenersAttached = false;
}

state.currentGradient = getComputedStyle(document.documentElement)
    .getPropertyValue("--bg-gradient")
    .trim();

function setGlobalThemeProperty(name, value) {
    if (typeof name !== "string") return;
    document.documentElement.style.setProperty(name, value);
    if (document.body) document.body.style.setProperty(name, value);
}

function removeGlobalThemeProperty(name) {
    if (typeof name !== "string") return;
    document.documentElement.style.removeProperty(name);
    if (document.body) document.body.style.removeProperty(name);
}

if (state.currentGradient) {
    setGlobalThemeProperty("--bg-gradient-next", state.currentGradient);
}

function captureThemeDefaults() {
    if (state.themeDefaultsCaptured) return;
    const initialIsDark = document.body.classList.contains("dark-mode");
    document.body.classList.remove("dark-mode");
    const lightStyles = getComputedStyle(document.body);
    themeDefaults.light.gradient = lightStyles.getPropertyValue("--bg-gradient").trim();
    themeDefaults.light.primaryColor = lightStyles.getPropertyValue("--primary-color").trim();
    themeDefaults.light.primaryColorDark = lightStyles.getPropertyValue("--primary-color-dark").trim();
    document.body.classList.add("dark-mode");
    const darkStyles = getComputedStyle(document.body);
    themeDefaults.dark.gradient = darkStyles.getPropertyValue("--bg-gradient").trim();
    themeDefaults.dark.primaryColor = darkStyles.getPropertyValue("--primary-color").trim();
    themeDefaults.dark.primaryColorDark = darkStyles.getPropertyValue("--primary-color-dark").trim();
    if (!initialIsDark) document.body.classList.remove("dark-mode");
    state.themeDefaultsCaptured = true;
}

function applyThemeTokens(tokens) {
    if (!tokens) return;
    if (tokens.primaryColor) setGlobalThemeProperty("--primary-color", tokens.primaryColor);
    if (tokens.primaryColorDark) setGlobalThemeProperty("--primary-color-dark", tokens.primaryColorDark);
}

function setDocumentGradient(gradient, { immediate = false } = {}) {
    const normalized = (gradient || "").trim();
    const current = (state.currentGradient || "").trim();
    const shouldSkipTransition = immediate || normalized === current;
    if (!dom.backgroundTransitionLayer || !dom.backgroundBaseLayer) {
        if (normalized) {
            setGlobalThemeProperty("--bg-gradient", normalized);
            setGlobalThemeProperty("--bg-gradient-next", normalized);
        } else {
            removeGlobalThemeProperty("--bg-gradient");
            removeGlobalThemeProperty("--bg-gradient-next");
        }
        state.currentGradient = normalized;
        return;
    }
    window.clearTimeout(backgroundTransitionTimer);
    if (shouldSkipTransition) {
        if (normalized) {
            setGlobalThemeProperty("--bg-gradient", normalized);
            setGlobalThemeProperty("--bg-gradient-next", normalized);
        } else {
            removeGlobalThemeProperty("--bg-gradient");
            removeGlobalThemeProperty("--bg-gradient-next");
        }
        state.currentGradient = normalized;
        return;
    }
    setGlobalThemeProperty("--bg-gradient-next", normalized);
    backgroundTransitionTimer = setTimeout(() => {
        setGlobalThemeProperty("--bg-gradient", normalized);
        state.currentGradient = normalized;
    }, BACKGROUND_TRANSITION_DURATION);
}

function updateCurrentSongInfo(song, { loadArtwork = false } = {}) {
    if (!song) return;
    dom.currentSongTitle.textContent = song.name || "未知歌曲";
    dom.currentSongArtist.textContent = Array.isArray(song.artist) ? song.artist.join(" / ") : song.artist || "未知艺术家";
    if (loadArtwork) {
        const picUrl = API.getPicUrl(song);
        if (picUrl) {
            dom.albumCover.src = picUrl;
            dom.albumCover.onerror = () => showAlbumCoverPlaceholder();
        } else {
            showAlbumCoverPlaceholder();
        }
    }
    updateMobileToolbarTitle();
}

function showAlbumCoverPlaceholder() {
    dom.albumCover.src = "";
    dom.albumCover.alt = "无封面";
    dom.albumCover.style.background = "none";
}

function updateProgressBarBackground(current, max) {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    dom.progressBar.style.background = `linear-gradient(to right, var(--primary-color) ${percentage}%, var(--progress-bg) ${percentage}%)`;
}

function updatePlayPauseButton() {
    if (!dom.playPauseBtn) return;
    const isPlaying = !dom.audioPlayer.paused && !dom.audioPlayer.ended;
    dom.playPauseBtn.classList.toggle("playing", isPlaying);
    dom.playPauseBtn.setAttribute("aria-label", isPlaying ? "暂停" : "播放");
}

function setAudioCurrentTime(time) {
    if (!dom.audioPlayer) return;
    dom.audioPlayer.currentTime = time;
    state.currentPlaybackTime = time;
    state.lastSavedPlaybackTime = time;
    safeSetLocalStorage("currentPlaybackTime", time.toString());
    dom.currentTimeDisplay.textContent = formatTime(time);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function debugLog(...args) {
    if (state.debugMode) console.log("[Solara Debug]", ...args);
}

function attemptPaletteApplication() {
    if (!state.audioReadyForPalette || !state.pendingPaletteReady) return;
    const { pendingPaletteData, pendingPaletteImage, pendingPaletteImmediate } = state;
    if (pendingPaletteData && pendingPaletteImage) {
        applyThemeTokens(pendingPaletteData);
        setDocumentGradient(pendingPaletteData.gradient, { immediate: pendingPaletteImmediate });
        paletteCache.set(pendingPaletteImage, pendingPaletteData);
        persistPaletteCache();
        state.dynamicPalette = pendingPaletteData;
        state.currentPaletteImage = pendingPaletteImage;
    }
    state.pendingPaletteData = null;
    state.pendingPaletteImage = null;
    state.pendingPaletteReady = false;
    state.pendingPaletteImmediate = false;
}

function savePlayerState() {
    safeSetLocalStorage("playlistSongs", JSON.stringify(state.playlistSongs));
    safeSetLocalStorage("currentTrackIndex", state.currentTrackIndex.toString());
    safeSetLocalStorage("playMode", state.playMode);
    safeSetLocalStorage("playbackQuality", state.playbackQuality);
    safeSetLocalStorage("playerVolume", state.volume.toString());
    safeSetLocalStorage("searchSource", state.searchSource);
    safeSetLocalStorage("currentPlaylist", state.currentPlaylist);
    safeSetLocalStorage("currentSong", JSON.stringify(state.currentSong));
    safeSetLocalStorage("currentPlaybackTime", state.currentPlaybackTime.toString());
}

async function exploreOnlineMusic() {
    const btn = dom.loadOnlineBtn;
    const btnText = btn.querySelector(".btn-text");
    const loader = btn.querySelector(".loader");
    try {
        btn.disabled = true;
        btnText.style.display = "none";
        loader.style.display = "inline-block";
        const PLAYLIST_IDS = [
            "3778678", "3779629", "2884035", "19723756", "180106", "60198"
        ];
        const randomPlaylistId = PLAYLIST_IDS[Math.floor(Math.random() * PLAYLIST_IDS.length)];
        const randomOffset = Math.floor(Math.random() * 501);
        const songs = await API.getRadarPlaylist(randomPlaylistId, { limit: 50, offset: randomOffset });
        if (songs.length > 0) {
            const shuffledSongs = songs.sort(() => Math.random() - 0.5);
            state.playlistSongs = [...state.playlistSongs, ...shuffledSongs];
            state.onlineSongs = shuffledSongs;
            renderPlaylist();
            showNotification(`已加载 ${shuffledSongs.length} 首随机探索歌曲到播放列表`, "success");
            debugLog(`加载随机探索雷达成功: ${shuffledSongs.length} 首歌曲, 歌单ID: ${randomPlaylistId}, 偏移: ${randomOffset}`);
        } else {
            showNotification("未找到随机歌曲", "error");
            debugLog(`未找到歌曲: 歌单ID: ${randomPlaylistId}, 偏移: ${randomOffset}`);
        }
    } catch (error) {
        console.error("加载随机在线音乐失败:", error);
        showNotification("加载失败，请稍后重试", "error");
        debugLog(`加载失败: ${error.message}`);
    } finally {
        btn.disabled = false;
        btnText.style.display = "flex";
        loader.style.display = "none";
    }
}

async function playSong(song) {
    if (!song) return;
    try {
        const audioUrl = API.getSongUrl(song, state.playbackQuality);
        debugLog(`获取音频URL: ${audioUrl}`);
        const audioData = await API.fetchJson(audioUrl);
        if (!audioData || !audioData.url) throw new Error("无法获取音频地址");
        const proxiedAudioUrl = buildAudioProxyUrl(audioData.url);
        const preferredAudioUrl = preferHttpsUrl(audioData.url);
        const finalAudioUrl = proxiedAudioUrl || preferredAudioUrl || audioData.url;
        state.currentSong = song;
        state.currentAudioUrl = finalAudioUrl;
        dom.audioPlayer.src = finalAudioUrl;
        dom.audioPlayer.play().catch(error => {
            console.error("播放失败:", error);
            showNotification("播放失败，请检查网络连接", "error");
        });
        updateCurrentSongInfo(song, { loadArtwork: true });
        await loadLyrics(song);
        savePlayerState();
        updatePlayPauseButton();
        showNotification(`正在播放: ${song.name}`, "success");
        debugLog(`开始播放: ${song.name} @${state.playbackQuality}`);
    } catch (error) {
        console.error("播放失败:", error);
        showNotification("播放失败，请稍后重试", "error");
        debugLog(`播放失败: ${error.message}`);
        throw error;
    }
}

async function playSearchResult(index) {
    const song = state.searchResults[index];
    if (!song) return;
    try {
        hideSearchResults();
        dom.searchInput.value = "";
        if (isMobileView) closeMobileSearch();
        const existingIndex = state.playlistSongs.findIndex(s => s.id === song.id && s.source === song.source);
        if (existingIndex !== -1) {
            state.currentTrackIndex = existingIndex;
            state.currentPlaylist = "playlist";
        } else {
            state.playlistSongs.push(song);
            state.currentTrackIndex = state.playlistSongs.length - 1;
            state.currentPlaylist = "playlist";
        }
        renderPlaylist();
        await playSong(song);
        showNotification(`正在播放: ${song.name}`);
    } catch (error) {
        console.error("播放失败:", error);
        showNotification("播放失败，请稍后重试", "error");
    }
}

function renderPlaylist() {
    if (!dom.playlistItems) return;
    if (state.playlistSongs.length === 0) {
        dom.playlist.classList.add("empty");
        dom.playlistItems.innerHTML = "";
        savePlayerState();
        updatePlaylistHighlight();
        updateMobileClearPlaylistVisibility();
        return;
    }
    dom.playlist.classList.remove("empty");
    const playlistHtml = state.playlistSongs.map((song, index) =>
        `<div class="playlist-item" data-index="${index}" role="button" tabindex="0" aria-label="播放 ${song.name}">
            ${song.name} - ${Array.isArray(song.artist) ? song.artist.join(" / ") : song.artist}
            <button class="playlist-item-remove" type="button" data-playlist-action="remove" data-index="${index}" title="从播放列表移除">
                <i class="fas fa-times"></i>
            </button>
            <button class="playlist-item-download" type="button" data-playlist-action="download" data-index="${index}" title="下载">
                <i class="fas fa-download"></i>
            </button>
        </div>`
    ).join("");
    dom.playlistItems.innerHTML = playlistHtml;
    savePlayerState();
    updatePlaylistHighlight();
    updateMobileClearPlaylistVisibility();
}

function removeFromPlaylist(index) {
    if (index < 0 || index >= state.playlistSongs.length) return;
    const removingCurrent = state.currentPlaylist === "playlist" && state.currentTrackIndex === index;
    if (removingCurrent) {
        if (state.playlistSongs.length === 1) {
            dom.audioPlayer.pause();
            dom.audioPlayer.src = "";
            state.currentTrackIndex = -1;
            state.currentSong = null;
            state.currentAudioUrl = null;
            state.currentPlaybackTime = 0;
            state.lastSavedPlaybackTime = 0;
            dom.progressBar.value = 0;
            dom.progressBar.max = 0;
            dom.currentTimeDisplay.textContent = "00:00";
            dom.durationDisplay.textContent = "00:00";
            updateProgressBarBackground(0, 1);
            dom.currentSongTitle.textContent = "选择一首歌曲开始播放";
            updateMobileToolbarTitle();
            dom.currentSongArtist.textContent = "未知艺术家";
            showAlbumCoverPlaceholder();
            clearLyricsContent();
            if (dom.lyrics) dom.lyrics.dataset.placeholder = "default";
            dom.lyrics.classList.add("empty");
            updatePlayPauseButton();
        } else if (index === state.playlistSongs.length - 1) {
            state.currentTrackIndex = index - 1;
        }
    } else if (state.currentPlaylist === "playlist" && state.currentTrackIndex > index) {
        state.currentTrackIndex--;
    }
    state.playlistSongs.splice(index, 1);
    if (state.playlistSongs.length === 0) {
        dom.playlist.classList.add("empty");
        if (dom.playlistItems) dom.playlistItems.innerHTML = "";
        state.currentPlaylist = "playlist";
        updateMobileClearPlaylistVisibility();
    } else {
        if (state.currentPlaylist === "playlist" && state.currentTrackIndex < 0) {
            state.currentTrackIndex = 0;
        }
        renderPlaylist();
        if (removingCurrent && state.currentPlaylist === "playlist" && state.currentTrackIndex >= 0) {
            const targetIndex = Math.min(state.currentTrackIndex, state.playlistSongs.length - 1);
            state.currentTrackIndex = targetIndex;
            playPlaylistSong(targetIndex);
        } else {
            updatePlaylistHighlight();
        }
    }
    savePlayerState();
    showNotification("已从播放列表移除", "success");
}

function clearPlaylist() {
    if (state.playlistSongs.length === 0) return;
    if (state.currentPlaylist === "playlist") {
        dom.audioPlayer.pause();
        dom.audioPlayer.src = "";
        state.currentTrackIndex = -1;
        state.currentSong = null;
        state.currentAudioUrl = null;
        state.currentPlaybackTime = 0;
        state.lastSavedPlaybackTime = 0;
        dom.progressBar.value = 0;
        dom.progressBar.max = 0;
        dom.currentTimeDisplay.textContent = "00:00";
        dom.durationDisplay.textContent = "00:00";
        updateProgressBarBackground(0, 1);
        dom.currentSongTitle.textContent = "选择一首歌曲开始播放";
        updateMobileToolbarTitle();
        dom.currentSongArtist.textContent = "未知艺术家";
        showAlbumCoverPlaceholder();
        clearLyricsContent();
        if (dom.lyrics) dom.lyrics.dataset.placeholder = "default";
        dom.lyrics.classList.add("empty");
        updatePlayPauseButton();
    }
    state.playlistSongs = [];
    dom.playlist.classList.add("empty");
    if (dom.playlistItems) dom.playlistItems.innerHTML = "";
    state.currentPlaylist = "playlist";
    updateMobileClearPlaylistVisibility();
    savePlayerState();
    showNotification("播放列表已清空", "success");
}

async function playPlaylistSong(index) {
    if (index < 0 || index >= state.playlistSongs.length) return;
    const song = state.playlistSongs[index];
    state.currentTrackIndex = index;
    state.currentPlaylist = "playlist";
    try {
        await playSong(song);
        updatePlaylistHighlight();
        if (isMobileView) closeMobilePanel();
    } catch (error) {
        console.error("播放失败:", error);
        showNotification("播放失败，请稍后重试", "error");
    }
}

function updatePlaylistHighlight() {
    if (!dom.playlistItems) return;
    const playlistItems = dom.playlistItems.querySelectorAll(".playlist-item");
    playlistItems.forEach((item, index) => {
        const isCurrent = state.currentPlaylist === "playlist" && index === state.currentTrackIndex;
        item.classList.toggle("current", isCurrent);
        item.setAttribute("aria-current", isCurrent ? "true" : "false");
        item.setAttribute("aria-pressed", isCurrent ? "true" : "false");
    });
}

function autoPlayNext() {
    if (state.playMode === "single") {
        dom.audioPlayer.currentTime = 0;
        dom.audioPlayer.play();
        return;
    }
    playNext();
    updatePlayPauseButton();
}

function playNext() {
    let nextIndex = -1;
    let playlist = [];
    if (state.currentPlaylist === "playlist") {
        playlist = state.playlistSongs;
    } else if (state.currentPlaylist === "online") {
        playlist = state.onlineSongs;
    } else if (state.currentPlaylist === "search") {
        playlist = state.searchResults;
    }
    if (playlist.length === 0) return;
    if (state.playMode === "random") {
        nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
        nextIndex = (state.currentTrackIndex + 1) % playlist.length;
    }
    state.currentTrackIndex = nextIndex;
    if (state.currentPlaylist === "playlist") {
        playPlaylistSong(nextIndex);
    } else if (state.currentPlaylist === "online") {
        playOnlineSong(nextIndex);
    } else if (state.currentPlaylist === "search") {
        playSearchResult(nextIndex);
    }
}

function playPrevious() {
    let prevIndex = -1;
    let playlist = [];
    if (state.currentPlaylist === "playlist") {
        playlist = state.playlistSongs;
    } else if (state.currentPlaylist === "online") {
        playlist = state.onlineSongs;
    } else if (state.currentPlaylist === "search") {
        playlist = state.searchResults;
    }
    if (playlist.length === 0) return;
    if (state.playMode === "random") {
        prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
        prevIndex = state.currentTrackIndex - 1;
        if (prevIndex < 0) prevIndex = playlist.length - 1;
    }
    state.currentTrackIndex = prevIndex;
    if (state.currentPlaylist === "playlist") {
        playPlaylistSong(prevIndex);
    } else if (state.currentPlaylist === "online") {
        playOnlineSong(prevIndex);
    } else if (state.currentPlaylist === "search") {
        playSearchResult(prevIndex);
    }
}

async function playOnlineSong(index) {
    const song = state.onlineSongs[index];
    if (!song) return;
    state.currentTrackIndex = index;
    state.currentPlaylist = "online";
    try {
        await playSong(song);
        updateOnlineHighlight();
    } catch (error) {
        console.error("播放失败:", error);
        showNotification("播放失败，请稍后重试", "error");
    }
}

function updateOnlineHighlight() {
    if (!dom.playlistItems) return;
    const playlistItems = dom.playlistItems.querySelectorAll(".playlist-item");
    playlistItems.forEach((item, index) => {
        if (state.currentPlaylist === "online" && index === state.currentTrackIndex) {
            item.classList.add("current");
        } else {
            item.classList.remove("current");
        }
    });
}

async function loadLyrics(song) {
    try {
        const lyricUrl = API.getLyric(song);
        debugLog(`获取歌词URL: ${lyricUrl}`);
        const lyricData = await API.fetchJson(lyricUrl);
        if (lyricData && lyricData.lyric) {
            parseLyrics(lyricData.lyric);
            dom.lyrics.classList.remove("empty");
            dom.lyrics.dataset.placeholder = "default";
        } else {
            setLyricsContentHtml("<div>暂无歌词</div>");
            dom.lyrics.classList.add("empty");
            dom.lyrics.dataset.placeholder = "message";
            state.lyricsData = [];
            state.currentLyricLine = -1;
        }
    } catch (error) {
        console.error("加载歌词失败:", error);
        setLyricsContentHtml("<div>歌词加载失败</div>");
        dom.lyrics.classList.add("empty");
        dom.lyrics.dataset.placeholder = "message";
        state.lyricsData = [];
        state.currentLyricLine = -1;
    }
}

function parseLyrics(lyricText) {
    const lines = lyricText.split('\n');
    const lyrics = [];
    lines.forEach(line => {
        const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const milliseconds = parseInt(match[3].padEnd(3, '0'));
            const time = minutes * 60 + seconds + milliseconds / 1000;
            const text = match[4].trim();
            if (text) lyrics.push({ time, text });
        }
    });
    state.lyricsData = lyrics.sort((a, b) => a.time - b.time);
    displayLyrics();
}

function setLyricsContentHtml(html) {
    if (dom.lyricsContent) dom.lyricsContent.innerHTML = html;
    if (dom.mobileInlineLyricsContent) dom.mobileInlineLyricsContent.innerHTML = html;
}

function clearLyricsContent() {
    setLyricsContentHtml("");
    state.lyricsData = [];
    state.currentLyricLine = -1;
    if (isMobileView) closeMobileInlineLyrics({ force: true });
}

function displayLyrics() {
    const lyricsHtml = state.lyricsData.map((lyric, index) =>
        `<div data-time="${lyric.time}" data-index="${index}">${lyric.text}</div>`
    ).join("");
    setLyricsContentHtml(lyricsHtml);
    if (dom.lyrics) dom.lyrics.dataset.placeholder = "default";
    if (state.isMobileInlineLyricsOpen) syncLyrics();
}

function syncLyrics() {
    if (state.lyricsData.length === 0) return;
    const currentTime = dom.audioPlayer.currentTime;
    let currentIndex = -1;
    for (let i = 0; i < state.lyricsData.length; i++) {
        if (currentTime >= state.lyricsData[i].time) {
            currentIndex = i;
        } else {
            break;
        }
    }
    if (currentIndex !== state.currentLyricLine) {
        state.currentLyricLine = currentIndex;
        const lyricTargets = [];
        if (dom.lyricsContent) {
            lyricTargets.push({
                elements: dom.lyricsContent.querySelectorAll("div[data-index]"),
                container: dom.lyricsScroll || dom.lyrics,
            });
        }
        if (dom.mobileInlineLyricsContent) {
            lyricTargets.push({
                elements: dom.mobileInlineLyricsContent.querySelectorAll("div[data-index]"),
                container: dom.mobileInlineLyricsScroll || dom.mobileInlineLyrics,
                inline: true,
            });
        }
        lyricTargets.forEach(({ elements, container, inline }) => {
            elements.forEach((element, index) => {
                if (index === currentIndex) {
                    element.classList.add("current");
                    const shouldScroll = !state.userScrolledLyrics && (!inline || state.isMobileInlineLyricsOpen);
                    if (shouldScroll) scrollToCurrentLyric(element, container);
                } else {
                    element.classList.remove("current");
                }
            });
        });
    }
}

function scrollToCurrentLyric(element, containerOverride) {
    const container = containerOverride || dom.lyricsScroll || dom.lyrics;
    if (!container || !element) return;
    const containerHeight = container.clientHeight;
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const elementOffsetTop = elementRect.top - containerRect.top + container.scrollTop;
    const elementHeight = elementRect.height;
    const targetScrollTop = elementOffsetTop - (containerHeight / 2) + (elementHeight / 2);
    const maxScrollTop = container.scrollHeight - containerHeight;
    const finalScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));
    if (Math.abs(container.scrollTop - finalScrollTop) > 1) {
        if (typeof container.scrollTo === "function") {
            container.scrollTo({ top: finalScrollTop, behavior: 'smooth' });
        } else {
            container.scrollTop = finalScrollTop;
        }
    }
    debugLog(`歌词滚动: 元素在容器内偏移=${elementOffsetTop}, 容器高度=${containerHeight}, 目标滚动=${finalScrollTop}`);
}

async function downloadSong(song, quality = "320") {
    try {
        showNotification("正在准备下载...");
        const audioUrl = API.getSongUrl(song, quality);
        const audioData = await API.fetchJson(audioUrl);
        if (audioData && audioData.url) {
            const proxiedAudioUrl = buildAudioProxyUrl(audioData.url);
            const preferredAudioUrl = preferHttpsUrl(audioData.url);
            const downloadUrl = proxiedAudioUrl || preferredAudioUrl || audioData.url;
            const link = document.createElement("a");
            link.href = downloadUrl;
            const preferredExtension = quality === "999" ? "flac" : quality === "740" ? "ape" : "mp3";
            const fileExtension = (() => {
                try {
                    const url = new URL(audioData.url);
                    const pathname = url.pathname || "";
                    const match = pathname.match(/\.([a-z0-9]+)$/i);
                    if (match) return match[1];
                } catch (error) {
                    console.warn("无法从下载链接中解析扩展名:", error);
                }
                return preferredExtension;
            })();
            link.download = `${song.name} - ${Array.isArray(song.artist) ? song.artist.join(" / ") : song.artist}.${fileExtension}`;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showNotification("下载已开始", "success");
        } else {
            throw new Error("无法获取下载地址");
        }
    } catch (error) {
        console.error("下载失败:", error);
        showNotification("下载失败，请稍后重试", "error");
    }
}

function switchMobileView(view) {
    if (view === "playlist") {
        if (dom.showPlaylistBtn) dom.showPlaylistBtn.classList.add("active");
        if (dom.showLyricsBtn) dom.showLyricsBtn.classList.remove("active");
        dom.playlist.classList.add("active");
        dom.lyrics.classList.remove("active");
    } else if (view === "lyrics") {
        if (dom.showLyricsBtn) dom.showLyricsBtn.classList.add("active");
        if (dom.showPlaylistBtn) dom.showPlaylistBtn.classList.remove("active");
        dom.lyrics.classList.add("active");
        dom.playlist.classList.remove("active");
    }
    if (isMobileView && document.body) {
        document.body.setAttribute("data-mobile-panel-view", view);
        if (dom.mobilePanelTitle) {
            dom.mobilePanelTitle.textContent = view === "lyrics" ? "歌词" : "播放列表";
        }
        updateMobileClearPlaylistVisibility();
    }
}

function showNotification(message, type = "success") {
    const notification = dom.notification;
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add("show");
    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}

function hideSearchResults() {
    if (dom.searchResults) {
        dom.searchResults.innerHTML = "";
        state.searchResults = [];
        state.renderedSearchCount = 0;
        state.hasMoreResults = true;
        state.searchPage = 1;
        state.isSearchMode = false;
    }
}

function updateSourceMenuPosition() {
    if (!state.sourceMenuOpen || !dom.sourceMenu || !dom.sourceSelectButton) return;
    const buttonRect = dom.sourceSelectButton.getBoundingClientRect();
    const menu = dom.sourceMenu;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const menuHeight = menu.offsetHeight;
    const menuWidth = menu.offsetWidth;
    let top = buttonRect.bottom + window.scrollY;
    let left = buttonRect.left + window.scrollX;
    if (top + menuHeight > viewportHeight + window.scrollY) {
        top = buttonRect.top + window.scrollY - menuHeight;
    }
    if (left + menuWidth > viewportWidth + window.scrollX) {
        left = viewportWidth + window.scrollX - menuWidth;
    }
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.style.width = `${buttonRect.width}px`;
    debugLog(`源菜单定位: top=${top}, left=${left}, width=${buttonRect.width}`);
}

function updatePlayerQualityMenuPosition() {
    if (!state.qualityMenuOpen || !dom.playerQualityMenu || !qualityMenuAnchor) return;
    const buttonRect = qualityMenuAnchor.getBoundingClientRect();
    const menu = dom.playerQualityMenu;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const menuHeight = menu.offsetHeight;
    const menuWidth = menu.offsetWidth;
    let top = buttonRect.bottom + window.scrollY;
    let left = buttonRect.left + window.scrollX;
    if (top + menuHeight > viewportHeight + window.scrollY) {
        top = buttonRect.top + window.scrollY - menuHeight;
    }
    if (left + menuWidth > viewportWidth + window.scrollX) {
        left = viewportWidth + window.scrollX - menuWidth;
    }
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.style.width = `${buttonRect.width}px`;
    debugLog(`音质菜单定位: top=${top}, left=${left}, width=${buttonRect.width}`);
}

function toggleSourceMenu() {
    state.sourceMenuOpen = !state.sourceMenuOpen;
    if (dom.sourceMenu) {
        dom.sourceMenu.classList.toggle("open", state.sourceMenuOpen);
        if (state.sourceMenuOpen) {
            scheduleSourceMenuPositionUpdate();
            ensureFloatingMenuListeners();
        } else {
            cancelSourceMenuPositionUpdate();
            releaseFloatingMenuListenersIfIdle();
        }
    }
    debugLog(`源菜单状态: ${state.sourceMenuOpen ? "打开" : "关闭"}`);
}

function toggleQualityMenu(anchor) {
    state.qualityMenuOpen = !state.qualityMenuOpen;
    qualityMenuAnchor = anchor || dom.qualityToggle || dom.mobileQualityToggle;
    if (dom.playerQualityMenu) {
        dom.playerQualityMenu.classList.toggle("open", state.qualityMenuOpen);
        if (state.qualityMenuOpen) {
            schedulePlayerQualityMenuPositionUpdate();
            ensureFloatingMenuListeners();
        } else {
            cancelPlayerQualityMenuPositionUpdate();
            releaseFloatingMenuListenersIfIdle();
        }
    }
    debugLog(`音质菜单状态: ${state.qualityMenuOpen ? "打开" : "关闭"}`);
}

function handleClickOutside(event) {
    if (state.sourceMenuOpen && dom.sourceMenu && !dom.sourceMenu.contains(event.target) && !dom.sourceSelectButton.contains(event.target)) {
        toggleSourceMenu();
    }
    if (state.qualityMenuOpen && dom.playerQualityMenu && !dom.playerQualityMenu.contains(event.target) && !qualityMenuAnchor.contains(event.target)) {
        toggleQualityMenu(null);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (dom.loadOnlineBtn) {
        dom.loadOnlineBtn.addEventListener("click", exploreOnlineMusic);
    }
    if (dom.searchBtn && dom.searchInput) {
        dom.searchBtn.addEventListener("click", async () => {
            const keyword = dom.searchInput.value.trim();
            if (!keyword) {
                showNotification("请输入搜索关键词", "error");
                return;
            }
            try {
                state.isSearchMode = true;
                state.searchKeyword = keyword;
                state.searchPage = 1;
                const results = await API.search(keyword, state.searchSource, 20, state.searchPage);
                state.searchResults = results;
                state.renderedSearchCount = results.length;
                state.hasMoreResults = results.length === 20;
                if (dom.searchResults) {
                    dom.searchResults.innerHTML = results.map((song, index) =>
                        `<div class="search-result-item" data-index="${index}">
                            ${song.name} - ${Array.isArray(song.artist) ? song.artist.join(" / ") : song.artist}
                            <button data-action="play" data-index="${index}" title="播放">
                                <i class="fas fa-play"></i>
                            </button>
                            <button data-action="add" data-index="${index}" title="添加到播放列表">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button data-action="download" data-index="${index}" title="下载">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>`
                    ).join("");
                }
                showNotification(`找到 ${results.length} 首歌曲`);
            } catch (error) {
                console.error("搜索失败:", error);
                showNotification("搜索失败，请稍后重试", "error");
            }
        });
    }
    if (dom.sourceSelectButton && dom.sourceMenu) {
        dom.sourceSelectButton.addEventListener("click", toggleSourceMenu);
        dom.sourceMenu.addEventListener("click", (event) => {
            debugLog("源菜单点击:", event.target);
            const target = event.target.closest("[data-source]");
            if (!target) return;
            const source = target.dataset.source;
            debugLog("选择源:", source);
            if (SOURCE_OPTIONS.some(opt => opt.value === source)) {
                state.searchSource = source;
                safeSetLocalStorage("searchSource", source);
                const sourceOption = SOURCE_OPTIONS.find(opt => opt.value === source);
                if (dom.sourceSelectLabel) {
                    dom.sourceSelectLabel.textContent = sourceOption ? sourceOption.label : "未知源";
                }
                toggleSourceMenu();
                showNotification(`搜索源已切换为: ${sourceOption.label}`);
            }
        });
    }
    if (dom.qualityToggle) {
        dom.qualityToggle.addEventListener("click", () => toggleQualityMenu(dom.qualityToggle));
    }
    if (dom.mobileQualityToggle) {
        dom.mobileQualityToggle.addEventListener("click", () => toggleQualityMenu(dom.mobileQualityToggle));
    }
    if (dom.playerQualityMenu) {
        dom.playerQualityMenu.addEventListener("click", (event) => {
            const target = event.target.closest("[data-quality]");
            if (!target) return;
            const quality = target.dataset.quality;
            if (QUALITY_OPTIONS.some(opt => opt.value === quality)) {
                state.playbackQuality = quality;
                safeSetLocalStorage("playbackQuality", quality);
                const qualityOption = QUALITY_OPTIONS.find(opt => opt.value === quality);
                if (dom.qualityLabel) dom.qualityLabel.textContent = qualityOption.label;
                if (dom.mobileQualityLabel) dom.mobileQualityLabel.textContent = qualityOption.label;
                toggleQualityMenu(null);
                showNotification(`音质已切换为: ${qualityOption.label}`);
                if (state.currentSong && state.currentAudioUrl) {
                    const currentTime = dom.audioPlayer.currentTime;
                    playSong(state.currentSong).then(() => {
                        setAudioCurrentTime(currentTime);
                    });
                }
            }
        });
    }
    if (dom.playlistItems) {
        dom.playlistItems.addEventListener("click", (event) => {
            const target = event.target.closest("[data-playlist-action]");
            if (!target) {
                const item = event.target.closest(".playlist-item");
                if (item) {
                    const index = parseInt(item.dataset.index, 10);
                    playPlaylistSong(index);
                }
                return;
            }
            const index = parseInt(target.dataset.index, 10);
            const action = target.dataset.playlistAction;
            if (action === "remove") {
                removeFromPlaylist(index);
            } else if (action === "download") {
                const song = state.playlistSongs[index];
                if (song) downloadSong(song, state.playbackQuality);
            }
        });
    }
    if (dom.searchResults) {
        dom.searchResults.addEventListener("click", (event) => {
            const target = event.target.closest("[data-action]");
            if (!target) return;
            const index = parseInt(target.dataset.index, 10);
            const action = target.dataset.action;
            if (action === "play") {
                playSearchResult(index);
            } else if (action === "add") {
                const song = state.searchResults[index];
                if (song && !state.playlistSongs.some(s => s.id === song.id && s.source === song.source)) {
                    state.playlistSongs.push(song);
                    renderPlaylist();
                    showNotification("已添加到播放列表", "success");
                } else {
                    showNotification("歌曲已在播放列表中", "info");
                }
            } else if (action === "download") {
                const song = state.searchResults[index];
                if (song) downloadSong(song, state.playbackQuality);
            }
        });
    }
    if (dom.playPauseBtn) {
        dom.playPauseBtn.addEventListener("click", () => {
            if (dom.audioPlayer.paused) {
                dom.audioPlayer.play().catch(error => {
                    console.error("播放失败:", error);
                    showNotification("播放失败，请检查网络连接", "error");
                });
            } else {
                dom.audioPlayer.pause();
            }
            updatePlayPauseButton();
        });
    }
    if (dom.volumeSlider) {
        dom.volumeSlider.addEventListener("input", () => {
            state.volume = dom.volumeSlider.value;
            dom.audioPlayer.volume = state.volume;
            safeSetLocalStorage("playerVolume", state.volume.toString());
        });
    }
    if (dom.playModeBtn) {
        dom.playModeBtn.addEventListener("click", () => {
            const modes = ["list", "single", "random"];
            const currentIndex = modes.indexOf(state.playMode);
            state.playMode = modes[(currentIndex + 1) % modes.length];
            safeSetLocalStorage("playMode", state.playMode);
            dom.playModeBtn.setAttribute("data-mode", state.playMode);
            showNotification(`播放模式: ${state.playMode === "list" ? "列表循环" : state.playMode === "single" ? "单曲循环" : "随机播放"}`);
        });
    }
    if (dom.progressBar) {
        dom.progressBar.addEventListener("input", () => {
            const time = parseFloat(dom.progressBar.value);
            setAudioCurrentTime(time);
            state.isSeeking = true;
        });
        dom.progressBar.addEventListener("change", () => {
            state.isSeeking = false;
        });
    }
    if (dom.audioPlayer) {
        dom.audioPlayer.addEventListener("timeupdate", () => {
            if (!state.isSeeking) {
                state.currentPlaybackTime = dom.audioPlayer.currentTime;
                dom.progressBar.value = state.currentPlaybackTime;
                dom.currentTimeDisplay.textContent = formatTime(state.currentPlaybackTime);
                syncLyrics();
                if (Math.abs(state.currentPlaybackTime - state.lastSavedPlaybackTime) > 5) {
                    state.lastSavedPlaybackTime = state.currentPlaybackTime;
                    safeSetLocalStorage("currentPlaybackTime", state.currentPlaybackTime.toString());
                }
            }
        });
        dom.audioPlayer.addEventListener("durationchange", () => {
            dom.progressBar.max = dom.audioPlayer.duration || 0;
            dom.durationDisplay.textContent = formatTime(dom.audioPlayer.duration || 0);
        });
        dom.audioPlayer.addEventListener("ended", () => {
            autoPlayNext();
        });
    }
    if (dom.mobileSearchToggle) {
        dom.mobileSearchToggle.addEventListener("click", toggleMobileSearch);
    }
    if (dom.mobileQueueToggle) {
        dom.mobileQueueToggle.addEventListener("click", () => toggleMobilePanel("playlist"));
    }
    if (dom.showLyricsBtn) {
        dom.showLyricsBtn.addEventListener("click", () => switchMobileView("lyrics"));
    }
    if (dom.showPlaylistBtn) {
        dom.showPlaylistBtn.addEventListener("click", () => switchMobileView("playlist"));
    }
    if (dom.mobilePanelClose) {
        dom.mobilePanelClose.addEventListener("click", closeMobilePanel);
    }
    if (dom.mobileClearPlaylistBtn) {
        dom.mobileClearPlaylistBtn.addEventListener("click", clearPlaylist);
    }
    document.addEventListener("click", handleClickOutside);
    if (state.currentSong && state.currentAudioUrl) {
        updateCurrentSongInfo(state.currentSong, { loadArtwork: true });
        dom.audioPlayer.src = state.currentAudioUrl;
        setAudioCurrentTime(state.currentPlaybackTime);
    }
    renderPlaylist();
    updatePlayPauseButton();
    updateMobileClearPlaylistVisibility();
    captureThemeDefaults();
    debugLog("初始化完成");
});
