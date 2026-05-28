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
    category: "배경/세계관",
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
    category: "배경/세계관",
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
    category: "배경/세계관",
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
    category: "배경/세계관",
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
    category: "배경/세계관",
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
    category: "배경/세계관",
    model: "GPT Image / SD / Midjourney",
    aspectRatio: "3:2",
    style: "Analog Horror",
    language: "한영 혼합",
    image: "/samples/analog-horror-rural-playground.png",
    tags: ["아날로그호러", "놀이터", "낮공포", "시골"],
  },
];
