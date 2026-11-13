(function(root){
'use strict';
// 虛構教學病例、測驗題庫與複習心智圖。不含真實病人資料。
const standard={age:'45',months:'8',nights:'5',pattern:'onset',opportunity:'yes',impact:'yes',isi:'20',preference:'cbti',cbti:'none',reviewed:true,flags:[]};
function shift(today,n){const d=new Date(today+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
function week(today,base,vary){return Array.from({length:7},(_,i)=>({date:shift(today,i-6),bed:base.bed,up:base.up,sol:vary.sol[i],waso:vary.waso[i],ema:vary.ema?vary.ema[i]:15,nap:vary.nap?vary.nap[i]:0,quality:vary.quality?vary.quality[i]:2}));}
const make=(profile,extra={})=>({version:1,profile:{...standard,...profile,flags:profile.flags||[]},diary:extra.diary||[],followups:extra.followups||[]});
const cases=[
 {title:'入睡困難與睡眠焦慮',tag:'典型',summary:'45 歲，8 個月、每週 5 夜；機會足夠，ISI 20，無特殊風險。含 7 日日誌及改善的追蹤紀錄。',points:['五項核心條件全部符合 → 進入完整 CBT-I','7 日連續日誌可產生睡眠時段討論草案','追蹤 ISI 20 → 10：下降 10 分達「反應」但未達「緩解」（<8）'],expect:'符合慢性失眠核心條件',
  build:t=>make({},{diary:week(t,{bed:'23:00',up:'07:00'},{sol:[50,45,60,35,40,30,35],waso:[35,30,40,25,20,25,20]}),followups:[{date:t,weeks:6,isi:10,adherence:6,function:'better',adverse:'none'}]})},
 {title:'夜間醒來，合併疑似 OSA',tag:'鑑別',summary:'68 歲，打鼾、目擊呼吸中止、高血壓及嗜睡。先評估 OSA，調整 CBT-I，不自動開立鎮靜藥。',points:['STOP 4/4 → 安排睡眠專科與 PSG／HSAT','失眠與 OSA 可共存（COMISA）','嗜睡 + 疑似 OSA：不自動計算限床、鎮靜藥先做安全審查'],expect:'符合慢性失眠核心條件',
  build:()=>make({age:'68',pattern:'maintenance',flags:['snore','apnea','htn','sleepy']})},
 {title:'睡得少但精力旺盛',tag:'急迫',summary:'32 歲，近期睡很少仍精力充沛、話多且衝動。走急迫精神評估分支，不當作一般失眠。',points:['睡眠需求下降 ≠ 失眠：無白天疲倦反而精力旺盛','躁期線索優先轉精神科急評','不提供限床或安眠藥選項'],expect:'先處理急迫風險',
  build:()=>make({age:'32',months:'.5',isi:'16',flags:['mania','bipolar']})},
 {title:'輪班與睡眠機會不足',tag:'鑑別',summary:'39 歲，夜班與家庭安排使睡眠時間不足；休假可正常睡。先釐清節律與睡眠機會。',points:['機會不足是「睡眠剝奪」而非失眠障礙','限床對睡眠不足者有害','輪班型節律問題需依節律診斷處理光照與時機'],expect:'先改善睡眠機會',
  build:()=>make({age:'39',opportunity:'no',flags:['rhythm']})},
 {title:'透析、腿部不適與長期安眠藥',tag:'共病',summary:'66 歲，睡眠維持困難，透析、不寧腿線索、跌倒風險與長期 BZD。先處理共病、核對藥物並安排個別減藥。',points:['CKD／透析常合併 RLS、搔癢與 OSA','RLS 先查鐵狀態，勿直接加安眠藥','長期 BZD 不可突然停用 → 個別化減藥'],expect:'符合慢性失眠核心條件',
  build:()=>make({age:'66',pattern:'maintenance',flags:['renal','rls','falls','bzd']})},
 {title:'Z-drug 後曾夢遊',tag:'用藥安全',summary:'51 歲，混合型失眠，曾在服藥後未完全清醒活動且事後失憶。排除 Z-drug 類，優先完整 CBT-I。',points:['曾發生複雜睡眠行為 → Z-drug 禁用（FDA／TFDA）','DORA 或低劑量 doxepin 仍需個別審查','CBT-I 為核心，不因藥物受限而延後'],expect:'符合慢性失眠核心條件',
  build:()=>make({age:'51',pattern:'mixed',flags:['complex']})},
 {title:'孕期睡眠維持困難',tag:'特殊族群',summary:'31 歲，懷孕 24 週，5 個月來每週 5 夜半夜醒來難再睡，ISI 17。夜尿與胃食道逆流加重。',points:['懷孕：CBT-I 為首選，藥物一律先做安全審查','本工具不自動計算限床時段，交由治療師調整','同步處理夜尿、逆流等身體症狀；評估孕期 RLS 與打鼾'],expect:'符合慢性失眠核心條件',
  build:()=>make({age:'31',months:'5',pattern:'maintenance',isi:'17',preference:'cbti',flags:['pregnant','pain']})},
 {title:'年長者早醒合併憂鬱與跌倒',tag:'特殊族群',summary:'74 歲，凌晨 4 點醒來無法再睡已 1 年，情緒低落、興趣減少；去年跌倒兩次。ISI 18。',points:['早醒型可討論低劑量 doxepin，但跌倒史需安全審查','憂鬱與失眠可並行治療；評估自殺風險與躁期史','刺激控制夜間下床需改採安全做法'],expect:'符合慢性失眠核心條件',
  build:()=>make({age:'74',months:'12',nights:'6',pattern:'early',isi:'18',preference:'unsure',flags:['mood','falls']})},
 {title:'喪親後 6 週入睡困難',tag:'短期',summary:'42 歲，父親過世後 6 週，每週 4 夜難以入睡，白天疲倦。過去睡眠正常。ISI 15。',points:['病程 <3 個月 → 短期失眠，非慢性失眠障礙','處理壓力源、維持合理睡眠機會、記錄日誌','2–4 週複評；若持續 ≥3 個月再評估慢性失眠'],expect:'可能為短期失眠',
  build:()=>make({age:'42',months:'1.5',nights:'4',pattern:'onset',isi:'15',preference:'unsure',flags:['mood']})},
 {title:'晚睡晚起的年輕人',tag:'鑑別',summary:'23 歲研究生，平日 23:00 上床常到 02:30 才睡著；週末 03:00 睡到 11:00 則睡得很好。ISI 16。',points:['自由作息時睡得正常 → 懷疑延遲睡眠相位（DSWPD）','需日誌（含週末）比較；光照與褪黑激素依節律時機','單純限床或安眠藥無法解決節律錯位'],expect:'符合慢性失眠核心條件',
  build:()=>make({age:'23',months:'18',nights:'5',pattern:'onset',isi:'16',flags:['rhythm']})},
 {title:'慢性疼痛使用 opioid、已完成 CBT-I',tag:'複雜',summary:'58 歲，腰椎術後慢性疼痛使用 opioid，已完成 8 週 CBT-I 仍每週 5 夜混合型失眠，ISI 19，希望討論合併藥物。',points:['opioid ＋ 鎮靜藥：呼吸抑制風險，先做用藥安全審查','已完成足量 CBT-I 仍困擾 → 再鑑別 OSA（opioid 可致中樞型）並轉睡眠專科','疼痛控制與失眠需同步處理'],expect:'符合慢性失眠核心條件',
  build:()=>make({age:'58',months:'24',pattern:'mixed',isi:'19',preference:'both',cbti:'adequate',flags:['pain','opioid']})},
 {title:'CBT-I 第 8 週仍未達反應',tag:'追蹤',summary:'49 歲，混合型失眠，ISI 基線 21。三次追蹤分數僅降至 15，每週僅執行策略 3 天，白天功能持平。',points:['ISI 下降 6 分（<8）→ 未達反應','先查落實度（3 天／週）、日誌完整性與 CBT-I 是否足量','重新鑑別 OSA、節律、情緒與藥物；不以分數直接加藥'],expect:'符合慢性失眠核心條件',
  build:t=>make({age:'49',months:'14',nights:'6',pattern:'mixed',isi:'21',flags:[]},{diary:week(t,{bed:'22:30',up:'07:00'},{sol:[60,70,45,80,55,65,50],waso:[60,45,70,50,65,40,55],ema:[30,25,40,20,35,30,25],quality:[1,2,1,2,1,2,2]}),followups:[{date:shift(t,-42),weeks:2,isi:19,adherence:3,function:'same',adverse:'none'},{date:shift(t,-28),weeks:4,isi:17,adherence:4,function:'same',adverse:'none'},{date:t,weeks:8,isi:15,adherence:3,function:'same',adverse:'none'}]})}
];
// level：基礎／進階／高階。answer 為 options 原始索引；畫面會打亂選項順序。
const quiz=[
 {level:'基礎',q:'成人慢性失眠障礙的病程與頻率門檻為何？',options:['每週至少 3 夜、持續至少 3 個月','每週至少 1 夜、持續至少 1 個月','每週至少 5 夜、持續至少 6 個月','只要 ISI ≥15 即可'],answer:0,explain:'核心條件：夜間睡眠困難、每週 ≥3 夜、病程 ≥3 個月、足夠睡眠機會，以及白天功能受損或困擾。',ref:'va'},
 {level:'基礎',q:'關於 ISI（失眠嚴重度指數），下列何者正確？',options:['可量化嚴重度與追蹤療效，但不能單獨診斷','總分 ≥15 即可確診慢性失眠','七項各 0–3 分，總分 0–21','分數越低代表失眠越嚴重'],answer:0,explain:'ISI 七項各 0–4 分、總分 0–28，分數越高越嚴重；用於嚴重度與追蹤，診斷仍需臨床訪談。',ref:'isi'},
 {level:'基礎',q:'ISI 總分 18 分屬於哪一級？',options:['中度失眠（15–21）','閾下失眠（8–14）','重度失眠（22–28）','無明顯失眠（0–7）'],answer:0,explain:'分層：0–7 無明顯、8–14 閾下、15–21 中度、22–28 重度。',ref:'isi'},
 {level:'基礎',q:'成人慢性失眠的首選治療為何？',options:['完整的失眠認知行為治療（CBT-I）','單獨提供睡眠衛教','長期使用 benzodiazepine','睡前飲酒放鬆'],answer:0,explain:'AASM 2021 強建議完整 CBT-I；睡眠衛教只能作為輔助，不宜單獨使用。',ref:'aasm'},
 {level:'基礎',q:'一晚睡眠日誌：23:00 準備入睡、07:00 離床；入睡前清醒 30、夜間清醒 45、早醒後清醒 15 分鐘，午睡 20 分鐘。睡眠效率為？',options:['81.3%','77.1%','85.4%','93.8%'],answer:0,explain:'躺床 480 分；總睡眠 = 480 − 30 − 45 − 15 = 390；390 ÷ 480 = 81.25%。午睡不列入夜間效率。',ref:'manual'},
 {level:'基礎',q:'刺激控制的核心做法是？',options:['有睡意才上床；清醒焦慮時離床做安靜活動，並固定起床時間','睡不著就在床上滑手機直到想睡','週末補眠以彌補平日睡眠不足','每晚提早 2 小時上床增加睡眠機會'],answer:0,explain:'刺激控制重建床與睡眠的連結；固定起床時間是基礎。跌倒風險者由治療師改採安全做法。',ref:'aasm'},
 {level:'基礎',q:'病人只在夜班與家務安排下每天僅能躺床 5 小時，休假可正常睡。最適當判斷是？',options:['屬睡眠機會不足，先改善作息與環境，不直接判定失眠障礙','典型慢性失眠，立即開始限床','應優先開立 Z-drug','ISI 高就代表需加藥'],answer:0,explain:'失眠障礙的前提是已有足夠睡眠機會；機會不足者限床反而有害。',ref:'va'},
 {level:'基礎',q:'服用 Z-drug 後曾發生夢遊、夢駕且事後失憶，應如何處理？',options:['停止該藥並立即聯絡醫師，之後避免再使用該類藥','減半劑量繼續使用','改在更晚的時間服用','合併酒精可減少發生'],answer:0,explain:'FDA 2019 加框警語及 TFDA 公告：曾發生複雜睡眠行為者禁用 zolpidem、zopiclone/eszopiclone、zaleplon。',ref:'fda'},
 {level:'進階',q:'STOP 篩檢（打鼾、嗜睡、目擊呼吸暫停、高血壓）在本工具中何時應進一步評估 OSA？',options:['≥2 項陽性，或有目擊呼吸暫停','需要 4 項全部陽性','只要有高血壓即可確診','STOP 陰性即可排除 OSA'],answer:0,explain:'STOP 為風險篩檢，不能確診或排除；≥2 項或目擊呼吸暫停時安排睡眠專科評估及 PSG／HSAT。',ref:'va'},
 {level:'進階',q:'雙重食慾素受體拮抗劑（DORA，如 lemborexant、suvorexant、daridorexant）的禁忌症為？',options:['猝睡症','高血壓','輕度憂鬱','睡眠維持困難'],answer:0,explain:'DORA 禁用於猝睡症；另需注意隔日嗜睡、睡眠癱瘓與 CYP3A 交互作用。',ref:'dayvigo'},
 {level:'進階',q:'失眠用低劑量 doxepin 最適合哪種型態？需避開哪些情況？',options:['睡眠維持困難；避開嚴重尿滯留、未治療狹角型青光眼與 MAOI','入睡困難；避開高血壓','早醒；避開 CKD','任何型態；無禁忌'],answer:0,explain:'低劑量 doxepin 用於睡眠維持；與抗憂鬱劑量不同，不可自行以高劑量製劑替代。',ref:'doxepin'},
 {level:'進階',q:'依 VA／DoD 2025，下列何者「不建議」用於單純治療慢性失眠？',options:['Trazodone','完整 CBT-I','低劑量 doxepin（睡眠維持）','DORA（依症狀討論）'],answer:0,explain:'VA／DoD 不建議以 benzodiazepines、diphenhydramine、trazodone 或抗精神病藥單純治療慢性失眠。',ref:'va'},
 {level:'進階',q:'32 歲病人近一週每晚只睡 2–3 小時卻精力充沛、話多、花費衝動。下一步？',options:['優先急迫精神評估躁期，暫停一般失眠流程','開始限床以鞏固睡眠','給予 Z-drug 並 2 週後追蹤','只提供睡眠衛教'],answer:0,explain:'睡眠需求下降而無疲倦，是躁期警訊；CBT-I 的限床本身也可能誘發躁期。',ref:'va'},
 {level:'進階',q:'ISI 療效判讀：基線 20，第 6 週 11。下列敘述何者正確？',options:['下降 9 分達「反應」，但 11 分尚未達「緩解」','達緩解，可直接結案','未達反應，應加藥','達反應即可自行停止所有治療'],answer:0,explain:'常用研究指標：ISI 下降 ≥8 為反應、ISI <8 為緩解；仍需併評白天功能與不良反應。',ref:'outcome'},
 {level:'高階',q:'最近連續 7 日日誌平均總睡眠 6 小時 20 分（380 分），固定 07:00 起床。依本工具保守規則，睡眠時段草案為？',options:['00:30 上床（6.5 小時）','00:40 上床（6 小時 20 分）','01:00 上床（6 小時）','23:00 上床（8 小時）'],answer:0,explain:'平均總睡眠向上取整至 15 分鐘：380 → 390 分；限制於 6–9 小時之間 → 390 分；07:00 − 6.5 h = 00:30。實際由治療師確認。',ref:'manual'},
 {level:'高階',q:'兩晚日誌：A 晚躺床 480 分、睡 390 分；B 晚躺床 360 分、睡 360 分。整體睡眠效率應為？',options:['89.3%（總睡眠合計 ÷ 躺床合計）','90.6%（兩晚效率平均）','100%（取最佳一晚）','81.3%（取最差一晚）'],answer:0,explain:'(390+360) ÷ (480+360) = 750 ÷ 840 = 89.3%。直接平均百分比會讓短躺床夜晚權重過大。',ref:'manual'},
 {level:'高階',q:'依 AASM 2026 合併治療指引，下列敘述何者最正確？',options:['相較單用藥物，建議加入 CBT-I；相較單用 CBT-I，不建議常規加藥（皆為條件式）','所有病人都應從一開始就合併藥物','CBT-I 與藥物合併在任何比較下都是強建議','單用藥物優於單用 CBT-I'],answer:0,explain:'兩項皆為條件式、低確定性建議；重視早期睡眠改善者可個別討論合併治療。',ref:'combo'},
 {level:'高階',q:'66 歲透析病人長期每晚服 BZD，主訴半夜醒來、晚間腿部難受想動。最不恰當的處置是？',options:['立即停用 BZD 並改用另一種安眠藥疊加','評估鐵狀態與 RLS，處理搔癢與容量','核對 BZD 劑量與戒斷史，安排個別化減藥','檢視夜間呼吸症狀與 OSA 風險'],answer:0,explain:'長期 BZD 不可突然停用；RLS 線索應先評估鐵狀態，勿直接加安眠藥；疊加鎮靜藥增加跌倒與呼吸風險。',ref:'va'},
 {level:'高階',q:'慢性疼痛使用 opioid 的病人已完成足量 CBT-I 仍失眠，要求加安眠藥。最優先的考量是？',options:['用藥安全審查（呼吸抑制）並再鑑別 OSA／中樞型呼吸中止，轉睡眠專科','直接加 Z-drug 與 BZD 合併','停用所有止痛藥','ISI 高就自動加 doxepin'],answer:0,explain:'opioid 合併鎮靜藥會增加呼吸抑制風險；opioid 亦可引起中樞型睡眠呼吸中止。足量 CBT-I 無效時應重新鑑別並轉介。',ref:'va'},
 {level:'高階',q:'CBT-I 第 8 週，ISI 由 21 降至 15，每週僅執行策略 3 天，白天功能持平。最適當的下一步？',options:['檢視落實障礙與療程是否足量，重新鑑別 OSA、節律、情緒及藥物，必要時轉介','判定 CBT-I 失敗，改為長期安眠藥','ISI 已下降即可結案','縮短躺床時間至 4 小時加速效果'],answer:0,explain:'下降 6 分未達反應；先找落實度與鑑別診斷問題，而非依分數直接加藥。睡眠時段不應低於安全下限。',ref:'manual'}
];
const map={center:'慢性失眠',branches:[
 {title:'診斷核心',tone:'teal',items:['夜間困難：入睡／維持／早醒','每週 ≥3 夜','病程 ≥3 個月（<3 月 = 短期失眠）','足夠睡眠機會與環境','白天功能受損或困擾','ISI 只量化嚴重度，不單獨診斷']},
 {title:'急迫優先',tone:'red',items:['自傷計畫／急性精神症狀','躁期：睡少卻精力旺盛','急性呼吸困難、身體不穩定','未滿 18 歲 → 兒青專科流程']},
 {title:'鑑別診斷',tone:'amber',items:['OSA：STOP ≥2 或目擊呼吸暫停','不寧腿：休息加重、活動緩解，查鐵','節律：輪班／DSWPD，比較休假作息','身體症狀：疼痛、夜尿、搔癢、逆流','精神共病：憂鬱、焦慮、創傷','藥物／物質：類固醇、刺激劑、咖啡因']},
 {title:'CBT-I 元件',tone:'teal',items:['刺激控制','睡眠機會管理（限床）','認知治療：降低努力入睡','放鬆訓練','睡眠衛教僅為輔助','高風險者由治療師調整']},
 {title:'藥物選擇',tone:'blue',items:['低劑量 doxepin：睡眠維持／早醒','DORA：入睡或維持','Z-drug：短期、入睡為主','不建議：BZD、trazodone、diphenhydramine、抗精神病藥','合併治療：條件式，個別討論','台灣適應症與給付需另查']},
 {title:'禁忌與安全',tone:'red',items:['Z-drug：曾複雜睡眠行為 → 禁用','DORA：猝睡症禁用','Doxepin：尿滯留、狹角青光眼、MAOI','孕哺、肝腎、跌倒、opioid、酒精 → 安全審查','長期 BZD 不可突然停用']},
 {title:'睡眠日誌',tone:'blue',items:['日期以最終起床日為準','總睡眠 = 時段 − 入睡前 − 夜間 − 早醒後','效率 = Σ總睡眠 ÷ Σ時段 ×100%','午睡不列入效率','時段草案：平均總睡眠取整 15 分，6–9 小時','平均 <5 小時或高風險 → 不自動計算']},
 {title:'追蹤療效',tone:'amber',items:['1–2 週：落實度、嗜睡、副作用','4–8 週：ISI、日誌、白天功能','反應：ISI 下降 ≥8','緩解：ISI <8','6–8 週未反應 → 再鑑別、轉介','穩定後 1–3 個月複查、復發預防']}
]};
const api={cases,quiz,map,shift};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.InsomniaContent=api;
})(typeof window!=='undefined'?window:globalThis);
