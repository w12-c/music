// audio.js - 音乐播放器核心功能
var musicData = [
    {
        id: 1,
        title: "青花瓷",
        author: "周杰伦",
        duration: "03:59",
        src: "mp3/周杰伦 - 青花瓷.mp3",
        cover: "img/2.jpg"
    },
    {
        id: 2,
        title: "晴天",
        author: "周杰伦",
        duration: "04:29",
        src: "mp3/周杰伦 - 晴天.mp3",
        cover: "img/2.jpg"
    },
    {
        id: 3,
        title: "富士山下",
        author: "陈奕迅",
        duration: "04:18",
        src: "mp3/富士山下 - 陈奕迅.mp3",
        cover: "img/2.jpg"
    },
    {
        id: 4,
        title: "可惜没如果",
        author: "林俊杰",
        duration: "04:58",
        src: "mp3/可惜没如果 - 林俊杰.mp3",
        cover: "img/3.jpg"
    },
    {
        id: 5,
        title: "多远都要在一起",
        author: "邓紫棋",
        duration: "03:37",
        src: "mp3/G.E.M. 邓紫棋 - 多远都要在一起.mp3",
        cover: "img/3.jpg"
    }
];

// 当前播放索引
var currentMusicIndex = 0;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initPlayer();
});

// 初始化播放器
function initPlayer() {
    // 获取DOM元素
    var audio = document.getElementById('audioTag');
    var musicTitle = document.getElementById('music-title');
    var recordImg = document.getElementById('record-img');
    var author = document.getElementById('author-name');
    var progress = document.getElementById('progress');
    var progressTotal = document.getElementById('progress-total');
    var playedTime = document.getElementById('playedTime');
    var audioTime = document.getElementById('audioTime');
    var pauseBtn = document.getElementById('pause');
    var playIcon = document.getElementById('play-icon');
    var prevBtn = document.getElementById('prev-btn');
    var nextBtn = document.getElementById('next-btn');
    var closeList = document.getElementById('close-list');
    var musicList = document.getElementById('music-list');
    
    
    // 检查音频文件是否存在
    checkAudioFiles();
    
    // 加载第一首音乐
    loadMusic(currentMusicIndex);
    
    // 生成音乐列表
    renderMusicList();
    
    // 设置音频事件监听
    setupAudioEvents();
    
    // 设置按钮事件
    setupButtonEvents();
    
    // 播放/暂停功能
    pauseBtn.addEventListener('click', function() {
        if (audio.paused) {
            playMusic();
        } else {
            pauseMusic();
        }
    });
    
    // 上一首
    prevBtn.addEventListener('click', function() {
        var prevIndex = (currentMusicIndex - 1 + musicData.length) % musicData.length;
        loadMusic(prevIndex);
        playMusic();
    });
    
    // 下一首
    nextBtn.addEventListener('click', function() {
        var nextIndex = (currentMusicIndex + 1) % musicData.length;
        loadMusic(nextIndex);
        playMusic();
    });
    
    // 点击进度条跳转
    progressTotal.addEventListener('click', function(e) {
        var rect = this.getBoundingClientRect();
        var clickPosition = e.clientX - rect.left;
        var totalWidth = rect.width;
        var percent = clickPosition / totalWidth;
        
        if (audio.duration) {
            audio.currentTime = percent * audio.duration;
            progress.style.width = percent * 100 + '%';
            playedTime.textContent = transTime(audio.currentTime);
        }
    });
    
    // 关闭/打开播放列表
    closeList.addEventListener('click', function() {
        musicList.classList.toggle('collapsed');
        var icon = closeList.querySelector('i');
        if (musicList.classList.contains('collapsed')) {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        } else {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        }
    });
    
    // 加载音乐
    function loadMusic(index) {
        if (index < 0 || index >= musicData.length) return;
        
        var music = musicData[index];
        currentMusicIndex = index;
        
        // 更新UI
        musicTitle.textContent = music.title;
        author.textContent = music.author;
        recordImg.src = music.cover;
        audioTime.textContent = music.duration;
        
        // 设置音频源
        audio.src = music.src;
        
        // 更新列表激活状态
        updateActiveMusicItem();
        
        // 重置播放时间
        playedTime.textContent = "00:00";
        progress.style.width = "0%";
    }
    
    // 渲染音乐列表
    function renderMusicList() {
        musicList.innerHTML = '';
        
        if (musicData.length === 0) {
            musicList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-music"></i>
                    <p>暂无音乐，请添加音乐文件</p>
                </div>
            `;
            return;
        }
        
        musicData.forEach(function(music, index) {
            var li = document.createElement('li');
            li.className = 'music-item';
            if (index === currentMusicIndex) {
                li.classList.add('active');
            }
            
            li.innerHTML = `
                <div class="song-info">
                    <div class="song-title">${music.title}</div>
                    <div class="song-author">${music.author}</div>
                </div>
                <div class="song-duration">${music.duration}</div>
            `;
            
            // 点击列表项切换音乐
            li.addEventListener('click', function() {
                loadMusic(index);
                playMusic();
            });
            
            musicList.appendChild(li);
        });
    }
    
    // 更新激活的音乐项
    function updateActiveMusicItem() {
        var items = document.querySelectorAll('.music-item');
        items.forEach(function(item, index) {
            if (index === currentMusicIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // 播放音乐
    function playMusic() {
        audio.play()
            .then(function() {
                rotateRecord();
                updatePlayButton(true);
            })
            .catch(function(error) {
                console.error("播放失败:", error);
                showError("无法播放音频，请检查音频文件路径");
            });
    }
    
    // 暂停音乐
    function pauseMusic() {
        audio.pause();
        rotateRecordStop();
        updatePlayButton(false);
    }
    
    // 旋转唱片（播放状态）
    function rotateRecord() {
        recordImg.classList.add('playing');
    }
    
    // 停止唱片旋转（暂停状态）
    function rotateRecordStop() {
        recordImg.classList.remove('playing');
    }
    
    // 更新播放按钮状态
    function updatePlayButton(isPlaying) {
        if (isPlaying) {
            playIcon.classList.remove('fa-play');
            playIcon.classList.add('fa-pause');
            pauseBtn.classList.add('playing');
        } else {
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
            pauseBtn.classList.remove('playing');
        }
    }
    
    // 设置音频事件
    function setupAudioEvents() {
        // 音频加载完成
        audio.addEventListener('loadedmetadata', function() {
            audioTime.textContent = transTime(audio.duration);
        });
        
        // 更新进度条
        audio.addEventListener('timeupdate', function() {
            if (audio.duration) {
                var value = audio.currentTime / audio.duration;
                progress.style.width = value * 100 + '%';
                
                // 更新时间显示
                playedTime.textContent = transTime(audio.currentTime);
            }
        });
        
        // 音频播放结束
        audio.addEventListener('ended', function() {
            var nextIndex = (currentMusicIndex + 1) % musicData.length;
            loadMusic(nextIndex);
            playMusic();
        });
        
        // 音频错误处理
        audio.addEventListener('error', function(e) {
            console.error("音频加载错误:", e);
            showError("音频加载失败，请检查文件路径");
        });
    }
    
    // 设置按钮事件
    function setupButtonEvents() {
        // 上一首按钮
        prevBtn.addEventListener('click', function() {
            var prevIndex = (currentMusicIndex - 1 + musicData.length) % musicData.length;
            loadMusic(prevIndex);
            playMusic();
        });
        
        // 下一首按钮
        nextBtn.addEventListener('click', function() {
            var nextIndex = (currentMusicIndex + 1) % musicData.length;
            loadMusic(nextIndex);
            playMusic();
        });
    }
    
    // 时间转换函数
    function transTime(value) {
        var time = "";
        var h = parseInt(value / 3600);
        value %= 3600;
        var m = parseInt(value / 60);
        var s = parseInt(value % 60);
        
        if (h > 0) {
            time = formatTime(h) + ":" + formatTime(m) + ":" + formatTime(s);
        } else {
            time = formatTime(m) + ":" + formatTime(s);
        }
        
        return time;
    }
    
    // 格式化时间（补零）
    function formatTime(time) {
        return time < 10 ? "0" + time : time.toString();
    }
    
    // 显示错误信息
    function showError(message) {
        // 移除现有的错误信息
        var existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // 创建错误信息元素
        var errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        // 插入到播放器顶部
        var audioContainer = document.querySelector('.audio-container');
        audioContainer.insertBefore(errorDiv, audioContainer.firstChild);
        
        // 3秒后自动移除
        setTimeout(function() {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }
    
    // 检查音频文件是否存在
    function checkAudioFiles() {
        // 这里可以添加音频文件存在性检查逻辑
        console.log("音乐播放器初始化完成，共" + musicData.length + "首歌曲");
    }
}
