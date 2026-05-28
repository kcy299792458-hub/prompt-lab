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
];
