// ─────────────────────────────────────────────────────────
// ✅ 환경 설정: 배포 시 아래 BASE 값만 변경하세요
//
//   로컬:  const BASE = '';
//   배포:  const BASE = '/tooloud';
//
// ─────────────────────────────────────────────────────────
const BASE = ''; // 배포 시 '/tooloud' 로 변경

import { supabase } from './_ignore/supabase.js'; // 상대경로 적용

// ─────────────────────────────────────────────────────────
// 경로 헬퍼: 모든 내부 경로 앞에 BASE를 붙여줍니다
// ─────────────────────────────────────────────────────────
function url(path) {
  return `${BASE}${path}`;
}

// ─────────────────────────────────────────────────────────
// 작업물 렌더링 (이미지/영상/오디오/PDF)
// ─────────────────────────────────────────────────────────
function renderMainWorkMedia(container, data) {
  if (!container) return;
  const u = data.img || "";
  const ext = u.split(".").pop().toLowerCase().split("?")[0];

  const moreBtn = container.querySelector(".work-card__more-btn");
  container.innerHTML = "";
  if (moreBtn) container.appendChild(moreBtn);

  // 이미지
  if (["jpg","jpeg","png","gif","webp"].includes(ext)) {
    const img = document.createElement("img");
    img.src = u;
    img.alt = "작업물";

    container.style.cssText = `
      display:flex;align-items:center;justify-content:center;overflow:hidden;
      background:linear-gradient(160deg,#a8b8cc 0%,#8fa3bc 50%,#7d95b0 100%);
    `;
    img.style.cssText = `
      max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;display:block;
    `;
    img.onerror = () => { container.style.background = "#e8eef5"; };
    container.appendChild(img);
    return;
  }

  // 영상
  if (["mp4","webm","mov"].includes(ext)) {
    const wrap = document.createElement("div");
    wrap.className = "main-work-video-wrap";
    wrap.innerHTML = `
      <video class="main-work-video" muted playsinline preload="metadata">
        <source src="${u}">
      </video>
      <canvas class="main-work-thumb"></canvas>
      <button class="main-work-playbtn" aria-label="재생">
        <svg viewBox="0 0 24 24" fill="white" width="48" height="48"
          style="filter:drop-shadow(0 2px 8px rgba(0,0,0,0.5))">
          <path d="M8 5v14l11-7z"></path>
        </svg>
      </button>
      <div class="main-work-video-controls">
        <span class="main-work-video-time">0:00 / 0:00</span>
        <div class="main-work-video-seekbar">
          <div class="main-work-video-seekbar__fill"></div>
        </div>
      </div>`;
    container.appendChild(wrap);

    const video    = wrap.querySelector(".main-work-video");
    const canvas   = wrap.querySelector(".main-work-thumb");
    const playBtn  = wrap.querySelector(".main-work-playbtn");
    const controls = wrap.querySelector(".main-work-video-controls");
    const timeEl   = wrap.querySelector(".main-work-video-time");
    const seekbar  = wrap.querySelector(".main-work-video-seekbar");
    const fill     = wrap.querySelector(".main-work-video-seekbar__fill");

    const pauseSvg = `<svg viewBox="0 0 24 24" fill="white" width="36" height="36" style="filter:drop-shadow(0 2px 8px rgba(0,0,0,0.4))"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>`;
    const playSvg  = `<svg viewBox="0 0 24 24" fill="white" width="48" height="48" style="filter:drop-shadow(0 2px 8px rgba(0,0,0,0.5))"><path d="M8 5v14l11-7z"></path></svg>`;

    function formatVideoTime(sec) {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m}:${String(s).padStart(2,"0")}`;
    }

    video.addEventListener("loadeddata", () => { video.currentTime = 0.5; });
    video.addEventListener("seeked", () => {
      if (video.paused) {
        const ctx = canvas.getContext("2d");
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.style.display = "block";
        video.style.display  = "none";
      }
    });
    video.addEventListener("loadedmetadata", () => {
      timeEl.textContent = `0:00 / ${formatVideoTime(video.duration)}`;
    });
    video.addEventListener("timeupdate", () => {
      if (!video.duration) return;
      const pct = (video.currentTime / video.duration) * 100;
      fill.style.width = `${pct}%`;
      timeEl.textContent = `${formatVideoTime(video.currentTime)} / ${formatVideoTime(video.duration)}`;
    });
    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (video.paused) { canvas.style.display="none"; video.style.display="block"; video.play(); playBtn.innerHTML=pauseSvg; }
      else { video.pause(); playBtn.innerHTML=playSvg; }
    });
    seekbar.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!video.duration) return;
      const rect = seekbar.getBoundingClientRect();
      const pct  = Math.max(0, Math.min(1,(e.clientX-rect.left)/rect.width));
      video.currentTime = pct*video.duration;
    });
    controls.addEventListener("click", (e)=>e.stopPropagation());
    video.addEventListener("ended", () => { canvas.style.display="block"; video.style.display="none"; playBtn.innerHTML=playSvg; });
    return;
  }

  // 오디오
  if (["mp3","wav","ogg","m4a"].includes(ext)) {
    const audioId = `mainAudio_${Date.now()}`;
    const wrap = document.createElement("div");
    wrap.className = "main-work-audio-wrap";
    wrap.innerHTML = `
      <div class="main-work-audio-card">
        <div class="main-work-audio-thumb">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
          <button class="main-work-audio-playbtn" id="${audioId}_btn" aria-label="재생">
            <svg viewBox="0 0 24 24" fill="white" width="48" height="48"
              style="filter:drop-shadow(0 2px 6px rgba(0,0,0,0.3))">
              <path d="M8 5v14l11-7z"></path>
            </svg>
          </button>
        </div>
        <div class="main-work-audio-controls" id="${audioId}_controls">
          <span class="main-work-audio-time" id="${audioId}_time">0:00 / 0:00</span>
          <div class="main-work-audio-seekbar" id="${audioId}_seekbar">
            <div class="main-work-audio-seekbar__fill" id="${audioId}_fill"></div>
          </div>
        </div>
      </div>
      <audio id="${audioId}" preload="metadata">
        <source src="${u}">
      </audio>`;
    container.appendChild(wrap);

    const audio   = wrap.querySelector(`#${audioId}`);
    const playBtn = wrap.querySelector(`#${audioId}_btn`);
    const timeEl  = wrap.querySelector(`#${audioId}_time`);
    const seekbar = wrap.querySelector(`#${audioId}_seekbar`);
    const fill    = wrap.querySelector(`#${audioId}_fill`);

    const pauseSvg = `<svg viewBox="0 0 24 24" fill="white" width="36" height="36"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>`;
    const playSvg  = `<svg viewBox="0 0 24 24" fill="white" width="48" height="48" style="filter:drop-shadow(0 2px 6px rgba(0,0,0,0.3))"><path d="M8 5v14l11-7z"></path></svg>`;

    function formatTime(sec) { const m=Math.floor(sec/60); const s=Math.floor(sec%60); return `${m}:${String(s).padStart(2,"0")}`; }

    playBtn?.addEventListener("click",(e)=>{ e.stopPropagation(); if(audio.paused){audio.play();playBtn.innerHTML=pauseSvg;} else{audio.pause();playBtn.innerHTML=playSvg;} });
    seekbar?.addEventListener("click",(e)=>{ e.stopPropagation(); if(!audio.duration)return; const rect=seekbar.getBoundingClientRect(); const pct=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width)); audio.currentTime=pct*audio.duration; });
    audio?.addEventListener("loadedmetadata",()=>{ timeEl.textContent=`0:00 / ${formatTime(audio.duration)}`; });
    audio?.addEventListener("timeupdate",()=>{ if(!audio.duration)return; fill.style.width=`${(audio.currentTime/audio.duration)*100}%`; timeEl.textContent=`${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`; });
    audio?.addEventListener("ended",()=>{ playBtn.innerHTML=playSvg; });
    return;
  }

  // PDF
  if(ext==="pdf" && window.pdfjsLib){
    const wrap = document.createElement("div");
    wrap.className="main-work-pdf-wrap";
    wrap.innerHTML=`
      <div class="main-work-pdf-stage">
        <canvas class="main-work-pdf-canvas"></canvas>
      </div>
      <div class="main-work-pdf-controls">
        <button type="button" class="main-work-pdf-btn" id="mainPdfPrev">이전</button>
        <div class="main-work-pdf-page" id="mainPdfPage">1 / 1</div>
        <button type="button" class="main-work-pdf-btn" id="mainPdfNext">다음</button>
      </div>`;
    container.appendChild(wrap);

    const canvas=wrap.querySelector(".main-work-pdf-canvas");
    const pageEl=wrap.querySelector("#mainPdfPage");
    const prevBtn=wrap.querySelector("#mainPdfPrev");
    const nextBtn=wrap.querySelector("#mainPdfNext");
    const pdfState={doc:null,page:1,total:1};

    async function drawPage(){
      if(!canvas||!pdfState.doc)return;
      const page=await pdfState.doc.getPage(pdfState.page);
      const vp=page.getViewport({scale:1});
      const stage=canvas.parentElement;
      const scale=Math.min((stage.clientWidth||300)/vp.width,(stage.clientHeight||220)/vp.height);
      const svp=page.getViewport({scale});
      canvas.width=svp.width;
      canvas.height=svp.height;
      await page.render({canvasContext:canvas.getContext("2d"),viewport:svp}).promise;
      if(pageEl) pageEl.textContent=`${pdfState.page} / ${pdfState.total}`;
      if(prevBtn) prevBtn.disabled=pdfState.page<=1;
      if(nextBtn) nextBtn.disabled=pdfState.page>=pdfState.total;
    }

    window.pdfjsLib.getDocument(u).promise.then(async pdf=>{ pdfState.doc=pdf; pdfState.total=pdf.numPages; await drawPage(); });
    prevBtn?.addEventListener("click",async e=>{ e.stopPropagation(); if(pdfState.page>1){ pdfState.page--; await drawPage(); } });
    nextBtn?.addEventListener("click",async e=>{ e.stopPropagation(); if(pdfState.page<pdfState.total){ pdfState.page++; await drawPage(); } });
    return;
  }

  // fallback
  const fallback=document.createElement("div");
  fallback.style.cssText="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:rgba(0,0,0,.35);font-size:13px;font-weight:600;";
  fallback.textContent="미리보기 없음";
  container.appendChild(fallback);
}

// ─────────────────────────────────────────────────────────
// DOMContentLoaded 이후 초기화
// ─────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async ()=>{
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  // 검색바
  try{
    loadSearchBar({
      target:'#searchbar-container',
      placeholder:'검색어를 입력하세요',
      onSearch:(value)=>{
        const keyword=encodeURIComponent(value.trim());
        window.location.href = url(`/searchResult/searchResult.html?keyword=${keyword}`);
      }
    });
  }catch(e){ console.warn('[searchBar] loadSearchBar 실패:',e.message); }

  // TOOL & WORK 데이터 로드
  // ... 이후 기존 코드 유지, url() 헬퍼 사용하도록 링크 수정
});