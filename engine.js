(function(root){
'use strict';
const FLAGS={urgent:'目前有自傷計畫／急迫危險或急性精神症狀',mania:'疑似躁期：睡得少卻精力旺盛、話多或衝動',unstable:'急性呼吸困難或身體狀況不穩定',sleepy:'明顯白天嗜睡／曾開車打瞌睡',snore:'大聲打鼾',apnea:'被目擊呼吸暫停／夜間嗆醒',htn:'高血壓',rls:'晚間休息時腿部難受想動，活動後緩解',rhythm:'輪班或自由作息時睡得正常、固定時間卻睡不著',pain:'疼痛、搔癢、夜尿或胃食道逆流',mood:'憂鬱、焦慮或創傷相關症狀',bipolar:'雙相情緒障礙病史',epilepsy:'癲癇未穩定控制',pregnant:'懷孕、備孕或哺乳',falls:'跌倒、步態不穩或認知障礙',renal:'CKD／透析',hepatic:'肝功能不全',opioid:'使用 opioid 或其他中樞抑制劑',alcohol:'酒精／藥物使用問題',bzd:'長期使用 BZD／Z-drug',complex:'曾服 Z-drug 後夢遊、夢駕或其他複雜睡眠行為',narcolepsy:'猝睡症',retention:'嚴重尿滯留',glaucoma:'未治療的狹角型青光眼',interact:'使用 CYP3A 抑制／誘導劑或 MAOI',medical:'藥物可能干擾睡眠（類固醇、刺激劑等）'};
const has=(p,k)=>(p.flags||[]).includes(k);
function isi(v){if(v===''||v==null)return '尚未填寫';v=Number(v);return v<=7?'0–7：無明顯失眠嚴重度':v<=14?'8–14：閾下失眠':v<=21?'15–21：中度失眠':'22–28：重度失眠';}
function assess(p){
 const missing=[];for(const [k,n]of Object.entries({age:'年齡',months:'持續月數',nights:'每週夜數',pattern:'主要困擾',opportunity:'睡眠機會',impact:'白天影響',preference:'治療偏好',cbti:'CBT-I 經驗'}))if(p[k]===''||p[k]==null)missing.push(n);
 if(p.reviewed!==true)missing.push('風險項目確認');
 if(missing.length)return {error:'請完成：'+missing.join('、')};
 if(!Number.isInteger(+p.age)||+p.age<0||+p.age>120||!Number.isFinite(+p.months)||+p.months<0||+p.months>1200||!Number.isInteger(+p.nights)||+p.nights<0||+p.nights>7)return {error:'請檢查年齡、月數與每週夜數的有效範圍。'};
 if(p.isi!==''&&p.isi!=null&&(!Number.isInteger(+p.isi)||+p.isi<0||+p.isi>28))return {error:'ISI 必須為 0–28 的整數。'};
 const enums={pattern:['onset','maintenance','early','mixed','none'],opportunity:['yes','no','unknown'],impact:['yes','no'],preference:['cbti','both','medication','unsure'],cbti:['none','partial','adequate']};
 for(const [k,values]of Object.entries(enums))if(!values.includes(p[k]))return {error:'選單值無效，請重新選擇。'};
 if(!Array.isArray(p.flags)||p.flags.some(k=>!(k in FLAGS)))return {error:'風險資料格式無效。'};
 const stop=['snore','sleepy','apnea','htn'].filter(k=>has(p,k)).length;
 const osa=stop>=2||has(p,'apnea');
 const urgent=['urgent','mania','unstable'].filter(k=>has(p,k));
 const adult=+p.age>=18;
 const criteria=[['有入睡、維持睡眠困難或過早醒來',p.pattern!=='none'],['每週至少 3 夜',+p.nights>=3],['持續至少 3 個月',+p.months>=3],['已有足夠睡眠機會與合適環境',p.opportunity==='yes'],['造成白天功能受損或明顯困擾',p.impact==='yes']];
 const core=criteria.every(x=>x[1]);
 let title,tone;
 if(!adult){title='未滿 18 歲：轉兒童青少年專科流程';tone='warn';}
 else if(urgent.length){title='先處理急迫風險，暫停一般失眠治療流程';tone='danger';}
 else if(p.opportunity==='no'){title='先改善睡眠機會／環境，避免直接判定慢性失眠';tone='warn';}
 else if(core){title='符合慢性失眠核心條件，仍需臨床鑑別與確認';tone='good';}
 else if(p.pattern==='none'||+p.nights===0){title='目前資料未支持失眠障礙';tone='warn';}
 else if(+p.months<3){title='可能為短期失眠，尚未達慢性病程';tone='warn';}
 else{title='尚未符合全部慢性失眠核心條件';tone='warn';}
 const differentials=[];
 if(osa)differentials.push(['睡眠呼吸中止風險','安排睡眠專科評估，視情況選 PSG／HSAT。合併明顯失眠、心肺疾病或 opioid 使用時，檢查方式需由醫師判斷。失眠與 OSA 可共存。']);
 if(has(p,'rls'))differentials.push(['不寧腿症候群線索','確認休息時出現、夜間加重、活動緩解及排除模仿疾病；由醫師評估鐵狀態與腎臟病。勿直接加安眠藥。']);
 if(has(p,'rhythm'))differentials.push(['晝夜節律／輪班相關問題','比較工作日及休假日作息；安排日誌，必要時節律評估。光照與褪黑激素時機應依節律診斷個別規劃。']);
 if(has(p,'pain'))differentials.push(['身體症狀干擾睡眠','同步處理疼痛、尿量與夜尿、搔癢或逆流；合併失眠仍可接受適當的 CBT-I。']);
 if(has(p,'mood'))differentials.push(['精神共病','評估憂鬱、焦慮與創傷症狀；共病與失眠可並行治療，需確認有無躁期。']);
 if(has(p,'medical'))differentials.push(['藥物／物質誘發','核對藥名、劑量與服藥時間，以及咖啡因、尼古丁；由原處方醫師評估調整。']);
 const blocked=!adult||urgent.length>0;
 const adapt=osa||['sleepy','bipolar','epilepsy','pregnant','falls','alcohol'].some(k=>has(p,k));
 const medCaution=['pregnant','hepatic','opioid','alcohol','interact','renal','falls'].filter(k=>has(p,k));
 const drugs=[
 {name:'低劑量 doxepin',fit:p.pattern==='maintenance'||p.pattern==='early'||p.pattern==='mixed',role:'以睡眠維持困難、過早醒來為主時，可與醫師討論。',info:'失眠低劑量製劑與抗憂鬱劑量不同；不可自行以高劑量製劑替代。注意隔日鎮靜。',avoid:['retention','glaucoma'],ref:'doxepin'},
 {name:'雙重食慾素受體拮抗劑（DORA）',fit:p.pattern!=='none',role:'入睡或睡眠維持困難可討論；例如 lemborexant、suvorexant、daridorexant。',info:'注意隔日嗜睡、睡眠癱瘓與 CYP3A 交互作用；猝睡症禁用。各藥的呼吸、肝功能及交互作用限制不同。',avoid:['narcolepsy'],ref:'dayvigo'},
 {name:'非 BZD 受體作用藥（Z-drug）',fit:p.pattern==='onset'||p.pattern==='mixed',role:'若需短期藥物，可依入睡／維持型症狀討論合適製劑；例如 zolpidem、eszopiclone、zaleplon。',info:'注意複雜睡眠行為、跌倒、依賴與隔日駕駛影響；不可自行疊加鎮靜藥。',avoid:['complex'],ref:'fda'}
 ].map(d=>({...d,excluded:d.avoid.filter(k=>has(p,k)),hold:blocked||osa||has(p,'sleepy')||medCaution.length>0}));
 return {title,tone,criteria,core,adult,urgent,stop,osa,blocked,adapt,differentials,drugs,medCaution,eligible:adult&&!urgent.length&&core};
}
function timeMin(t){if(!/^\d{2}:\d{2}$/.test(t||''))return NaN;const [h,m]=t.split(':').map(Number);return h<24&&m<60?h*60+m:NaN;}
function night(r){const b=timeMin(r.bed),u=timeMin(r.up);if(!Number.isFinite(b)||!Number.isFinite(u)||b===u)return {error:'請填寫不同的準備入睡時間與最終離床時間。'};const tib=(u-b+1440)%1440;if(tib<120||tib>960)return {error:'睡眠時段需介於 2–16 小時；日誌以主要睡眠時段計。'};for(const k of ['sol','waso','ema','nap'])if(r[k]===''||!Number.isFinite(+r[k])||+r[k]<0||+r[k]>960)return {error:'清醒與午睡分鐘不可空白、為負值或超過 960。'};const awake=+r.sol+(+r.waso)+(+r.ema);if(awake>=tib)return {error:'清醒分鐘總和必須小於躺床時段。'};if(r.quality===''||r.quality==null||!Number.isInteger(+r.quality)||+r.quality<0||+r.quality>4)return {error:'請選擇白天功能 0–4 分。'};return {tib,tst:tib-awake,se:(tib-awake)/tib*100};}
function summary(rows){if(!rows.length)return null;const vals=rows.map(night);if(vals.some(v=>v.error))return null;const sum=k=>vals.reduce((s,v)=>s+v[k],0);return {n:rows.length,tib:sum('tib')/rows.length,tst:sum('tst')/rows.length,se:sum('tst')/sum('tib')*100,sol:rows.reduce((s,r)=>s+(+r.sol),0)/rows.length,waso:rows.reduce((s,r)=>s+(+r.waso),0)/rows.length,quality:rows.reduce((s,r)=>s+(+r.quality),0)/rows.length};}
function hhmm(m){m=(Math.round(m)%1440+1440)%1440;return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;}
function windowPlan(p,rows,wake){const a=assess(p);if(a.error||!a.eligible)return {error:'先完成成人慢性失眠評估並排除急迫風險。'};if(a.adapt)return {error:'有需調整 CBT-I 的共病或嗜睡風險；由治療師訂睡眠時段，本工具不計算限床時間。'};const sorted=[...rows].sort((a,b)=>a.date.localeCompare(b.date));const week=sorted.slice(-7);if(week.length<7)return {error:'至少需要 7 個不同日期的睡眠日誌。'};const gap=(Date.parse(week[6].date)-Date.parse(week[0].date))/86400000;if(gap!==6)return {error:'請提供最近連續 7 日資料，避免以零散日誌計算睡眠時段。'};const s=summary(week);if(!s)return {error:'日誌內容不完整。'};if(s.tst<300)return {error:'平均睡眠少於 5 小時，請由治療師進行評估，不自動縮短睡眠機會。'};const w=timeMin(wake);if(!Number.isFinite(w))return {error:'請選擇固定起床時間。'};const mins=Math.max(360,Math.min(540,Math.ceil(s.tst/15)*15));return {mins,bed:hhmm(w-mins),wake:hhmm(w),summary:s};}
function followup(base,r){const score=+r.isi,delta=+base-score;const out={delta,remission:score<8,response:delta>=8,review:[]};if(r.adverse!=='none')out.review.push('先評估不良反應，勿依分數改善直接延續原治療。');if(r.adverse==='complex')out.review.push('若與 Z-drug 相關，停止該藥並立即聯絡處方醫師；之後避免該類藥物。');if(r.adverse==='severe')out.review.push('嚴重嗜睡、跌倒或呼吸問題需即時醫療評估，避免駕駛。');if(r.function==='worse'||r.function==='same')out.review.push('白天功能未改善：重新檢視共病、睡眠機會與治療負擔。');if(delta<0)out.review.push('ISI 惡化：重新評估壓力、用藥、躁期、OSA 與依從性。');if(+r.weeks>=6&&!out.response&&!out.remission)out.review.push('療程 6–8 週仍未達反應：確認 CBT-I 是否足量、落實度與診斷，轉睡眠／身心專科。');if(out.remission)out.review.push('分數達緩解門檻，仍須確認日間功能與無不良反應；規劃復發預防。');else if(out.response)out.review.push('達常用療效反應門檻，可持續完成療程並定期複評。');else out.review.push('尚未達常用療效反應門檻；依療程長度與臨床情況追蹤，不直接加藥。');return out;}
function validateImport(s){if(!s||s.version!==1||!s.profile||!Array.isArray(s.diary)||!Array.isArray(s.followups)||s.diary.length>4000||s.followups.length>1000)throw Error('備份格式不符或資料筆數過多。');const p=s.profile;const allowed=['age','months','nights','pattern','opportunity','impact','isi','preference','cbti','reviewed','flags'];if(Object.keys(p).some(k=>!allowed.includes(k))||!Array.isArray(p.flags)||p.flags.some(k=>!(k in FLAGS)))throw Error('評估欄位格式不符。');if(assess(p).error)throw Error('評估資料不完整或數值無效。');if(s.followups.length&&(p.isi===''||p.isi==null))throw Error('追蹤資料缺少 ISI 基線。');const dates=new Set();for(const d of s.diary){if(!validDate(d.date)||dates.has(d.date)||night(d).error)throw Error('睡眠日誌日期重複或數值無效。');dates.add(d.date);}for(const f of s.followups)if(!validDate(f.date)||!Number.isInteger(+f.isi)||+f.isi<0||+f.isi>28||!['none','mild','complex','severe'].includes(f.adverse)||!['better','same','worse'].includes(f.function)||!Number.isInteger(+f.weeks)||+f.weeks<0||+f.weeks>520||!Number.isInteger(+f.adherence)||+f.adherence<0||+f.adherence>7)throw Error('追蹤資料格式不符。');return {version:1,profile:p,diary:s.diary,followups:s.followups};}
function validDate(d){return /^\d{4}-\d{2}-\d{2}$/.test(d||'')&&!isNaN(Date.parse(d))&&new Date(d+'T12:00:00Z').toISOString().slice(0,10)===d;}
const api={FLAGS,assess,isi,night,summary,windowPlan,followup,hhmm,validateImport,validDate};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Insomnia=api;
})(typeof window!=='undefined'?window:globalThis);
