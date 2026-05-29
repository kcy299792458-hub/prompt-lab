export type PromptVersion = {
  label: string;
  language: "영어" | "한국어" | "한영 혼합";
  body: string;
};

export type Prompt = {
  id: number;
  title: string;
  description: string;
  body: string;
  promptVersions?: PromptVersion[];
  category: string;
  model: string;
  aspectRatio: string;
  style: string;
  language: "영어" | "한국어" | "한영 혼합";
  image: string;
  tags: string[];
  authorName?: string;
};

export const categories = [
  "전체",
  "사진/시네마틱",
  "인물/패션",
  "제품/광고",
  "캐릭터/웹툰",
  "3D/공간",
  "편집/콜라주",
  "기괴/호러",
  "배경/세계관",
];

export const prompts: Prompt[] = [
  {
    id: 31,
    title: "QR 코드가 숨어 있는 건축 렌더",
    description: "ControlNet tile_resample로 QR 코드를 고급 주택 렌더 안에 숨긴 인기 워크플로우.",
    body: `A photo-realistic rendering of a 2 story house with greenery, pool, (Botanical:1.5), (Photorealistic:1.3), (Highly detailed:1.2), (Natural light:1.2), art inspired by Architectural Digest, Vogue Living, and Elle Decor, <lora:epiNoiseoffset_v2:1>

Negative prompt: bad_pictures, (bad_prompt_version2:0.8), EasyNegative, 3d, cartoon, anime, sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, normal quality, ((monochrome)), ((grayscale))

Workflow notes: img2img with QR code image, denoising strength 1, ControlNet tile_resample, model control_v11f1e_sd15_tile, control weight 0.9, pixel perfect true.`,
    promptVersions: [
      {
        label: "원문/워크플로우",
        language: "영어",
        body: `A photo-realistic rendering of a 2 story house with greenery, pool, (Botanical:1.5), (Photorealistic:1.3), (Highly detailed:1.2), (Natural light:1.2), art inspired by Architectural Digest, Vogue Living, and Elle Decor, <lora:epiNoiseoffset_v2:1>

Negative prompt: bad_pictures, (bad_prompt_version2:0.8), EasyNegative, 3d, cartoon, anime, sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, normal quality, ((monochrome)), ((grayscale))

Steps: 20, Sampler: Euler a, CFG scale: 7, Seed: 2443712455, Size: 768x768, Model: revAnimated_v122, Denoising strength: 1, ControlNet tile_resample weight 0.9.`,
      },
      {
        label: "출처",
        language: "한영 혼합",
        body: "Reddit r/StableDiffusion: https://www.reddit.com/r/StableDiffusion/comments/1436nqv/my_attempt_on_qr_code/",
      },
    ],
    category: "3D/공간",
    model: "Stable Diffusion + ControlNet",
    aspectRatio: "1:1",
    style: "Hidden QR / Architecture",
    language: "영어",
    image: "https://i.redd.it/8j3vz9j0vj4b1.png",
    tags: ["QR", "ControlNet", "건축", "워크플로우"],
  },
  {
    id: 32,
    title: "바이킹 롱하우스 시대 셀피",
    description: "역사 속 인물들이 전면 카메라 셀피를 찍는다는 설정의 Midjourney 프롬프트.",
    body: `A group of male Norse, Dane, and Vikings huddled together and is taking a group selfie picture together in 793 CE. They are drinking ale at a feast in a Viking longhouse. They are all wearing traditional Viking armor and helmets. Everyone smiling directly at the camera. The image is photorealistic, has natural lighting, and is taken with a front-facing phone selfie camera by one of the Vikings. --ar 3:2 --s 1000 --no phone --v 5 --q 2`,
    promptVersions: [
      {
        label: "원문",
        language: "영어",
        body: `A group of male Norse, Dane, and Vikings huddled together and is taking a group selfie picture together in 793 CE. They are drinking ale at a feast in a Viking longhouse. They are all wearing traditional Viking armor and helmets. Everyone smiling directly at the camera. The image is photorealistic, has natural lighting, and is taken with a front-facing phone selfie camera by one of the Vikings. --ar 3:2 --s 1000 --no phone --v 5 --q 2`,
      },
      {
        label: "출처",
        language: "한영 혼합",
        body: "Reddit r/midjourney: https://www.reddit.com/r/midjourney/comments/11vuvdk/time_period_selfies_time_traveler_shows_soldiers/",
      },
    ],
    category: "사진/시네마틱",
    model: "Midjourney v5",
    aspectRatio: "3:2",
    style: "Historical Selfie",
    language: "영어",
    image: "https://preview.redd.it/hj9f60entqoa1.png?width=1344&format=png&auto=webp&s=825bb4788696f05720a8d21787e4a02b56dacb22",
    tags: ["셀피", "역사", "바이킹", "포토리얼"],
  },
  {
    id: 33,
    title: "2000년대 폰카처럼 일부러 못 찍은 사진",
    description: "AI 이미지가 너무 완벽해 보이는 문제를 거꾸로 이용해 저품질 폰카 질감을 만들려는 실험형 프롬프트.",
    body: `(candid poorly lit poorly exposed poorly composed low-quality vacation closeup photo in phst artstyle) (with natural lighting and dynamic angles) (that has been poorly shot with a iphone 6 nokia 6600 cell phone camera) by an amateur storm thorgerson) (and uploaded to facebook on 17.05.2012) (and that is capturing the moment of a happy 25 years old woman Sarah) (with extremely detailed skin and round eyes with extremely detailed pupils and irises and brown hair) (wearing a white tshirt in a park) (and taking a selfie while looking into the camera) (in spring with a clear blue sky at noon), abcdefghijklmnopqrstuvwxyz

Negative prompt: yellow hue, (professional studio portrait photography), (long neck, exaggerated cartoon caricature with illogical distorted body proportions), (watermark, text), (belt, straps, bag), (model, red carpet, fashion), (fat, asymmetrical), (instagram, facebook, pexels, unsplash, flickr, shutterstock), (shiny, glossy), (vignette, blur, movie scene, render), (teeth, makeup), abcdefghijklmnopqrstuvwxyz0987654321`,
    promptVersions: [
      {
        label: "원문",
        language: "영어",
        body: `(candid poorly lit poorly exposed poorly composed low-quality vacation closeup photo in phst artstyle) (with natural lighting and dynamic angles) (that has been poorly shot with a iphone 6 nokia 6600 cell phone camera) by an amateur storm thorgerson) (and uploaded to facebook on 17.05.2012) (and that is capturing the moment of a happy 25 years old woman Sarah) (with extremely detailed skin and round eyes with extremely detailed pupils and irises and brown hair) (wearing a white tshirt in a park) (and taking a selfie while looking into the camera) (in spring with a clear blue sky at noon), abcdefghijklmnopqrstuvwxyz

Negative prompt: yellow hue, (professional studio portrait photography), (long neck, exaggerated cartoon caricature with illogical distorted body proportions), (watermark, text), (belt, straps, bag), (model, red carpet, fashion), (fat, asymmetrical), (instagram, facebook, pexels, unsplash, flickr, shutterstock), (shiny, glossy), (vignette, blur, movie scene, render), (teeth, makeup), abcdefghijklmnopqrstuvwxyz0987654321

Steps: 25, Seed: 83455220128015, Model: sd_xl_base_1.0_0.9vae, Size: 1080x1920, Sampler: DPM++ 2M Karras, CFG scale: 7.5`,
      },
      {
        label: "출처",
        language: "한영 혼합",
        body: "Reddit r/StableDiffusion: https://www.reddit.com/r/StableDiffusion/comments/181wanj/day_3_of_me_attempting_to_figure_out_the_most/",
      },
    ],
    category: "사진/시네마틱",
    model: "SDXL",
    aspectRatio: "9:16",
    style: "2000s Phone Camera",
    language: "영어",
    image: "https://i.imgur.com/sC6szZBh.jpg",
    tags: ["폰카", "저화질", "리얼리즘", "SDXL"],
  },
  {
    id: 34,
    title: "새벽 아파트 복도",
    description: "2000년대 초 피쳐폰으로 찍힌 듯한 한국 구형 아파트 복도와, 어둠 속에 겨우 보이는 실루엣.",
    body: `(found photo:1.4), (old nokia phone camera:1.3), (2002, 2003 digital photo:1.2), low resolution, heavy jpeg compression artifact, digital noise, grain, fluorescent light, yellow-green tint, underexposed shadows, blown highlights, lens distortion, weak vignette, chromatic aberration, (korean apartment corridor:1.4), brutalist concrete hallway, old linoleum floor, brown steel doors, flickering light, dark end of hallway, (silhouette barely visible in darkness:1.3), human figure, tilted head, white chrysanthemum wreath against one door, cardboard boxes, old umbrella, (liminal space:1.2), (uncanny:1.3), subtle horror, something wrong, eerie, unsettling, backrooms aesthetic, no people visible clearly`,
    promptVersions: [
      {
        label: "한국어 서술형",
        language: "한국어",
        body: "2000년대 초반 노키아 피쳐폰 카메라로 우연히 찍힌 것처럼 보이는 저화질 사진. 배경은 1990년대 후반에 지어진 한국의 5층짜리 소형 아파트 복도. 갈색 철제문, 낡은 리놀륨 바닥, 오래된 소화기와 택배 더미, 한 문 앞에만 놓인 흰 국화 화환. 복도 끝 어둠이 시작되는 지점에 사람 키만 한 무언가의 윤곽이 있고, 얼굴은 보이지 않으며 고개를 약간 기울이고 있다.",
      },
      {
        label: "Stable Diffusion",
        language: "영어",
        body: `(found photo:1.4), (old nokia phone camera:1.3), (2002, 2003 digital photo:1.2), low resolution, heavy jpeg compression artifact, digital noise, grain, fluorescent light, yellow-green tint, underexposed shadows, blown highlights, lens distortion, weak vignette, chromatic aberration, (korean apartment corridor:1.4), brutalist concrete hallway, old linoleum floor, brown steel doors, flickering light, dark end of hallway, (silhouette barely visible in darkness:1.3), human figure, tilted head, white chrysanthemum wreath against one door, cardboard boxes, old umbrella, (liminal space:1.2), (uncanny:1.3), subtle horror, something wrong, eerie, unsettling, backrooms aesthetic, no people visible clearly

Negative: (best quality, masterpiece, 8k, sharp, detailed:1.5), bright, clean, monster, blood, gore, ghost clearly visible, obvious horror, anime, illustration, painting, 3d render, cgi, cinematic, movie still, studio lighting, professional photo, hdr, vivid colors`,
      },
      {
        label: "Midjourney",
        language: "영어",
        body: "/imagine prompt: grainy low-res photo taken on 2002 nokia phone, korean apartment hallway, flickering fluorescent light, brown steel doors, white funeral chrysanthemum wreath beside one door, dark end of corridor, barely visible human silhouette with tilted head in the darkness, jpeg artifact, digital noise, yellow-green fluorescent tint, vignette, liminal space, uncanny, found footage aesthetic, no clear monster, subtle wrongness, something you notice after 5 seconds --ar 3:2 --v 6.1 --style raw",
      },
    ],
    category: "기괴/호러",
    model: "GPT Image / SD / Midjourney",
    aspectRatio: "3:2",
    style: "Analog Horror",
    language: "한영 혼합",
    image: "/samples/analog-horror-apartment-corridor.png",
    tags: ["아날로그호러", "리미널", "복도", "피쳐폰"],
  },
  {
    id: 35,
    title: "방과 후 수영장",
    description: "오래된 일본 초등학교 수영장 아래에 설명하기 어려운 하얀 형체가 잠긴 장면.",
    body: `(found photo:1.4), (2001 cheap digital camera:1.3), low megapixel, heavy noise, soft focus, overexposed whites, cyan-tinted shadows, jpeg artifact, slight motion blur, (japanese elementary school outdoor swimming pool:1.4), still water surface, old blue tile, mossy concrete edge, half-open locker room window, blue vinyl hose in pool, small swim cap left on ground, summer afternoon haze, (something submerged in deep end:1.5), white elongated shape underwater, (vaguely human silhouette beneath surface:1.4), photographer shadow visible in water reflection, (liminal space:1.2), (uncanny:1.4), dread, subtle horror, ordinary scene with one impossible detail`,
    promptVersions: [
      {
        label: "한국어 서술형",
        language: "한국어",
        body: "2000년대 초반 일본의 오래된 초등학교 야외 수영장을 찍은 것처럼 보이는 저화질 사진. 수면은 지나치게 고요하고, 탈의실 창문은 반쯤 열려 있으며, 파란 비닐 호스가 수영장 안으로 늘어져 있다. 수면 아래 중앙 깊은 곳에 길고 흰 것이 가라앉아 있고, 처음에는 수건이나 비닐처럼 보이지만 윤곽선이 사람의 형태와 유사하다.",
      },
      {
        label: "Stable Diffusion",
        language: "영어",
        body: `(found photo:1.4), (2001 cheap digital camera:1.3), low megapixel, heavy noise, soft focus, overexposed whites, cyan-tinted shadows, jpeg artifact, slight motion blur, (japanese elementary school outdoor swimming pool:1.4), still water surface, old blue tile, mossy concrete edge, half-open locker room window, blue vinyl hose in pool, small swim cap left on ground, summer afternoon haze, (something submerged in deep end:1.5), white elongated shape underwater, (vaguely human silhouette beneath surface:1.4), photographer shadow visible in water reflection, (liminal space:1.2), (uncanny:1.4), dread, subtle horror, ordinary scene with one impossible detail

Negative: (masterpiece, sharp, 8k, hdr:1.5), monster, ghost visible clearly, blood, gore, dramatic lighting, anime, illustration, 3d, clean water, olympic pool, modern facility, people swimming`,
      },
      {
        label: "Midjourney",
        language: "영어",
        body: "/imagine prompt: low-res photo from 2001 cheap digicam, japanese elementary school outdoor pool, summer afternoon, perfectly still water, old cracked concrete edge with green algae, small abandoned swim cap beside ladder, half-open changing room window, something white and long submerged in deep end of pool, vaguely human in shape, photographer's shadow reflected on water surface, jpeg grain, soft focus, washed-out overexposed tones, cyan shadows, liminal space, found photo, uncanny dread, no obvious monster --ar 3:2 --v 6.1 --style raw",
      },
    ],
    category: "기괴/호러",
    model: "GPT Image / SD / Midjourney",
    aspectRatio: "3:2",
    style: "Analog Horror",
    language: "한영 혼합",
    image: "/samples/analog-horror-school-pool.png",
    tags: ["아날로그호러", "수영장", "리미널", "저화질"],
  },
  {
    id: 36,
    title: "지하 주차장 의자",
    description: "낮인데도 한밤처럼 보이는 한국 아파트 지하 주차장, 빈 의자와 검은 비닐봉지.",
    body: `(found photo:1.4), (2005 camera phone photo:1.3), low res, digital noise, flash photography, blown highlights near camera, deep darkness beyond flash range, jpeg compression artifact, blue-tinted blacks, (korean underground apartment parking lot:1.4), 1990s concrete construction, yellow stripe reflective tape on pillars, parking lot line markings, early 2000s korean cars parked, hyundai avante, fluorescent ceiling lights, (folding chair alone in empty parking space:1.4), black plastic bag tied to chair leg, handwritten note on pillar illegible due to low resolution, (car idling in dark far end of garage:1.3), faint exhaust smoke, liminal space, uncanny, dread, subtle horror, daytime but feels like midnight, photographer unknown reason for photo`,
    promptVersions: [
      {
        label: "한국어 서술형",
        language: "한국어",
        body: "2000년대 중반 구형 카메라폰으로 찍은 것처럼 보이는 저화질 사진. 배경은 1990년대 후반 아파트 단지 지하 주차장. 한 기둥 옆 빈 주차 공간에 접이식 의자가 하나 놓여 있고, 의자 다리 사이에 검은 비닐봉지가 묶여 있다. 옆 기둥에는 손으로 쓴 메모지가 붙어 있지만 해상도가 낮아 읽을 수 없다. 저편 어둠 속에는 시동이 걸린 차 한 대가 있다.",
      },
      {
        label: "Stable Diffusion",
        language: "영어",
        body: `(found photo:1.4), (2005 camera phone photo:1.3), low res, digital noise, flash photography, blown highlights near camera, deep darkness beyond flash range, jpeg compression artifact, blue-tinted blacks, (korean underground apartment parking lot:1.4), 1990s concrete construction, yellow stripe reflective tape on pillars, parking lot line markings, early 2000s korean cars parked, hyundai avante, fluorescent ceiling lights, (folding chair alone in empty parking space:1.4), black plastic bag tied to chair leg, handwritten note on pillar illegible due to low resolution, (car idling in dark far end of garage:1.3), faint exhaust smoke, liminal space, uncanny, dread, subtle horror, daytime but feels like midnight, photographer unknown reason for photo

Negative: (best quality, sharp, masterpiece:1.5), bright parking lot, modern building, obvious monster, blood, ghost, anime, illustration, hdr, vivid, people, clear text`,
      },
      {
        label: "Midjourney",
        language: "영어",
        body: "/imagine prompt: blurry low-res camera phone photo circa 2005, underground parking garage of korean apartment complex, yellow-striped concrete pillars, old hyundai cars parked, weak flash illuminates foreground only, deep darkness beyond, single folding chair in empty parking space with black plastic bag tied to leg, illegible handwritten note on nearest pillar, one car idling in the dark far end with barely visible exhaust fumes, jpeg noise, digital grain, blue-tinted shadows, overexposed flash area, liminal, uncanny, dread, something deeply wrong --ar 3:2 --v 6.1 --style raw",
      },
    ],
    category: "기괴/호러",
    model: "GPT Image / SD / Midjourney",
    aspectRatio: "3:2",
    style: "Analog Horror",
    language: "한영 혼합",
    image: "/samples/analog-horror-parking-garage.png",
    tags: ["아날로그호러", "주차장", "리미널", "카메라폰"],
  },
  {
    id: 37,
    title: "모두가 같은 곳을 보는 축제",
    description: "일본 시골 마쓰리 사진 속 모든 사람이 화면 밖 같은 방향을 바라보는 군중 호러.",
    body: `(found photo:1.4), (2002 budget digicam:1.3), low resolution, noise, grain, soft focus, no flash, twilight, orange streetlamps, blue dusk sky, jpeg artifact, slight motion blur, tourist photo, (japanese rural town summer festival street:1.4), matsuri, yatai food stalls, paper lanterns hanging, people in yukata, all ages crowd, (every single person in photo staring at same direction:1.6), all heads turned left toward camera edge, blank expressions, empty eyes, (nothing visible at left edge of frame, only dark alley:1.3), uncanny, (wrongness:1.5), crowd horror, mass behavior, liminal dread, ordinary festival turned sinister, no blood, no monster`,
    promptVersions: [
      {
        label: "한국어 서술형",
        language: "한국어",
        body: "2000년대 초반 일본 여행 중 찍은 것처럼 보이는 저화질 디지털 사진. 배경은 지방 소도시의 여름 마쓰리 거리이고, 야타이와 종이 초롱, 유카타 차림의 사람들이 보인다. 사진 속 모든 사람, 포장마차 주인부터 아이와 노인까지 전부 한 방향을 바라보고 있다. 화면 왼쪽 끝에는 아무것도 없고 어두운 골목만 있다.",
      },
      {
        label: "Stable Diffusion",
        language: "영어",
        body: `(found photo:1.4), (2002 budget digicam:1.3), low resolution, noise, grain, soft focus, no flash, twilight, orange streetlamps, blue dusk sky, jpeg artifact, slight motion blur, tourist photo, (japanese rural town summer festival street:1.4), matsuri, yatai food stalls, paper lanterns hanging, people in yukata, all ages crowd, (every single person in photo staring at same direction:1.6), all heads turned left toward camera edge, blank expressions, empty eyes, (nothing visible at left edge of frame, only dark alley:1.3), uncanny, (wrongness:1.5), crowd horror, mass behavior, liminal dread, ordinary festival turned sinister, no blood, no monster

Negative: (sharp, masterpiece, best quality, 8k:1.5), people looking at camera, smiling, obvious horror element, monster, ghost, blood, anime, illustration, studio photography, professional, hdr`,
      },
      {
        label: "Midjourney",
        language: "영어",
        body: "/imagine prompt: grainy tourist photo circa 2002 cheap digicam, japanese rural summer festival street at dusk, yatai food stalls, paper lanterns strung overhead, crowd in yukata of all ages, everyone in the entire photo has turned their head to look in the exact same direction toward left edge of frame, blank expressionless faces, nothing visible at left edge only dark alley, orange street lamp glow mixed with blue twilight sky, digital noise, soft focus, jpeg artifact, no flash low light photography, crowd behavior horror, subtle wrongness, deeply unsettling --ar 3:2 --v 6.1 --style raw",
      },
    ],
    category: "기괴/호러",
    model: "GPT Image / SD / Midjourney",
    aspectRatio: "3:2",
    style: "Analog Horror",
    language: "한영 혼합",
    image: "/samples/analog-horror-matsuri-crowd.png",
    tags: ["아날로그호러", "축제", "군중", "마쓰리"],
  },
  {
    id: 38,
    title: "병원 복도의 빈 휠체어",
    description: "한국 지방 병원 복도 중앙의 빈 휠체어와 유리 반사에만 보이는 형체.",
    body: `(found photo:1.4), (2003 camera phone:1.3), low resolution, digital noise, weak flash, overexposed floor tiles near camera, dim fluorescent beyond, yellow-white hospital light, slightly tilted frame, jpeg artifact, (korean regional hospital corridor:1.4), 2000s interior, beige linoleum, multiple closed patient room doors, one door slightly ajar, (single empty wheelchair in center of hallway:1.5), footrests down, patient gown draped over backrest, (nurse station glass window at end of corridor:1.3), (reflection in glass shows standing figure not present in hallway:1.6), vague silhouette in reflection, no clear face, uncanny wrongness, liminal space hospital, subtle dread, something reflected that shouldn't exist`,
    promptVersions: [
      {
        label: "한국어 서술형",
        language: "한국어",
        body: "2000년대 초 한국 지방 종합병원 복도를 찍은 저화질 사진. 복도 중앙에는 빈 휠체어가 놓여 있고, 등받이에는 환자복이 걸려 있다. 복도 끝 간호사 스테이션 유리창에 무언가가 비치는데, 실제 복도 어디에도 그 형체는 없다. 플래시가 가까운 바닥만 과하게 밝히고 뒤쪽은 형광등 빛 속으로 사라진다.",
      },
      {
        label: "Stable Diffusion",
        language: "영어",
        body: `(found photo:1.4), (2003 camera phone:1.3), low resolution, digital noise, weak flash, overexposed floor tiles near camera, dim fluorescent beyond, yellow-white hospital light, slightly tilted frame, jpeg artifact, (korean regional hospital corridor:1.4), 2000s interior, beige linoleum, multiple closed patient room doors, one door slightly ajar, (single empty wheelchair in center of hallway:1.5), footrests down, patient gown draped over backrest, (nurse station glass window at end of corridor:1.3), (reflection in glass shows standing figure not present in hallway:1.6), vague silhouette in reflection, no clear face, uncanny wrongness, liminal space hospital, subtle dread, something reflected that shouldn't exist

Negative: (masterpiece, sharp, best quality, 8k:1.5), monster clearly visible, blood, gore, obvious ghost, dramatic pose, anime, illustration, hdr, modern hospital, people in corridor, bright clean environment`,
      },
      {
        label: "Midjourney",
        language: "영어",
        body: "/imagine prompt: blurry low-res camera phone photo 2003, korean regional hospital hallway, fluorescent lights, beige linoleum, row of closed patient room doors with one slightly open, single empty wheelchair in exact center of corridor not against wall, patient gown draped over wheelchair backrest as if just removed, nurse station glass window at far end, standing figure visible only as reflection in glass, figure not present anywhere in the actual corridor, overexposed flash on nearby floor, darkness deepening toward far end, tilted frame, digital grain, jpeg noise, yellow-white tint, uncanny, liminal space, hospital horror, subtle dread --ar 3:2 --v 6.1 --style raw",
      },
    ],
    category: "기괴/호러",
    model: "GPT Image / SD / Midjourney",
    aspectRatio: "3:2",
    style: "Analog Horror",
    language: "한영 혼합",
    image: "/samples/analog-horror-hospital-corridor.png",
    tags: ["아날로그호러", "병원", "휠체어", "반사"],
  },
  {
    id: 39,
    title: "아무도 밀지 않는 그네",
    description: "낮의 한국 시골 놀이터에서 혼자 높이 올라가 있는 그네와 얼굴이 보이지 않는 아이.",
    body: `(found photo:1.4), (late 1990s disposable camera or early digicam:1.3), underexposed, muted colors, low saturation, jpeg artifact in sky area, vignette, slight grain, no flash outdoor, (rural korean playground:1.4), 1990s rusty iron jungle gym, faded paint, cracked concrete ground, one broken swing hanging crooked, clear afternoon sky but oppressive mood, empty surroundings, rice fields beyond, (child on working swing, back to camera:1.5), no face visible, (swing at high arc, feet off ground:1.3), no adult present anywhere, nobody visible in background, no cars, no buildings nearby, (nobody pushing the swing:1.4), self-swinging impossibility, liminal space, rural isolation, child horror, subtle impossibility, uncanny, dread, sunlit wrongness, daytime horror`,
    promptVersions: [
      {
        label: "한국어 서술형",
        language: "한국어",
        body: "1990년대 말 또는 2000년대 초 일회용 카메라로 찍힌 것처럼 보이는 야외 사진. 한국 지방 소도시 외곽의 낡은 놀이터, 녹슨 정글짐과 페인트가 벗겨진 미끄럼틀, 멀리 논밭이 보인다. 남아 있는 그네 하나에 아이가 뒤돌아 앉아 있고, 아무도 밀어주지 않았는데 그네가 높이 올라가 있다. 주변에는 어른도 차도 집도 보이지 않는다.",
      },
      {
        label: "Stable Diffusion",
        language: "영어",
        body: `(found photo:1.4), (late 1990s disposable camera or early digicam:1.3), underexposed, muted colors, low saturation, jpeg artifact in sky area, vignette, slight grain, no flash outdoor, (rural korean playground:1.4), 1990s rusty iron jungle gym, faded paint, cracked concrete ground, one broken swing hanging crooked, clear afternoon sky but oppressive mood, empty surroundings, rice fields beyond, (child on working swing, back to camera:1.5), no face visible, (swing at high arc, feet off ground:1.3), no adult present anywhere, nobody visible in background, no cars, no buildings nearby, (nobody pushing the swing:1.4), self-swinging impossibility, liminal space, rural isolation, child horror, subtle impossibility, uncanny, dread, sunlit wrongness, daytime horror

Negative: (sharp, masterpiece, best quality, 8k, hdr:1.5), child's face visible, adult present, normal playground scene, happy children, monster, ghost visible, blood, anime, illustration, urban setting, modern equipment`,
      },
      {
        label: "Midjourney",
        language: "영어",
        body: "/imagine prompt: old underexposed photo from late 1990s disposable camera, rural korean playground, rusty iron jungle gym, faded peeling paint, cracked concrete ground, one broken swing hanging crookedly, one child with back to camera on working swing at highest point of arc, feet clearly off ground, nobody else visible anywhere, no adults, no cars, no buildings, only empty rice fields in distance, nobody is pushing the swing, clear afternoon sky, oppressive quiet, jpeg artifact, muted colors, vignette, slight grain, daytime horror, rural isolation, uncanny, something is very wrong --ar 3:2 --v 6.1 --style raw",
      },
    ],
    category: "기괴/호러",
    model: "GPT Image / SD / Midjourney",
    aspectRatio: "3:2",
    style: "Analog Horror",
    language: "한영 혼합",
    image: "/samples/analog-horror-rural-playground.png",
    tags: ["아날로그호러", "놀이터", "낮공포", "시골"],
  },
  {
    id: 40,
    title: "직접 플래시 루프탑 스냅",
    description: "인스타 감성의 직접 플래시, 필름 그레인, 럭셔리 에디토리얼 분위기를 섞은 루프탑 스냅.",
    body: `Photorealistic cinematic street photo, a stylish anonymous fashion subject in an oversized dark coat photographed with direct flash in a luxury lifestyle editorial mood, wide-angle analog snapshot, dreamy orange sunset behind a city rooftop, imperfect framing, visible film grain, natural skin texture, slight motion blur, candid unedited look, no readable text, no logo, no watermark, vertical 4:5 composition`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `Photorealistic cinematic street photo, a stylish anonymous fashion subject in an oversized dark coat photographed with direct flash in a luxury lifestyle editorial mood, wide-angle analog snapshot, dreamy orange sunset behind a city rooftop, imperfect framing, visible film grain, natural skin texture, slight motion blur, candid unedited look, no readable text, no logo, no watermark, vertical 4:5 composition`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Instagram #aiprompt, #aiprompts, #gptimage 인기 태그의 직접 플래시/필름룩/일상 스냅 트렌드를 참고해 프롬프트랩용으로 새로 작성했습니다. 출처: https://www.instagram.com/popular/aiprompt/ / https://www.instagram.com/popular/aiprompts/ / https://www.instagram.com/popular/gptimage/",
      },
    ],
    category: "사진/시네마틱",
    model: "GPT Image",
    aspectRatio: "4:5",
    style: "Direct Flash Editorial",
    language: "영어",
    image: "/samples/trend-cinematic-flash-rooftop.png",
    tags: ["플래시", "필름룩", "인스타트렌드", "스냅"],
  },
  {
    id: 41,
    title: "비 오는 택시 창문 폰카",
    description: "2000년대 폰카 화질과 비 오는 창문 반사를 이용한 도시 야간 시네마틱 프롬프트.",
    body: `Candid low quality 2000s phone camera photo, a late-night Korean convenience store seen through a rain-speckled taxi window, neon reflections on wet asphalt, one blurred passerby carrying a transparent umbrella, overexposed fluorescent lights, JPEG compression artifacts, timestamp-like empty corner glow but no readable text, realistic mundane atmosphere, horizontal 16:9, no watermark`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `Candid low quality 2000s phone camera photo, a late-night Korean convenience store seen through a rain-speckled taxi window, neon reflections on wet asphalt, one blurred passerby carrying a transparent umbrella, overexposed fluorescent lights, JPEG compression artifacts, timestamp-like empty corner glow but no readable text, realistic mundane atmosphere, horizontal 16:9, no watermark`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Instagram prompt 릴스에서 반복되는 low quality phone photo, rain window, neon reflection 조합과 커뮤니티의 저화질 카메라 프롬프트 흐름을 참고했습니다. 결과 이미지는 원본 커뮤니티 이미지를 쓰지 않고 새로 생성했습니다.",
      },
    ],
    category: "사진/시네마틱",
    model: "GPT Image",
    aspectRatio: "16:9",
    style: "Low Quality Phone Camera",
    language: "영어",
    image: "/samples/trend-cinematic-phone-taxi.png",
    tags: ["폰카", "저화질", "시네마틱", "인스타트렌드"],
  },
  {
    id: 42,
    title: "네온 골목 다큐멘터리 컷",
    description: "비 온 뒤 골목, 푸드카트 수증기, 택시 헤드라이트를 합친 다큐멘터리풍 야간 사진.",
    body: `Photorealistic documentary night street photograph, dense Seoul alley with red and cyan neon reflecting on puddles, steam from a food cart, cinematic taxi headlights cutting through mist, shot on 35mm film, high dynamic range but natural, strong atmosphere, no readable signs, no logo, no watermark, 16:10 composition`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `Photorealistic documentary night street photograph, dense Seoul alley with red and cyan neon reflecting on puddles, steam from a food cart, cinematic taxi headlights cutting through mist, shot on 35mm film, high dynamic range but natural, strong atmosphere, no readable signs, no logo, no watermark, 16:10 composition`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Instagram의 cinematic ai prompt 계열에서 많이 보이는 neon alley, film grain, wet street, documentary photo 키워드를 프롬프트랩 스타일로 정리했습니다.",
      },
    ],
    category: "사진/시네마틱",
    model: "GPT Image",
    aspectRatio: "16:10",
    style: "Documentary Night Photo",
    language: "영어",
    image: "/samples/trend-cinematic-neon-alley.png",
    tags: ["네온", "거리사진", "포토리얼", "필름룩"],
  },
  {
    id: 43,
    title: "사이버 마스크 패션 포트레이트",
    description: "Civitai 월간 반응순에서 강했던 다크 사이버 패션 포트레이트 흐름을 새로 재구성한 프롬프트.",
    body: `High-fashion editorial portrait of an anonymous model wearing a black translucent face veil and sculptural chrome shoulder armor, red neon rim light, black sclera inspired contact lenses but still tasteful, dark cyberpunk studio, gritty film grain, chromatic aberration, chiaroscuro lighting, dynamic three-quarter pose, very aesthetic, no text, no logo, no watermark, vertical 4:5`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `High-fashion editorial portrait of an anonymous model wearing a black translucent face veil and sculptural chrome shoulder armor, red neon rim light, black sclera inspired contact lenses but still tasteful, dark cyberpunk studio, gritty film grain, chromatic aberration, chiaroscuro lighting, dynamic three-quarter pose, very aesthetic, no text, no logo, no watermark, vertical 4:5`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Civitai Most Reactions / Month API에서 확인한 cyberpunk armor, black mask, film grain, chromatic aberration 계열 이미지 메타데이터를 참고했습니다. 참고 이미지: https://civitai.com/images/74218680",
      },
    ],
    category: "인물/패션",
    model: "GPT Image",
    aspectRatio: "4:5",
    style: "Cyberpunk Fashion Editorial",
    language: "영어",
    image: "/samples/trend-fashion-cyber-mask.png",
    tags: ["패션", "사이버펑크", "Civitai", "필름그레인"],
  },
  {
    id: 44,
    title: "한복 테크웨어 에디토리얼",
    description: "전통 실루엣과 테크웨어 소재감을 섞은 차분한 패션 화보 프롬프트.",
    body: `Editorial fashion portrait, anonymous Korean model wearing a modern ivory hanbok-inspired techwear jacket with subtle reflective seams, clean museum concrete interior, soft skylight, restrained luxury magazine styling, calm confident pose, 85mm lens, shallow depth of field, natural fabric texture, no text, no logo, no watermark, vertical 4:5`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `Editorial fashion portrait, anonymous Korean model wearing a modern ivory hanbok-inspired techwear jacket with subtle reflective seams, clean museum concrete interior, soft skylight, restrained luxury magazine styling, calm confident pose, 85mm lens, shallow depth of field, natural fabric texture, no text, no logo, no watermark, vertical 4:5`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Instagram의 fashion prompt, editorial portrait, techwear 스타일 공유 흐름을 참고해 한국적 소재로 새로 변형했습니다. 특정 작가 이미지나 브랜드 이미지는 사용하지 않았습니다.",
      },
    ],
    category: "인물/패션",
    model: "GPT Image",
    aspectRatio: "4:5",
    style: "Hanbok Techwear Editorial",
    language: "영어",
    image: "/samples/trend-fashion-hanbok-techwear.png",
    tags: ["패션", "한복", "테크웨어", "화보"],
  },
  {
    id: 45,
    title: "수중 실버 패브릭 화보",
    description: "인물 화보에서 자주 쓰이는 수중 부유감과 실버 패브릭을 결합한 몽환적 이미지 프롬프트.",
    body: `Dreamlike underwater fashion editorial portrait, anonymous model suspended in dark blue water wearing flowing translucent silver fabric, soft light rays from above, tiny bubbles, elegant pose, realistic skin and fabric movement, cinematic luxury magazine mood, no text, no logo, no watermark, vertical 3:4`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `Dreamlike underwater fashion editorial portrait, anonymous model suspended in dark blue water wearing flowing translucent silver fabric, soft light rays from above, tiny bubbles, elegant pose, realistic skin and fabric movement, cinematic luxury magazine mood, no text, no logo, no watermark, vertical 3:4`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Instagram의 dreamlike fashion editorial, underwater portrait, flowing fabric 계열 프롬프트 구성을 참고했습니다. 결과 이미지는 프롬프트랩용 신규 생성본입니다.",
      },
    ],
    category: "인물/패션",
    model: "GPT Image",
    aspectRatio: "3:4",
    style: "Underwater Editorial",
    language: "영어",
    image: "/samples/trend-fashion-underwater-silver.png",
    tags: ["수중", "화보", "패션", "몽환"],
  },
  {
    id: 46,
    title: "앰버 향수 빈티지 광고",
    description: "실크, 연기, 앰버 조명으로 고급 향수 광고컷을 만드는 제품사진 프롬프트.",
    body: `Premium product advertisement photo, translucent glass perfume bottle on rippled silk fabric, warm amber side light, delicate smoke, water droplets, shallow depth of field, 1970s luxury magazine mood mixed with modern clean styling, no brand name, no readable text, no logo, no watermark, square 1:1 composition`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `Premium product advertisement photo, translucent glass perfume bottle on rippled silk fabric, warm amber side light, delicate smoke, water droplets, shallow depth of field, 1970s luxury magazine mood mixed with modern clean styling, no brand name, no readable text, no logo, no watermark, square 1:1 composition`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Instagram의 product prompt, perfume ad, luxury lighting 공유 흐름을 참고했습니다. 상표와 텍스트는 배제해 재사용 가능한 샘플로 만들었습니다.",
      },
    ],
    category: "제품/광고",
    model: "GPT Image",
    aspectRatio: "1:1",
    style: "Luxury Product Ad",
    language: "영어",
    image: "/samples/trend-product-amber-perfume.png",
    tags: ["제품사진", "향수", "광고", "럭셔리"],
  },
  {
    id: 47,
    title: "녹차 세럼 스톤 제품컷",
    description: "화산석, 물방울, 녹차잎을 이용한 한국 스킨케어 상세페이지용 제품 이미지.",
    body: `Clean Korean skincare serum advertisement, translucent glass bottle on wet black volcanic stone, dewy green tea leaves, soft diffused studio light, realistic reflections, small water droplets, premium beauty brand mood, minimal composition, no logo, no readable text, no watermark, square 1:1`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `Clean Korean skincare serum advertisement, translucent glass bottle on wet black volcanic stone, dewy green tea leaves, soft diffused studio light, realistic reflections, small water droplets, premium beauty brand mood, minimal composition, no logo, no readable text, no watermark, square 1:1`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Instagram의 skincare product photography, clean beauty ad, wet stone set 디자인 트렌드를 참고해 브랜드 없는 샘플로 재작성했습니다.",
      },
    ],
    category: "제품/광고",
    model: "GPT Image",
    aspectRatio: "1:1",
    style: "Skincare Product Shot",
    language: "영어",
    image: "/samples/trend-product-green-tea-serum.png",
    tags: ["제품사진", "화장품", "스킨케어", "상세페이지"],
  },
  {
    id: 48,
    title: "무광 블랙 스피커 랜딩컷",
    description: "스타트업 랜딩페이지에 바로 쓸 수 있는 무광 테크 제품 광고 이미지 프롬프트.",
    body: `Commercial product photography, matte black wireless speaker on a clean concrete plinth, dramatic softbox light from left, precise shadow, subtle colored rim light, premium startup landing-page mood, realistic material texture, minimal modern composition, no brand mark, no text, no watermark, 16:9`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `Commercial product photography, matte black wireless speaker on a clean concrete plinth, dramatic softbox light from left, precise shadow, subtle colored rim light, premium startup landing-page mood, realistic material texture, minimal modern composition, no brand mark, no text, no watermark, 16:9`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "제품 광고 프롬프트에서 반복되는 concrete plinth, dramatic softbox, minimal startup landing-page 구성을 정리해 신규 이미지로 생성했습니다.",
      },
    ],
    category: "제품/광고",
    model: "GPT Image",
    aspectRatio: "16:9",
    style: "Tech Product Landing",
    language: "영어",
    image: "/samples/trend-product-matte-speaker.png",
    tags: ["제품사진", "테크", "스튜디오", "랜딩"],
  },
  {
    id: 49,
    title: "레드 코어 메카 가디언",
    description: "Civitai의 다크 레드 메카 계열 인기 메타데이터를 바탕으로 만든 오리지널 게임 키비주얼.",
    body: `Polished anime game key visual, original dark red mecha guardian robot standing in rain, glowing red core, angular armor, smoky battlefield background, dynamic low angle, crisp cel shading mixed with painterly lighting, high detail, no text, no logo, no watermark, vertical 3:4`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `Polished anime game key visual, original dark red mecha guardian robot standing in rain, glowing red core, angular armor, smoky battlefield background, dynamic low angle, crisp cel shading mixed with painterly lighting, high detail, no text, no logo, no watermark, vertical 3:4`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Civitai Most Reactions / Month API에서 확인한 mecha, robot, grim, dark, red theme 흐름을 오리지널 캐릭터로 재작성했습니다. 참고 이미지: https://civitai.com/images/74225837",
      },
    ],
    category: "캐릭터/웹툰",
    model: "GPT Image",
    aspectRatio: "3:4",
    style: "Anime Mecha Key Visual",
    language: "영어",
    image: "/samples/trend-character-red-mecha.png",
    tags: ["메카", "게임원화", "Civitai", "키비주얼"],
  },
  {
    id: 50,
    title: "크리스털 포션 아이콘",
    description: "픽셀아트 평가 태그와 RPG 아이템 아이콘 구성을 합친 게임 리소스 프롬프트.",
    body: `Cute high resolution pixel-art inspired RPG item icon, original glowing crystal potion bottle with tiny wings, centered object, crisp silhouette, dark transparent-feeling vignette background, jewel highlights, game inventory style, no text, no logo, no watermark, square 1:1`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `Cute high resolution pixel-art inspired RPG item icon, original glowing crystal potion bottle with tiny wings, centered object, crisp silhouette, dark transparent-feeling vignette background, jewel highlights, game inventory style, no text, no logo, no watermark, square 1:1`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Civitai 월간 반응순 API에서 보이는 score_9, pixel art, game item 계열 태그 운용을 참고하되, 기존 캐릭터 IP 없이 오리지널 아이템으로 구성했습니다.",
      },
    ],
    category: "캐릭터/웹툰",
    model: "GPT Image",
    aspectRatio: "1:1",
    style: "Pixel Art Item Icon",
    language: "영어",
    image: "/samples/trend-character-crystal-potion.png",
    tags: ["게임", "아이콘", "픽셀아트", "아이템"],
  },
  {
    id: 51,
    title: "서울 루프탑 마법사 키비주얼",
    description: "웹툰 커버처럼 바로 읽히는 서울 루프탑 판타지 캐릭터 프롬프트.",
    body: `Korean webtoon cover style, original young mage standing on a Seoul rooftop at sunset, school-uniform inspired coat, glowing paper talismans floating around, dramatic orange sky, clean line art blended with painterly lighting, polished character illustration, no readable text, no logo, no watermark, vertical 3:4`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `Korean webtoon cover style, original young mage standing on a Seoul rooftop at sunset, school-uniform inspired coat, glowing paper talismans floating around, dramatic orange sky, clean line art blended with painterly lighting, polished character illustration, no readable text, no logo, no watermark, vertical 3:4`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Instagram과 국내 커뮤니티에서 많이 공유되는 webtoon cover, rooftop fantasy, glowing talisman 조합을 특정 작품명 없이 오리지널 캐릭터로 재작성했습니다.",
      },
    ],
    category: "캐릭터/웹툰",
    model: "GPT Image",
    aspectRatio: "3:4",
    style: "Korean Webtoon Cover",
    language: "영어",
    image: "/samples/trend-character-rooftop-mage.png",
    tags: ["웹툰", "캐릭터", "판타지", "키비주얼"],
  },
  {
    id: 52,
    title: "호수 위 유리 온실 카페",
    description: "아이소메트릭 3D 미니어처 스타일로 만든 아침 호수 위 온실 카페.",
    body: `Cozy isometric 3D render of a tiny glass greenhouse cafe floating on a calm lake at sunrise, warm interior lights, lush plants, wooden deck, soft fog over water, detailed miniature style, cinematic color grading, no text, no logo, no watermark, square 1:1`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `Cozy isometric 3D render of a tiny glass greenhouse cafe floating on a calm lake at sunrise, warm interior lights, lush plants, wooden deck, soft fog over water, detailed miniature style, cinematic color grading, no text, no logo, no watermark, square 1:1`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Instagram의 isometric 3D room, cozy cafe, miniature render 계열 인기 포맷을 공간 카테고리용으로 새로 구성했습니다.",
      },
    ],
    category: "3D/공간",
    model: "GPT Image",
    aspectRatio: "1:1",
    style: "Isometric Miniature 3D",
    language: "영어",
    image: "/samples/trend-3d-greenhouse-cafe.png",
    tags: ["3D", "아이소메트릭", "카페", "미니어처"],
  },
  {
    id: 53,
    title: "네온 레트로웨이브 미니시티",
    description: "Civitai의 retrowave 도시 풍경 흐름을 3D 미니어처 도시로 재구성한 프롬프트.",
    body: `Neon retrowave miniature cityscape, glowing orange sun behind purple mountains, starry dusk sky, glossy black streets reflecting magenta and cyan neon strips, small futuristic towers, clean high-detail 3D render, synthwave album-cover mood, no readable text, no logo, no watermark, wide 16:9`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `Neon retrowave miniature cityscape, glowing orange sun behind purple mountains, starry dusk sky, glossy black streets reflecting magenta and cyan neon strips, small futuristic towers, clean high-detail 3D render, synthwave album-cover mood, no readable text, no logo, no watermark, wide 16:9`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Civitai 월간 반응순에서 확인한 ck-Neon-Retrowave, city, sundown, mountains, starry night 계열 메타데이터를 참고했습니다. 참고 이미지: https://civitai.com/images/32365539",
      },
    ],
    category: "3D/공간",
    model: "GPT Image",
    aspectRatio: "16:9",
    style: "Retrowave 3D City",
    language: "영어",
    image: "/samples/trend-3d-retrowave-city.png",
    tags: ["3D", "레트로웨이브", "Civitai", "도시"],
  },
  {
    id: 54,
    title: "클레이 스톱모션 침실",
    description: "손으로 만든 듯한 질감과 따뜻한 조명을 살린 클레이 애니메이션풍 방 렌더.",
    body: `Cozy clay animation style bedroom, handmade miniature furniture, warm desk lamp, soft blanket texture, visible clay fingerprints, imperfect stop-motion film aesthetic, small potted plant and books, charming warm mood, square composition, no text, no logo, no watermark`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `Cozy clay animation style bedroom, handmade miniature furniture, warm desk lamp, soft blanket texture, visible clay fingerprints, imperfect stop-motion film aesthetic, small potted plant and books, charming warm mood, square composition, no text, no logo, no watermark`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Instagram의 clay render, cozy room, handmade miniature 스타일 공유 흐름을 참고해 공간 샘플로 구성했습니다.",
      },
    ],
    category: "3D/공간",
    model: "GPT Image",
    aspectRatio: "1:1",
    style: "Clay Stop-Motion Room",
    language: "영어",
    image: "/samples/trend-3d-clay-bedroom.png",
    tags: ["3D", "클레이", "미니어처", "방"],
  },
  {
    id: 55,
    title: "Y2K 홀로그램 매거진 콜라주",
    description: "홀로그램 스티커, 크롬 별, 컷아웃을 사용한 인스타식 Y2K 편집 프롬프트.",
    body: `Y2K magazine collage lookbook page, anonymous fashion portrait cutouts, holographic stickers, chrome stars, inset frames, cute UI icons, glossy magazine paper texture, playful but polished editorial layout, decorative unreadable microtext only, no real words, no logo, no watermark, vertical 4:5`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `Y2K magazine collage lookbook page, anonymous fashion portrait cutouts, holographic stickers, chrome stars, inset frames, cute UI icons, glossy magazine paper texture, playful but polished editorial layout, decorative unreadable microtext only, no real words, no logo, no watermark, vertical 4:5`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Instagram #aiprompts/#gptimage에서 자주 보이는 Y2K collage, holographic sticker, magazine layout 스타일을 프롬프트랩용으로 새로 작성했습니다.",
      },
    ],
    category: "편집/콜라주",
    model: "GPT Image",
    aspectRatio: "4:5",
    style: "Y2K Magazine Collage",
    language: "영어",
    image: "/samples/trend-edit-y2k-collage.png",
    tags: ["Y2K", "콜라주", "인스타트렌드", "매거진"],
  },
  {
    id: 56,
    title: "가챠 카드 결과 화면",
    description: "게임 UI, 희귀도 프레임, 보석 파티클을 한 장에 모은 가챠 결과 화면 프롬프트.",
    body: `Anime gacha result screen style using an original fantasy character, glowing rarity frame, gem particles, radial light, polished mobile game interface panels, decorative unreadable UI labels only, no real words, no brand logo, no watermark, vertical 9:16`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `Anime gacha result screen style using an original fantasy character, glowing rarity frame, gem particles, radial light, polished mobile game interface panels, decorative unreadable UI labels only, no real words, no brand logo, no watermark, vertical 9:16`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "AI 이미지 커뮤니티에서 반복되는 gacha card, mobile game UI, rarity frame 구성을 참고하되 특정 게임 UI는 모사하지 않도록 오리지널 화면으로 생성했습니다.",
      },
    ],
    category: "편집/콜라주",
    model: "GPT Image",
    aspectRatio: "9:16",
    style: "Mobile Game UI Edit",
    language: "영어",
    image: "/samples/trend-edit-gacha-card.png",
    tags: ["게임UI", "가챠", "편집", "캐릭터"],
  },
  {
    id: 57,
    title: "낙서장 캐릭터 콘셉트 시트",
    description: "스케치, 스티커, 화살표, 메모 박스를 섞은 콘셉트 시트형 콜라주 프롬프트.",
    body: `Doodle sketchbook collage character design page, original cute streetwear mascot character repeated in rough pencil sketches, sticker-like cutouts, arrows and boxes with decorative unreadable scribbles, mixed marker and watercolor texture, messy creative desk background, playful prompt-engineering mood, no real readable text, no logo, no watermark, square 1:1`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `Doodle sketchbook collage character design page, original cute streetwear mascot character repeated in rough pencil sketches, sticker-like cutouts, arrows and boxes with decorative unreadable scribbles, mixed marker and watercolor texture, messy creative desk background, playful prompt-engineering mood, no real readable text, no logo, no watermark, square 1:1`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "국내 AI 이미지 커뮤니티의 프롬프트 실험/태그 비교식 게시물 구성과 Instagram의 doodle sheet 스타일을 참고했습니다. 관련 DCInside 예시: https://gall.dcinside.com/board/view/?id=ai_ani&no=87679",
      },
    ],
    category: "편집/콜라주",
    model: "GPT Image",
    aspectRatio: "1:1",
    style: "Doodle Concept Sheet",
    language: "영어",
    image: "/samples/trend-edit-doodle-sheet.png",
    tags: ["낙서장", "콜라주", "캐릭터시트", "프롬프트공유"],
  },
  {
    id: 58,
    title: "VHS 생일파티 거울 그림자",
    description: "가정용 VHS 테이프 속 거울 반사에만 보이는 사람 형상으로 만드는 은근한 공포.",
    body: `VHS analog horror still from a 1994 family birthday tape, low-resolution camcorder footage of a suburban dining room, birthday cake on table, warm home video lighting, heavy scanlines, chromatic bleed, timestamp area blurred with no readable numbers, in the hallway mirror behind the family table a tall person-shaped shadow appears where no one is standing, subtle uncanny dread, no blood, no gore, no text, 4:3`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `VHS analog horror still from a 1994 family birthday tape, low-resolution camcorder footage of a suburban dining room, birthday cake on table, warm home video lighting, heavy scanlines, chromatic bleed, timestamp area blurred with no readable numbers, in the hallway mirror behind the family table a tall person-shaped shadow appears where no one is standing, subtle uncanny dread, no blood, no gore, no text, 4:3`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Instagram의 analog horror/VHS prompt 흐름과 국내 커뮤니티의 저화질 생활사진 공포 구성을 참고했습니다. 원본 이미지를 가져오지 않고 직접 생성한 결과물입니다.",
      },
    ],
    category: "기괴/호러",
    model: "GPT Image",
    aspectRatio: "4:3",
    style: "VHS Analog Horror",
    language: "영어",
    image: "/samples/trend-horror-vhs-birthday.png",
    tags: ["VHS", "아날로그호러", "인스타트렌드", "언캐니"],
  },
  {
    id: 59,
    title: "낮의 빈 쇼핑몰 푸드코트",
    description: "인스타에서 규모가 큰 liminal spaces 흐름을 쇼핑몰 푸드코트 사진으로 만든 프롬프트.",
    body: `Liminal space horror photograph, abandoned 1990s mall food court at noon, sunlit but empty, plastic chairs perfectly arranged, old tiled floor, one escalator frozen, distant storefronts dark, washed-out disposable camera colors, slight fisheye distortion, uncanny quiet, no people, no readable signs, no logo, no watermark, 3:2`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `Liminal space horror photograph, abandoned 1990s mall food court at noon, sunlit but empty, plastic chairs perfectly arranged, old tiled floor, one escalator frozen, distant storefronts dark, washed-out disposable camera colors, slight fisheye distortion, uncanny quiet, no people, no readable signs, no logo, no watermark, 3:2`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Instagram liminalspaces 인기 페이지와 AI prompt 태그의 empty mall, uncanny quiet, disposable camera 분위기를 참고했습니다. 출처: https://www.instagram.com/popular/liminalspaces/",
      },
    ],
    category: "기괴/호러",
    model: "GPT Image",
    aspectRatio: "3:2",
    style: "Liminal Space Photo",
    language: "영어",
    image: "/samples/trend-horror-liminal-mall.png",
    tags: ["리미널", "쇼핑몰", "인스타트렌드", "저화질"],
  },
  {
    id: 60,
    title: "교실 단체사진의 빈 의자",
    description: "스캔된 단체사진의 어긋난 초점과 앞줄의 빈 의자로 만드는 언캐니 호러 프롬프트.",
    body: `Uncanny school yearbook photo aesthetic, early 2000s low-resolution scanned group portrait in a Korean classroom, desks pushed aside, every face slightly motion-blurred and underexposed except one empty chair in the front row, fluorescent lighting, dust on scanner glass, subtle horror, no readable names, no text, no gore, no logo, 4:3`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `Uncanny school yearbook photo aesthetic, early 2000s low-resolution scanned group portrait in a Korean classroom, desks pushed aside, every face slightly motion-blurred and underexposed except one empty chair in the front row, fluorescent lighting, dust on scanner glass, subtle horror, no readable names, no text, no gore, no logo, 4:3`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "국내 커뮤니티와 Instagram에서 자주 보이는 yearbook photo, scanned photo, uncanny group portrait 호러 구성을 참고해 프롬프트랩용으로 새로 작성했습니다.",
      },
    ],
    category: "기괴/호러",
    model: "GPT Image",
    aspectRatio: "4:3",
    style: "Uncanny Scanned Photo",
    language: "영어",
    image: "/samples/trend-horror-yearbook-chair.png",
    tags: ["언캐니", "단체사진", "저화질", "기괴"],
  },
  {
    id: 61,
    title: "고대 숲속 마법 도서관",
    description: "세계관 배경용으로 쓰기 좋은 거대한 나무 속 도서관 콘셉트아트 프롬프트.",
    body: `Epic fantasy concept art, vast library built inside ancient trees, glowing shelves, floating dust particles, warm candlelight, moss-covered wooden stairs, misty forest visible through arches, wide establishing shot, high detail, no text, no logo, no watermark, 16:9`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `Epic fantasy concept art, vast library built inside ancient trees, glowing shelves, floating dust particles, warm candlelight, moss-covered wooden stairs, misty forest visible through arches, wide establishing shot, high detail, no text, no logo, no watermark, 16:9`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Instagram과 Civitai에서 꾸준히 강한 fantasy environment, wide establishing shot, glowing library 계열의 세계관 배경 프롬프트 흐름을 참고했습니다.",
      },
    ],
    category: "배경/세계관",
    model: "GPT Image",
    aspectRatio: "16:9",
    style: "Fantasy Environment Concept",
    language: "영어",
    image: "/samples/trend-world-forest-library.png",
    tags: ["세계관", "판타지", "도서관", "컨셉아트"],
  },
  {
    id: 62,
    title: "솔라펑크 옥상 도시",
    description: "녹지 옥상, 태양광 유리, 아침 안개를 사용한 낙관적인 솔라펑크 도시 배경.",
    body: `Solarpunk city terrace worldbuilding concept art, layered green rooftops, public gardens, warm morning haze, soft white architecture with solar glass panels, people only as tiny distant silhouettes, optimistic ecological megacity, cinematic wide shot, no text, no logo, no watermark, 16:9`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `Solarpunk city terrace worldbuilding concept art, layered green rooftops, public gardens, warm morning haze, soft white architecture with solar glass panels, people only as tiny distant silhouettes, optimistic ecological megacity, cinematic wide shot, no text, no logo, no watermark, 16:9`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "최근 이미지 프롬프트 공유에서 반복되는 solarpunk, ecological megacity, rooftop garden 키워드를 배경/세계관 카테고리에 맞게 정리했습니다.",
      },
    ],
    category: "배경/세계관",
    model: "GPT Image",
    aspectRatio: "16:9",
    style: "Solarpunk Worldbuilding",
    language: "영어",
    image: "/samples/trend-world-solarpunk-terrace.png",
    tags: ["세계관", "솔라펑크", "도시", "배경"],
  },
  {
    id: 63,
    title: "사막 위 부유하는 검은 모노리스",
    description: "미니멀한 SF 영화 오프닝처럼 보이는 사막 모노리스 세계관 프롬프트.",
    body: `Science fiction worldbuilding environment, vast desert plain with a single black monolith hovering above cracked salt flats, distant research convoy as tiny silhouettes, pale sunrise, atmospheric dust, minimalist cinematic composition, high-detail concept art, no text, no logo, no watermark, wide 21:9`,
    promptVersions: [
      {
        label: "프롬프트랩 원문",
        language: "영어",
        body: `Science fiction worldbuilding environment, vast desert plain with a single black monolith hovering above cracked salt flats, distant research convoy as tiny silhouettes, pale sunrise, atmospheric dust, minimalist cinematic composition, high-detail concept art, no text, no logo, no watermark, wide 21:9`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Civitai와 Instagram의 sci-fi environment, cinematic concept art, minimalist monolith 계열 구도를 참고했습니다. 결과 이미지는 프롬프트랩용으로 새로 생성했습니다.",
      },
    ],
    category: "배경/세계관",
    model: "GPT Image",
    aspectRatio: "21:9",
    style: "Sci-Fi Environment Concept",
    language: "영어",
    image: "/samples/trend-world-desert-monolith.png",
    tags: ["SF", "사막", "모노리스", "컨셉아트"],
  },
  {
    id: 64,
    title: "2010년대 학원 로맨스 버스정류장",
    description: "2010년대 한국 학원 로맨스 웹툰의 정서를 실사 청춘 영화 스틸처럼 바꾼 프롬프트.",
    body: `Create a vertical 4:5 photorealistic live-action still from this exact detailed prompt: A nostalgic 2010s Korean school-romance webtoon mood reimagined as a real photograph, without referencing any existing title or character. Two anonymous young adult actors dressed as high-school students stand at a small neighborhood bus stop after light rain, one holding a transparent umbrella and the other holding a paperback workbook and a cheap wired earphone. The setting should feel like Korea around 2012: old apartment blocks in the background, a faded bus route sign with no readable text, damp pavement, convenience-store glow far behind them, and a soft overcast blue-gray evening sky. Use a 50mm lens feeling, shallow depth of field, natural skin texture, subdued school-uniform fabric, gentle awkward distance between the two characters, and the emotional tone of first love before anyone says anything. Color grade should be muted pastel with realistic rain reflections and a slightly compressed early digital camera softness. Avoid existing webtoon characters, celebrity likeness, readable signage, logos, explicit romance, kissing, exaggerated drama, plastic skin, extra fingers, watermark, and anime/cartoon rendering.`,
    promptVersions: [
      {
        label: "실제 생성 프롬프트",
        language: "영어",
        body: `Create a vertical 4:5 photorealistic live-action still from this exact detailed prompt: A nostalgic 2010s Korean school-romance webtoon mood reimagined as a real photograph, without referencing any existing title or character. Two anonymous young adult actors dressed as high-school students stand at a small neighborhood bus stop after light rain, one holding a transparent umbrella and the other holding a paperback workbook and a cheap wired earphone. The setting should feel like Korea around 2012: old apartment blocks in the background, a faded bus route sign with no readable text, damp pavement, convenience-store glow far behind them, and a soft overcast blue-gray evening sky. Use a 50mm lens feeling, shallow depth of field, natural skin texture, subdued school-uniform fabric, gentle awkward distance between the two characters, and the emotional tone of first love before anyone says anything. Color grade should be muted pastel with realistic rain reflections and a slightly compressed early digital camera softness. Avoid existing webtoon characters, celebrity likeness, readable signage, logos, explicit romance, kissing, exaggerated drama, plastic skin, extra fingers, watermark, and anime/cartoon rendering.`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Instagram #aiprompts, #aiprompt, #aiphoto에서 보이는 실사화/청춘사진/프롬프트 카드 흐름과 사용자가 언급한 2010년대 한국 웹툰 배경 감성을 참고했습니다. 특정 웹툰명과 캐릭터명은 프롬프트에서 제외했습니다. 출처: https://www.instagram.com/popular/aiprompts/ / https://www.instagram.com/popular/aiphoto/",
      },
    ],
    category: "사진/시네마틱",
    model: "GPT Image",
    aspectRatio: "4:5",
    style: "2010s Korean Youth Live Action",
    language: "영어",
    image: "/samples/instagram-webtoon-bus-stop.png",
    tags: ["인스타트렌드", "웹툰실사화", "2010년대", "학원로맨스"],
  },
  {
    id: 65,
    title: "방과 후 분식집 청춘 스틸",
    description: "분식집, 교복, 오렌지 형광등으로 만드는 2010년대 한국 웹툰 실사화 분위기.",
    body: `Create a horizontal 16:9 photorealistic 2010s Korean after-school scene from this exact detailed prompt: A nostalgic live-action reinterpretation of early-2010s Korean school webtoon atmosphere, set inside a tiny neighborhood snack bar after school. Three anonymous young adult actors dressed as students sit around a metal table with tteokbokki, fish cake soup, paper cups, and cheap notebooks. The room has orange fluorescent lighting, plastic menu boards with all text blurred and unreadable, condensation on the window, old posters reduced to abstract color blocks, and school bags on the floor. The image should feel like a still from a youth drama made from a webtoon, warm but ordinary, with real awkward friendships, not polished idol styling. Use a slightly soft early DSLR look, 35mm lens, natural expressions, imperfect posture, realistic food steam, muted red-orange palette, and shallow background blur. Avoid existing webtoon titles or characters, readable Korean text, logos, brand labels, celebrity likeness, romance overacting, kissing, anime style, extra fingers, distorted hands, watermark, and overly glossy K-drama lighting.`,
    promptVersions: [
      {
        label: "실제 생성 프롬프트",
        language: "영어",
        body: `Create a horizontal 16:9 photorealistic 2010s Korean after-school scene from this exact detailed prompt: A nostalgic live-action reinterpretation of early-2010s Korean school webtoon atmosphere, set inside a tiny neighborhood snack bar after school. Three anonymous young adult actors dressed as students sit around a metal table with tteokbokki, fish cake soup, paper cups, and cheap notebooks. The room has orange fluorescent lighting, plastic menu boards with all text blurred and unreadable, condensation on the window, old posters reduced to abstract color blocks, and school bags on the floor. The image should feel like a still from a youth drama made from a webtoon, warm but ordinary, with real awkward friendships, not polished idol styling. Use a slightly soft early DSLR look, 35mm lens, natural expressions, imperfect posture, realistic food steam, muted red-orange palette, and shallow background blur. Avoid existing webtoon titles or characters, readable Korean text, logos, brand labels, celebrity likeness, romance overacting, kissing, anime style, extra fingers, distorted hands, watermark, and overly glossy K-drama lighting.`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Instagram의 AI photo, live action, Korean youth aesthetic 계열과 2010년대 학원 웹툰 배경 실사화 수요를 참고했습니다. 출처: https://www.instagram.com/popular/aiphotography/ / https://www.instagram.com/popular/aiprompts/",
      },
    ],
    category: "사진/시네마틱",
    model: "GPT Image",
    aspectRatio: "16:9",
    style: "Korean Youth Drama Still",
    language: "영어",
    image: "/samples/instagram-webtoon-snack-bar.png",
    tags: ["인스타트렌드", "웹툰실사화", "분식집", "청춘"],
  },
  {
    id: 66,
    title: "싸이월드 감성 방바닥 셀카",
    description: "스티커 사진, MP3, 플립폰, 책상 조명으로 만든 2010년대 한국 방 사진 프롬프트.",
    body: `Create a square 1:1 photorealistic nostalgic bedroom selfie scene from this exact detailed prompt: A 2010s Korean teen-room atmosphere reimagined as a real photo, inspired by old social media diary and sticker-photo culture but without copying any real platform UI. An anonymous young adult student sits on the floor of a small bedroom wearing casual school sportswear, surrounded by a flip phone, old MP3 player, tangled earphones, sticker sheets, printed photo strips, a plaid blanket, and textbooks. The room has a low bed, a simple wood desk, a corkboard with blurred photos, pastel curtains, and warm desk-lamp light. The image should feel like a soft early-digital-camera snapshot from around 2011: mild grain, low dynamic range, gentle flash falloff, slightly awkward framing, and cozy clutter. Add a few decorative sticker-like shapes as physical objects on the desk, not digital overlays, and keep all writing unreadable. Avoid real social media logos, readable text, existing webtoon characters, celebrity likeness, childish sexualization, anime style, distorted hands, extra fingers, watermark, and modern smartphone design.`,
    promptVersions: [
      {
        label: "실제 생성 프롬프트",
        language: "영어",
        body: `Create a square 1:1 photorealistic nostalgic bedroom selfie scene from this exact detailed prompt: A 2010s Korean teen-room atmosphere reimagined as a real photo, inspired by old social media diary and sticker-photo culture but without copying any real platform UI. An anonymous young adult student sits on the floor of a small bedroom wearing casual school sportswear, surrounded by a flip phone, old MP3 player, tangled earphones, sticker sheets, printed photo strips, a plaid blanket, and textbooks. The room has a low bed, a simple wood desk, a corkboard with blurred photos, pastel curtains, and warm desk-lamp light. The image should feel like a soft early-digital-camera snapshot from around 2011: mild grain, low dynamic range, gentle flash falloff, slightly awkward framing, and cozy clutter. Add a few decorative sticker-like shapes as physical objects on the desk, not digital overlays, and keep all writing unreadable. Avoid real social media logos, readable text, existing webtoon characters, celebrity likeness, childish sexualization, anime style, distorted hands, extra fingers, watermark, and modern smartphone design.`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Instagram의 nostalgic photo prompt, AI photo editing, old digital camera 감성과 국내 2010년대 웹툰/싸이월드식 소품 기억을 결합했습니다. 출처: https://www.instagram.com/popular/aiphoto/ / https://www.instagram.com/popular/gptimage/",
      },
    ],
    category: "사진/시네마틱",
    model: "GPT Image",
    aspectRatio: "1:1",
    style: "Early Digital Camera Nostalgia",
    language: "영어",
    image: "/samples/instagram-webtoon-cyworld-room.png",
    tags: ["인스타트렌드", "2010년대", "방사진", "디카감성"],
  },
  {
    id: 67,
    title: "첫사랑 네컷 사진 스트립",
    description: "인스타 프롬프트 카드에서 자주 보이는 폴라로이드/포토부스 감성을 한국 청춘물로 변형.",
    body: `Create a vertical 4:5 photorealistic Korean photo-booth memory image from this exact detailed prompt: A strip of four old photo-booth pictures lies on a cafe table beside a half-finished iced drink and a cheap mechanical pencil. Each small photo shows two anonymous young adult school friends in a 2010s Korean first-love youth-drama mood, making slightly different awkward poses: looking away, laughing, holding up a small hand heart, and standing stiffly side by side. The photo strip should look physically printed, slightly glossy, with soft flash, gentle overexposure, dust specks, and no readable text or brand mark. The background table includes a folded school timetable with all writing blurred, a coin purse, and an old feature phone, creating a nostalgic 2012 atmosphere. Use macro focus on the printed strip, shallow depth of field, warm cafe light, natural paper texture, and muted pastel colors. Avoid identifiable faces, existing webtoon characters, readable text, logos, celebrity likeness, kissing, sexualized poses, extra fingers, watermark, and modern smartphone props.`,
    promptVersions: [
      {
        label: "실제 생성 프롬프트",
        language: "영어",
        body: `Create a vertical 4:5 photorealistic Korean photo-booth memory image from this exact detailed prompt: A strip of four old photo-booth pictures lies on a cafe table beside a half-finished iced drink and a cheap mechanical pencil. Each small photo shows two anonymous young adult school friends in a 2010s Korean first-love youth-drama mood, making slightly different awkward poses: looking away, laughing, holding up a small hand heart, and standing stiffly side by side. The photo strip should look physically printed, slightly glossy, with soft flash, gentle overexposure, dust specks, and no readable text or brand mark. The background table includes a folded school timetable with all writing blurred, a coin purse, and an old feature phone, creating a nostalgic 2012 atmosphere. Use macro focus on the printed strip, shallow depth of field, warm cafe light, natural paper texture, and muted pastel colors. Avoid identifiable faces, existing webtoon characters, readable text, logos, celebrity likeness, kissing, sexualized poses, extra fingers, watermark, and modern smartphone props.`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Instagram의 photo-booth, retro polaroid, AI photo prompt 공유 흐름과 Prompt 이미지 카드 포맷을 참고했습니다. 출처: https://www.instagram.com/popular/aiprompt/ / https://www.instagram.com/popular/aiphoto/",
      },
    ],
    category: "사진/시네마틱",
    model: "GPT Image",
    aspectRatio: "4:5",
    style: "Photo Booth Memory",
    language: "영어",
    image: "/samples/instagram-polaroid-first-love-strip.png",
    tags: ["인스타트렌드", "네컷사진", "첫사랑", "폴라로이드"],
  },
  {
    id: 68,
    title: "GPT Image 액션 피규어 패키지 프롬프트",
    description: "투명 블리스터 팩, 카드백, 소품 칸, 이름표까지 갖춘 인스타/틱톡용 AI 액션 피규어 패키지 프롬프트.",
    body: `Create a vertical 4:5 premium product photograph for GPT Image using this exact detailed prompt:

Turn the uploaded reference person, original character, or described persona into a high-end collectible action figure sealed inside realistic retail blister packaging. If no reference photo is provided, create an anonymous stylish AI prompt creator character instead: black oversized hoodie, loose black cargo pants, black-and-white sneakers, small crossbody camera bag, soft layered black hair, calm downward gaze, one hand holding a miniature camera and the other holding a tiny prompt notebook.

Packaging structure: a clear molded PET plastic blister with believable rounded edges, subtle thickness, tiny seams, soft dents, and realistic specular highlights; a thick matte cardboard backing card with a die-cut hang tab at the top; separate molded accessory compartments on the right side; a larger figure compartment on the left; a small bottom nameplate area with either the simple label "PROMPT MAKER" or abstract unreadable display marks if text rendering is unstable. The packaging should feel like a real premium collectible sold in a design-store toy aisle, not a flat poster.

Figure design: the figure should look like a physical 1/12 scale articulated collectible, with subtle joint lines at shoulders, elbows, wrists, knees, and ankles, but still elegant and not mechanical. Use realistic vinyl/plastic skin material, matte fabric-like sculpting on the hoodie, layered folds in the cargo pants, tiny zipper pulls, shoe stitching, bag buckles, and small painted details. The pose should be relaxed and slightly asymmetrical, with believable toy balance inside the blister tray.

Accessories: arrange each accessory in its own clear compartment with clean spacing: a miniature laptop showing an abstract prompt interface with no readable words, over-ear headphones, a tiny takeaway coffee cup with no logo, a small blank image card, a sheet of abstract stickers, a compact camera lens, a black notebook, and a pen. The accessories must look like miniature plastic objects, not full-size objects pasted into the scene.

Graphic design: use an original packaging card design with cream paper texture, black brush-like marks, muted violet blocks, small lime-yellow accent shapes, tiny abstract UI symbols, and decorative microtext that is intentionally unreadable. Do not use any real brand name, toy franchise layout, social media logo, barcode numbers, QR code, or copyrighted character reference. The overall look should be trendy enough for an Instagram AI prompt post but clean enough for a product catalog.

Lighting and camera: shoot it as a realistic studio product photo, straight-on with a slight 70mm lens compression, softbox reflection across the curved plastic, controlled shadow beneath the package, gentle gray background, crisp focus on the figure and accessories, subtle depth from the blister plastic, realistic cardboard fibers, dust-free but tactile materials, and high dynamic range without looking CGI.

Quality controls: keep the full package visible in frame, preserve the rectangular card silhouette, avoid cutting off the hang tab or bottom edge, keep hands and accessories anatomically clean, keep all text either exactly requested or unreadable, and make the image feel like a real photographed object.

Negative instructions: no Barbie, no Funko, no Marvel, no DC, no anime franchise, no celebrity likeness, no readable brand logos, no watermark, no messy random letters, no deformed hands, no extra fingers, no duplicate heads, no melted plastic, no floating accessories, no warped packaging, no flat 2D illustration, no low-resolution screenshot, no over-saturated toy colors.`,
    promptVersions: [
      {
        label: "복사용 GPT Image 템플릿",
        language: "영어",
        body: `Create a vertical 4:5 premium product photograph for GPT Image using this exact detailed prompt:

Turn the uploaded reference person, original character, or described persona into a high-end collectible action figure sealed inside realistic retail blister packaging. If no reference photo is provided, create an anonymous stylish AI prompt creator character instead: black oversized hoodie, loose black cargo pants, black-and-white sneakers, small crossbody camera bag, soft layered black hair, calm downward gaze, one hand holding a miniature camera and the other holding a tiny prompt notebook.

Packaging structure: a clear molded PET plastic blister with believable rounded edges, subtle thickness, tiny seams, soft dents, and realistic specular highlights; a thick matte cardboard backing card with a die-cut hang tab at the top; separate molded accessory compartments on the right side; a larger figure compartment on the left; a small bottom nameplate area with either the simple label "PROMPT MAKER" or abstract unreadable display marks if text rendering is unstable. The packaging should feel like a real premium collectible sold in a design-store toy aisle, not a flat poster.

Figure design: the figure should look like a physical 1/12 scale articulated collectible, with subtle joint lines at shoulders, elbows, wrists, knees, and ankles, but still elegant and not mechanical. Use realistic vinyl/plastic skin material, matte fabric-like sculpting on the hoodie, layered folds in the cargo pants, tiny zipper pulls, shoe stitching, bag buckles, and small painted details. The pose should be relaxed and slightly asymmetrical, with believable toy balance inside the blister tray.

Accessories: arrange each accessory in its own clear compartment with clean spacing: a miniature laptop showing an abstract prompt interface with no readable words, over-ear headphones, a tiny takeaway coffee cup with no logo, a small blank image card, a sheet of abstract stickers, a compact camera lens, a black notebook, and a pen. The accessories must look like miniature plastic objects, not full-size objects pasted into the scene.

Graphic design: use an original packaging card design with cream paper texture, black brush-like marks, muted violet blocks, small lime-yellow accent shapes, tiny abstract UI symbols, and decorative microtext that is intentionally unreadable. Do not use any real brand name, toy franchise layout, social media logo, barcode numbers, QR code, or copyrighted character reference. The overall look should be trendy enough for an Instagram AI prompt post but clean enough for a product catalog.

Lighting and camera: shoot it as a realistic studio product photo, straight-on with a slight 70mm lens compression, softbox reflection across the curved plastic, controlled shadow beneath the package, gentle gray background, crisp focus on the figure and accessories, subtle depth from the blister plastic, realistic cardboard fibers, dust-free but tactile materials, and high dynamic range without looking CGI.

Quality controls: keep the full package visible in frame, preserve the rectangular card silhouette, avoid cutting off the hang tab or bottom edge, keep hands and accessories anatomically clean, keep all text either exactly requested or unreadable, and make the image feel like a real photographed object.

Negative instructions: no Barbie, no Funko, no Marvel, no DC, no anime franchise, no celebrity likeness, no readable brand logos, no watermark, no messy random letters, no deformed hands, no extra fingers, no duplicate heads, no melted plastic, no floating accessories, no warped packaging, no flat 2D illustration, no low-resolution screenshot, no over-saturated toy colors.`,
      },
      {
        label: "한국어 사용 가이드",
        language: "한영 혼합",
        body: "인물 사진을 첨부할 때는 첫 문장의 uploaded reference person을 그대로 두고, 원하는 직업이나 콘셉트만 accessories와 outfit 부분에 추가하세요. 예: 개발자라면 기계식 키보드, 노트북, 커피, 회로 패턴 카드백을 넣고, 디자이너라면 색상칩, 스타일러스, 스케치북, 목업 보드를 넣으면 됩니다. 브랜드명과 실제 장난감 라인 이름은 빼는 편이 안전합니다.",
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "ChatGPT action figure / box doll 트렌드는 업로드한 사진을 장난감 박스, 블리스터 패키지, 소품 칸, 이름표가 있는 수집형 피규어 이미지로 바꾸는 포맷으로 소개됩니다. 원문 프롬프트를 복사하지 않고 구조만 참고해 프롬프트랩용으로 새로 작성했습니다. 참고: https://www.globaltechcouncil.org/ai/chatgpt-action-figure-trend/ / https://www.kalon.ai/templates/ai-action-figure-prompts / https://www.eonline.com/news/1416043/chatgpt-action-figure-trend-how-to-make-ai-barbie-doll",
      },
    ],
    category: "제품/광고",
    model: "GPT Image",
    aspectRatio: "4:5",
    style: "GPT Image Action Figure Package",
    language: "영어",
    image: "/samples/instagram-action-figure-package.png",
    tags: ["GPT Image", "액션피규어", "피규어패키지", "블리스터팩", "인스타트렌드"],
  },
  {
    id: 69,
    title: "Quiet Luxury 패션 변환컷",
    description: "Gemini/Nano Banana 계열 패션 변환 프롬프트 흐름을 로고 없는 룩북 이미지로 정리.",
    body: `Create a vertical 4:5 fashion transformation image from this exact detailed prompt: An Instagram-style AI fashion prompt result showing one anonymous adult model in a clean studio wearing a complete quiet-luxury outfit generated as if from a text prompt, not copied from any brand. The model stands in a relaxed full-body pose against a warm off-white seamless background. Outfit: oversized slate-gray wool blazer, white ribbed tank top, wide black pleated trousers, minimal leather loafers, thin silver necklace, and a structured dark brown shoulder bag with no logo. Lighting: large softbox from the left, gentle shadow on the floor, realistic fabric texture, natural skin, and editorial catalog polish. Add subtle visual hints of an AI style-transfer prompt trend through floating translucent fabric swatches and small abstract prompt-card shapes in the background, but no readable words. Composition should be clean and useful for a fashion inspiration post. Avoid brand logos, readable text, celebrity likeness, unrealistic body proportions, extra limbs, plastic skin, overdone makeup, duplicated hands, watermark, and runway background.`,
    promptVersions: [
      {
        label: "실제 생성 프롬프트",
        language: "영어",
        body: `Create a vertical 4:5 fashion transformation image from this exact detailed prompt: An Instagram-style AI fashion prompt result showing one anonymous adult model in a clean studio wearing a complete quiet-luxury outfit generated as if from a text prompt, not copied from any brand. The model stands in a relaxed full-body pose against a warm off-white seamless background. Outfit: oversized slate-gray wool blazer, white ribbed tank top, wide black pleated trousers, minimal leather loafers, thin silver necklace, and a structured dark brown shoulder bag with no logo. Lighting: large softbox from the left, gentle shadow on the floor, realistic fabric texture, natural skin, and editorial catalog polish. Add subtle visual hints of an AI style-transfer prompt trend through floating translucent fabric swatches and small abstract prompt-card shapes in the background, but no readable words. Composition should be clean and useful for a fashion inspiration post. Avoid brand logos, readable text, celebrity likeness, unrealistic body proportions, extra limbs, plastic skin, overdone makeup, duplicated hands, watermark, and runway background.`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Instagram #geminiprompt 공개 페이지에서 fashion inspiration 계열이 언급되고, Nano Banana/Gemini 이미지 편집 트렌드가 패션·레트로 보정으로 확산된 자료를 참고했습니다. 출처: https://www.instagram.com/popular/geminiprompt/ / https://www.perfectcorp.com/consumer/blog/selfie-editing/best-nano-banana-pro-prompts-instagram",
      },
    ],
    category: "인물/패션",
    model: "GPT Image",
    aspectRatio: "4:5",
    style: "AI Fashion Transformation",
    language: "영어",
    image: "/samples/instagram-gemini-fashion-tryon.png",
    tags: ["인스타트렌드", "패션", "Gemini", "NanoBanana"],
  },
  {
    id: 70,
    title: "나노바나나 스티커팩 편집",
    description: "인스타에서 강한 Nano Banana/AI 편집 프롬프트 흐름을 오리지널 캐릭터 스티커팩으로 변형.",
    body: `Create a square 1:1 playful AI sticker-edit result from this exact detailed prompt: A cute original character sticker pack laid out on a clean white desk, inspired by viral Instagram AI image editing prompts and Nano Banana / Gemini prompt transformation culture, but not using any real mascot. The main subject is one original rounded yellow fruit-like character with tiny arms, big expressive eyes, and a small green leaf hat, repeated as six separate physical vinyl stickers: happy pose, sleepy pose, surprised pose, holding a tiny camera, wearing headphones, and waving. The stickers have glossy laminated edges, soft shadows, and a few peeled corners to show they are physical objects. Around them are a blank prompt card, a tablet edge, washi tape, and a small cutting mat with no readable text. Style should be clean, cheerful, social-media-friendly, and useful as a prompt result preview. Avoid real brand names, readable words, copyrighted mascots, Minion-like design, Pikachu-like design, logos, watermark, distorted character faces, clutter, and digital UI screenshots.`,
    promptVersions: [
      {
        label: "실제 생성 프롬프트",
        language: "영어",
        body: `Create a square 1:1 playful AI sticker-edit result from this exact detailed prompt: A cute original character sticker pack laid out on a clean white desk, inspired by viral Instagram AI image editing prompts and Nano Banana / Gemini prompt transformation culture, but not using any real mascot. The main subject is one original rounded yellow fruit-like character with tiny arms, big expressive eyes, and a small green leaf hat, repeated as six separate physical vinyl stickers: happy pose, sleepy pose, surprised pose, holding a tiny camera, wearing headphones, and waving. The stickers have glossy laminated edges, soft shadows, and a few peeled corners to show they are physical objects. Around them are a blank prompt card, a tablet edge, washi tape, and a small cutting mat with no readable text. Style should be clean, cheerful, social-media-friendly, and useful as a prompt result preview. Avoid real brand names, readable words, copyrighted mascots, Minion-like design, Pikachu-like design, logos, watermark, distorted character faces, clutter, and digital UI screenshots.`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Instagram #nanobanana 공개 페이지와 Gemini Nano Banana 이미지 편집 트렌드 자료를 참고했습니다. 결과는 기존 캐릭터를 쓰지 않은 오리지널 스티커팩입니다. 출처: https://www.instagram.com/popular/nanobanana/ / https://www.moneycontrol.com/technology/google-gemini-nano-banana-ai-saree-trend-is-viral-on-instagram-all-you-need-to-know-article-13546410.html",
      },
    ],
    category: "캐릭터/웹툰",
    model: "GPT Image",
    aspectRatio: "1:1",
    style: "AI Sticker Pack Edit",
    language: "영어",
    image: "/samples/instagram-nano-banana-stickers.png",
    tags: ["인스타트렌드", "스티커", "NanoBanana", "캐릭터"],
  },
  {
    id: 71,
    title: "인스타 프롬프트 카드 콜라주",
    description: "이미지 안에 프롬프트 텍스트가 함께 들어가는 인스타 캐러셀 포맷을 저작권 안전하게 재구성.",
    body: `Create a vertical 4:5 social media prompt-card collage image from this exact detailed prompt: A polished Instagram-style AI prompt carousel cover shown as a physical design board on a desk, not a screenshot. The board contains one large generated-looking cinematic image area at the top showing an anonymous person standing in rain under neon lights, and below it several neat prompt blocks represented only by abstract blurred lines, colored labels, and unreadable microtext. Add small visual elements: paper clips, translucent sticky tabs, a pencil, a tiny camera memory card, and a soft shadow from window light. The design should communicate 'image + prompt text' clearly without including any readable prompt words. Use a clean editorial layout, off-white paper texture, black typography-like marks that are illegible, cyan and warm orange accent stickers, and realistic overhead photography. This should feel like the kind of prompt-sharing image people post on Instagram, but original and copyright-safe. Avoid readable text, real usernames, Instagram UI, logos, brand marks, QR codes, watermark, messy layout, random letters, distorted photo area, and low-quality screenshot styling.`,
    promptVersions: [
      {
        label: "실제 생성 프롬프트",
        language: "영어",
        body: `Create a vertical 4:5 social media prompt-card collage image from this exact detailed prompt: A polished Instagram-style AI prompt carousel cover shown as a physical design board on a desk, not a screenshot. The board contains one large generated-looking cinematic image area at the top showing an anonymous person standing in rain under neon lights, and below it several neat prompt blocks represented only by abstract blurred lines, colored labels, and unreadable microtext. Add small visual elements: paper clips, translucent sticky tabs, a pencil, a tiny camera memory card, and a soft shadow from window light. The design should communicate 'image + prompt text' clearly without including any readable prompt words. Use a clean editorial layout, off-white paper texture, black typography-like marks that are illegible, cyan and warm orange accent stickers, and realistic overhead photography. This should feel like the kind of prompt-sharing image people post on Instagram, but original and copyright-safe. Avoid readable text, real usernames, Instagram UI, logos, brand marks, QR codes, watermark, messy layout, random letters, distorted photo area, and low-quality screenshot styling.`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Instagram에서 이미지 결과물과 프롬프트 텍스트를 한 장의 카드/캐러셀로 공유하는 포맷을 참고했습니다. 원문 프롬프트를 그대로 복제하지 않고 구조만 재작성했습니다. 출처: https://www.instagram.com/popular/aiprompt/ / https://www.instagram.com/popular/aiprompts/",
      },
    ],
    category: "편집/콜라주",
    model: "GPT Image",
    aspectRatio: "4:5",
    style: "Prompt Card Collage",
    language: "영어",
    image: "/samples/instagram-prompt-card-collage.png",
    tags: ["인스타트렌드", "프롬프트카드", "콜라주", "캐러셀"],
  },
  {
    id: 72,
    title: "거울 속 실내 수영장 셀피",
    description: "간단한 한 줄 아이디어가 강하게 먹히는 인스타식 초현실 AI 사진 프롬프트.",
    body: `Create a vertical 4:5 surreal but photorealistic mirror selfie concept from this exact detailed prompt: An anonymous adult stands in a quiet apartment hallway taking a mirror selfie with an old compact digital camera, but the mirror reflection shows a different impossible room behind them: a sunlit indoor swimming pool with blue tiles and floating curtains. The real hallway is dim, beige, and ordinary, with shoes by the door, a coat rack, and soft evening light; the reflected pool room is bright, dreamy, and slightly uncanny. The subject's face should be obscured by the compact camera and not identifiable. Use realistic mirror reflections, subtle dust on the mirror, 2000s digital camera flash, muted colors, mild grain, and a clean vertical composition suited to an Instagram AI photo prompt. The image should feel like an impossible edit that could become viral because the prompt idea is simple and striking. Avoid readable text, logos, smartphone UI, celebrity likeness, horror monsters, gore, warped hands, extra limbs, impossible mirror frame geometry, watermark, and cartoon styling.`,
    promptVersions: [
      {
        label: "실제 생성 프롬프트",
        language: "영어",
        body: `Create a vertical 4:5 surreal but photorealistic mirror selfie concept from this exact detailed prompt: An anonymous adult stands in a quiet apartment hallway taking a mirror selfie with an old compact digital camera, but the mirror reflection shows a different impossible room behind them: a sunlit indoor swimming pool with blue tiles and floating curtains. The real hallway is dim, beige, and ordinary, with shoes by the door, a coat rack, and soft evening light; the reflected pool room is bright, dreamy, and slightly uncanny. The subject's face should be obscured by the compact camera and not identifiable. Use realistic mirror reflections, subtle dust on the mirror, 2000s digital camera flash, muted colors, mild grain, and a clean vertical composition suited to an Instagram AI photo prompt. The image should feel like an impossible edit that could become viral because the prompt idea is simple and striking. Avoid readable text, logos, smartphone UI, celebrity likeness, horror monsters, gore, warped hands, extra limbs, impossible mirror frame geometry, watermark, and cartoon styling.`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "Instagram #aiphotography, #aiphoto의 초현실 AI 사진/편집 프롬프트 흐름을 참고했습니다. 출처: https://www.instagram.com/popular/aiphotography/ / https://www.instagram.com/popular/aiphoto/",
      },
    ],
    category: "사진/시네마틱",
    model: "GPT Image",
    aspectRatio: "4:5",
    style: "Surreal Mirror Selfie",
    language: "영어",
    image: "/samples/instagram-surreal-mirror-selfie.png",
    tags: ["인스타트렌드", "거울셀피", "초현실", "디카"],
  },
  {
    id: 73,
    title: "2013년 골목길 첫사랑 무드",
    description: "좁은 주택가, 편의점 불빛, 물웅덩이 반사로 만든 한국 청춘 웹툰 실사화 스틸.",
    body: `Create a horizontal 16:9 cinematic lifestyle photo from this exact detailed prompt: A nostalgic Korean night walk scene that feels like a live-action version of a 2010s school romance webtoon, but completely original. Two anonymous young adult actors in casual school-uniform-inspired outfits walk separately on opposite sides of a narrow residential street, both pretending not to notice each other. Between them are wet asphalt reflections, old streetlights, a small convenience store glow in the distance, parked compact cars with unreadable plates, and apartment windows with warm light. The camera is placed low behind a puddle so their reflections appear near the bottom of the frame. Use realistic 35mm lens compression, soft mist, muted blue-orange color grade, natural awkward body language, and a quiet emotional tone. It should look like a still from a Korean youth film made around 2013, not a modern glossy drama. Avoid existing webtoon references, readable signs, logos, celebrity likeness, kissing, sexualized poses, extra fingers, warped legs, watermark, anime style, and excessive rain effects.`,
    promptVersions: [
      {
        label: "실제 생성 프롬프트",
        language: "영어",
        body: `Create a horizontal 16:9 cinematic lifestyle photo from this exact detailed prompt: A nostalgic Korean night walk scene that feels like a live-action version of a 2010s school romance webtoon, but completely original. Two anonymous young adult actors in casual school-uniform-inspired outfits walk separately on opposite sides of a narrow residential street, both pretending not to notice each other. Between them are wet asphalt reflections, old streetlights, a small convenience store glow in the distance, parked compact cars with unreadable plates, and apartment windows with warm light. The camera is placed low behind a puddle so their reflections appear near the bottom of the frame. Use realistic 35mm lens compression, soft mist, muted blue-orange color grade, natural awkward body language, and a quiet emotional tone. It should look like a still from a Korean youth film made around 2013, not a modern glossy drama. Avoid existing webtoon references, readable signs, logos, celebrity likeness, kissing, sexualized poses, extra fingers, warped legs, watermark, anime style, and excessive rain effects.`,
      },
      {
        label: "조사 참고",
        language: "한영 혼합",
        body: "사용자가 언급한 2010년대 한국 웹툰 배경 실사화 수요와 Instagram의 AI photo/live-action prompt 흐름을 참고했습니다. 특정 작품명이나 캐릭터명은 쓰지 않았습니다. 출처: https://www.instagram.com/popular/aiprompt/ / https://www.instagram.com/popular/aiphotography/",
      },
    ],
    category: "사진/시네마틱",
    model: "GPT Image",
    aspectRatio: "16:9",
    style: "2013 Korean Night Walk",
    language: "영어",
    image: "/samples/instagram-webtoon-night-walk.png",
    tags: ["인스타트렌드", "웹툰실사화", "2013", "청춘영화"],
  },
];

const actualGenerationPrompts: Record<number, string> = {
  40: `Create a photorealistic vertical 4:5 cinematic street-fashion image from this exact detailed prompt: A stylish anonymous adult fashion subject stands on a high city rooftop just after sunset, wearing an oversized charcoal wool coat, black trousers, and subtle silver accessories. The photo should feel like an expensive but candid lifestyle editorial captured with a compact film camera and a harsh direct flash. Use a wide-angle 28mm lens feeling, slightly imperfect framing, the subject placed a little off-center, city railings and a blurred skyline behind them, warm orange-pink sky fading into blue, direct flash reflecting softly on the coat fabric, natural skin texture, visible fine film grain, tiny dust specks, slight motion blur in one hand, and an unedited snapshot mood. The image must look plausible and photographed, not like a 3D render. Keep the face anonymous and not celebrity-like. Avoid readable text, logos, brand marks, watermarks, extra fingers, distorted hands, plastic skin, over-smoothed beauty retouching, and overly perfect studio lighting.`,
  41: `Create a photorealistic horizontal 16:9 night street image from this exact detailed prompt: A late-night Korean convenience store is seen from inside the back seat of a taxi through a rain-speckled side window. The camera should feel like a cheap 2000s phone camera: low resolution, slight digital zoom, smeared highlights, crushed shadows, mild JPEG compression blocks, and imperfect autofocus. Outside, wet asphalt reflects red, cyan, and green neon, a blurred passerby with a transparent umbrella crosses the frame, the convenience store lights are overexposed and fluorescent, and the taxi interior edge is barely visible as a dark soft silhouette at the bottom. The mood is mundane but cinematic, like a real found photo from a rainy city night. Add subtle window droplets in sharp foreground and a soft, hazy background. Do not include readable store signs, logos, brand names, watermarks, clear license plates, fake timestamps, cartoon styling, or overly clean HDR rendering.`,
  42: `Create a photorealistic 16:10 documentary night street photograph from this exact detailed prompt: A dense Seoul side alley after heavy rain, seen from pedestrian eye level with a 35mm film camera. The pavement is wet and uneven, reflecting red, cyan, and white neon from small restaurants and bars, but all signs must be unreadable abstract light shapes. A small food cart releases white steam near the middle ground, taxi headlights cut diagonally through the mist from the far end of the alley, and a few distant human silhouettes are blurred enough to be anonymous. The composition should feel cinematic but still natural, with deep shadows, realistic lens bloom, mild halation around neon, fine 35mm film grain, slight handheld tilt, and layered depth from foreground puddles to background haze. Color grade: cool blue shadows with warm red practical lights. Avoid fantasy elements, perfect symmetry, over-sharpened HDR, readable Korean text, logos, watermarks, clean studio lighting, and faces looking directly at camera.`,
  43: `Create a vertical 4:5 high-fashion editorial portrait from this exact detailed prompt: An anonymous adult fashion model is photographed in a dark cyberpunk studio wearing a black translucent face veil, a sculptural chrome shoulder harness, and a matte black high-neck garment. The styling should feel avant-garde and expensive rather than costume-like. Use a three-quarter pose with the head slightly turned toward camera, black sclera inspired contact lenses or very dark reflective eyes, red neon rim light on the shoulders, a cool dim key light from above, and deep chiaroscuro shadows across the face veil. Add gritty film grain, subtle chromatic aberration on the red highlights, a hint of motion in the veil fabric, and a shallow depth of field. The image should look like a real editorial fashion photograph with dramatic post-processing, not an anime image. Keep all anatomy elegant and believable. Avoid readable text, logos, brand names, watermark, gore, monstrous deformation, extra limbs, plastic skin, glossy toy-like armor, and celebrity likeness.`,
  44: `Create a vertical 4:5 fashion editorial portrait from this exact detailed prompt: An anonymous adult Korean model stands in a quiet concrete museum interior wearing a modern ivory jacket inspired by hanbok structure and techwear construction. The garment has a softly crossed collar, layered wrap panels, matte technical fabric, subtle reflective piping along the seams, hidden fasteners, and a slightly oversized silhouette. Use a calm full-body or three-quarter composition with the model centered but surrounded by negative space, soft skylight entering from high windows, pale concrete walls, a polished stone floor with faint reflection, and restrained luxury magazine styling. The mood should be elegant, Korean, contemporary, and wearable, not costume or fantasy. Use an 85mm portrait lens feeling, shallow depth of field, accurate fabric texture, natural hands, and subdued warm-gray color grading. Avoid readable text, logos, brand labels, ornate historical costume exaggeration, celebrity likeness, distorted fingers, extra limbs, plastic skin, and over-saturated colors.`,
  45: `Create a vertical 3:4 dreamlike underwater fashion editorial image from this exact detailed prompt: An anonymous adult model floats weightlessly in dark blue water, wrapped in long translucent silver fabric that moves like slow smoke around the body. The pose is elegant and calm, with arms relaxed, hair drifting naturally, and the face partially turned away so the person feels anonymous. Light rays enter from the top left and fade into deep blue shadow, tiny air bubbles rise around the fabric edges, and the silver textile catches soft highlights without looking metallic or fake. The image should feel like a luxury fashion magazine shoot captured underwater with a high-end camera, realistic skin tones, real fabric drag, soft suspended particles, and a quiet cinematic mood. Composition should leave negative space above the subject and preserve a vertical poster feeling. Avoid mermaid elements, fantasy creatures, visible pool tiles, readable text, logos, watermark, distorted limbs, extra fingers, stiff doll anatomy, over-sharpening, and cartoon or anime styling.`,
  46: `Create a square 1:1 premium product advertisement image from this exact detailed prompt: A nameless translucent glass perfume bottle sits on rippled champagne silk fabric, photographed as a luxury fragrance advertisement with no brand text. The bottle should have a heavy glass base, a simple rectangular silhouette, a clear cap, and warm amber liquid inside. Use a low side angle with an 80mm macro lens feeling, warm amber side light from the left, a narrow white highlight along the glass edge, a soft dark background, delicate smoke drifting behind the bottle, tiny water droplets on the glass, and realistic caustic reflections on the silk. The composition should feel like a 1970s luxury magazine still life mixed with modern clean product photography. The image must be highly polished but believable, with accurate glass refraction and fabric folds. Avoid any readable label, logo, brand mark, watermark, fake typography, extra bottles, messy props, floating bottle, warped cap, and over-saturated orange color.`,
  47: `Create a square 1:1 clean skincare product advertisement image from this exact detailed prompt: A translucent unbranded glass serum bottle with a matte white dropper cap stands on wet black volcanic stone, surrounded by a few fresh green tea leaves and tiny beads of water. The scene should feel like a premium Korean skincare campaign: minimal, calm, botanical, and high-end. Use soft diffused studio light from the upper left, a subtle green bounce reflection in the glass, realistic water droplets on the bottle and stone, a shallow depth of field with the foreground stone sharp and background softly blurred, and a restrained color palette of black, clear glass, pale green, and soft white. The bottle may have a blank frosted label area but absolutely no readable letters or brand marks. Make the glass refraction and shadows physically believable. Avoid logos, readable text, crowded props, fake plant clutter, plastic-looking bottle, floating objects, deformed dropper, excessive glow, oversaturated green, and watermark.`,
  48: `Create a horizontal 16:9 commercial tech product photograph from this exact detailed prompt: A matte black unbranded wireless speaker sits on a clean rectangular concrete plinth in a minimal studio set. The speaker should have a simple cylindrical-rectangular hybrid shape, fine woven acoustic mesh texture, one small blank recessed control area with no symbols, and a premium tactile finish. Use a dramatic large softbox from the upper left, a precise shadow falling to the right, a very subtle cool cyan rim light along the back edge, and a dark gray seamless background. The composition should have generous negative space for a landing page hero, with the product placed slightly left of center and viewed from a low three-quarter angle. Show realistic material texture, dust-free but not plastic, believable contact shadow, and crisp product photography focus. Avoid logos, readable text, brand marks, buttons with symbols, duplicate speakers, floating object, warped geometry, excessive reflections, colorful gradient background, watermark, and toy-like CGI appearance.`,
  49: `Create a vertical 3:4 polished anime game key visual from this exact detailed prompt: An original dark red mecha guardian robot stands alone in heavy rain on a smoky battlefield at night. The mecha should have angular black and gunmetal armor, a glowing red circular core in the chest, narrow red sensor eyes, large protective shoulder plates, wet metal surfaces with rain streaks, and battle-worn scratches without looking broken. Use a dynamic low-angle composition so the robot feels huge and protective, with one arm lowered and one arm slightly raised as if blocking danger. Background: ruined industrial silhouettes, drifting smoke, red warning lights blurred in the distance, rain illuminated by the core glow. Visual style: crisp anime game key art with painterly lighting, sharp silhouette, high detail, cinematic contrast, and controlled red accents. Avoid existing franchise resemblance, logos, readable text, watermark, human pilots, gore, excessive weapons, deformed limbs, toy-like plastic, and cluttered background.`,
  50: `Create a square 1:1 cute high-resolution pixel-art inspired RPG inventory icon from this exact detailed prompt: A single original crystal potion bottle with tiny translucent wings is centered on a dark vignette background. The bottle is small, round, and faceted like cut glass, filled with glowing violet-blue liquid and a floating star-shaped crystal inside. The wings should be delicate and symmetrical, attached near the neck of the bottle, with a tiny cork stopper wrapped in gold thread. The style should resemble a polished game item icon: crisp silhouette, readable shape at small size, pixel-art influence with clean chunky highlights, but rendered at high resolution with jewel-like sparkle and controlled lighting. Use a soft circular glow behind the item, tiny particle specks, and a subtle drop shadow so it feels ready for an inventory grid. Avoid text, numbers, UI labels, logos, watermark, multiple items, hands, character face, messy background, blurry edges, and overly realistic product photography.`,
  51: `Create a vertical 3:4 Korean webtoon cover style character illustration from this exact detailed prompt: An original young adult mage stands on the roof of a Seoul apartment building at sunset, wearing a long dark coat inspired by a school uniform but modified with fantasy details: brass buttons, a loose tie, layered cuffs, and subtle embroidered talisman patterns. Around the character, glowing paper talismans float in a circular motion, casting warm orange light on the coat and face. The background shows rooftop railings, distant apartment blocks, water tanks, antennas, and a dramatic orange sky fading into purple. Use clean webtoon line art with painterly lighting, crisp facial features, expressive but not exaggerated eyes, dynamic wind in hair and coat hem, and a polished key visual composition suitable for a fantasy webtoon poster. Keep all text absent. Avoid existing anime or webtoon character likeness, logos, readable Korean writing on talismans, watermark, deformed hands, extra fingers, messy anatomy, and over-cluttered magic effects.`,
  52: `Create a square 1:1 cozy isometric 3D render from this exact detailed prompt: A tiny glass greenhouse cafe floats on a calm lake at sunrise, designed like a miniature diorama viewed from an elevated isometric angle. The cafe has transparent glass walls with thin dark metal frames, a warm wooden floor, a small counter inside, hanging plants, a few round tables, and amber interior lights glowing through early morning fog. A narrow wooden deck wraps around the greenhouse with two empty chairs and potted herbs. The surrounding lake surface is mirror-calm with soft ripples, pale mist, and a reflection of the glass structure. Use high-detail 3D rendering with miniature scale, soft global illumination, realistic glass transparency, cozy warm-cool color contrast, and clean composition centered in frame. Avoid readable signs, logos, people, cluttered furniture, fantasy castles, impossible perspective, harsh shadows, flat cartoon look, watermark, and text.`,
  53: `Create a horizontal 16:9 neon retrowave miniature cityscape from this exact detailed prompt: A small futuristic city is built like a glossy miniature model on a black reflective surface. In the background, a huge glowing orange sun sits low behind simplified purple mountains under a deep starry dusk sky. The city has compact geometric towers, thin neon strips, tiny elevated roads, and wet black streets reflecting magenta, cyan, and orange light. The overall mood should be synthwave album-cover energy but rendered as a clean high-detail 3D miniature, not a flat illustration. Use strong perspective leading lines toward the sun, controlled bloom on neon, crisp silhouettes, and atmospheric haze near the mountains. Keep the palette balanced between black, orange, magenta, cyan, and violet. Avoid readable text, logos, retro typography, cars with brand marks, people in foreground, oversaturated chaos, flat poster graphics, watermark, and distorted architecture.`,
  54: `Create a square 1:1 cozy clay animation style bedroom render from this exact detailed prompt: A small handmade bedroom diorama made entirely in clay and stop-motion materials. The room has a low bed with a soft wrinkled blanket, a small wooden desk, a warm desk lamp, stacked books, a tiny potted plant, a round rug, a window with soft evening light, and slightly imperfect handmade furniture. Every surface should show tactile clay fingerprints, tiny tool marks, rounded edges, and subtle irregularities like a real stop-motion set. Use warm amber lamp light balanced with cool blue window light, shallow depth of field, miniature scale, and a charming quiet mood. The camera looks slightly downward from a corner of the room, making the space feel lived-in and cozy. Avoid realistic human figures, readable book titles, logos, watermark, flat vector style, plastic toy shine, overly perfect geometry, clutter that hides the room layout, and excessive beige monotone.`,
  55: `Create a vertical 4:5 Y2K magazine collage lookbook image from this exact detailed prompt: A polished editorial collage page featuring anonymous fashion portrait cutouts arranged like a late-1990s / early-2000s glossy magazine spread. Use two or three cropped model photos as paper cutouts with no recognizable celebrity, layered over holographic sticker shapes, chrome stars, translucent plastic frames, tiny decorative UI icons, faux barcode blocks with no readable numbers, soft airbrush gradients, and reflective magazine paper texture. The layout should feel energetic and trendy but still professionally designed, with clear visual hierarchy and negative space. Use a palette of silver, icy blue, hot pink accents, black outlines, and pearly white highlights. Add tape pieces, scanner texture, halftone dots, and subtle paper shadows to make the collage physical. All microtext must be abstract scribbles, not real words. Avoid readable text, logos, brand names, watermark, messy clutter, distorted faces, extra limbs, and low-quality random sticker chaos.`,
  56: `Create a vertical 9:16 anime mobile game gacha result screen from this exact detailed prompt: An original fantasy character appears in the center of a polished mobile game gacha result interface. The character is a young adult star knight with a short cape, luminous armor accents, and a crystal sword held downward in a calm victory pose. Around the character is a glowing rarity frame made of gold and violet light, gem particles, radial burst rays, floating shards, and layered translucent UI panels. The screen should clearly feel like a gacha pull result without copying any existing game: top and bottom interface bars, circular icons, empty stat panels, decorative unreadable glyph labels, and a large central card frame. The design should be clean, premium, and readable as UI, with deep navy background, violet highlights, gold accents, and sparkling particle effects. Avoid real words, readable letters, logos, brand marks, copyrighted game resemblance, watermark, distorted hands, extra fingers, cramped composition, and messy UI clutter.`,
  57: `Create a square 1:1 doodle sketchbook collage character concept sheet from this exact detailed prompt: A messy but appealing creative desk scene showing an open sketchbook page filled with concept art for one original cute streetwear mascot character. The mascot is a small round character wearing oversized sneakers, a hoodie, and a tiny crossbody bag. Show the character repeated in several forms: a clean front pose, a side pose, a rough action pose, two facial expression thumbnails, a color swatch strip, and sticker-like cutout versions taped onto the page. Use rough pencil lines, marker strokes, watercolor stains, tiny arrows, boxes, circles, and decorative unreadable scribbles that look like notes without forming real words. The page should feel like an artist prompt notebook shared online, playful and practical. Add pens, tape, and paper texture around the sketchbook, but keep the main character readable. Avoid real text, logos, watermark, copyrighted mascot resemblance, distorted anatomy, random unrelated characters, clutter covering the drawings, and overly polished vector art.`,
  58: `Create a 4:3 VHS analog horror still from this exact detailed prompt: A low-resolution frame from a 1994 family birthday tape in a suburban dining room. The camera is placed at table height, slightly tilted, as if held by a parent using an old camcorder. A birthday cake with a few lit candles sits in the foreground, plastic plates and cups are scattered around, and warm yellow home-video lighting fills the room. The family members should be out of frame or blurred anonymous silhouettes at the edges; the focus is the room itself. In the hallway mirror behind the table, a tall person-shaped shadow appears clearly, but no matching person exists in the actual hallway. The horror should be subtle and uncanny, not graphic. Add heavy VHS scanlines, chromatic bleed, soft tracking noise, crushed blacks, mild tape warping near the bottom, and a blurred timestamp area with no readable numbers. Avoid blood, gore, obvious monster face, readable text, logos, watermark, modern furniture, crisp HD quality, and jump-scare composition.`,
  59: `Create a 3:2 liminal space horror photograph from this exact detailed prompt: An abandoned 1990s shopping mall food court at noon, photographed with a slightly faded disposable camera. The space is sunlit but empty, with rows of plastic chairs and laminate tables arranged too perfectly, old tiled flooring, a closed escalator in the background, dark storefront openings, dusty skylight beams, and a few dead potted plants. The composition should be wide and still, with a subtle fisheye distortion and the feeling that the mall was vacated minutes ago even though it has been empty for years. Colors should be washed-out beige, pale teal, and weak yellow sunlight, with soft grain, mild vignetting, and realistic dust. Make the horror come from silence, scale, and absence, not from creatures. Avoid people, readable store signs, logos, brand names, blood, gore, monsters, graffiti text, watermark, cinematic fog overload, and modern luxury mall design.`,
  60: `Create a 4:3 uncanny early-2000s scanned school group photo from this exact detailed prompt: A low-resolution scanned classroom group portrait with an unsettling empty chair in the front row. The scene is a generic Korean classroom from the early 2000s with desks pushed aside, fluorescent ceiling lights, pale green walls, old curtains, and a chalkboard in the background with no readable writing. Several anonymous young adult or late-teen students stand and sit in rows, but every face is slightly motion-blurred, underexposed, or turned just enough to avoid clear identity. The front row contains one perfectly centered empty chair that is sharper than the people around it. The image should feel like a real printed photo scanned years later: dust on scanner glass, faded colors, slight paper bend, compression noise, and uneven exposure. The horror should be subtle and psychological, focused on the empty chair. Avoid readable names, school logos, gore, ghosts, obvious monster, childlike closeups, identifiable faces, watermark, modern classroom equipment, and clean professional photography.`,
  61: `Create a horizontal 16:9 epic fantasy environment concept art image from this exact detailed prompt: A vast magical library is built inside and between ancient living trees in a misty forest. Enormous tree trunks form the structural columns, with carved wooden balconies, spiral staircases wrapped around roots, glowing shelves embedded into bark, hanging lanterns, moss-covered reading platforms, and bridges connecting different levels. The camera is a wide establishing shot from a slightly low angle, showing the scale of the library rising into the canopy while a misty forest is visible through arched openings. Use warm candlelight and golden shelf glow against cool green-blue forest fog, floating dust particles, soft volumetric light beams, and richly detailed wood texture. The scene should feel inhabitable and worldbuilding-focused, not just decorative. Include tiny distant silhouettes only for scale, not as main characters. Avoid readable book titles, signs, logos, watermark, modern furniture, over-bright fantasy colors, flat illustration, and chaotic clutter.`,
  62: `Create a horizontal 16:9 solarpunk city terrace worldbuilding concept art image from this exact detailed prompt: A layered ecological megacity seen from a high rooftop terrace in the morning. The architecture is soft white concrete, pale timber, and solar glass, with curved balconies, public gardens, green roofs, water channels, and vertical farms built into the city blocks. In the foreground, a communal rooftop garden has vegetable beds, small trees, shaded seating, and transparent solar panels catching warm morning light. In the distance, multiple terraces step down into a bright hazy skyline, with tiny anonymous silhouettes for scale only. The mood should be optimistic, clean, and plausible rather than fantasy, with atmospheric haze, soft sunlight, realistic vegetation, and a calm civic design language. Use a balanced palette of white, fresh green, warm gold, and clear sky blue. Avoid logos, readable signage, flying cars, cyberpunk darkness, excessive utopian gloss, text, watermark, crowded people, and one-note green monotony.`,
  63: `Create a wide 21:9 science fiction environment concept art image from this exact detailed prompt: A vast desert salt flat at pale sunrise, cracked white ground stretching to the horizon, with a single enormous black monolith hovering silently several meters above the surface. The monolith is perfectly smooth, vertical, rectangular, and slightly reflective, casting a soft impossible shadow through dusty morning air. Far below it, a tiny research convoy of two rover-like vehicles and a few small anonymous silhouettes provide scale, but they must remain distant and secondary. Use minimalist cinematic composition with the monolith slightly off-center, a huge sky, low warm sunlight, thin atmospheric dust, and restrained colors: pale sand, silver blue sky, black monolith, faint orange horizon. The mood should be mysterious, lonely, and monumental, like a serious sci-fi film establishing shot. Avoid logos, readable text, alien creatures, explosions, excessive spaceships, fantasy magic, watermark, cluttered foreground, and over-detailed noisy design.`,
};

for (const prompt of prompts) {
  const actualPrompt = actualGenerationPrompts[prompt.id];
  if (!actualPrompt) continue;

  prompt.body = actualPrompt;
  if (prompt.promptVersions?.[0]) {
    prompt.promptVersions[0] = {
      ...prompt.promptVersions[0],
      label: "실제 생성 프롬프트",
      body: actualPrompt,
    };
  }
}
