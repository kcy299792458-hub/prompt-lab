"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Send, X } from "lucide-react";
import { AuthControls } from "@/app/components/AuthControls";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const requestTypes = ["실사", "애니", "제품사진", "캐릭터", "리터칭", "배경", "기타"];
const maxImageCount = 4;
const maxImageSize = 5 * 1024 * 1024;

function makeSafeNickname(session: Session) {
  const baseName = session.user.user_metadata.nickname || session.user.email?.split("@")[0] || "user";
  const safeBase = baseName.replace(/[^a-zA-Z0-9가-힣_]/g, "").slice(0, 17) || "user";
  return `${safeBase}_${session.user.id.slice(0, 6)}`.slice(0, 24);
}

function sanitizeFileExtension(fileName: string) {
  return fileName.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
}

export default function NewPromptRequestPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    targetModel: "GPT Image 2.0",
    requestType: "기타",
    guestNickname: "",
    password: "",
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
      setMessage("참고 이미지는 1장당 5MB 이하만 첨부할 수 있습니다.");
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

  const uploadReferenceImages = async () => {
    if (!supabase || images.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (const image of images) {
      const extension = sanitizeFileExtension(image.name);
      const uniqueId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const path = `${new Date().toISOString().slice(0, 10)}/${uniqueId}.${extension}`;

      const { data, error } = await supabase.storage
        .from("prompt-request-images")
        .upload(path, image, {
          cacheControl: "31536000",
          contentType: image.type,
          upsert: false,
        });

      if (error) {
        throw new Error("프롬프트 요청 게시판을 사용하려면 007 SQL 실행이 필요합니다.");
      }

      const { data: publicData } = supabase.storage
        .from("prompt-request-images")
        .getPublicUrl(data.path);
      uploadedUrls.push(publicData.publicUrl);
    }

    return uploadedUrls;
  };

  const submitRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setMessage("Supabase 환경변수가 필요합니다.");
      return;
    }

    if (form.title.trim().length < 2) {
      setMessage("제목은 2자 이상 입력하세요.");
      return;
    }

    if (!form.body.trim()) {
      setMessage("요청 내용을 입력하세요.");
      return;
    }

    if (!session && form.guestNickname.trim().length < 2) {
      setMessage("닉네임은 2자 이상이어야 합니다.");
      return;
    }

    if (!session && form.password.length < 4) {
      setMessage("비밀번호는 4자 이상이어야 합니다.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const referenceImageUrls = await uploadReferenceImages();

      if (session) {
        const nickname = makeSafeNickname(session);
        await supabase.from("profiles").upsert(
          {
            id: session.user.id,
            nickname,
          },
          { onConflict: "id" },
        );

        const { data, error } = await supabase
          .from("prompt_requests")
          .insert({
            author_id: session.user.id,
            title: form.title.trim(),
            body: form.body.trim(),
            target_model: form.targetModel,
            request_type: form.requestType,
            reference_image_urls: referenceImageUrls,
          })
          .select("id")
          .single();

        if (error || !data) {
          throw new Error(error?.message || "요청 글을 등록할 수 없습니다.");
        }

        router.push(`/requests/${data.id}`);
        return;
      }

      const { data, error } = await supabase.rpc("create_guest_prompt_request", {
        p_title: form.title.trim(),
        p_body: form.body.trim(),
        p_guest_nickname: form.guestNickname.trim(),
        p_password: form.password,
        p_target_model: form.targetModel,
        p_request_type: form.requestType,
        p_reference_image_urls: referenceImageUrls,
      });

      if (error || !data) {
        throw new Error(error?.message || "요청 글을 등록할 수 없습니다.");
      }

      router.push(`/requests/${data}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "요청 글을 등록할 수 없습니다.");
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
            <small>요청 글쓰기</small>
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
          <h1>프롬프트 요청하기</h1>
          <p>원하는 이미지와 참고 자료를 올리면 다른 사람이 프롬프트 답변을 남길 수 있습니다.</p>
        </div>
        <Link href="/requests" className="primary-button dc-write-button">
          <ArrowLeft size={15} aria-hidden="true" />
          요청 목록
        </Link>
      </section>

      <nav className="community-board-tabs" aria-label="게시판 종류">
        <Link href="/boards">일반 게시판</Link>
        <Link className="active" href="/requests">
          프롬프트 요청
        </Link>
      </nav>

      <section className="request-write-page">
        <form className="upload-form-panel request-form-panel" onSubmit={submitRequest}>
          <div className="dc-write-panel-head">
            <strong>요청 글 작성</strong>
            <span>참고 이미지는 최대 {maxImageCount}장</span>
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
              value={form.requestType}
              onChange={(event) => setForm({ ...form, requestType: event.target.value })}
              aria-label="요청 분야"
            >
              {requestTypes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <input value="GPT Image 2.0" aria-label="희망 모델" readOnly />
            {!session && (
              <>
                <input
                  value={form.guestNickname}
                  onChange={(event) => setForm({ ...form, guestNickname: event.target.value })}
                  placeholder="닉네임"
                  aria-label="닉네임"
                />
                <input
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  placeholder="수정/해결 비밀번호"
                  type="password"
                  aria-label="수정/해결 비밀번호"
                />
              </>
            )}
          </div>

          <textarea
            value={form.body}
            onChange={(event) => setForm({ ...form, body: event.target.value })}
            placeholder="원하는 이미지, 분위기, 참고할 스타일, 피하고 싶은 요소를 적어주세요."
            aria-label="요청 내용"
            className="request-body-input"
          />

          <div className="dc-file-row">
            <label className="dc-file-button">
              <ImagePlus size={15} aria-hidden="true" />
              참고 이미지 첨부
              <input type="file" accept="image/*" multiple onChange={handleImageChange} />
            </label>
            <span>{images.length}장 선택됨</span>
          </div>

          {previews.length > 0 && (
            <div className="upload-preview-grid request-preview-grid">
              {previews.map((preview, index) => (
                <div className="dc-image-preview" key={preview}>
                  <img src={preview} alt={`참고 이미지 ${index + 1}`} />
                  <button type="button" onClick={() => removeImage(index)} aria-label="이미지 제거">
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {message && <p className="dc-status-message">{message}</p>}

          <button className="primary-button upload-submit-button" type="submit" disabled={isSubmitting}>
            <Send size={17} aria-hidden="true" />
            {isSubmitting ? "등록 중" : "요청 등록"}
          </button>
        </form>
      </section>
    </main>
  );
}
