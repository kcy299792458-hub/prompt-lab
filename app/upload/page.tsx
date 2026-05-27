"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Upload, X } from "lucide-react";
import { AuthControls } from "@/app/components/AuthControls";
import { categories } from "@/data/prompts";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type PromptVersionInsert = {
  image_post_id: string;
  label: string;
  language: "ko" | "en" | "negative" | "settings";
  body: string;
};

const maxImageCount = 8;
const maxImageSize = 10 * 1024 * 1024;

function sanitizeFileExtension(fileName: string) {
  return fileName.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
}

function makeSafeNickname(session: Session) {
  const baseName =
    session.user.user_metadata.nickname ||
    session.user.email?.split("@")[0] ||
    "user";
  const safeBase = baseName.replace(/[^a-zA-Z0-9가-힣_]/g, "").slice(0, 17) || "user";
  return `${safeBase}_${session.user.id.slice(0, 6)}`.slice(0, 24);
}

export default function UploadPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: categories.find((item) => item !== "전체") || "사진/시네마틱",
    model: "",
    aspectRatio: "",
    style: "",
    tags: "",
    koPrompt: "",
    enPrompt: "",
    negativePrompt: "",
    settingsPrompt: "",
  });

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  const resetImages = () => {
    previews.forEach((preview) => URL.revokeObjectURL(preview));
    setImages([]);
    setPreviews([]);
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const imageOnlyFiles = selectedFiles.filter((file) => file.type.startsWith("image/"));
    const oversizedFile = imageOnlyFiles.find((file) => file.size > maxImageSize);

    if (oversizedFile) {
      setMessage("이미지는 1장당 10MB 이하만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }

    const nextImages = [...images, ...imageOnlyFiles].slice(0, maxImageCount);
    resetImages();
    setImages(nextImages);
    setPreviews(nextImages.map((file) => URL.createObjectURL(file)));
    event.target.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setPreviews((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const uploadImages = async (userId: string) => {
    if (!supabase) return [];

    const uploadedUrls: string[] = [];

    for (const image of images) {
      const extension = sanitizeFileExtension(image.name);
      const uniqueId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const path = `${userId}/${new Date().toISOString().slice(0, 10)}/${uniqueId}.${extension}`;

      const { data, error } = await supabase.storage.from("prompt-images").upload(path, image, {
        cacheControl: "31536000",
        contentType: image.type,
        upsert: false,
      });

      if (error) {
        throw new Error("이미지 업로드 기능을 사용하려면 006 SQL 실행이 필요합니다.");
      }

      const { data: publicData } = supabase.storage.from("prompt-images").getPublicUrl(data.path);
      uploadedUrls.push(publicData.publicUrl);
    }

    return uploadedUrls;
  };

  const submitPost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setMessage("Supabase 환경변수가 필요합니다.");
      return;
    }

    if (!session) {
      setMessage("이미지 업로드는 로그인 후 사용할 수 있습니다.");
      return;
    }

    if (form.title.trim().length < 2) {
      setMessage("제목은 2자 이상 입력하세요.");
      return;
    }

    if (images.length === 0) {
      setMessage("결과 이미지를 1장 이상 첨부하세요.");
      return;
    }

    const versionDrafts: PromptVersionInsert[] = [
      {
        image_post_id: "",
        label: "한국어 원문",
        language: "ko",
        body: form.koPrompt.trim(),
      },
      {
        image_post_id: "",
        label: "영어 원문",
        language: "en",
        body: form.enPrompt.trim(),
      },
      {
        image_post_id: "",
        label: "네거티브",
        language: "negative",
        body: form.negativePrompt.trim(),
      },
      {
        image_post_id: "",
        label: "추가 설정",
        language: "settings",
        body: form.settingsPrompt.trim(),
      },
    ];
    const versions = versionDrafts.filter((version) => version.body.length > 0);

    if (versions.length === 0) {
      setMessage("프롬프트 원문을 1개 이상 입력하세요.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const nickname = makeSafeNickname(session);
      await supabase.from("profiles").upsert(
        {
          id: session.user.id,
          nickname,
        },
        { onConflict: "id" },
      );

      const imageUrls = await uploadImages(session.user.id);
      const tags = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 12);

      const { data: postData, error: postError } = await supabase
        .from("image_posts")
        .insert({
          author_id: session.user.id,
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          model: form.model.trim() || "미기재",
          aspect_ratio: form.aspectRatio.trim() || "미기재",
          style: form.style.trim() || "미기재",
          image_url: imageUrls[0],
          image_urls: imageUrls,
          tags,
        })
        .select("id")
        .single();

      if (postError || !postData) {
        throw new Error(
          postError?.message.includes("image_urls")
            ? "여러 장 이미지 게시글을 사용하려면 006 SQL 실행이 필요합니다."
            : postError?.message || "이미지 게시글을 저장할 수 없습니다.",
        );
      }

      const versionRows = versions.map((version) => ({
        ...version,
        image_post_id: postData.id as string,
      }));

      const { error: versionError } = await supabase.from("prompt_versions").insert(versionRows);

      if (versionError) {
        throw new Error(versionError.message);
      }

      router.push(`/images/${postData.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "이미지 게시글을 등록할 수 없습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="site-shell dc-shell">
      <header className="topbar dc-topbar">
        <Link className="brand dc-brand" href="/">
          <span className="brand-mark">
            <img className="brand-logo" src="/logo.png" alt="" />
          </span>
          <span>
            <strong>프롬프트랩</strong>
            <small>이미지 업로드</small>
          </span>
        </Link>
        <nav className="topnav dc-topnav" aria-label="주요 메뉴">
          <Link href="/">이미지</Link>
          <Link href="/boards">게시판</Link>
          <Link href="/saved">저장함</Link>
          <Link href="/upload">업로드</Link>
          <AuthControls />
        </nav>
      </header>

      <section className="dc-headline">
        <div>
          <h1>이미지 프롬프트 업로드</h1>
          <p>결과 이미지 여러 장과 프롬프트 원문, 모델 정보를 함께 등록</p>
        </div>
        <Link href="/" className="primary-button dc-write-button">
          <ArrowLeft size={15} aria-hidden="true" />
          갤러리로
        </Link>
      </section>

      <section className="upload-page">
        <form className="upload-form-panel" onSubmit={submitPost}>
          <div className="dc-write-panel-head">
            <strong>이미지 글 작성</strong>
            <span>최대 {maxImageCount}장</span>
          </div>

          <div className="upload-form-grid">
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="제목"
              aria-label="제목"
              className="upload-title-input"
            />
            <select
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              aria-label="카테고리"
            >
              {categories
                .filter((item) => item !== "전체")
                .map((item) => (
                  <option key={item}>{item}</option>
                ))}
            </select>
            <input
              value={form.model}
              onChange={(event) => setForm({ ...form, model: event.target.value })}
              placeholder="사용 모델 예: Midjourney v6, GPT Image"
              aria-label="사용 모델"
            />
            <input
              value={form.aspectRatio}
              onChange={(event) => setForm({ ...form, aspectRatio: event.target.value })}
              placeholder="비율 예: 1:1, 4:5, 16:9"
              aria-label="비율"
            />
            <input
              value={form.style}
              onChange={(event) => setForm({ ...form, style: event.target.value })}
              placeholder="스타일 예: 실사, 애니, 제품사진"
              aria-label="스타일"
            />
            <input
              value={form.tags}
              onChange={(event) => setForm({ ...form, tags: event.target.value })}
              placeholder="태그 쉼표로 구분"
              aria-label="태그"
            />
          </div>

          <textarea
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            placeholder="설명"
            aria-label="설명"
            className="upload-description-input"
          />

          <div className="dc-file-row">
            <label className="dc-file-button">
              <ImagePlus size={15} aria-hidden="true" />
              이미지 선택
              <input type="file" accept="image/*" multiple onChange={handleImageChange} />
            </label>
            <span>{images.length}장 선택됨</span>
          </div>

          {previews.length > 0 && (
            <div className="upload-preview-grid">
              {previews.map((preview, index) => (
                <div className="dc-image-preview" key={preview}>
                  <img src={preview} alt={`업로드 이미지 ${index + 1}`} />
                  <button type="button" onClick={() => removeImage(index)} aria-label="이미지 제거">
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="upload-prompt-grid">
            <textarea
              value={form.koPrompt}
              onChange={(event) => setForm({ ...form, koPrompt: event.target.value })}
              placeholder="한국어 프롬프트 원문"
              aria-label="한국어 프롬프트 원문"
            />
            <textarea
              value={form.enPrompt}
              onChange={(event) => setForm({ ...form, enPrompt: event.target.value })}
              placeholder="영어 프롬프트 원문"
              aria-label="영어 프롬프트 원문"
            />
            <textarea
              value={form.negativePrompt}
              onChange={(event) => setForm({ ...form, negativePrompt: event.target.value })}
              placeholder="네거티브 프롬프트"
              aria-label="네거티브 프롬프트"
            />
            <textarea
              value={form.settingsPrompt}
              onChange={(event) => setForm({ ...form, settingsPrompt: event.target.value })}
              placeholder="시드, CFG, 스텝, LoRA 등 추가 설정"
              aria-label="추가 설정"
            />
          </div>

          {message && <p className="dc-status-message">{message}</p>}

          <button className="primary-button upload-submit-button" type="submit" disabled={isSubmitting}>
            <Upload size={17} aria-hidden="true" />
            {isSubmitting ? "등록 중" : "이미지 글 등록"}
          </button>
        </form>
      </section>
    </main>
  );
}
